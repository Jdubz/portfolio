import type { GatsbyNode } from "gatsby"
import type { Configuration } from "webpack"
import path from "path"

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({ actions, stage, getConfig }) => {
  // Configure webpack alias for @/ imports
  actions.setWebpackConfig({
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  })

  // Remove ESLint plugin to avoid compatibility issues with Gatsby's outdated version
  if (stage === "develop" || stage === "develop-html") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const config = getConfig() as Configuration

    if (config.plugins) {
      // Webpack plugin filtering - constructor is a Function type
      config.plugins = config.plugins.filter((plugin) => {
        return plugin?.constructor?.name !== "ESLintWebpackPlugin"
      })
    }

    actions.replaceWebpackConfig(config)
  }
}
