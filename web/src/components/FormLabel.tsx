/**
 * FormLabel Component
 *
 * Standardized label component for form fields.
 * Provides consistent typography and spacing across all forms.
 */

import React from "react"
import { Text } from "theme-ui"
import type { ThemeUIStyleObject } from "theme-ui"

interface FormLabelProps {
  /**
   * Label text content
   */
  children: React.ReactNode

  /**
   * Additional sx styles to merge with base label styles
   */
  sx?: ThemeUIStyleObject
}

/**
 * Renders a form label with consistent application-wide styling
 *
 * @example
 * ```tsx
 * <FormLabel>
 *   Email Address
 * </FormLabel>
 * <Input type="email" />
 * ```
 *
 * @example With custom styles
 * ```tsx
 * <FormLabel sx={{ color: 'error' }}>
 *   Required Field *
 * </FormLabel>
 * ```
 */
export const FormLabel: React.FC<FormLabelProps> = ({ children, sx }) => (
  <Text
    as="label"
    sx={{
      fontSize: 1,
      fontWeight: "bold",
      mb: 1,
      display: "block",
      ...sx,
    }}
  >
    {children}
  </Text>
)
