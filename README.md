# CLI
The CLI is designed to help you set up your project with [Intent UI](https://intentui.com) quickly and efficiently. It’s the easiest and most convenient way to install Intent UI, allowing you to get started with your project in just minutes.

## Existing Project
If you already have a project set up—whether it’s built with Laravel, Next.js, Remix, Tanstack, or any other framework—simply run the following command to install Intent UI:
```bash
npx @intentui/cli@latest init
```
This command will prompt you to confirm your project’s setup. However, the CLI is smart enough to detect your project type and provide default values.
Here’s an example of the output when running the command in a Next.js project:
```
✔ Initializing.
? Components folder: src/components
? Utils folder: src/utils
? Where would you like to place the CSS file? src/app/globals.css
✔ Installing dependencies.
✔ Configuring.
✔ UI folder created at `src/components/ui`
✔ Primitive file saved to `src/components/ui/primitive.tsx`
✔ Theme Provider file saved to `"src/components/theme-provider.tsx"`
✔ Providers file saved to `"src/components/providers.tsx"`
✔ Configuration saved to `intentui.json`
✔ Installation complete.
```

## Start a New Project
The CLI is highly flexible and can automatically detect whether you already have a project set up. If you don’t, you can start fresh by running the `init` command like this:
```bash
npx @intentui/cli@latest init
```

Running this command will create a new project if no existing setup is detected. Currently, the CLI supports Laravel, Next.js, Remix, and Vite. If you’d like to see support for other frameworks, please [let me know](https://x.com/irsyadadl).
```
? No setup project detected. Do you want to start a new project? (yes/no) yes
? Which framework do you want to use? Next.js
? Which package manager do you want to use? Bun
? Enter the name of your new project: new-project
? Which Tailwind version do you want to use? (3/4) 4
...
...
Project setup complete!
To get started, run: `cd new-project && npm run dev`
```

## Add
Once you’ve set up Intent UI, you can start adding components easily by running the `add` command:
```bash
npx @intentui/cli@latest add combo-box
```

## Diff
If you think your Intent UI setup might be outdated, don’t worry. You can check for changes by running the `diff` command:
```bash
npx @intentui/cli@latest diff
```

This will display the components that differ from your installed versions and provide a list so you can quickly choose which components to update.

## Alias
If you’re tired of typing `npx @intentui/cli@latest`, you can create an alias for the CLI by adding the following line to your `.bashrc` or `.zshrc` file:
```bash
alias intentui='npx @intentui/cli@latest'
```
Then you can run the CLI using the `intentui` command:
```bash
intentui [command]
```
### Help
If you’re unsure about the next steps, you can always refer to the `help` command for guidance:
```bash
npx @intentui/cli@latest help
```
