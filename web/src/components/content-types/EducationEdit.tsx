import React from "react"
import { Box, Flex } from "theme-ui"
import type { UpdateContentItemData, UpdateEducationData } from "../../types/content-item"
import { FormField } from "../FormField"

interface EducationEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const EducationEdit: React.FC<EducationEditProps> = ({ data, onChange }) => {
  // Cast to specific type - safe because parent component ensures correct type
  const educationData = data as UpdateEducationData

  return (
    <Flex sx={{ flexDirection: "column", gap: 3, mb: 3 }}>
      <FormField
        label="Institution"
        name="institution"
        value={educationData.institution ?? ""}
        onChange={(value) => onChange({ ...data, institution: value })}
        required
        placeholder="University Name"
      />

      <FormField
        label="Degree"
        name="degree"
        value={educationData.degree ?? ""}
        onChange={(value) => onChange({ ...data, degree: value })}
        placeholder="Bachelor of Science"
      />

      <FormField
        label="Field of Study"
        name="field"
        value={educationData.field ?? ""}
        onChange={(value) => onChange({ ...data, field: value })}
        placeholder="Computer Science"
      />

      <FormField
        label="Location"
        name="location"
        value={educationData.location ?? ""}
        onChange={(value) => onChange({ ...data, location: value })}
        placeholder="City, State"
      />

      <Flex sx={{ gap: 3, flexDirection: ["column", "row"] }}>
        <Box sx={{ flex: 1 }}>
          <FormField
            label="Start Date"
            name="startDate"
            value={educationData.startDate ?? ""}
            onChange={(value) => onChange({ ...data, startDate: value })}
            placeholder="2015-09"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <FormField
            label="End Date"
            name="endDate"
            value={educationData.endDate ?? ""}
            onChange={(value) => onChange({ ...data, endDate: value || null })}
            placeholder="2019-05"
          />
        </Box>
      </Flex>

      <FormField
        label="Honors"
        name="honors"
        value={educationData.honors ?? ""}
        onChange={(value) => onChange({ ...data, honors: value })}
        placeholder="Summa Cum Laude, Dean's List"
      />

      <FormField
        label="Description"
        name="description"
        type="textarea"
        value={educationData.description ?? ""}
        onChange={(value) => onChange({ ...data, description: value })}
        rows={3}
        placeholder="Additional details about your education..."
      />

      <FormField
        label="Relevant Courses (comma-separated)"
        name="relevantCourses"
        value={educationData.relevantCourses?.join(", ") ?? ""}
        onChange={(value) =>
          onChange({
            ...data,
            relevantCourses: value ? value.split(",").map((c) => c.trim()).filter(Boolean) : [],
          })
        }
        placeholder="Data Structures, Algorithms, Machine Learning"
      />

      <FormField
        label="Credential ID"
        name="credentialId"
        value={educationData.credentialId ?? ""}
        onChange={(value) => onChange({ ...data, credentialId: value })}
        placeholder="ABC123XYZ"
      />

      <FormField
        label="Credential URL"
        name="credentialUrl"
        value={educationData.credentialUrl ?? ""}
        onChange={(value) => onChange({ ...data, credentialUrl: value })}
        placeholder="https://credential-url.com"
      />

      <FormField
        label="Expiration Date"
        name="expiresAt"
        value={educationData.expiresAt ?? ""}
        onChange={(value) => onChange({ ...data, expiresAt: value })}
        placeholder="2025-12-31"
      />
    </Flex>
  )
}
