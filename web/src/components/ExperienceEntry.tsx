import React, { useState } from "react"
import { Box, Heading, Text, Button, Flex } from "theme-ui"
import type { ExperienceEntry as ExperienceEntryType, UpdateExperienceData } from "../types/experience"
import { ConfirmDialog } from "./ConfirmDialog"
import { MarkdownContent } from "./MarkdownContent"
import { FormField } from "./FormField"
import { FormActions } from "./FormActions"
import { logger } from "../utils/logger"
import { formatMonthYear } from "../utils/dateFormat"
import { StructuredEntryView } from "./entry-types/StructuredEntryView"
import { SimpleEntryView } from "./entry-types/SimpleEntryView"

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
          <FormField
            label="Title"
            name="title"
            value={editData.title ?? ""}
            onChange={(value) => setEditData({ ...editData, title: value })}
            required
          />

          <FormField
            label="Role"
            name="role"
            value={editData.role ?? ""}
            onChange={(value) => setEditData({ ...editData, role: value })}
            placeholder="Senior Developer, Lead Engineer, etc."
          />

          <FormField
            label="Location"
            name="location"
            value={editData.location ?? ""}
            onChange={(value) => setEditData({ ...editData, location: value })}
            placeholder="Portland, OR · Remote"
          />

          <Flex sx={{ gap: 3, flexDirection: ["column", "row"] }}>
            <Box sx={{ flex: 1 }}>
              <FormField
                label="Start Date"
                name="startDate"
                type="month"
                value={editData.startDate ?? ""}
                onChange={(value) => setEditData({ ...editData, startDate: value })}
                required
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormField
                label="End Date (leave empty for Present)"
                name="endDate"
                type="month"
                value={editData.endDate ?? ""}
                onChange={(value) => setEditData({ ...editData, endDate: value || null })}
                placeholder="Leave empty for Present"
              />
            </Box>
          </Flex>

          <FormField
            label="Description"
            name="body"
            value={editData.body ?? ""}
            onChange={(value) => setEditData({ ...editData, body: value })}
            type="textarea"
            rows={6}
          />

          <FormField
            label="Notes (internal)"
            name="notes"
            value={editData.notes ?? ""}
            onChange={(value) => setEditData({ ...editData, notes: value })}
            type="textarea"
            rows={2}
            sx={{ fontSize: 1 }}
          />

          <FormActions
            onCancel={handleCancel}
            onSave={() => void handleSave()}
            onDelete={handleDeleteClick}
            isSubmitting={isSaving}
            isDeleting={isDeleting}
          />
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
        {formatMonthYear(entry.startDate)} – {formatMonthYear(entry.endDate)}
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

      {/* Content - render based on type */}
      {entry.renderType === "structured-entry" && <StructuredEntryView entry={entry} />}
      {entry.renderType === "simple-entry" && <SimpleEntryView entry={entry} />}
      {(!entry.renderType || entry.renderType === "text") && entry.body && (
        <MarkdownContent sx={{ mb: 3 }}>{entry.body}</MarkdownContent>
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
          <Button type="button" onClick={() => setIsEditing(true)} variant="secondary.sm">
            Edit
          </Button>
        </Box>
      )}
    </Box>
  )
}
