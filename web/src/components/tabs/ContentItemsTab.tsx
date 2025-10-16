import React, { useState, useRef } from "react"
import { Box, Text, Button, Flex, Spinner, Alert, Link } from "theme-ui"
import { useContentItems } from "../../hooks/useContentItems"
import { ContentItem } from "../ContentItem"
import { ReorderModal } from "../ReorderModal"
import { CreateContentItemModal } from "../CreateContentItemModal"
import type { UpdateContentItemData, CreateContentItemData, ContentItemWithChildren } from "../../types/content-item"
import type { User } from "firebase/auth"
import { logger } from "../../utils/logger"
import { getUploadResumeUrl } from "../../config/api"

// Constants
const INTRO_PROFILE_SECTION_KEYWORD = "intro"

interface ContentItemsTabProps {
  isEditor: boolean
  user: User | null
}

/**
 * New unified content management tab using content-items
 * Replaces the old WorkExperienceTab with experiences + blurbs
 */
export const ContentItemsTab: React.FC<ContentItemsTabProps> = ({ isEditor, user }) => {
  const {
    hierarchy,
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    reorderItems,
    getRootItems,
    getItemsByType,
  } = useContentItems()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showReorderModal, setShowReorderModal] = useState(false)
  const [uploadingResume, setUploadingResume] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [createChildContext, setCreateChildContext] = useState<{ parentId: string; childType: string } | null>(null)

  // Get profile sections and companies for rendering
  const profileSections = getItemsByType("profile-section")
  const introSection = profileSections.find(
    (s) => s.type === "profile-section" && s.heading?.toLowerCase().includes(INTRO_PROFILE_SECTION_KEYWORD)
  )

  // Get root-level companies (work experience)
  const companies = hierarchy.filter((item) => item.type === "company")

  // Get other root-level items (skills, education, etc.)
  const otherRootItems = hierarchy.filter((item) => item.type !== "company" && item.type !== "profile-section")

  const handleUpdateItem = async (id: string, data: UpdateContentItemData) => {
    const result = await updateItem(id, data)
    if (!result) {
      throw new Error("Update failed")
    }
  }

  const handleDeleteItem = async (id: string) => {
    const result = await deleteItem(id)
    if (!result) {
      throw new Error("Delete failed")
    }
  }

  const handleCreateItem = async (data: CreateContentItemData) => {
    // If creating a child, set the parentId
    if (createChildContext) {
      data.parentId = createChildContext.parentId
    }

    const result = await createItem(data)
    if (!result) {
      throw new Error("Create failed")
    }
    setShowCreateModal(false)
    setCreateChildContext(null)
  }

  const handleAddChild = (parentId: string, childType: string) => {
    setCreateChildContext({ parentId, childType })
    setShowCreateModal(true)
  }

  const handleReorderRootItems = async (reorderedItems: Array<{ id: string; title: string; order: number }>) => {
    try {
      const itemsToReorder = reorderedItems.map((item) => ({
        id: item.id,
        order: item.order,
      }))

      const success = await reorderItems(itemsToReorder)
      if (!success) {
        throw new Error("Reorder failed")
      }

      logger.info("Root items reordered successfully", {
        component: "ContentItemsTab",
        action: "reorderRootItems",
      })
    } catch (error) {
      logger.error("Failed to reorder root items", error as Error, {
        component: "ContentItemsTab",
        action: "reorderRootItems",
      })
      throw error
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDownloadResume = (e: React.MouseEvent<HTMLAnchorElement>) => {
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

      const functionUrl = getUploadResumeUrl()

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
        component: "ContentItemsTab",
        action: "handleResumeUpload",
      })
    } catch (error) {
      logger.error("Resume upload failed", error as Error, {
        component: "ContentItemsTab",
        action: "handleResumeUpload",
      })
      setUploadError(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploadingResume(false)
    }
  }

  // Recursive render function for hierarchy with children
  const renderItemWithChildren = (item: ContentItemWithChildren) => {
    return (
      <ContentItem
        key={item.id}
        item={item}
        isEditor={isEditor}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
        onAddChild={handleAddChild}
        childItems={item.children || []}
      >
        {/* Render children if they exist */}
        {item.children && item.children.length > 0 && (
          <Box sx={{ mt: 4 }}>{item.children.map((child) => renderItemWithChildren(child))}</Box>
        )}
      </ContentItem>
    )
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

          {/* Intro/Profile Section */}
          {introSection && renderItemWithChildren(introSection)}

          {/* Work Experience (Companies with nested Projects) */}
          {companies.length > 0 && (
            <Box sx={{ mb: 5 }}>{companies.map((company) => renderItemWithChildren(company))}</Box>
          )}

          {companies.length === 0 && (
            <Box sx={{ variant: "cards.primary", p: 4, mb: 4, opacity: 0.6, borderStyle: "dashed" }}>
              <Text sx={{ textAlign: "center", color: "textMuted", fontSize: 2 }}>
                No work experience yet.
                {isEditor && " Click '+ Add Content' below to create entries."}
              </Text>
            </Box>
          )}

          {/* Other Root Items (Skills, Education, Text Sections, etc.) */}
          {isEditor && otherRootItems.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Button variant="secondary.sm" onClick={() => setShowReorderModal(true)}>
                ⇅ Reorder Sections ({otherRootItems.length})
              </Button>
            </Box>
          )}

          {otherRootItems.map((item) => renderItemWithChildren(item))}

          {/* Create New Content Button (Editors Only) */}
          {isEditor && (
            <Box sx={{ mt: 5, mb: 4 }}>
              <Button onClick={() => setShowCreateModal(true)} variant="primary.sm">
                + Add Content
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Create Content Modal */}
      {showCreateModal && (
        <CreateContentItemModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setCreateChildContext(null)
          }}
          onCreate={handleCreateItem}
          preselectedType={createChildContext?.childType}
        />
      )}

      {/* Reorder Modal */}
      <ReorderModal
        isOpen={showReorderModal}
        title="Reorder Sections"
        items={otherRootItems.map((item) => ({
          id: item.id,
          title: getTitleForItem(item),
          order: item.order,
        }))}
        onClose={() => setShowReorderModal(false)}
        onSave={handleReorderRootItems}
      />
    </Box>
  )
}

/**
 * Helper to get display title for different item types
 */
function getTitleForItem(item: ContentItemWithChildren): string {
  switch (item.type) {
    case "company":
      return item.company
    case "project":
      return item.name
    case "skill-group":
      return item.category
    case "education":
      return item.institution
    case "profile-section":
      return item.heading
    case "text-section":
      return item.heading || "Text Section"
    case "accomplishment":
      return item.description.substring(0, 50) + "..."
    case "timeline-event":
      return item.title
    default:
      return "Item"
  }
}
