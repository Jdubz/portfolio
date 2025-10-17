import React from "react"
import { Flex } from "theme-ui"
import type { UpdateContentItemData, UpdateTextSectionData } from "../../types/content-item"
import { FormField } from "../FormField"
import { MarkdownEditor } from "../MarkdownEditor"

interface TextSectionEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const TextSectionEdit: React.FC<TextSectionEditProps> = ({ data, onChange }) => {
  // Cast to specific type - safe because parent component ensures correct type
  const textData = data as UpdateTextSectionData

  return (
    <Flex sx={{ flexDirection: "column", gap: 3, mb: 3 }}>
      <FormField
        label="Heading (optional)"
        name="heading"
        value={textData.heading ?? ""}
        onChange={(value) => onChange({ ...data, heading: value })}
        placeholder="Section Title"
      />

      <MarkdownEditor
        label="Content"
        name="content"
        value={textData.content ?? ""}
        onChange={(value) => onChange({ ...data, content: value })}
        rows={10}
        showPreview
        required
      />
    </Flex>
  )
}
