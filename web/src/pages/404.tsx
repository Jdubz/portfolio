import * as React from "react"
import { HeadFC, PageProps } from "gatsby"
import PageShell from "../components/PageShell"
import ButtonLink from "../components/elements/ButtonLink"
import Seo from "../components/homepage/Seo"

const NotFound = (_props: PageProps) => (
  <PageShell kicker="404" title="Page not found" lead="The page you were looking for does not exist.">
    <ButtonLink to="/">Back to the homepage</ButtonLink>
  </PageShell>
)

export default NotFound

export const Head: HeadFC = () => <Seo title="404 - Not Found" />
