/** @jsx jsx */
import { Box, jsx } from "theme-ui"

const Footer = () => {
  const trackSocialClick = (platform: string) => {
    import("../../../utils/firebase-analytics")
      .then(({ analyticsEvents }) => {
        analyticsEvents.socialLinkClicked(platform)
      })
      .catch(() => {
        // Analytics not critical
      })
  }

  return (
    // @ts-expect-error - React 18 type compatibility
    <Box
      as="footer"
      variant="layout.footer"
      sx={{
        width: "100%",
        textAlign: "center",
        mt: "auto",
      }}
    >
      <div sx={{ mb: 3, color: "white" }}>Copyright &copy; {new Date().getFullYear()}. All rights reserved.</div>
      <div sx={{ fontSize: 1, display: "flex", gap: [3], justifyContent: "center", flexWrap: "wrap" }}>
        <a href="/privacy" sx={{ variant: "links.white" }}>
          Privacy Policy
        </a>
        <a href="/terms" sx={{ variant: "links.white" }}>
          Terms of Service
        </a>
        <a
          href="https://github.com/Jdubz/portfolio"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackSocialClick("github")}
          sx={{ variant: "links.white" }}
        >
          Source Code
        </a>
      </div>
    </Box>
  )
}

export default Footer
