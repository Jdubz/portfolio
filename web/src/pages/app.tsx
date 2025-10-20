/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Theme UI jsx pragma causes TypeScript errors with classic JSX runtime
/** @jsx jsx */
/** @jsxFrag React.Fragment */
import React from "react"
import { Box, Heading, Text, Button, jsx } from "theme-ui"
import { Link } from "gatsby"

/**
 * App Redirect Page
 *
 * This page now redirects to the Job Finder application hosted on Firebase.
 * Redirects are handled via Firebase Hosting configuration in firebase.json.
 * 
 * Production: https://job-finder.joshwentworth.com
 * Staging: https://job-finder-staging.joshwentworth.com
 */
const AppPage: React.FC = () => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      px: 4,
      bg: "background",
    }}
  >
    <Box sx={{ maxWidth: "600px" }}>
      <Heading
        as="h1"
        sx={{
          fontSize: [5, 6, 7],
          mb: 3,
          background: "linear-gradient(135deg, var(--theme-ui-colors-primary), var(--theme-ui-colors-accent))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Redirecting...
      </Heading>

      <Text
        sx={{
          fontSize: [2, 3],
          mb: 4,
          color: "textMuted",
          lineHeight: 1.6,
        }}
      >
        The Job Finder app has moved to its own domain
      </Text>

      <Text
        sx={{
          fontSize: 1,
          mb: 5,
          color: "textMuted",
          opacity: 0.8,
        }}
      >
        You should be automatically redirected. If not, the application is now hosted at job-finder.joshwentworth.com
      </Text>

      <Link to="/" sx={{ textDecoration: "none" }}>
        <Button
          sx={{
            px: 5,
            py: 3,
            fontSize: 2,
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          }}
        >
          ← Back to Home
        </Button>
      </Link>
    </Box>
  </Box>
)

export default AppPage

export const Head = () => <title>Redirecting to Job Finder | Josh Wentworth</title>
