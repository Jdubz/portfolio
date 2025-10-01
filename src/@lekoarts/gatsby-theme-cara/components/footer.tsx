/** @jsx jsx */
import { Box, jsx } from "theme-ui"

const Footer = () => {
  return (
    // @ts-expect-error - React 18 type compatibility
    <Box as="footer" variant="footer">
      Copyright &copy; {new Date().getFullYear()}. All rights reserved.
    </Box>
  )
}

export default Footer
