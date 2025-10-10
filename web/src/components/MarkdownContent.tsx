/**
 * MarkdownContent Component
 *
 * Wrapper component for rendering markdown content with consistent styling.
 * Uses ReactMarkdown with centralized theme-ui styles.
 */

import React from "react"
import ReactMarkdown from "react-markdown"
import { Box } from "theme-ui"
import type { ThemeUIStyleObject } from "theme-ui"
import { markdownStyles } from "../styles/markdown"

interface MarkdownContentProps {
  /**
   * Markdown content to render
   */
  children: string

  /**
   * Additional sx styles to merge with base markdown styles
   */
  sx?: ThemeUIStyleObject
}

/**
 * Renders markdown content with consistent application-wide styling
 *
 * @example
 * ```tsx
 * <MarkdownContent>
 *   # Heading
 *   This is **bold** and *italic*
 * </MarkdownContent>
 * ```
 *
 * @example With custom styles
 * ```tsx
 * <MarkdownContent sx={{ mb: 4, fontSize: 3 }}>
 *   Custom styled markdown content
 * </MarkdownContent>
 * ```
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({ children, sx }) => (
  <Box sx={{ ...markdownStyles, ...sx }}>
    <ReactMarkdown>{children}</ReactMarkdown>
  </Box>
)
