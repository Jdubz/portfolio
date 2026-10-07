import type { GatsbyConfig } from "gatsby"

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
    // MDX support for content sections
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `sections`,
        path: `${__dirname}/src/content/sections`,
      },
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        extensions: [`.mdx`, `.md`],
        gatsbyRemarkPlugins: [],
      },
    },
    // Theme-UI for styling
    `gatsby-plugin-theme-ui`,
  ],
}

export default config
