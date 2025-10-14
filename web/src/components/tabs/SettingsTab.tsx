import React, { useState, useEffect, useRef } from "react"
import { Box, Heading, Text, Label, Input, Button, Flex, Alert, Spinner, Image } from "theme-ui"
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
    avatar: "",
    logo: "",
  })

  // UI state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Refs for file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Load current defaults (visible to everyone, editable only for editors)
  useEffect(() => {
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
          avatar: defaults.avatar ?? "",
          logo: defaults.logo ?? "",
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
  }, [])

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

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB")
      return
    }

    try {
      setUploadingAvatar(true)
      setError(null)

      const result = await generatorClient.uploadImage(file, "avatar")

      setFormData((prev) => ({ ...prev, avatar: result.url }))
      setSuccess(true)
      setUploadingAvatar(false)

      logger.info("Avatar uploaded successfully", {
        component: "SettingsTab",
        action: "uploadAvatar",
        size: result.size,
      })
    } catch (err) {
      logger.error("Failed to upload avatar", err as Error, {
        component: "SettingsTab",
        action: "uploadAvatar",
      })
      setError(err instanceof Error ? err.message : "Failed to upload avatar")
      setUploadingAvatar(false)
    }
  }

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB")
      return
    }

    try {
      setUploadingLogo(true)
      setError(null)

      const result = await generatorClient.uploadImage(file, "logo")

      setFormData((prev) => ({ ...prev, logo: result.url }))
      setSuccess(true)
      setUploadingLogo(false)

      logger.info("Logo uploaded successfully", {
        component: "SettingsTab",
        action: "uploadLogo",
        size: result.size,
      })
    } catch (err) {
      logger.error("Failed to upload logo", err as Error, {
        component: "SettingsTab",
        action: "uploadLogo",
      })
      setError(err instanceof Error ? err.message : "Failed to upload logo")
      setUploadingLogo(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <Box>
        <Flex sx={{ justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <Spinner size={48} />
        </Flex>
      </Box>
    )
  }

  const headerText = isEditor
    ? "Manage your default personal information. These values will be pre-filled when generating resumes and cover letters."
    : "View the default personal information used for resume and cover letter generation. Sign in as an editor to modify these settings."

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Text sx={{ color: "text", opacity: 0.8 }}>{headerText}</Text>
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
            disabled={!isEditor || saving}
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
            disabled={!isEditor || saving}
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
            disabled={!isEditor || saving}
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
            disabled={!isEditor || saving}
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
            disabled={!isEditor || saving}
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
            disabled={!isEditor || saving}
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
            disabled={!isEditor || saving}
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
              disabled={!isEditor || saving}
              sx={{ width: "80px", height: "40px", cursor: "pointer" }}
            />
            <Input
              type="text"
              value={formData.accentColor}
              onChange={(e) => handleChange("accentColor", e.target.value)}
              disabled={!isEditor || saving}
              placeholder="#3B82F6"
              sx={{ flex: 1 }}
            />
          </Flex>
        </Box>

        {/* Avatar */}
        <Box sx={{ mb: 4 }}>
          <Label htmlFor="avatar">
            Avatar
            <Text as="span" sx={{ ml: 2, fontSize: 1, opacity: 0.7 }}>
              (profile photo for resumes)
            </Text>
          </Label>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              void handleAvatarUpload(e)
            }}
            style={{ display: "none" }}
          />
          <Flex sx={{ gap: 2, alignItems: "center" }}>
            {/* Avatar Display with Placeholder */}
            <Box
              sx={{
                position: "relative",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                bg: formData.avatar ? "transparent" : "muted",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {formData.avatar ? (
                <Image src={formData.avatar} alt="Avatar" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Text sx={{ fontSize: 0, color: "textMuted", textAlign: "center" }}>No avatar</Text>
              )}
            </Box>

            {/* Upload Icon Button */}
            {isEditor && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar || saving}
                sx={{
                  width: "40px",
                  height: "40px",
                  p: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                title={formData.avatar ? "Change avatar" : "Upload avatar"}
              >
                {uploadingAvatar ? "..." : "📤"}
              </Button>
            )}

            {/* Description */}
            <Flex sx={{ flexDirection: "column", flex: 1 }}>
              <Text sx={{ fontSize: 1, opacity: 0.7 }}>
                Recommended: Square image, 512x512px for optimal quality (minimum 400x400px). Max 5MB. Formats: JPG,
                PNG, WebP, SVG
              </Text>
            </Flex>
          </Flex>
        </Box>

        {/* Logo */}
        <Box sx={{ mb: 4 }}>
          <Label htmlFor="logo">
            Logo
            <Text as="span" sx={{ ml: 2, fontSize: 1, opacity: 0.7 }}>
              (personal brand logo for headers)
            </Text>
          </Label>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              void handleLogoUpload(e)
            }}
            style={{ display: "none" }}
          />
          <Flex sx={{ gap: 2, alignItems: "center" }}>
            {/* Logo Display with Placeholder */}
            <Box
              sx={{
                width: "120px",
                height: "80px",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "4px",
                overflow: "hidden",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bg: formData.logo ? "background" : "muted",
              }}
            >
              {formData.logo ? (
                <Image
                  src={formData.logo}
                  alt="Logo"
                  sx={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              ) : (
                <Text sx={{ fontSize: 0, color: "textMuted", textAlign: "center" }}>No logo</Text>
              )}
            </Box>

            {/* Upload Icon Button */}
            {isEditor && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingLogo || saving}
                sx={{
                  width: "40px",
                  height: "40px",
                  p: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                title={formData.logo ? "Change logo" : "Upload logo"}
              >
                {uploadingLogo ? "..." : "📤"}
              </Button>
            )}

            {/* Description */}
            <Flex sx={{ flexDirection: "column", flex: 1 }}>
              <Text sx={{ fontSize: 1, opacity: 0.7 }}>
                Recommended: Horizontal logo, transparent background. Max 5MB. Formats: JPG, PNG, WebP, SVG
              </Text>
            </Flex>
          </Flex>
        </Box>

        {/* Actions - Editor Only */}
        {isEditor && (
          <Flex sx={{ gap: 3, justifyContent: "flex-end", mt: 4 }}>
            <Button type="submit" variant="primary" disabled={saving || !hasChanges} sx={{ px: 4, py: 2 }}>
              {saving ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}
            </Button>
          </Flex>
        )}
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
