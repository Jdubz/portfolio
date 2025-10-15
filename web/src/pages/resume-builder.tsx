import React, { useState, useEffect } from "react"
import { Box, Heading, Text, Button, Flex, Spinner } from "theme-ui"
import { Link, type HeadFC, navigate } from "gatsby"
import Seo from "../components/homepage/Seo"
import { useAuth, signInWithGoogle, signOut } from "../hooks/useAuth"
import { Tabs, type Tab } from "../components/Tabs"
import { HowItWorksTab } from "../components/tabs/HowItWorksTab"
import { WorkExperienceTab } from "../components/tabs/WorkExperienceTab"
import { DocumentBuilderTab } from "../components/tabs/DocumentBuilderTab"
import { AIPromptsTab } from "../components/tabs/AIPromptsTab"
import { SettingsTab } from "../components/tabs/SettingsTab"
import { DocumentHistoryTab } from "../components/tabs/DocumentHistoryTab"
import { JobApplicationsTab } from "../components/tabs/JobApplicationsTab"
import { GenerationDetailsModal } from "../components/GenerationDetailsModal"
import { ErrorBoundary } from "../components/ErrorBoundary"
import { logger } from "../utils/logger"
import type { GenerationRequest } from "../types/generator"

/**
 * Unified Resume Builder Page with Tabs
 *
 * Tabs with URL routing support:
 * - /resume-builder (default - shows "How It Works")
 * - /resume-builder?tab=how-it-works
 * - /resume-builder?tab=work-experience
 * - /resume-builder?tab=document-builder
 * - /resume-builder?tab=ai-prompts
 * - /resume-builder?tab=settings
 * - /resume-builder?tab=history (editor-only)
 * - /resume-builder?tab=job-applications (editor-only)
 *
 * Legacy routes (redirects):
 * - /experience → /resume-builder?tab=work-experience
 * - /resume-settings → /resume-builder?tab=settings
 */
const ResumeBuilderPage: React.FC = () => {
  const { user, isEditor, loading: authLoading } = useAuth()
  const [signingIn, setSigningIn] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Document generation state
  const [modalRequest, setModalRequest] = useState<GenerationRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get initial tab from URL query param
  const getInitialTab = (): string => {
    if (typeof window === "undefined") {
      return "how-it-works"
    }
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get("tab")
    const validTabs = [
      "how-it-works",
      "work-experience",
      "document-builder",
      "ai-prompts",
      "settings",
      "history",
      "job-applications",
    ]
    return tabParam && validTabs.includes(tabParam) ? tabParam : "how-it-works"
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
      const newUrl = activeTab === "how-it-works" ? "/resume-builder" : `/resume-builder?tab=${activeTab}`
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

  // Redirect non-editors away from history and job-applications tabs
  useEffect(() => {
    if (!authLoading && (activeTab === "history" || activeTab === "job-applications") && !isEditor) {
      logger.info("Non-editor attempted to access editor-only tab, redirecting to document-builder", {
        page: "resume-builder",
        tab: activeTab,
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

  const handleViewGeneratedDocs = (request: GenerationRequest) => {
    setModalRequest(request)
    setIsModalOpen(true)
    logger.info("Viewing generated documents from job match", {
      generationId: request.id,
    })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalRequest(null)
  }

  // Build tabs array (conditionally include editor-only tabs)
  // Each tab wrapped in ErrorBoundary to prevent entire app crashes
  const tabs: Tab[] = [
    {
      id: "how-it-works",
      label: "How It Works",
      content: (
        <ErrorBoundary>
          <HowItWorksTab />
        </ErrorBoundary>
      ),
    },
    {
      id: "work-experience",
      label: "Work Experience",
      content: (
        <ErrorBoundary>
          <WorkExperienceTab isEditor={isEditor} user={user} />
        </ErrorBoundary>
      ),
    },
    {
      id: "document-builder",
      label: "Document Builder",
      content: (
        <ErrorBoundary>
          <DocumentBuilderTab isEditor={isEditor} />
        </ErrorBoundary>
      ),
    },
    {
      id: "ai-prompts",
      label: "AI Prompts",
      content: (
        <ErrorBoundary>
          <AIPromptsTab isEditor={isEditor} />
        </ErrorBoundary>
      ),
    },
    {
      id: "settings",
      label: "Personal Info",
      content: (
        <ErrorBoundary>
          <SettingsTab isEditor={isEditor} />
        </ErrorBoundary>
      ),
    },
    // Only show editor-only tabs to editors
    ...(isEditor
      ? [
          {
            id: "job-applications",
            label: "Job Applications",
            content: (
              <ErrorBoundary>
                <JobApplicationsTab onViewGeneratedDocs={handleViewGeneratedDocs} />
              </ErrorBoundary>
            ),
          },
          {
            id: "history",
            label: "Document History",
            content: (
              <ErrorBoundary>
                <DocumentHistoryTab isEditor={isEditor} />
              </ErrorBoundary>
            ),
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

      {/* Generation Details Modal */}
      {isModalOpen && modalRequest && <GenerationDetailsModal request={modalRequest} onClose={handleCloseModal} />}
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
