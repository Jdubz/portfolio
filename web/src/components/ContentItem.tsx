import React, { useState } from "react"
import { Box, Button } from "theme-ui"
import type { ContentItem as ContentItemType, UpdateContentItemData } from "../types/content-item"
import { ConfirmDialog } from "./ConfirmDialog"
import { FormActions } from "./FormActions"
import { logger } from "../utils/logger"

// Import view components
import { CompanyView } from "./content-types/CompanyView"
import { ProjectView } from "./content-types/ProjectView"
import { SkillGroupView } from "./content-types/SkillGroupView"
import { EducationView } from "./content-types/EducationView"
import { ProfileSectionView } from "./content-types/ProfileSectionView"
import { TextSectionView } from "./content-types/TextSectionView"
import { AccomplishmentView } from "./content-types/AccomplishmentView"
import { TimelineEventView } from "./content-types/TimelineEventView"

// Import edit components
import { CompanyEdit } from "./content-types/CompanyEdit"
import { ProjectEdit } from "./content-types/ProjectEdit"
import { SkillGroupEdit } from "./content-types/SkillGroupEdit"
import { EducationEdit } from "./content-types/EducationEdit"
import { ProfileSectionEdit } from "./content-types/ProfileSectionEdit"
import { TextSectionEdit } from "./content-types/TextSectionEdit"
import { AccomplishmentEdit } from "./content-types/AccomplishmentEdit"
import { TimelineEventEdit } from "./content-types/TimelineEventEdit"

interface ContentItemProps {
  item: ContentItemType
  isEditor: boolean
  onUpdate: (id: string, data: UpdateContentItemData) => Promise<void>
  onDelete: (id: string) => Promise<void>
  children?: React.ReactNode
}

/**
 * Display component for a single content item
 * Renders appropriate view/edit component based on type
 */
export const ContentItem: React.FC<ContentItemProps> = ({
  item,
  isEditor,
  onUpdate,
  onDelete,
  children,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editData, setEditData] = useState<UpdateContentItemData>(item)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onUpdate(item.id, editData)
      setIsEditing(false)
    } catch (error) {
      logger.error("Failed to save content item", error as Error, {
        component: "ContentItem",
        action: "handleSave",
        itemId: item.id,
        itemType: item.type,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData(item)
    setIsEditing(false)
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    setShowDeleteDialog(false)
    setIsDeleting(true)
    try {
      await onDelete(item.id)
    } catch (error) {
      logger.error("Failed to delete content item", error as Error, {
        component: "ContentItem",
        action: "handleDelete",
        itemId: item.id,
        itemType: item.type,
      })
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
  }

  // Get item title for delete confirmation
  const getItemTitle = (): string => {
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
        {/* Render appropriate edit component based on type */}
        {item.type === "company" && (
          <CompanyEdit data={editData} onChange={setEditData} />
        )}
        {item.type === "project" && (
          <ProjectEdit data={editData} onChange={setEditData} />
        )}
        {item.type === "skill-group" && (
          <SkillGroupEdit data={editData} onChange={setEditData} />
        )}
        {item.type === "education" && (
          <EducationEdit data={editData} onChange={setEditData} />
        )}
        {item.type === "profile-section" && (
          <ProfileSectionEdit data={editData} onChange={setEditData} />
        )}
        {item.type === "text-section" && (
          <TextSectionEdit data={editData} onChange={setEditData} />
        )}
        {item.type === "accomplishment" && (
          <AccomplishmentEdit data={editData} onChange={setEditData} />
        )}
        {item.type === "timeline-event" && (
          <TimelineEventEdit data={editData} onChange={setEditData} />
        )}

        <FormActions
          onCancel={handleCancel}
          onSave={() => void handleSave()}
          onDelete={handleDeleteClick}
          isSubmitting={isSaving}
          isDeleting={isDeleting}
        />

        <ConfirmDialog
          isOpen={showDeleteDialog}
          title={`Delete ${item.type}`}
          message={`Are you sure you want to delete "${getItemTitle()}"? This action cannot be undone.`}
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
      {/* Render appropriate view component based on type */}
      {item.type === "company" && <CompanyView item={item} />}
      {item.type === "project" && <ProjectView item={item} />}
      {item.type === "skill-group" && <SkillGroupView item={item} />}
      {item.type === "education" && <EducationView item={item} />}
      {item.type === "profile-section" && <ProfileSectionView item={item} />}
      {item.type === "text-section" && <TextSectionView item={item} />}
      {item.type === "accomplishment" && <AccomplishmentView item={item} />}
      {item.type === "timeline-event" && <TimelineEventView item={item} />}

      {/* Render children (nested items) */}
      {children && <Box sx={{ mt: 4, pl: 4, borderLeft: "2px solid", borderColor: "muted" }}>{children}</Box>}

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
