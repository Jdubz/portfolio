import React, { useState } from "react"
import { Box, Text, Flex, Button } from "theme-ui"
import type { CreateExperienceData } from "../types/experience"
import { FormField } from "./FormField"
import { FormError } from "./FormError"
import { createValidator, validators } from "../utils/validators"

interface CreateExperienceFormProps {
  onCreate: (data: CreateExperienceData) => Promise<void>
  onCancel: () => void
}

// Create validator for experience form
const validateExperience = createValidator<CreateExperienceData & Record<string, unknown>>([
  { field: "title", validator: validators.required("Title") },
  { field: "startDate", validator: validators.required("Start date") },
  { field: "startDate", validator: validators.dateFormat },
  {
    field: "endDate",
    validator: (value: unknown) => {
      if (!value || value === null || (typeof value === "string" && !value.trim())) {
        return null // End date is optional
      }
      return validators.dateFormat(value)
    },
  },
])

/**
 * Form for creating new experience entries
 * Only shown to editors
 */
export const CreateExperienceForm: React.FC<CreateExperienceFormProps> = ({ onCreate, onCancel }) => {
  const [formData, setFormData] = useState<CreateExperienceData>({
    title: "",
    role: "",
    location: "",
    body: "",
    startDate: "",
    endDate: null,
    notes: "",
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate form
    const errors = validateExperience(formData as CreateExperienceData & Record<string, unknown>)
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0]
      setError(firstError ?? "Please fix form errors")
      return
    }

    setIsCreating(true)
    try {
      await onCreate(formData)
      // Reset form on success
      setFormData({
        title: "",
        role: "",
        location: "",
        body: "",
        startDate: "",
        endDate: null,
        notes: "",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entry")
    } finally {
      setIsCreating(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    void handleSubmit(e)
  }

  return (
    <Box
      as="form"
      onSubmit={handleFormSubmit}
      sx={{
        bg: "muted",
        p: 4,
        borderRadius: "8px",
        border: "2px dashed",
        borderColor: "primary",
        mb: 4,
      }}
    >
      <Text as="h3" sx={{ fontSize: 3, fontWeight: "bold", mb: 3 }}>
        Create New Experience Entry
      </Text>

      <FormError message={error} />

      <Flex sx={{ flexDirection: "column", gap: 3 }}>
        <FormField
          label="Title"
          name="title"
          value={formData.title}
          onChange={(value) => setFormData({ ...formData, title: value })}
          placeholder="Some Company"
          required
        />

        <FormField
          label="Role"
          name="role"
          value={formData.role ?? ""}
          onChange={(value) => setFormData({ ...formData, role: value })}
          placeholder="Senior Developer, Lead Engineer, etc."
        />

        <FormField
          label="Location"
          name="location"
          value={formData.location ?? ""}
          onChange={(value) => setFormData({ ...formData, location: value })}
          placeholder="Portland, OR · Remote"
        />

        <Flex sx={{ gap: 3, flexDirection: ["column", "row"] }}>
          <Box sx={{ flex: 1 }}>
            <FormField
              label="Start Date (YYYY-MM)"
              name="startDate"
              value={formData.startDate}
              onChange={(value) => setFormData({ ...formData, startDate: value })}
              placeholder="2023-01"
              required
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <FormField
              label="End Date (YYYY-MM or leave empty for Present)"
              name="endDate"
              value={formData.endDate ?? ""}
              onChange={(value) => setFormData({ ...formData, endDate: value || null })}
              placeholder="2024-12 or empty"
            />
          </Box>
        </Flex>

        <FormField
          label="Description"
          name="body"
          value={formData.body ?? ""}
          onChange={(value) => setFormData({ ...formData, body: value })}
          type="textarea"
          rows={6}
          placeholder="Describe your role, responsibilities, and achievements..."
        />

        <FormField
          label="Notes (internal, only visible to editors)"
          name="notes"
          value={formData.notes ?? ""}
          onChange={(value) => setFormData({ ...formData, notes: value })}
          type="textarea"
          rows={2}
          placeholder="Internal notes..."
          sx={{ fontSize: 1 }}
        />

        <Flex sx={{ gap: 2, justifyContent: "flex-end" }}>
          <Button type="button" onClick={onCancel} variant="secondary.sm" disabled={isCreating}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating} variant="primary.sm">
            {isCreating ? "Creating..." : "Create Entry"}
          </Button>
        </Flex>
      </Flex>
    </Box>
  )
}
