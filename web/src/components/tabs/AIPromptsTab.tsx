import React from "react"
import { Box, Heading, Text } from "theme-ui"

interface AIPromptsTabProps {
  isEditor: boolean
}

export const AIPromptsTab: React.FC<AIPromptsTabProps> = ({ isEditor }) => {
  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Heading as="h2" sx={{ fontSize: 4, mb: 3, color: "primary" }}>
        AI Prompts
      </Heading>
      <Text sx={{ fontSize: 2, color: "text", opacity: 0.7, mb: 3 }}>
        Coming soon! This tab will allow you to customize the AI prompts used for generating resumes and cover letters.
      </Text>
      {isEditor && (
        <Text sx={{ fontSize: 1, color: "text", opacity: 0.6 }}>
          As an editor, you&apos;ll be able to fine-tune the AI prompts to match your preferred writing style and
          format.
        </Text>
      )}
    </Box>
  )
}
