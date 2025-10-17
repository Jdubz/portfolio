import React from "react"
import { Box, Heading } from "theme-ui"
import type { TextSectionItem } from "../../types/content-item"
import { MarkdownContent } from "../MarkdownContent"

interface TextSectionViewProps {
  item: TextSectionItem
}

export const TextSectionView: React.FC<TextSectionViewProps> = ({ item }) => {
  return (
    <Box>
      {/* Heading */}
      {item.heading && (
        <Heading
          as="h2"
          sx={{
            fontSize: [3, 4],
            mb: 3,
            color: "text",
          }}
        >
          {item.heading}
        </Heading>
      )}

      {/* Content */}
      <MarkdownContent>{item.content}</MarkdownContent>
    </Box>
  )
}
