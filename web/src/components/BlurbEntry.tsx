import React, { useState } from "react"
import { Box, Heading, Text, Button, Flex } from "theme-ui"
import type { BlurbEntry as BlurbEntryType, UpdateBlurbData } from "../types/experience"
import { MarkdownContent } from "./MarkdownContent"
import { FormField } from "./FormField"
import { FormActions } from "./FormActions"
import { MarkdownEditor } from "./MarkdownEditor"
import { logger } from "../utils/logger"

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
  const [editData, setEditData] = useState<UpdateBlurbData>({
    title: blurb?.title ?? DEFAULT_TITLES[name] ?? name,
    content: blurb?.content ?? "",
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
    })
    setIsEditing(false)
  }

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

          <MarkdownEditor
            label="Content (Markdown)"
            name="content"
            value={editData.content ?? ""}
            onChange={(value) => setEditData({ ...editData, content: value })}
            rows={12}
            showPreview
          />

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

      <MarkdownContent>{blurb.content}</MarkdownContent>

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
