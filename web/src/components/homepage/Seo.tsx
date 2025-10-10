import * as React from "react"
import useSiteMetadata from "../../hooks/useSiteMetadata"

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

      {/* Favicons */}
      <link rel="icon" href="/favicons/favicon.ico" sizes="any" />
      <link rel="icon" type="image/svg+xml" href="/favicons/favicon-primary.svg" />
      <link rel="icon" href="/favicons/favicon-mono.svg" media="(prefers-color-scheme: light)" />
      <link rel="icon" href="/favicons/favicon-dark.svg" media="(prefers-color-scheme: dark)" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicons/primary-32.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/favicons/primary-192.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/favicons/primary-512.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon-primary-180.png" />
      <link rel="mask-icon" href="/favicons/favicon-mono.svg" color="#0EA5E9" />
      <link rel="manifest" href="/favicons/site.webmanifest" />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

      {children}
    </>
  )
}

export default Seo
