/**
 * MarkdownEditor Component
 *
 * Specialized textarea for editing markdown content.
 * Uses monospace font and provides optional preview.
 */

import React, { useState } from "react"
import { Box, Textarea, Button, Flex } from "theme-ui"
import type { ThemeUIStyleObject } from "theme-ui"
import { FormLabel } from "./FormLabel"
import { MarkdownContent } from "./MarkdownContent"

interface MarkdownEditorProps {
  /**
   * Field label text
   */
  label: string

  /**
   * Field name/id
   */
  name: string

  /**
   * Current field value
   */
  value: string

  /**
   * Change handler
   */
  onChange: (value: string) => void

  /**
   * Number of rows for textarea
   */
  rows?: number

  /**
   * Placeholder text
   */
  placeholder?: string

  /**
   * Whether the field is required
   */
  required?: boolean

  /**
   * Whether to show preview toggle
   */
  showPreview?: boolean

  /**
   * Additional sx styles to apply to the textarea
   */
  sx?: ThemeUIStyleObject

  /**
   * Whether the field is disabled
   */
  disabled?: boolean
}

/**
 * Renders a markdown editor with optional preview
 *
 * @example Basic usage
 * ```tsx
 * <MarkdownEditor
 *   label="Description"
 *   name="description"
 *   value={description}
 *   onChange={setDescription}
 *   rows={12}
 * />
 * ```
 *
 * @example With preview
 * ```tsx
 * <MarkdownEditor
 *   label="Content"
 *   name="content"
 *   value={content}
 *   onChange={setContent}
 *   showPreview
 * />
 * ```
 */
export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  label,
  name,
  value,
  onChange,
  rows = 12,
  placeholder,
  required = false,
  showPreview = false,
  sx,
  disabled = false,
}) => {
  const [isPreview, setIsPreview] = useState(false)

  return (
    <Box>
      <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <FormLabel>
          {label}
          {required && " *"}
        </FormLabel>
        {showPreview && (
          <Button
            type="button"
            variant="secondary.sm"
            onClick={() => setIsPreview(!isPreview)}
            sx={{ fontSize: 0, py: 1, px: 2 }}
          >
            {isPreview ? "Edit" : "Preview"}
          </Button>
        )}
      </Flex>

      {isPreview ? (
        <Box
          sx={{
            border: "1px solid",
            borderColor: "muted",
            borderRadius: "4px",
            p: 3,
            minHeight: rows ? `${rows * 1.5}em` : "18em",
            bg: "background",
          }}
        >
          {value ? <MarkdownContent>{value}</MarkdownContent> : <Box sx={{ opacity: 0.5 }}>No content yet</Box>}
        </Box>
      ) : (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          sx={{
            fontSize: 2,
            fontFamily: "monospace",
            ...sx,
          }}
        />
      )}
    </Box>
  )
}
