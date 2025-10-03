declare module "*.mdx" {
  import type { JSX } from "react"
  const MDXComponent: () => JSX.Element
  export default MDXComponent
}
