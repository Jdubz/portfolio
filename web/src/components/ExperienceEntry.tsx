import React, { useState } from "react"
import { Box, Heading, Text, Button, Flex, Input, Textarea } from "theme-ui"
import type { ExperienceEntry as ExperienceEntryType, UpdateExperienceData } from "../types/experience"

interface ExperienceEntryProps {
  entry: ExperienceEntryType
  isEditor: boolean
  onUpdate: (id: string, data: UpdateExperienceData) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

/**
 * Display component for a single experience entry
 * Shows read-only view for public, edit mode for editors
 */
export const ExperienceEntry: React.FC<ExperienceEntryProps> = ({ entry, isEditor, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editData, setEditData] = useState<UpdateExperienceData>({
    title: entry.title,
    role: entry.role,
    body: entry.body,
    startDate: entry.startDate,
    endDate: entry.endDate,
    notes: entry.notes,
  })

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) {
      return "Present"
    }
    const [year, month] = dateStr.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(entry.id, editData)
      setIsEditing(false)
    } catch (error) {
      console.error("Save failed:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      title: entry.title,
      role: entry.role,
      body: entry.body,
      startDate: entry.startDate,
      endDate: entry.endDate,
      notes: entry.notes,
    })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${entry.title}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(entry.id)
    } catch (error) {
      console.error("Delete failed:", error)
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <Box
        sx={{
          bg: "muted",
          p: 4,
          borderRadius: "8px",
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

          {/* Role */}
          <Box>
            <Text as="label" sx={{ fontSize: 1, fontWeight: "bold", mb: 1, display: "block" }}>
              Role (optional)
            </Text>
            <Input
              value={editData.role ?? ""}
              onChange={(e) => setEditData({ ...editData, role: e.target.value })}
              placeholder="Senior Developer, Lead Engineer, etc."
              sx={{ fontSize: 2 }}
            />
          </Box>

          {/* Dates */}
          <Flex sx={{ gap: 3, flexDirection: ["column", "row"] }}>
            <Box sx={{ flex: 1 }}>
              <Text as="label" sx={{ fontSize: 1, fontWeight: "bold", mb: 1, display: "block" }}>
                Start Date (YYYY-MM)
              </Text>
              <Input
                value={editData.startDate}
                onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                placeholder="2023-01"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Text as="label" sx={{ fontSize: 1, fontWeight: "bold", mb: 1, display: "block" }}>
                End Date (YYYY-MM or leave empty for Present)
              </Text>
              <Input
                value={editData.endDate ?? ""}
                onChange={(e) => setEditData({ ...editData, endDate: e.target.value || null })}
                placeholder="2024-12 or empty"
              />
            </Box>
          </Flex>

          {/* Body */}
          <Box>
            <Text as="label" sx={{ fontSize: 1, fontWeight: "bold", mb: 1, display: "block" }}>
              Description
            </Text>
            <Textarea
              value={editData.body ?? ""}
              onChange={(e) => setEditData({ ...editData, body: e.target.value })}
              rows={6}
              sx={{ fontSize: 2, fontFamily: "body" }}
            />
          </Box>

          {/* Notes */}
          <Box>
            <Text as="label" sx={{ fontSize: 1, fontWeight: "bold", mb: 1, display: "block" }}>
              Notes (internal)
            </Text>
            <Textarea
              value={editData.notes ?? ""}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              rows={2}
              sx={{ fontSize: 1, fontFamily: "body" }}
            />
          </Box>

          {/* Actions */}
          <Flex sx={{ gap: 2, justifyContent: "flex-end" }}>
            <Button
              onClick={() => void handleDelete()}
              disabled={isDeleting || isSaving}
              variant="buttons.sizes.sm"
              sx={{ bg: "red", color: "white", "&:hover": { bg: "darkred" } }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button onClick={handleCancel} variant="buttons.sizes.sm" disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={isSaving} variant="buttons.sizes.sm">
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </Flex>
        </Flex>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        bg: "muted",
        p: 4,
        borderRadius: "8px",
        mb: 4,
        position: "relative",
      }}
    >
      {/* Date Range */}
      <Text
        sx={{
          fontSize: 1,
          fontWeight: "bold",
          color: "primary",
          mb: 2,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {formatDate(entry.startDate)} – {formatDate(entry.endDate)}
      </Text>

      {/* Title */}
      <Heading
        as="h2"
        sx={{
          fontSize: [3, 4],
          mb: entry.role ? 1 : 3,
          color: "text",
        }}
      >
        {entry.title}
      </Heading>

      {/* Role */}
      {entry.role && (
        <Text
          sx={{
            fontSize: 2,
            color: "textMuted",
            fontStyle: "italic",
            mb: 3,
          }}
        >
          {entry.role}
        </Text>
      )}

      {/* Body */}
      {entry.body && (
        <Text
          sx={{
            fontSize: 2,
            lineHeight: 1.6,
            mb: 3,
            whiteSpace: "pre-wrap",
          }}
        >
          {entry.body}
        </Text>
      )}

      {/* Notes (only for editors) */}
      {isEditor && entry.notes && (
        <Box
          sx={{
            mt: 3,
            pt: 3,
            borderTop: "1px solid",
            borderColor: "gray",
          }}
        >
          <Text sx={{ fontSize: 1, fontStyle: "italic", color: "textMuted" }}>
            <strong>Notes:</strong> {entry.notes}
          </Text>
        </Box>
      )}

      {/* Editor Actions */}
      {isEditor && (
        <Box sx={{ mt: 4 }}>
          <Button onClick={() => setIsEditing(true)} variant="buttons.sizes.sm">
            Edit
          </Button>
        </Box>
      )}

      {/* Metadata (only for editors) */}
      {isEditor && (
        <Text
          sx={{
            fontSize: 0,
            color: "textMuted",
            mt: 3,
            fontStyle: "italic",
          }}
        >
          Last updated by {entry.updatedBy} • {new Date(entry.updatedAt).toLocaleString()}
        </Text>
      )}
    </Box>
  )
}
