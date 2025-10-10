/**
 * FormError Component
 *
 * Standardized error message display for forms.
 * Shows error messages with consistent styling across the application.
 */

import React from "react"
import { Box } from "theme-ui"
import type { ThemeUIStyleObject } from "theme-ui"

interface FormErrorProps {
  /**
   * Error message to display
   */
  message: string | null | undefined

  /**
   * Additional sx styles
   */
  sx?: ThemeUIStyleObject
}

/**
 * Renders a form error message box
 *
 * @example
 * ```tsx
 * <FormError message={error} />
 * ```
 *
 * @example With custom styles
 * ```tsx
 * <FormError message={error} sx={{ mb: 4 }} />
 * ```
 */
export const FormError: React.FC<FormErrorProps> = ({ message, sx }) => {
  if (!message) {
    return null
  }

  return (
    <Box
      sx={{
        bg: "red",
        color: "white",
        p: 2,
        borderRadius: "4px",
        mb: 3,
        fontSize: 1,
        ...sx,
      }}
    >
      {message}
    </Box>
  )
}
