/** @jsx jsx */
import { Box, jsx } from "theme-ui"

const Footer = () => {
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
      <div sx={{ mb: 3 }}>Copyright &copy; {new Date().getFullYear()}. All rights reserved.</div>
      <div sx={{ fontSize: 1, display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
        <a href="/privacy" sx={{ variant: "links.muted" }}>
          Privacy Policy
        </a>
        <a href="/terms" sx={{ variant: "links.muted" }}>
          Terms of Service
        </a>
        <a
          href="https://github.com/Jdubz/portfolio"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ variant: "links.muted" }}
        >
          Source Code
        </a>
      </div>
    </Box>
  )
}

export default Footer
