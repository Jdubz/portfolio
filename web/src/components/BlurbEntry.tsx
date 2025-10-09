import React, { useState } from "react"
import { Box, Heading, Text, Button, Flex, Input, Textarea } from "theme-ui"
import ReactMarkdown from "react-markdown"
import type { BlurbEntry as BlurbEntryType, UpdateBlurbData } from "../types/experience"

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
      console.error("Save failed:", error)
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
          {/* Title */}
          <Box>
            <Text as="label" sx={{ fontSize: 1, fontWeight: "bold", mb: 1, display: "block" }}>
              Title
            </Text>
            <Input
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              sx={{ fontSize: 2 }}
            />
          </Box>

          {/* Content */}
          <Box>
            <Text as="label" sx={{ fontSize: 1, fontWeight: "bold", mb: 1, display: "block" }}>
              Content (Markdown)
            </Text>
            <Textarea
              value={editData.content}
              onChange={(e) => setEditData({ ...editData, content: e.target.value })}
              rows={12}
              sx={{ fontSize: 2, fontFamily: "monospace" }}
            />
          </Box>

          {/* Actions */}
          <Flex sx={{ gap: 2, justifyContent: "flex-end" }}>
            <Button onClick={handleCancel} variant="secondary.sm" disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={isSaving} variant="primary.sm">
              {isSaving ? "Saving..." : blurb ? "Save" : "Create"}
            </Button>
          </Flex>
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
            <Button onClick={() => setIsEditing(true)} variant="secondary.sm">
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

      <Box
        sx={{
          fontSize: 2,
          lineHeight: 1.6,
          "& h1, & h2, & h3, & h4, & h5, & h6": {
            mt: 3,
            mb: 2,
            fontWeight: "bold",
          },
          "& h2": {
            fontSize: 3,
          },
          "& h3": {
            fontSize: 2,
          },
          "& ul, & ol": {
            pl: 4,
            mb: 2,
          },
          "& li": {
            mb: 1,
          },
          "& p": {
            mb: 2,
          },
          "& code": {
            bg: "muted",
            px: 1,
            borderRadius: "2px",
            fontFamily: "monospace",
          },
          "& a": {
            color: "primary",
            textDecoration: "none",
            "&:hover": {
              textDecoration: "underline",
            },
          },
        }}
      >
        <ReactMarkdown>{blurb.content}</ReactMarkdown>
      </Box>

      {/* Editor Actions */}
      {isEditor && (
        <Box sx={{ mt: 4 }}>
          <Button onClick={() => setIsEditing(true)} variant="secondary.sm">
            Edit
          </Button>
        </Box>
      )}
    </Box>
  )
}
