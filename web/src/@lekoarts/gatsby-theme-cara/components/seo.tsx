import * as React from "react"
import useSiteMetadata from "@lekoarts/gatsby-theme-cara/src/hooks/use-site-metadata"

const Seo = ({
  title,
  description,
  pathname,
  children,
}: {
  title?: string
  description?: string
  pathname?: string
  children?: React.ReactNode
}) => {
  const site = useSiteMetadata()

  const {
    siteTitle,
    siteTitleAlt,
    siteHeadline: _siteHeadline,
    siteUrl,
    siteDescription,
    siteImage,
    siteLanguage,
    author,
  } = site

  const seo = {
    title: title ?? siteTitleAlt,
    description: description ?? siteDescription,
    url: pathname ? `${siteUrl}${pathname}` : siteUrl,
    image: `${siteUrl}${siteImage}`,
  }

  // Structured data for better SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author,
    url: siteUrl,
    jobTitle: "Multidisciplinary Engineer",
    description: siteDescription,
    image: seo.image,
    sameAs: ["https://github.com/jdubz", "https://www.linkedin.com/in/josh-wentworth"],
    knowsAbout: [
      "Software Engineering",
      "Hardware Engineering",
      "Electronics",
      "Lighting Systems",
      "Digital Fabrication",
      "Embedded Systems",
      "Full Stack Development",
    ],
  }

  return (
    <>
      <html lang={siteLanguage} />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#141821" />

      {/* Open Graph */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:creator" content="@jdubz" />

      {/* Additional SEO */}
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />

      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>

      {/* Canonical URL */}
      <link rel="canonical" href={seo.url} />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

      {children}
    </>
  )
}

export default Seo
