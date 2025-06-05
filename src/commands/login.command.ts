import * as ChildProcess from "node:child_process"
import * as FS from "node:fs/promises"
import * as http from "node:http"
import * as OS from "node:os"
import * as Path from "node:path"
import type { ParsedUrlQuery } from "node:querystring"
import * as url from "node:url"
import { Command } from "@effect/cli"
import { Config, Console, Data, Effect } from "effect"
import { customAlphabet } from "nanoid"

const FILENAME = ".intentui"
const DOMAIN_CONFIG = Config.succeed("https://blocks.intentui.com")

class UserCancellationError extends Data.TaggedError("UserCancellationError")<{
  message: string
}> {}

class AuthenticationError extends Data.TaggedError("AuthenticationError")<{
  message: string
  cause?: unknown
}> {}

class FileSystemError extends Data.TaggedError("FileSystemError")<{
  message: string
  path: string
  cause?: unknown
}> {}

class ProcessError extends Data.TaggedError("ProcessError")<{
  message: string
  command: string
  cause?: unknown
}> {}

class ServerError extends Data.TaggedError("ServerError")<{
  message: string
  cause?: unknown
}> {}

const nanoid = customAlphabet("123456789QAZWSXEDCRFVTGBYHNUJMIKOLP", 8)

const generateNanoid = Effect.sync(() => nanoid())

const openUrl = (urlToOpen: string) => {
  const openCommand =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open"

  return Effect.try({
    try: () =>
      ChildProcess.spawn(openCommand, [urlToOpen], {
        shell: process.platform === "win32",
      }),
    catch: (cause) =>
      new ProcessError({
        message: `Failed to open URL: ${urlToOpen}`,
        command: openCommand,
        cause,
      }),
  })
}

const getUserConfigPath = Effect.sync(() => Path.join(OS.homedir(), FILENAME))

const saveApiKey = (apiKey: string) =>
  Effect.gen(function* () {
    const path = yield* getUserConfigPath
    const content = JSON.stringify({ key: apiKey }, null, 2)
    return yield* Effect.tryPromise({
      try: () => FS.writeFile(path, content),
      catch: (cause) =>
        new FileSystemError({
          message: "Failed to write API key",
          path,
          cause,
        }),
    })
  })

export const loginCommand = Command.make("login", {}, () =>
  Effect.gen(function* () {
    yield* Console.log("Attempting to log in to Intent UI Blocks...")

    const domain = yield* DOMAIN_CONFIG

    let resolveAuthPromise!: (value: ParsedUrlQuery) => void
    let rejectAuthPromise!: (reason?: unknown) => void

    const actualAuthPromise = new Promise<ParsedUrlQuery>((resolve, reject) => {
      resolveAuthPromise = resolve
      rejectAuthPromise = reject
    })

    const serverAndPortEffect = Effect.acquireRelease(
      Effect.async<{ server: http.Server; port: number }, ServerError, never>((resume) => {
        const srv = http.createServer((req, res) => {
          res.setHeader("Access-Control-Allow-Origin", "*")
          res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

          if (req.method === "OPTIONS") {
            res.writeHead(200)
            res.end()
            return
          }
          if (req.method === "GET" && req.url) {
            const parsedUrl = url.parse(req.url, true)
            const queryParams = parsedUrl.query

            if (queryParams.cancelled) {
              res.writeHead(200, { "Content-Type": "text/plain" })
              res.end("Login process cancelled. You can close this tab.")
              rejectAuthPromise(
                new UserCancellationError({
                  message: "Login process cancelled by user.",
                }),
              )
            } else if (queryParams.key && typeof queryParams.key === "string") {
              res.writeHead(200, { "Content-Type": "text/plain" })
              res.end("Authentication successful! You can close this tab.")
              resolveAuthPromise(queryParams)
            } else {
              res.writeHead(400, { "Content-Type": "text/plain" })
              res.end("API key not found in callback. Please try again.")
              rejectAuthPromise(
                new AuthenticationError({
                  message: "API key not found in callback.",
                }),
              )
            }
          } else {
            res.writeHead(405)
            res.end()
          }
        })
        srv.on("error", (err) => {
          const serverError = new ServerError({
            message: "HTTP server runtime error",
            cause: err,
          })
          rejectAuthPromise(serverError)
          resume(Effect.fail(serverError))
        })
        srv.listen(0, "127.0.0.1", () => {
          const address = srv.address()
          if (address && typeof address === "object") {
            resume(Effect.succeed({ server: srv, port: address.port }))
          } else {
            srv.close()
            const serverError = new ServerError({
              message: "Failed to get server address after listen",
            })
            rejectAuthPromise(serverError)
            resume(Effect.fail(serverError))
          }
        })
      }),
      (serverData) =>
        Effect.sync(() => {
          serverData.server.close((err) => {
            if (err) {
              console.error("Error closing server:", err)
            }
          })
        }),
    )

    const serverData = yield* serverAndPortEffect
    const port = serverData.port
    yield* Console.log(`HTTP server listening on http://127.0.0.1:${port}`)

    const code = yield* generateNanoid
    const confirmationUrl = new URL(`${domain}/auth/devices`)
    confirmationUrl.searchParams.append("code", code)
    confirmationUrl.searchParams.append("redirect", `http://127.0.0.1:${port}`)

    yield* Console.log(`Your confirmation code: ${code}`)
    yield* Console.log(
      `If your browser doesn't open automatically, please navigate to:\n${confirmationUrl.toString()}`,
    )

    yield* openUrl(confirmationUrl.toString())
    yield* Console.log("Waiting for authentication via browser...")

    try {
      const authData = yield* Effect.promise(() => actualAuthPromise)
      const apiKey = authData.key
      if (apiKey && typeof apiKey === "string") {
        yield* saveApiKey(apiKey)
        const configPath = yield* getUserConfigPath
        yield* Console.log(`Authentication successful. API key saved to: ${configPath}`)
      } else {
        yield* Effect.fail(
          new AuthenticationError({
            message: "API key not found in response after promise resolution.",
          }),
        )
      }
    } catch (error) {
      if (error instanceof UserCancellationError) {
        yield* Console.log(error.message)
      } else if (error instanceof AuthenticationError) {
        yield* Console.error(`Authentication failed: ${error.message}`)
        if (error.cause) yield* Console.error(`Cause: ${String(error.cause)}`)
      } else if (error instanceof ServerError) {
        yield* Console.error(`Server error: ${error.message}`)
        if (error.cause) yield* Console.error(`Cause: ${String(error.cause)}`)
      } else {
        yield* Console.error("An unexpected error occurred during authentication.")
        yield* Console.error(String(error))
      }

      if (!(error instanceof UserCancellationError)) {
        const effectError = error instanceof Error ? error : new Error(String(error))
        return yield* Effect.fail(effectError)
      }
    } finally {
      yield* Console.log("Login process finished.")
    }
  }),
)
