import type { GatsbyNode } from "gatsby"
import type { Configuration } from "webpack"

export const onCreateWebpackConfig: GatsbyNode["onCreateWebpackConfig"] = ({ actions, stage, getConfig }) => {
  actions.setWebpackConfig({
    // Add watch options to ignore unnecessary files
    ...(stage === "develop" && {
      watchOptions: {
        ignored: [
          "**/node_modules",
          "**/.cache",
          "**/public",
          "**/.git",
          "**/dist",
          "**/coverage",
          "**/.DS_Store",
          "**/npm-debug.log*",
          "**/yarn-debug.log*",
          "**/yarn-error.log*",
          "**/.env*",
          "**/screenshots",
          "**/lighthouse-*.{html,json}",
        ],
      },
    }),
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
