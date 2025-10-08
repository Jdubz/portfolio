import React, { useState } from "react"
import { Box, Button, Flex, Input, Text, Textarea } from "theme-ui"
import type { CreateExperienceData } from "../types/experience"

interface CreateExperienceFormProps {
  onCreate: (data: CreateExperienceData) => Promise<void>
  onCancel: () => void
}

/**
 * Form for creating new experience entries
 * Only shown to editors
 */
export const CreateExperienceForm: React.FC<CreateExperienceFormProps> = ({ onCreate, onCancel }) => {
  const [formData, setFormData] = useState<CreateExperienceData>({
    title: "",
    role: "",
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

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required")
      return
    }
    if (!formData.startDate.trim()) {
      setError("Start date is required")
      return
    }
    if (!/^\d{4}-\d{2}$/.test(formData.startDate)) {
      setError("Start date must be in YYYY-MM format")
      return
    }
    if (formData.endDate && !/^\d{4}-\d{2}$/.test(formData.endDate)) {
      setError("End date must be in YYYY-MM format")
      return
    }

    setIsCreating(true)
    try {
      await onCreate(formData)
      // Reset form on success
      setFormData({
        title: "",
        role: "",
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

      {error && <Box sx={{ bg: "red", color: "white", p: 2, borderRadius: "4px", mb: 3, fontSize: 1 }}>{error}</Box>}

      <Flex sx={{ flexDirection: "column", gap: 3 }}>
        {/* Title */}
        <Box>
          <Text as="label" sx={{ fontSize: 1, fontWeight: "bold", mb: 1, display: "block" }}>
            Title *
          </Text>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Senior Full-Stack Developer"
            required
            sx={{ fontSize: 2 }}
          />
        </Box>

        {/* Role */}
        <Box>
          <Text as="label" sx={{ fontSize: 1, fontWeight: "bold", mb: 1, display: "block" }}>
            Role (optional)
          </Text>
          <Input
            value={formData.role ?? ""}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="Senior Developer, Lead Engineer, etc."
            sx={{ fontSize: 2 }}
          />
        </Box>

        {/* Dates */}
        <Flex sx={{ gap: 3, flexDirection: ["column", "row"] }}>
          <Box sx={{ flex: 1 }}>
            <Text as="label" sx={{ fontSize: 1, fontWeight: "bold", mb: 1, display: "block" }}>
              Start Date (YYYY-MM) *
            </Text>
            <Input
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              placeholder="2023-01"
              required
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Text as="label" sx={{ fontSize: 1, fontWeight: "bold", mb: 1, display: "block" }}>
              End Date (YYYY-MM or leave empty for Present)
            </Text>
            <Input
              value={formData.endDate ?? ""}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value || null })}
              placeholder="2024-12 or empty"
            />
          </Box>
        </Flex>

        {/* Body */}
        <Box>
          <Text as="label" sx={{ fontSize: 1, fontWeight: "bold", mb: 1, display: "block" }}>
            Description
          </Text>
          <Textarea
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            rows={6}
            placeholder="Describe your role, responsibilities, and achievements..."
            sx={{ fontSize: 2, fontFamily: "body" }}
          />
        </Box>

        {/* Notes */}
        <Box>
          <Text as="label" sx={{ fontSize: 1, fontWeight: "bold", mb: 1, display: "block" }}>
            Notes (internal, only visible to editors)
          </Text>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            placeholder="Internal notes..."
            sx={{ fontSize: 1, fontFamily: "body" }}
          />
        </Box>

        {/* Actions */}
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
