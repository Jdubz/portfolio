import React, { useState } from "react"
import { Box, Button, Heading, Text } from "theme-ui"
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
  onAddChild?: (parentId: string, childType: string) => void
  _onReorderChildren?: (parentId: string, reorderedChildren: Array<{ id: string; order: number }>) => Promise<void>
  children?: React.ReactNode
  childItems?: ContentItemType[]
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
  onAddChild,
  _onReorderChildren,
  children,
  childItems = [],
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editData, setEditData] = useState<UpdateContentItemData>(item)
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null)
  const [editingChildId, setEditingChildId] = useState<string | null>(null)
  const [childEditData, setChildEditData] = useState<UpdateContentItemData | null>(null)
  const [isSavingChild, setIsSavingChild] = useState(false)

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

  const handleEditChild = (child: ContentItemType) => {
    setEditingChildId(child.id)
    setChildEditData(child)
    setExpandedChildId(null) // Collapse the child when editing
  }

  const handleSaveChild = async () => {
    if (!childEditData || !editingChildId) {
      return
    }

    setIsSavingChild(true)
    try {
      await onUpdate(editingChildId, childEditData)
      setEditingChildId(null)
      setChildEditData(null)
    } catch (error) {
      logger.error("Failed to save child item", error as Error, {
        component: "ContentItem",
        action: "handleSaveChild",
        childId: editingChildId,
      })
    } finally {
      setIsSavingChild(false)
    }
  }

  const handleCancelChildEdit = () => {
    setEditingChildId(null)
    setChildEditData(null)
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
        {item.type === "company" && <CompanyEdit data={editData} onChange={setEditData} />}
        {item.type === "project" && <ProjectEdit data={editData} onChange={setEditData} />}
        {item.type === "skill-group" && <SkillGroupEdit data={editData} onChange={setEditData} />}
        {item.type === "education" && <EducationEdit data={editData} onChange={setEditData} />}
        {item.type === "profile-section" && <ProfileSectionEdit data={editData} onChange={setEditData} />}
        {item.type === "text-section" && <TextSectionEdit data={editData} onChange={setEditData} />}
        {item.type === "accomplishment" && <AccomplishmentEdit data={editData} onChange={setEditData} />}
        {item.type === "timeline-event" && <TimelineEventEdit data={editData} onChange={setEditData} />}

        {/* Child Items Management */}
        {canHaveChildren(item.type) && childItems.length > 0 && (
          <Box sx={{ mt: 4, pt: 4, borderTop: "1px solid", borderColor: "muted" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Heading as="h3" sx={{ fontSize: 3 }}>
                {getChildTypeName(item.type)}s ({childItems.length})
              </Heading>
              <Text sx={{ fontSize: 1, color: "textMuted" }}>Ordered by creation • Click to expand</Text>
            </Box>

            {childItems.map((child, index) => {
              const isEditingThisChild = editingChildId === child.id

              return (
                <Box
                  key={child.id}
                  sx={{
                    p: 3,
                    mb: 2,
                    bg: isEditingThisChild ? "muted" : expandedChildId === child.id ? "muted" : "background",
                    border: "2px solid",
                    borderColor: isEditingThisChild ? "primary" : expandedChildId === child.id ? "primary" : "gray",
                    borderRadius: 4,
                  }}
                >
                  {isEditingThisChild && childEditData ? (
                    // Edit mode for this child
                    <Box>
                      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
                        <Text sx={{ fontSize: 1, color: "textMuted" }}>#{index + 1}</Text>
                        <Heading as="h4" sx={{ fontSize: 2 }}>
                          Editing: {getTitleForContentItem(child)}
                        </Heading>
                      </Box>

                      {/* Render appropriate edit component based on child type */}
                      {child.type === "project" && <ProjectEdit data={childEditData} onChange={setChildEditData} />}
                      {child.type === "education" && <EducationEdit data={childEditData} onChange={setChildEditData} />}
                      {child.type === "accomplishment" && (
                        <AccomplishmentEdit data={childEditData} onChange={setChildEditData} />
                      )}
                      {child.type === "timeline-event" && (
                        <TimelineEventEdit data={childEditData} onChange={setChildEditData} />
                      )}

                      {/* Edit actions */}
                      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleCancelChildEdit}
                          disabled={isSavingChild}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={() => void handleSaveChild()}
                          disabled={isSavingChild}
                        >
                          {isSavingChild ? "Saving..." : "Save"}
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    // View mode for this child
                    <>
                      <Box
                        onClick={() => setExpandedChildId(expandedChildId === child.id ? null : child.id)}
                        sx={{
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          userSelect: "none",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Text sx={{ fontSize: 1, color: "textMuted" }}>#{index + 1}</Text>
                          <Text sx={{ fontSize: 2, fontWeight: "bold" }}>{getTitleForContentItem(child)}</Text>
                        </Box>
                        <Text sx={{ fontSize: 1, color: "textMuted" }}>
                          {expandedChildId === child.id ? "▼" : "▶"}
                        </Text>
                      </Box>

                      {expandedChildId === child.id && (
                        <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid", borderColor: "gray" }}>
                          {/* Child content preview */}
                          {child.type === "project" && (
                            <Box>
                              <Text sx={{ fontSize: 1, color: "textMuted", mb: 2 }}>{child.description}</Text>
                              {child.role && <Text sx={{ fontSize: 1, color: "textMuted" }}>Role: {child.role}</Text>}
                            </Box>
                          )}
                          {child.type === "education" && (
                            <Box>
                              {child.degree && (
                                <Text sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>{child.degree}</Text>
                              )}
                              {child.field && (
                                <Text sx={{ fontSize: 1, color: "textMuted" }}>Field: {child.field}</Text>
                              )}
                            </Box>
                          )}

                          {/* Child actions */}
                          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                            <Button
                              type="button"
                              variant="secondary.sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditChild(child)
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="danger.sm"
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (window.confirm(`Delete ${getTitleForContentItem(child)}?`)) {
                                  await onDelete(child.id)
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              )
            })}

            {onAddChild && (
              <Button
                type="button"
                variant="secondary.sm"
                onClick={() => onAddChild(item.id, getChildType(item.type))}
                sx={{ mt: 2 }}
              >
                + Add {getChildTypeName(item.type)}
              </Button>
            )}
          </Box>
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
        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <Button type="button" onClick={() => setIsEditing(true)} variant="secondary.sm">
            Edit
          </Button>
          {canHaveChildren(item.type) && onAddChild && (
            <Button type="button" onClick={() => onAddChild(item.id, getChildType(item.type))} variant="secondary.sm">
              + Add {getChildTypeName(item.type)}
            </Button>
          )}
        </Box>
      )}
    </Box>
  )
}

/**
 * Determine if an item type can have children
 */
function canHaveChildren(type: string): boolean {
  return type === "company" || type === "text-section"
}

/**
 * Get the child type for a given parent type
 */
function getChildType(parentType: string): string {
  switch (parentType) {
    case "company":
      return "project"
    case "text-section":
      return "education" // or project for Selected Projects
    default:
      return "text-section"
  }
}

/**
 * Get human-readable name for child type
 */
function getChildTypeName(parentType: string): string {
  switch (parentType) {
    case "company":
      return "Project"
    case "text-section":
      return "Child Item"
    default:
      return "Item"
  }
}

/**
 * Get item title for any content item (global helper)
 */
function getTitleForContentItem(item: ContentItemType): string {
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
