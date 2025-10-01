import type { GatsbyNode } from "gatsby"
import type { Configuration } from "webpack"

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({
  actions,
  stage,
  getConfig
}) => {
  // Remove ESLint plugin to avoid compatibility issues with Gatsby's outdated version
  if (stage === "develop" || stage === "develop-html") {
    const config = getConfig() as Configuration

    if (config.plugins) {
      config.plugins = config.plugins.filter((plugin) => {
        return plugin?.constructor?.name !== "ESLintWebpackPlugin"
      })
    }

    actions.replaceWebpackConfig(config)
  }
}
