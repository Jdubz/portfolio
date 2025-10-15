import React, { useState } from "react"
import { Box, Heading, Text, Button, Flex } from "theme-ui"
import type { BlurbEntry as BlurbEntryType, UpdateBlurbData } from "../types/experience"
import { MarkdownContent } from "./MarkdownContent"
import { FormField } from "./FormField"
import { FormActions } from "./FormActions"
import { MarkdownEditor } from "./MarkdownEditor"
import { logger } from "../utils/logger"
import { ProfileHeaderView } from "./blurb-types/ProfileHeaderView"
import { ProfileHeaderEdit } from "./blurb-types/ProfileHeaderEdit"
import { ProjectShowcaseView } from "./blurb-types/ProjectShowcaseView"
import { ProjectShowcaseEdit } from "./blurb-types/ProjectShowcaseEdit"
import { CategorizedListView } from "./blurb-types/CategorizedListView"
import { CategorizedListEdit } from "./blurb-types/CategorizedListEdit"
import { TimelineView } from "./blurb-types/TimelineView"
import { TimelineEdit } from "./blurb-types/TimelineEdit"

interface BlurbEntryProps {
  name: string
  blurb: BlurbEntryType | null
  isEditor: boolean
  onUpdate: (name: string, data: UpdateBlurbData) => Promise<void>
  onCreate: (name: string, title: string, content: string) => Promise<void>
}

// Default titles for known blurbs
const DEFAULT_TITLES: Record<string, string> = {
  intro: "Introduction",
  "selected-projects": "Selected Projects",
  skills: "Skills & Technologies",
  "education-certificates": "Education & Certificates",
  biography: "Biography",
  "closing-notes": "Closing Notes",
}

/**
 * Display component for a markdown blurb
 * Shows placeholder if doesn't exist, read-only view for public, edit mode for editors
 */
export const BlurbEntry: React.FC<BlurbEntryProps> = ({ name, blurb, isEditor, onUpdate, onCreate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editData, setEditData] = useState<UpdateBlurbData & { structuredData?: BlurbEntryType["structuredData"] }>({
    title: blurb?.title ?? DEFAULT_TITLES[name] ?? name,
    content: blurb?.content ?? "",
    structuredData: blurb?.structuredData,
  })

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (blurb) {
        // Update existing blurb
        await onUpdate(name, editData)
      } else {
        // Create new blurb
        await onCreate(name, editData.title ?? DEFAULT_TITLES[name] ?? name, editData.content ?? "")
      }
      setIsEditing(false)
    } catch (error) {
      logger.error("Failed to save blurb", error as Error, {
        component: "BlurbEntry",
        action: "handleSave",
        blurbName: name,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      title: blurb?.title ?? DEFAULT_TITLES[name] ?? name,
      content: blurb?.content ?? "",
      structuredData: blurb?.structuredData,
    })
    setIsEditing(false)
  }

  const renderType = blurb?.renderType || "text"

  // Edit mode
  if (isEditing) {
    return (
      <Box
        sx={{
          variant: "cards.primary",
          p: 4,
          border: "2px solid",
          borderColor: "primary",
          mb: 4,
        }}
      >
        <Flex sx={{ flexDirection: "column", gap: 3 }}>
          <FormField
            label="Title"
            name="title"
            value={editData.title ?? ""}
            onChange={(value) => setEditData({ ...editData, title: value })}
            required
          />

          {/* Render appropriate edit component based on renderType */}
          {renderType === "profile-header" && (
            <ProfileHeaderEdit
              data={editData.structuredData}
              onChange={(data) => setEditData({ ...editData, structuredData: data })}
            />
          )}

          {renderType === "project-showcase" && (
            <ProjectShowcaseEdit
              data={editData.structuredData}
              onChange={(data) => setEditData({ ...editData, structuredData: data })}
            />
          )}

          {renderType === "categorized-list" && (
            <CategorizedListEdit
              data={editData.structuredData}
              onChange={(data) => setEditData({ ...editData, structuredData: data })}
            />
          )}

          {renderType === "timeline" && (
            <TimelineEdit
              data={editData.structuredData}
              onChange={(data) => setEditData({ ...editData, structuredData: data })}
            />
          )}

          {renderType === "text" && (
            <MarkdownEditor
              label="Content (Markdown)"
              name="content"
              value={editData.content ?? ""}
              onChange={(value) => setEditData({ ...editData, content: value })}
              rows={12}
              showPreview
            />
          )}

          <FormActions
            onCancel={handleCancel}
            onSave={() => void handleSave()}
            isSubmitting={isSaving}
            saveText={blurb ? "Save" : "Create"}
          />
        </Flex>
      </Box>
    )
  }

  // Placeholder if blurb doesn't exist
  if (!blurb) {
    return (
      <Box
        sx={{
          variant: "cards.primary",
          p: 4,
          mb: 4,
          opacity: 0.6,
          borderStyle: "dashed",
        }}
      >
        <Heading
          as="h2"
          sx={{
            fontSize: [3, 4],
            mb: 2,
            color: "text",
          }}
        >
          {DEFAULT_TITLES[name] ?? name}
        </Heading>

        <Text
          sx={{
            fontSize: 2,
            color: "textMuted",
            fontStyle: "italic",
          }}
        >
          No content yet.
        </Text>

        {/* Editor Actions */}
        {isEditor && (
          <Box sx={{ mt: 4 }}>
            <Button type="button" onClick={() => setIsEditing(true)} variant="secondary.sm">
              Create Content
            </Button>
          </Box>
        )}
      </Box>
    )
  }

  // Read-only view
  return (
    <Box
      sx={{
        variant: "cards.primary",
        p: 4,
        mb: 4,
      }}
    >
      <Heading
        as="h2"
        sx={{
          fontSize: [3, 4],
          mb: 3,
          color: "text",
        }}
      >
        {blurb.title}
      </Heading>

      {/* Render appropriate view component based on renderType */}
      {renderType === "profile-header" && <ProfileHeaderView blurb={blurb} />}
      {renderType === "project-showcase" && <ProjectShowcaseView blurb={blurb} />}
      {renderType === "categorized-list" && <CategorizedListView blurb={blurb} />}
      {renderType === "timeline" && <TimelineView blurb={blurb} />}
      {renderType === "text" && <MarkdownContent>{blurb.content}</MarkdownContent>}

      {/* Editor Actions */}
      {isEditor && (
        <Box sx={{ mt: 4 }}>
          <Button type="button" onClick={() => setIsEditing(true)} variant="secondary.sm">
            Edit
          </Button>
        </Box>
      )}
    </Box>
  )
}
