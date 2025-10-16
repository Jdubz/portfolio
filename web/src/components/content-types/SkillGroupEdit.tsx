import React from "react"
import { Box, Flex, Heading, Button, Text } from "theme-ui"
import type { UpdateContentItemData, UpdateSkillGroupData } from "../../types/content-item"
import { FormField } from "../FormField"

interface SkillGroupEditProps {
  data: UpdateContentItemData
  onChange: (data: UpdateContentItemData) => void
}

export const SkillGroupEdit: React.FC<SkillGroupEditProps> = ({ data, onChange }) => {
  // Cast to specific type - safe because parent component ensures correct type
  const skillGroupData = data as UpdateSkillGroupData

  const handleAddSubcategory = () => {
    const currentSubcategories = skillGroupData.subcategories ?? []
    onChange({
      ...data,
      subcategories: [...currentSubcategories, { name: "", skills: [] }],
    })
  }

  const handleRemoveSubcategory = (index: number) => {
    const currentSubcategories = skillGroupData.subcategories ?? []
    onChange({
      ...data,
      subcategories: currentSubcategories.filter((_, i) => i !== index),
    })
  }

  const handleSubcategoryChange = (index: number, field: "name" | "skills", value: string) => {
    const currentSubcategories = skillGroupData.subcategories ?? []
    const updatedSubcategories = [...currentSubcategories]

    if (field === "skills") {
      updatedSubcategories[index] = {
        ...updatedSubcategories[index],
        skills: value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [],
      }
    } else {
      updatedSubcategories[index] = { ...updatedSubcategories[index], [field]: value }
    }

    onChange({ ...data, subcategories: updatedSubcategories })
  }

  return (
    <Flex sx={{ flexDirection: "column", gap: 3, mb: 3 }}>
      <FormField
        label="Category"
        name="category"
        value={skillGroupData.category ?? ""}
        onChange={(value) => onChange({ ...data, category: value })}
        required
        placeholder="Frontend Development"
      />

      <FormField
        label="Skills (comma-separated)"
        name="skills"
        value={skillGroupData.skills?.join(", ") ?? ""}
        onChange={(value) =>
          onChange({
            ...data,
            skills: value ? value.split(",").map((s) => s.trim()).filter(Boolean) : [],
          })
        }
        placeholder="React, TypeScript, CSS"
      />

      {/* Subcategories */}
      <Box>
        <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Heading as="h4" sx={{ fontSize: 2 }}>
            Subcategories (optional)
          </Heading>
          <Button type="button" onClick={handleAddSubcategory} variant="secondary.sm">
            Add Subcategory
          </Button>
        </Flex>

        {skillGroupData.subcategories && skillGroupData.subcategories.length > 0 ? (
          <Flex sx={{ flexDirection: "column", gap: 3 }}>
            {skillGroupData.subcategories.map((subcategory, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 3,
                  border: "1px solid",
                  borderColor: "muted",
                  borderRadius: 2,
                }}
              >
                <Flex sx={{ flexDirection: "column", gap: 2 }}>
                  <FormField
                    label="Subcategory Name"
                    name={`subcategory-name-${idx}`}
                    value={subcategory.name}
                    onChange={(value) => handleSubcategoryChange(idx, "name", value)}
                    placeholder="Frameworks"
                  />
                  <FormField
                    label="Skills (comma-separated)"
                    name={`subcategory-skills-${idx}`}
                    value={subcategory.skills.join(", ")}
                    onChange={(value) => handleSubcategoryChange(idx, "skills", value)}
                    placeholder="React, Vue, Angular"
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveSubcategory(idx)}
                    variant="secondary.sm"
                  >
                    Remove Subcategory
                  </Button>
                </Flex>
              </Box>
            ))}
          </Flex>
        ) : (
          <Text sx={{ fontSize: 1, color: "textMuted", fontStyle: "italic" }}>
            No subcategories added yet
          </Text>
        )}
      </Box>
    </Flex>
  )
}
