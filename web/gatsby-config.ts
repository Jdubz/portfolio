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
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Josh Wentworth - Portfolio`,
        short_name: `JW`,
        description: `Multidisciplinary engineer blending software, electronics/lighting, and digital fabrication`,
        start_url: `/`,
        background_color: `#141821`,
        theme_color: `#0EA5E9`,
        display: `standalone`,
        icons: [
          {
            src: `/favicons/primary-192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `/favicons/primary-512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
          {
            src: `/favicons/maskable-primary-192.png`,
            sizes: `192x192`,
            type: `image/png`,
            purpose: `maskable`,
          },
          {
            src: `/favicons/maskable-primary-512.png`,
            sizes: `512x512`,
            type: `image/png`,
            purpose: `maskable`,
          },
        ],
      },
    },
  ],
}

export default config
