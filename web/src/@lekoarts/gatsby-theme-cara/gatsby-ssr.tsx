import { GatsbySSR } from "gatsby"

// Icons are loaded on-demand via SVG sprite references
// No need to preload/prefetch since they're used throughout the page
export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHeadComponents }) => {
  setHeadComponents([])
}
