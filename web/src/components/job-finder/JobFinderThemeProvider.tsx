import React from "react"
import { ThemeProvider, Box } from "theme-ui"
import { jobFinderTheme } from "../../theme/jobFinderTheme"

interface JobFinderThemeProviderProps {
  children: React.ReactNode
}

export const JobFinderThemeProvider: React.FC<JobFinderThemeProviderProps> = ({ children }) => (
  <ThemeProvider theme={jobFinderTheme}>
    <Box
      data-theme="job-finder"
      sx={{
        bg: "background",
        color: "text",
        minHeight: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      {children}
    </Box>
  </ThemeProvider>
)
