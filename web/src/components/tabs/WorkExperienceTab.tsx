import React, { useState, useRef } from "react"
import { Box, Text, Button, Flex, Spinner, Alert, Link } from "theme-ui"
import { useExperienceData } from "../../hooks/useExperienceData"
import { ExperienceEntry } from "../ExperienceEntry"
import { BlurbEntry } from "../BlurbEntry"
import { ReorderModal } from "../ReorderModal"
import { CreateExperienceForm } from "../CreateExperienceForm"
import type { UpdateExperienceData, CreateExperienceData, UpdateBlurbData } from "../../types/experience"
import type { User } from "firebase/auth"
import { logger } from "../../utils/logger"

interface WorkExperienceTabProps {
  isEditor: boolean
  user: User | null
}

export const WorkExperienceTab: React.FC<WorkExperienceTabProps> = ({ isEditor, user }) => {
  const { entries, blurbs, loading, error, createEntry, updateEntry, deleteEntry, createBlurb, updateBlurb } =
    useExperienceData()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [showReorderBlurbsModal, setShowReorderBlurbsModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter page-level blurbs (blurbs come pre-sorted by order field from backend)
  const pageBlurbs = Object.values(blurbs).filter((blurb) => blurb.type === "page" || !blurb.type) // Include blurbs without type for backward compatibility
  const introBlurb = pageBlurbs.find((b) => b.name === "intro")
  const otherBlurbs = pageBlurbs.filter((b) => b.name !== "intro")

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

  const handleReorderBlurbs = async (reorderedItems: Array<{ id: string; title: string; order: number }>) => {
    try {
      // Update each blurb with new order
      for (const item of reorderedItems) {
        await updateBlurb(item.id, { order: item.order })
      }
      logger.info("Blurbs reordered successfully", {
        component: "WorkExperienceTab",
        action: "reorderBlurbs",
      })
    } catch (error) {
      logger.error("Failed to reorder blurbs", error as Error, {
        component: "WorkExperienceTab",
        action: "reorderBlurbs",
      })
      throw error
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

      logger.info("Resume uploaded successfully", {
        component: "WorkExperienceTab",
        action: "handleResumeUpload",
      })
    } catch (error) {
      logger.error("Resume upload failed", error as Error, {
        component: "WorkExperienceTab",
        action: "handleResumeUpload",
      })
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploadingResume(false)
    }
  }

  return (
    <Box>
      {/* Resume Upload/Download Section */}
      <Flex sx={{ alignItems: "center", gap: 3, mb: 4 }}>
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
        <Link
          href="https://storage.googleapis.com/joshwentworth-resume/resume.pdf"
          download="Josh_Wentworth_Resume.pdf"
          onClick={(e) => void handleDownloadResume(e)}
          sx={{
            display: "inline-block",
            fontSize: 2,
            fontWeight: "bold",
            color: "icon_indigo",
            textDecoration: "none",
            transition: "color 0.3s ease",
            cursor: "pointer",
            "&:hover": {
              color: "primary",
            },
          }}
        >
          Download Resume
        </Link>
      </Flex>

      {uploadError && (
        <Text
          sx={{
            mb: 3,
            fontSize: 1,
            color: "red",
          }}
        >
          {uploadError}
        </Text>
      )}

      {/* Content */}
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
          {introBlurb && (
            <BlurbEntry
              name={introBlurb.name}
              blurb={introBlurb}
              isEditor={isEditor}
              onUpdate={handleUpdateBlurb}
              onCreate={handleCreateBlurb}
            />
          )}
          {!introBlurb && isEditor && (
            <BlurbEntry
              name="intro"
              blurb={null}
              isEditor={isEditor}
              onUpdate={handleUpdateBlurb}
              onCreate={handleCreateBlurb}
            />
          )}

          {/* Experience Entries (always chronological order) */}
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

          {/* Create New Entry Button (Editors Only) - After experience, before Selected Projects */}
          {isEditor && !showCreateForm && (
            <Box sx={{ mt: 4, mb: 4 }}>
              <Button onClick={() => setShowCreateForm(true)} variant="primary.sm">
                + New Section
              </Button>
            </Box>
          )}

          {/* Create Form - After experience, before Selected Projects */}
          {showCreateForm && (
            <Box sx={{ mt: 4, mb: 4 }}>
              <CreateExperienceForm onCreate={handleCreateEntry} onCancel={() => setShowCreateForm(false)} />
            </Box>
          )}

          {/* Remaining Blurbs (after experience) - sorted by order field */}
          {isEditor && otherBlurbs.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Button variant="secondary.sm" onClick={() => setShowReorderBlurbsModal(true)}>
                ⇅ Reorder Sections ({otherBlurbs.length})
              </Button>
            </Box>
          )}

          {otherBlurbs.map((blurb) => (
            <BlurbEntry
              key={blurb.name}
              name={blurb.name}
              blurb={blurb}
              isEditor={isEditor}
              onUpdate={handleUpdateBlurb}
              onCreate={handleCreateBlurb}
            />
          ))}
        </>
      )}

      {/* Reorder Blurbs Modal */}
      <ReorderModal
        isOpen={showReorderBlurbsModal}
        title="Reorder Sections"
        items={otherBlurbs.map((blurb) => ({
          id: blurb.name,
          title: blurb.title,
          order: blurb.order ?? 999,
        }))}
        onClose={() => setShowReorderBlurbsModal(false)}
        onSave={handleReorderBlurbs}
      />
    </Box>
  )
}
