import type { GatsbyConfig, PluginRef } from "gatsby"
import "dotenv/config"

const shouldAnalyseBundle = process.env.ANALYSE_BUNDLE

const config: GatsbyConfig = {
  siteMetadata: {
    // Site metadata used for SEO and social media
    // These values are available to query via GraphQL
    siteTitle: `Josh Wentworth`,
    siteTitleAlt: `Josh Wentworth - Software × Hardware × Fabrication`,
    siteHeadline: `Josh Wentworth - Multidisciplinary Engineer`,
    siteUrl: `https://joshwentworth.com`,
    siteDescription: `Multidisciplinary engineer blending software, electronics/lighting, and digital fabrication. End-to-end problem solving.`,
    siteImage: `/banner.jpg`,
    siteLanguage: `en`,
    author: `Josh Wentworth`,
  },
  trailingSlash: `always`,
  plugins: [
    `gatsby-plugin-postcss`,
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        output: `/`,
        excludes: [],
      },
    },
    {
      resolve: `@lekoarts/gatsby-theme-cara`,
      // Gatsby theme providing the core functionality
      options: {},
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Josh Wentworth - Portfolio`,
        short_name: `Josh Wentworth`,
        description: `Multidisciplinary engineer blending software, electronics/lighting, and digital fabrication`,
        start_url: `/`,
        background_color: `#141821`,
        // This will impact how browsers show your PWA/website
        // https://css-tricks.com/meta-theme-color-and-trickery/
        // theme_color: `#f6ad55`,
        display: `standalone`,
        icons: [
          {
            src: `/android-chrome-192x192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `/android-chrome-512x512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
        ],
      },
    },
    // You can remove this plugin if you don't need it
    shouldAnalyseBundle && {
      resolve: `gatsby-plugin-webpack-statoscope`,
      options: {
        saveReportTo: `${__dirname}/public/.statoscope/_bundle.html`,
        saveStatsTo: `${__dirname}/public/.statoscope/_stats.json`,
        open: false,
      },
    },
  ].filter(Boolean) as Array<PluginRef>,
}

export default config
