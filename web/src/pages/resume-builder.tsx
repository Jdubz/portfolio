import React, { useState, useEffect } from "react"
import { Box, Heading, Text, Button, Flex, Spinner } from "theme-ui"
import { Link, type HeadFC, navigate } from "gatsby"
import Seo from "../components/homepage/Seo"
import { useAuth, signInWithGoogle, signOut } from "../hooks/useAuth"
import { Tabs, type Tab } from "../components/Tabs"
import { WorkExperienceTab } from "../components/tabs/WorkExperienceTab"
import { DocumentBuilderTab } from "../components/tabs/DocumentBuilderTab"
import { AIPromptsTab } from "../components/tabs/AIPromptsTab"
import { SettingsTab } from "../components/tabs/SettingsTab"
import { DocumentHistoryTab } from "../components/tabs/DocumentHistoryTab"
import { logger } from "../utils/logger"

/**
 * Unified Resume Builder Page with Tabs
 *
 * Tabs with URL routing support:
 * - /resume-builder?tab=work-experience
 * - /resume-builder?tab=document-builder (default)
 * - /resume-builder?tab=ai-prompts
 * - /resume-builder?tab=settings
 * - /resume-builder?tab=history (editor-only)
 *
 * Legacy routes (redirects):
 * - /experience → /resume-builder?tab=work-experience
 * - /resume-settings → /resume-builder?tab=settings
 */
const ResumeBuilderPage: React.FC = () => {
  const { user, isEditor, loading: authLoading } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Get initial tab from URL query param
  const getInitialTab = (): string => {
    if (typeof window === "undefined") {
      return "document-builder"
    }
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get("tab")
    const validTabs = ["work-experience", "document-builder", "ai-prompts", "settings", "history"]
    return tabParam && validTabs.includes(tabParam) ? tabParam : "document-builder"
  }

  const [activeTab, setActiveTab] = useState<string>(getInitialTab())

  // Sync URL with active tab
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const currentParams = new URLSearchParams(window.location.search)
    const currentTab = currentParams.get("tab")

    if (currentTab !== activeTab) {
      const newUrl = activeTab === "document-builder" ? "/resume-builder" : `/resume-builder?tab=${activeTab}`
      void navigate(newUrl, { replace: true })
    }
  }, [activeTab])

  // Listen for browser back/forward navigation
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handlePopState = () => {
      const newTab = getInitialTab()
      setActiveTab(newTab)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  // Redirect non-editors away from history tab
  useEffect(() => {
    if (!authLoading && activeTab === "history" && !isEditor) {
      logger.info("Non-editor attempted to access history tab, redirecting to document-builder", {
        page: "resume-builder",
        user: user?.email ?? "anonymous",
      })
      void navigate("/resume-builder?tab=document-builder", { replace: true })
    }
  }, [authLoading, activeTab, isEditor, user])

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

  // Build tabs array (conditionally include history for editors only)
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
      label: "Personal Info",
      content: <SettingsTab isEditor={isEditor} />,
    },
    // Only show history tab to editors
    ...(isEditor
      ? [
          {
            id: "history",
            label: "Document History",
            content: <DocumentHistoryTab isEditor={isEditor} />,
          },
        ]
      : []),
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
