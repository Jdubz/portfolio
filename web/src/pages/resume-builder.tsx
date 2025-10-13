import React, { useState } from "react"
import { Box, Heading, Text, Button, Flex, Spinner } from "theme-ui"
import { Link, type HeadFC } from "gatsby"
import Seo from "../components/homepage/Seo"
import { useAuth, signInWithGoogle, signOut } from "../hooks/useAuth"
import { Tabs, type Tab } from "../components/Tabs"
import { WorkExperienceTab } from "../components/tabs/WorkExperienceTab"
import { DocumentBuilderTab } from "../components/tabs/DocumentBuilderTab"
import { AIPromptsTab } from "../components/tabs/AIPromptsTab"
import { SettingsTab } from "../components/tabs/SettingsTab"
import { logger } from "../utils/logger"

/**
 * Unified Resume Builder Page with Tabs
 *
 * Tabs:
 * 1. Work Experience - View/manage professional experience portfolio
 * 2. Document Builder - Generate AI-powered resumes and cover letters
 * 3. AI Prompts - Customize AI prompts (coming soon)
 * 4. Settings - Manage default personal information (editors only)
 */
const ResumeBuilderPage: React.FC = () => {
  const { user, isEditor, loading: authLoading } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("document-builder")

  const handleSignIn = () => {
    setSigningIn(true)
    setAuthError(null)
    void signInWithGoogle()
      .then(() => {
        // Success handled by auth state listener
      })
      .catch((error) => {
        setAuthError(error instanceof Error ? error.message : "Sign-in failed")
      })
      .finally(() => {
        setSigningIn(false)
      })
  }

  const handleSignOut = () => {
    void signOut().catch((error) => {
      logger.error("Failed to sign out", error as Error, {
        page: "resume-builder",
        action: "handleSignOut",
      })
    })
  }

  const tabs: Tab[] = [
    {
      id: "work-experience",
      label: "Work Experience",
      content: <WorkExperienceTab isEditor={isEditor} user={user} />,
    },
    {
      id: "document-builder",
      label: "Document Builder",
      content: <DocumentBuilderTab isEditor={isEditor} />,
    },
    {
      id: "ai-prompts",
      label: "AI Prompts",
      content: <AIPromptsTab isEditor={isEditor} />,
    },
    {
      id: "settings",
      label: "Settings",
      content: <SettingsTab isEditor={isEditor} />,
    },
  ]

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bg: "background",
        px: [4, 5, 6],
        py: [5, 6, 7],
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
        }}
      >
        {/* Home Button */}
        <Box sx={{ mb: 5 }}>
          <Link
            to="/"
            style={{
              color: "inherit",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              fontSize: "16px",
            }}
          >
            ← Back to Home
          </Link>
        </Box>

        {/* Header */}
        <Flex
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 5,
            flexDirection: ["column", "row"],
            gap: [3, 0],
          }}
        >
          <Box>
            <Heading
              as="h1"
              sx={{
                fontSize: [5, 6, 7],
                mb: 2,
                color: "text",
              }}
            >
              Resume Builder
            </Heading>

            <Text
              sx={{
                fontSize: [2, 3],
                color: "textMuted",
                mb: 3,
              }}
            >
              Manage your experience portfolio and generate AI-powered resumes
            </Text>
          </Box>

          {/* Auth Button */}
          <Box>
            {authLoading ? (
              <Spinner size={24} />
            ) : (
              <Box>
                <Flex
                  sx={{
                    alignItems: "center",
                    gap: 3,
                    flexDirection: ["column", "row"],
                  }}
                >
                  <Button
                    onClick={user ? handleSignOut : handleSignIn}
                    variant="secondary.sm"
                    disabled={signingIn}
                    sx={{
                      cursor: signingIn ? "wait" : "pointer",
                    }}
                  >
                    {isEditor ? "Editor" : "Viewer"}
                  </Button>
                </Flex>
                {authError && (
                  <Text
                    sx={{
                      mt: 2,
                      fontSize: 1,
                      color: "red",
                    }}
                  >
                    {authError}
                  </Text>
                )}
              </Box>
            )}
          </Box>
        </Flex>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </Box>
    </Box>
  )
}

export default ResumeBuilderPage

export const Head: HeadFC = () => (
  <Seo
    title="Resume Builder - Josh Wentworth"
    description="Manage your experience portfolio and generate AI-powered resumes and cover letters"
  />
)
