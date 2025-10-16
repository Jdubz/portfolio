import React from "react"
import { Flex } from "theme-ui"
import type { UpdateContentItemData, UpdateAccomplishmentData } from "../../types/content-item"
import { FormField } from "../FormField"

interface AccomplishmentEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const AccomplishmentEdit: React.FC<AccomplishmentEditProps> = ({ data, onChange }) => {
  // Cast to specific type - safe because parent component ensures correct type
  const accomplishmentData = data as UpdateAccomplishmentData

  return (
    <Flex sx={{ flexDirection: "column", gap: 3, mb: 3 }}>
      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={accomplishmentData.description ?? ""}
        onChange={(value) => onChange({ ...data, description: value })}
        rows={3}
        required
        placeholder="Describe the accomplishment..."
      />

      <FormField
        label="Date"
        name="date"
        value={accomplishmentData.date ?? ""}
        onChange={(value) => onChange({ ...data, date: value })}
        placeholder="2024-03"
      />

      <FormField
        label="Context"
        name="context"
        type="textarea"
        value={accomplishmentData.context ?? ""}
        onChange={(value) => onChange({ ...data, context: value })}
        rows={2}
        placeholder="Provide context about this accomplishment..."
      />

      <FormField
        label="Impact"
        name="impact"
        type="textarea"
        value={accomplishmentData.impact ?? ""}
        onChange={(value) => onChange({ ...data, impact: value })}
        rows={2}
        placeholder="Describe the impact or results..."
      />

      <FormField
        label="Technologies (comma-separated)"
        name="technologies"
        value={accomplishmentData.technologies?.join(", ") ?? ""}
        onChange={(value) =>
          onChange({
            ...data,
            technologies: value
              ? value
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : [],
          })
        }
        placeholder="React, TypeScript"
      />
    </Flex>
  )
}
