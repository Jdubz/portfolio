import React, { useState, useRef } from "react"
import { Box, Heading, Text, Button, Flex, Spinner, Alert } from "theme-ui"
import { Link, type HeadFC } from "gatsby"
import Seo from "../components/homepage/Seo"
import { useAuth, signInWithGoogle, signOut } from "../hooks/useAuth"
import { useExperienceData } from "../hooks/useExperienceData"
import { ExperienceEntry } from "../components/ExperienceEntry"
import { BlurbEntry } from "../components/BlurbEntry"
import { CreateExperienceForm } from "../components/CreateExperienceForm"
import type { UpdateExperienceData, CreateExperienceData, UpdateBlurbData } from "../types/experience"

/**
 * Experience Portfolio Page
 *
 * Public: Displays all experience entries (read-only)
 * Editors: Can edit/delete entries inline when authenticated with role: 'editor'
 *
 * This is a hidden page shared via direct URL with recruiters/tools
 */
const ExperiencePage: React.FC = () => {
  const { user, isEditor, loading: authLoading } = useAuth()
  const { entries, blurbs, loading, error, createEntry, updateEntry, deleteEntry, createBlurb, updateBlurb } =
    useExperienceData()
  const [signingIn, setSigningIn] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Define blurb order
  const blurbOrder = ["intro", "selected-projects", "skills", "education-certificates", "biography", "closing-notes"]

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
      console.error("Sign out failed:", error)
    })
  }

  const handleUpdateEntry = async (id: string, data: UpdateExperienceData) => {
    const result = await updateEntry(id, data)
    if (!result) {
      throw new Error("Update failed")
    }
  }

  const handleDeleteEntry = async (id: string) => {
    const result = await deleteEntry(id)
    if (!result) {
      throw new Error("Delete failed")
    }
  }

  const handleCreateEntry = async (data: CreateExperienceData) => {
    const result = await createEntry(data)
    if (!result) {
      throw new Error("Create failed")
    }
    setShowCreateForm(false)
  }

  const handleUpdateBlurb = async (name: string, data: UpdateBlurbData) => {
    const result = await updateBlurb(name, data)
    if (!result) {
      throw new Error("Update failed")
    }
  }

  const handleCreateBlurb = async (name: string, title: string, content: string) => {
    const result = await createBlurb({ name, title, content })
    if (!result) {
      throw new Error("Create failed")
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDownloadResume = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Use direct link - GCS doesn't support CORS for fetch
    // Browser will handle the download automatically via the <a> tag's download attribute
    e.preventDefault()
    window.open("https://storage.googleapis.com/joshwentworth-resume/resume.pdf", "_blank")
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    // Validate PDF
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed")
      return
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB")
      return
    }

    setUploadingResume(true)
    setUploadError(null)

    try {
      const token = await user?.getIdToken()
      if (!token) {
        throw new Error("Not authenticated")
      }

      const functionUrl =
        process.env.GATSBY_ENVIRONMENT === "production"
          ? (process.env.GATSBY_UPLOAD_RESUME_URL_PROD ??
            "https://us-central1-static-sites-257923.cloudfunctions.net/uploadResume")
          : (process.env.GATSBY_UPLOAD_RESUME_URL_DEV ??
            "https://us-central1-static-sites-257923.cloudfunctions.net/uploadResume")

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = (await response.json()) as { success?: boolean; message?: string }

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Upload failed")
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Reload the page to update the download link
      window.location.reload()
    } catch (error) {
      console.error("Resume upload failed:", error)
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploadingResume(false)
    }
  }

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
        <Box
          sx={{
            mb: 5,
          }}
        >
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
              Experience Portfolio
            </Heading>

            <Text
              sx={{
                fontSize: [2, 3],
                color: "textMuted",
                mb: 3,
              }}
            >
              Complete professional experience and work history
            </Text>
            <br />
            <Flex sx={{ alignItems: "center", gap: 3 }}>
              {isEditor && (
                <>
                  <Button
                    onClick={handleUploadClick}
                    disabled={uploadingResume}
                    variant="secondary.sm"
                    sx={{
                      cursor: uploadingResume ? "wait" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                    title="Upload Resume"
                  >
                    {uploadingResume ? (
                      <Spinner size={16} />
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    )}
                    {uploadingResume ? "Uploading..." : "Upload"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => void handleFileChange(e)}
                    style={{ display: "none" }}
                  />
                </>
              )}
              <a
                href="https://storage.googleapis.com/joshwentworth-resume/resume.pdf"
                download="Josh_Wentworth_Resume.pdf"
                onClick={(e) => void handleDownloadResume(e)}
                style={{
                  display: "inline-block",
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#667eea",
                  textDecoration: "none",
                  transition: "color 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#0ea5e9")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#667eea")}
              >
                Download Resume
              </a>
            </Flex>
            {uploadError && (
              <Text
                sx={{
                  mt: 2,
                  fontSize: 1,
                  color: "red",
                }}
              >
                {uploadError}
              </Text>
            )}
          </Box>

          {/* Mode Indicator */}
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

        {/* Page Content */}
        <Box sx={{ mt: 5 }}>
          {/* Show loading spinner */}
          {loading ? (
            <Flex sx={{ justifyContent: "center", py: 6 }}>
              <Spinner size={48} />
            </Flex>
          ) : (
            <>
              {/* Show errors if any */}
              {error && (
                <Alert variant="error" sx={{ mb: 4 }}>
                  {error}
                </Alert>
              )}

              {/* Intro Blurb */}
              <BlurbEntry
                name="intro"
                blurb={blurbs["intro"] ?? null}
                isEditor={isEditor}
                onUpdate={handleUpdateBlurb}
                onCreate={handleCreateBlurb}
              />

              {/* Experience Entries */}
              {entries.length === 0 ? (
                <Box sx={{ variant: "cards.primary", p: 4, mb: 4, opacity: 0.6, borderStyle: "dashed" }}>
                  <Text sx={{ textAlign: "center", color: "textMuted", fontSize: 2 }}>
                    No experience entries yet.
                    {isEditor && " Click '+ New Section' below to create one."}
                  </Text>
                </Box>
              ) : (
                <Box>
                  {entries.map((entry) => (
                    <ExperienceEntry
                      key={entry.id}
                      entry={entry}
                      isEditor={isEditor}
                      onUpdate={handleUpdateEntry}
                      onDelete={handleDeleteEntry}
                    />
                  ))}
                </Box>
              )}

              {/* Remaining Blurbs (after experience) */}
              {blurbOrder.slice(1).map((blurbName) => (
                <BlurbEntry
                  key={blurbName}
                  name={blurbName}
                  blurb={blurbs[blurbName] ?? null}
                  isEditor={isEditor}
                  onUpdate={handleUpdateBlurb}
                  onCreate={handleCreateBlurb}
                />
              ))}
            </>
          )}
        </Box>

        {/* Create New Entry Button (Editors Only) - Bottom of list */}
        {isEditor && !showCreateForm && (
          <Box sx={{ mt: 4 }}>
            <Button onClick={() => setShowCreateForm(true)} variant="primary.sm">
              + New Section
            </Button>
          </Box>
        )}

        {/* Create Form - Bottom of list */}
        {showCreateForm && (
          <Box sx={{ mt: 4 }}>
            <CreateExperienceForm onCreate={handleCreateEntry} onCancel={() => setShowCreateForm(false)} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ExperiencePage

export const Head: HeadFC = () => (
  <Seo
    title="Experience Portfolio - Josh Wentworth"
    description="Complete professional experience and work history. Full-stack engineer specializing in React, TypeScript, Node.js, Python, and cloud architecture."
  />
)
