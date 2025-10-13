import React, { useState, useEffect } from "react"
import { Box, Heading, Text, Label, Input, Button, Flex, Alert, Spinner } from "theme-ui"
import { generatorClient } from "../../api/generator-client"
import type { UpdateDefaultsData } from "../../types/generator"
import { logger } from "../../utils/logger"

interface SettingsTabProps {
  isEditor: boolean
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ isEditor }) => {
  // Form state
  const [formData, setFormData] = useState<UpdateDefaultsData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    accentColor: "#3B82F6",
  })

  // UI state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Load current defaults
  useEffect(() => {
    if (!isEditor) {
      setLoading(false)
      return
    }

    const loadDefaults = async () => {
      try {
        setLoading(true)
        setError(null)

        const defaults = await generatorClient.getDefaults()

        setFormData({
          name: defaults.name ?? "",
          email: defaults.email ?? "",
          phone: defaults.phone ?? "",
          location: defaults.location ?? "",
          website: defaults.website ?? "",
          github: defaults.github ?? "",
          linkedin: defaults.linkedin ?? "",
          accentColor: defaults.accentColor ?? "#3B82F6",
        })

        setLoading(false)
      } catch (err) {
        logger.error("Failed to load defaults", err as Error, {
          component: "SettingsTab",
          action: "loadDefaults",
        })
        setError(err instanceof Error ? err.message : "Failed to load settings")
        setLoading(false)
      }
    }

    void loadDefaults()
  }, [isEditor])

  // Handle input change
  const handleChange = (field: keyof UpdateDefaultsData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
    setSuccess(false)
  }

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasChanges) {
      setSuccess(true)
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      await generatorClient.updateDefaults(formData)

      setSaving(false)
      setSuccess(true)
      setHasChanges(false)

      logger.info("Settings saved successfully", {
        component: "SettingsTab",
        action: "saveSettings",
      })
    } catch (err) {
      logger.error("Failed to save settings", err as Error, {
        component: "SettingsTab",
        action: "saveSettings",
      })
      setError(err instanceof Error ? err.message : "Failed to save settings")
      setSaving(false)
    }
  }

  // Show editor-only message
  if (!isEditor) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Text sx={{ fontSize: 2, color: "text", opacity: 0.7 }}>
          Settings are only available for editors. Sign in as an editor to manage your default personal information.
        </Text>
      </Box>
    )
  }

  // Auth check
  if (loading) {
    return (
      <Box>
        <Flex sx={{ justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Spinner size={48} />
        </Flex>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Text sx={{ color: "text", opacity: 0.8 }}>
          Manage your default personal information. These values will be pre-filled when generating resumes and cover
          letters.
        </Text>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && !error && (
        <Alert variant="success" sx={{ mb: 3 }}>
          ✓ Settings saved successfully!
        </Alert>
      )}

      {/* Settings Form */}
      <Box
        as="form"
        onSubmit={(e: React.FormEvent) => {
          void handleSubmit(e)
        }}
        sx={{
          bg: "background",
          p: 4,
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "muted",
        }}
      >
        {/* Personal Information */}
        <Heading as="h2" sx={{ fontSize: 3, mb: 3, color: "primary" }}>
          Personal Information
        </Heading>

        <Box sx={{ mb: 3 }}>
          <Label htmlFor="name">
            Name{" "}
            <Text as="span" sx={{ color: "red" }}>
              *
            </Text>
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            disabled={saving}
            placeholder="John Doe"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Label htmlFor="email">
            Email{" "}
            <Text as="span" sx={{ color: "red" }}>
              *
            </Text>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
            disabled={saving}
            placeholder="john@example.com"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            disabled={saving}
            placeholder="555-1234"
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            disabled={saving}
            placeholder="Portland, OR"
          />
        </Box>

        {/* Online Presence */}
        <Heading as="h2" sx={{ fontSize: 3, mb: 3, mt: 4, color: "primary" }}>
          Online Presence
        </Heading>

        <Box sx={{ mb: 3 }}>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => handleChange("website", e.target.value)}
            disabled={saving}
            placeholder="https://yourwebsite.com"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            type="url"
            value={formData.github}
            onChange={(e) => handleChange("github", e.target.value)}
            disabled={saving}
            placeholder="https://github.com/username"
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            type="url"
            value={formData.linkedin}
            onChange={(e) => handleChange("linkedin", e.target.value)}
            disabled={saving}
            placeholder="https://linkedin.com/in/username"
          />
        </Box>

        {/* Visual Styling */}
        <Heading as="h2" sx={{ fontSize: 3, mb: 3, mt: 4, color: "primary" }}>
          Visual Styling
        </Heading>

        <Box sx={{ mb: 4 }}>
          <Label htmlFor="accentColor">
            Accent Color
            <Text as="span" sx={{ ml: 2, fontSize: 1, opacity: 0.7 }}>
              (used for section headers and highlights)
            </Text>
          </Label>
          <Flex sx={{ gap: 2, alignItems: "center" }}>
            <Input
              id="accentColor"
              type="color"
              value={formData.accentColor}
              onChange={(e) => handleChange("accentColor", e.target.value)}
              disabled={saving}
              sx={{ width: "80px", height: "40px", cursor: "pointer" }}
            />
            <Input
              type="text"
              value={formData.accentColor}
              onChange={(e) => handleChange("accentColor", e.target.value)}
              disabled={saving}
              placeholder="#3B82F6"
              sx={{ flex: 1 }}
            />
          </Flex>
        </Box>

        {/* Actions */}
        <Flex sx={{ gap: 3, justifyContent: "flex-end", mt: 4 }}>
          <Button type="submit" variant="primary" disabled={saving || !hasChanges} sx={{ px: 4, py: 2 }}>
            {saving ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}
          </Button>
        </Flex>
      </Box>

      {/* Info Box */}
      <Box sx={{ mt: 4, p: 3, bg: "muted", borderRadius: "4px" }}>
        <Text sx={{ fontSize: 1, color: "text", opacity: 0.8 }}>
          <strong>Note:</strong> These settings are shared across all resumes and cover letters you generate. Update
          them whenever your contact information changes. Required fields are marked with{" "}
          <Text as="span" sx={{ color: "red" }}>
            *
          </Text>
          .
        </Text>
      </Box>
    </Box>
  )
}
