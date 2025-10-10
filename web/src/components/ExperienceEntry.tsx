import React, { useState } from "react"
import { Box, Heading, Text, Button, Flex, Input, Textarea } from "theme-ui"
import type { ExperienceEntry as ExperienceEntryType, UpdateExperienceData } from "../types/experience"
import { ConfirmDialog } from "./ConfirmDialog"
import { MarkdownContent } from "./MarkdownContent"
import { FormLabel } from "./FormLabel"
import { logger } from "../utils/logger"

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editData, setEditData] = useState<UpdateExperienceData>({
    title: entry.title,
    role: entry.role,
    location: entry.location,
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
      logger.error("Failed to save experience", error as Error, {
        component: "ExperienceEntry",
        action: "handleSave",
        entryId: entry.id,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      title: entry.title,
      role: entry.role,
      location: entry.location,
      body: entry.body,
      startDate: entry.startDate,
      endDate: entry.endDate,
      notes: entry.notes,
    })
    setIsEditing(false)
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false)
    setIsDeleting(true)
    try {
      await onDelete(entry.id)
    } catch (error) {
      logger.error("Failed to delete experience", error as Error, {
        component: "ExperienceEntry",
        action: "handleDelete",
        entryId: entry.id,
      })
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
  }

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
            <FormLabel>Title</FormLabel>
            <Input
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              sx={{ fontSize: 2 }}
            />
          </Box>

          {/* Role */}
          <Box>
            <FormLabel>Role (optional)</FormLabel>
            <Input
              value={editData.role ?? ""}
              onChange={(e) => setEditData({ ...editData, role: e.target.value })}
              placeholder="Senior Developer, Lead Engineer, etc."
              sx={{ fontSize: 2 }}
            />
          </Box>

          {/* Location */}
          <Box>
            <FormLabel>Location (optional)</FormLabel>
            <Input
              value={editData.location ?? ""}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              placeholder="San Francisco, CA · Remote"
              sx={{ fontSize: 2 }}
            />
          </Box>

          {/* Dates */}
          <Flex sx={{ gap: 3, flexDirection: ["column", "row"] }}>
            <Box sx={{ flex: 1 }}>
              <FormLabel>Start Date (YYYY-MM)</FormLabel>
              <Input
                value={editData.startDate}
                onChange={(e) => setEditData({ ...editData, startDate: e.target.value })}
                placeholder="2023-01"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormLabel>End Date (YYYY-MM or leave empty for Present)</FormLabel>
              <Input
                value={editData.endDate ?? ""}
                onChange={(e) => setEditData({ ...editData, endDate: e.target.value || null })}
                placeholder="2024-12 or empty"
              />
            </Box>
          </Flex>

          {/* Body */}
          <Box>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={editData.body ?? ""}
              onChange={(e) => setEditData({ ...editData, body: e.target.value })}
              rows={6}
              sx={{ fontSize: 2, fontFamily: "body" }}
            />
          </Box>

          {/* Notes */}
          <Box>
            <FormLabel>Notes (internal)</FormLabel>
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
              onClick={handleDeleteClick}
              disabled={isDeleting || isSaving}
              variant="secondary.sm"
              sx={{
                bg: "red",
                color: "white",
                borderColor: "red",
                "&:hover": { bg: "darkred", borderColor: "darkred" },
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button onClick={handleCancel} variant="secondary.sm" disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={() => void handleSave()} disabled={isSaving} variant="primary.sm">
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </Flex>
        </Flex>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Experience Entry"
          message={`Are you sure you want to delete "${entry.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={() => void handleDeleteConfirm()}
          onCancel={handleDeleteCancel}
          isDestructive={true}
        />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        variant: "cards.primary",
        p: 4,
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
          mb: 2,
          color: "text",
        }}
      >
        {entry.title}
      </Heading>

      {/* Location */}
      {entry.location && (
        <Text
          sx={{
            display: "block",
            fontSize: 1,
            color: "textMuted",
            mb: 2,
          }}
        >
          {entry.location}
        </Text>
      )}

      {/* Role */}
      {entry.role && (
        <Text
          sx={{
            display: "block",
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
      {entry.body && <MarkdownContent sx={{ mb: 3 }}>{entry.body}</MarkdownContent>}

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
          <Button onClick={() => setIsEditing(true)} variant="secondary.sm">
            Edit
          </Button>
        </Box>
      )}
    </Box>
  )
}
