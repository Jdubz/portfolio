import React from "react"
import { Box } from "theme-ui"

interface ModalBodyProps {
  children: React.ReactNode
  padding?: number
}

/**
 * Modal Body component
 *
 * Provides consistent padding for modal content
 *
 * @example
 * ```tsx
 * <ModalBody>
 *   <FormField label="Name" value={name} onChange={setName} />
 * </ModalBody>
 * ```
 */
export const ModalBody: React.FC<ModalBodyProps> = ({ children, padding = 4 }) => (
  <Box sx={{ p: padding }}>{children}</Box>
)
