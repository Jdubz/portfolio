import { graphql, useStaticQuery } from "gatsby"

interface SiteMetadata {
  siteTitle: string
  siteTitleAlt: string
  siteHeadline: string
  siteUrl: string
  siteDescription: string
  siteImage: string
  siteLanguage: string
  author: string
}

const useSiteMetadata = (): SiteMetadata => {
  const data = useStaticQuery<{ site: { siteMetadata: SiteMetadata } }>(graphql`
    query {
      site {
        siteMetadata {
          siteTitle
          siteTitleAlt
          siteHeadline
          siteUrl
          siteDescription
          siteImage
          siteLanguage
          author
        }
      }
    }
  `)

  return data.site.siteMetadata
}

export default useSiteMetadata
