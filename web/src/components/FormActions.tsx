/**
 * FormActions Component
 *
 * Standardized form action buttons (Cancel, Save/Submit, optional Delete).
 * Provides consistent spacing and styling for form submission controls.
 */

import React from "react"
import { Button, Flex } from "theme-ui"
import type { ThemeUIStyleObject } from "theme-ui"

interface FormActionsProps {
  /**
   * Cancel button handler
   */
  onCancel: () => void

  /**
   * Save/submit button handler
   */
  onSave: () => void

  /**
   * Optional delete button handler
   */
  onDelete?: () => void

  /**
   * Whether a save/submit operation is in progress
   */
  isSubmitting?: boolean

  /**
   * Whether a delete operation is in progress
   */
  isDeleting?: boolean

  /**
   * Text for the save button
   */
  saveText?: string

  /**
   * Text for the delete button
   */
  deleteText?: string

  /**
   * Text for the cancel button
   */
  cancelText?: string

  /**
   * Additional sx styles
   */
  sx?: ThemeUIStyleObject
}

/**
 * Renders standardized form action buttons
 *
 * @example Basic usage (Cancel + Save)
 * ```tsx
 * <FormActions
 *   onCancel={handleCancel}
 *   onSave={handleSave}
 *   isSubmitting={isSaving}
 * />
 * ```
 *
 * @example With delete button
 * ```tsx
 * <FormActions
 *   onCancel={handleCancel}
 *   onSave={handleSave}
 *   onDelete={handleDelete}
 *   isSubmitting={isSaving}
 *   isDeleting={isDeleting}
 * />
 * ```
 */
export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSave,
  onDelete,
  isSubmitting = false,
  isDeleting = false,
  saveText = "Save",
  deleteText = "Delete",
  cancelText = "Cancel",
  sx,
}) => {
  const disabled = isSubmitting || isDeleting

  return (
    <Flex sx={{ gap: 2, justifyContent: "flex-end", ...sx }}>
      {onDelete && (
        <Button
          type="button"
          onClick={onDelete}
          disabled={disabled}
          variant="secondary.sm"
          sx={{
            bg: "red",
            color: "white",
            borderColor: "red",
            "&:hover": { bg: "darkred", borderColor: "darkred" },
          }}
        >
          {isDeleting ? `${deleteText.replace(/e?$/, "")}ing...` : deleteText}
        </Button>
      )}
      <Button type="button" onClick={onCancel} variant="secondary.sm" disabled={isSubmitting}>
        {cancelText}
      </Button>
      <Button type="button" onClick={onSave} variant="primary.sm" disabled={disabled}>
        {isSubmitting ? `${saveText.replace(/e?$/, "")}ing...` : saveText}
      </Button>
    </Flex>
  )
}
