/** @jsx jsx */
import { Box, jsx } from "theme-ui"

type FooterProps = {
  /**
   * Set on ordinary pages. The homepage footer is pinned over the dark wave, so it is positioned
   * absolutely and uses white text; on a page it sits in the flow and follows the colour mode.
   */
  onPage?: boolean
}

const Footer = ({ onPage = false }: FooterProps) => {
  const link = { variant: onPage ? "links.primary" : "links.white" }

  return (
    // @ts-expect-error - React 18 type compatibility
    <Box
      as="footer"
      variant="layout.footer"
      sx={{
        width: "100%",
        textAlign: "center",
        mt: "auto",
        ...(onPage && { position: "static", borderTop: "1px solid", borderColor: "divider" }),
      }}
    >
      <div sx={{ mb: 3, color: onPage ? "textMuted" : "white" }}>
        Copyright &copy; {new Date().getFullYear()}. All rights reserved.
      </div>
      <div sx={{ fontSize: 1, display: "flex", gap: [3], justifyContent: "center", flexWrap: "wrap" }}>
        <a href="/privacy" sx={link}>
          Privacy Policy
        </a>
        <a href="/terms" sx={link}>
          Terms of Service
        </a>
        <a href="https://github.com/Jdubz/portfolio" target="_blank" rel="noopener noreferrer" sx={link}>
          Source Code
        </a>
      </div>
    </Box>
  )
}

export default Footer
