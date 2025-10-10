/**
 * FormField Component
 *
 * Standardized form field component combining label, input, and optional error message.
 * Supports both Input and Textarea types.
 */

import React from "react"
import { Box, Input, Textarea } from "theme-ui"
import type { ThemeUIStyleObject } from "theme-ui"
import { FormLabel } from "./FormLabel"

interface FormFieldProps {
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
   * Field type: 'input' for single-line, 'textarea' for multi-line
   */
  type?: "input" | "textarea"

  /**
   * Number of rows for textarea (only used when type="textarea")
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
   * Error message to display (if any)
   */
  error?: string

  /**
   * Additional sx styles to apply to the input/textarea
   */
  sx?: ThemeUIStyleObject

  /**
   * Whether the field is disabled
   */
  disabled?: boolean
}

/**
 * Renders a form field with label and input/textarea
 *
 * @example Basic input
 * ```tsx
 * <FormField
 *   label="Email"
 *   name="email"
 *   value={email}
 *   onChange={setEmail}
 *   required
 * />
 * ```
 *
 * @example Textarea
 * ```tsx
 * <FormField
 *   label="Description"
 *   name="description"
 *   value={description}
 *   onChange={setDescription}
 *   type="textarea"
 *   rows={6}
 * />
 * ```
 */
export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "input",
  rows = 4,
  placeholder,
  required = false,
  error,
  sx,
  disabled = false,
}) => {
  const inputSx: ThemeUIStyleObject = {
    fontSize: 2,
    fontFamily: type === "textarea" ? "body" : undefined,
    borderColor: error ? "red" : undefined,
    ...sx,
  }

  return (
    <Box>
      <FormLabel>
        {label}
        {required && " *"}
      </FormLabel>

      {type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          sx={inputSx}
        />
      ) : (
        <Input
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          sx={inputSx}
        />
      )}

      {error && (
        <Box
          sx={{
            color: "red",
            fontSize: 0,
            mt: 1,
          }}
        >
          {error}
        </Box>
      )}
    </Box>
  )
}
