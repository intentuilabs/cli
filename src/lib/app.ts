export const app = {
  repo: {
    base: "irsyadadl/intentui",
    branch: "3.x",
    get ui() {
      return `https://raw.githubusercontent.com/${this.base}/${this.branch}/components/ui`
    },
  },
}
