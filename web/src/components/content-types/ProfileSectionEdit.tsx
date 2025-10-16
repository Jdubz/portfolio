import React from "react"
import { Flex } from "theme-ui"
import type { UpdateContentItemData, UpdateProfileSectionData } from "../../types/content-item"
import { FormField } from "../FormField"
import { MarkdownEditor } from "../MarkdownEditor"

interface ProfileSectionEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const ProfileSectionEdit: React.FC<ProfileSectionEditProps> = ({ data, onChange }) => {
  // Cast to specific type - safe because parent component ensures correct type
  const profileData = data as UpdateProfileSectionData

  return (
    <Flex sx={{ flexDirection: "column", gap: 3, mb: 3 }}>
      <FormField
        label="Heading"
        name="heading"
        value={profileData.heading ?? ""}
        onChange={(value) => onChange({ ...data, heading: value })}
        required
        placeholder="Profile"
      />

      <MarkdownEditor
        label="Content"
        name="content"
        value={profileData.content ?? ""}
        onChange={(value) => onChange({ ...data, content: value })}
        rows={8}
        showPreview
      />

      {/* TODO: Add structured data fields when needed */}
    </Flex>
  )
}
