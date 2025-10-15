import React from "react"
import { Box, Text, Button, Flex, Heading } from "theme-ui"
import { FormField } from "../FormField"
import type { BlurbEntry } from "../../types/experience"

interface CategorizedListEditProps {
  data: BlurbEntry["structuredData"]
  onChange: (data: BlurbEntry["structuredData"]) => void
}

export const CategorizedListEdit: React.FC<CategorizedListEditProps> = ({ data, onChange }) => {
  const listData = data || {}
  const categories = listData.categories || []

  const handleAddCategory = () => {
    onChange({
      ...listData,
      categories: [
        ...categories,
        {
          category: "",
          skills: [],
        },
      ],
    })
  }

  const handleRemoveCategory = (index: number) => {
    const newCategories = [...categories]
    newCategories.splice(index, 1)
    onChange({
      ...listData,
      categories: newCategories,
    })
  }

  const handleUpdateCategory = (index: number, value: string) => {
    const newCategories = [...categories]
    newCategories[index] = { ...newCategories[index], category: value }
    onChange({
      ...listData,
      categories: newCategories,
    })
  }

  const handleAddSkill = (categoryIndex: number) => {
    const newCategories = [...categories]
    const skills = newCategories[categoryIndex].skills || []
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      skills: [...skills, ""],
    }
    onChange({
      ...listData,
      categories: newCategories,
    })
  }

  const handleRemoveSkill = (categoryIndex: number, skillIndex: number) => {
    const newCategories = [...categories]
    const skills = [...(newCategories[categoryIndex].skills || [])]
    skills.splice(skillIndex, 1)
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      skills,
    }
    onChange({
      ...listData,
      categories: newCategories,
    })
  }

  const handleUpdateSkill = (categoryIndex: number, skillIndex: number, value: string) => {
    const newCategories = [...categories]
    const skills = [...(newCategories[categoryIndex].skills || [])]
    skills[skillIndex] = value
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      skills,
    }
    onChange({
      ...listData,
      categories: newCategories,
    })
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {categories.map((category, catIdx) => (
        <Box
          key={catIdx}
          sx={{
            p: 3,
            border: "1px solid",
            borderColor: "muted",
            borderRadius: "4px",
          }}
        >
          <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Heading as="h4" sx={{ fontSize: 3 }}>
              Category {catIdx + 1}
            </Heading>
            <Button
              type="button"
              variant="danger.sm"
              onClick={() => handleRemoveCategory(catIdx)}
            >
              Remove Category
            </Button>
          </Flex>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <FormField
              label="Category Name"
              name={`category-name-${catIdx}`}
              value={category.category}
              onChange={(value) => handleUpdateCategory(catIdx, value)}
              placeholder="e.g., Frontend, Backend, Platform"
            />

            <Box>
              <Text sx={{ fontSize: 2, fontWeight: "bold", mb: 2 }}>Skills</Text>
              {(category.skills || []).map((skill, skillIdx) => (
                <Flex key={skillIdx} sx={{ gap: 2, mb: 2, alignItems: "center" }}>
                  <Box sx={{ flex: 1 }}>
                    <FormField
                      label=""
                      name={`category-${catIdx}-skill-${skillIdx}`}
                      value={skill}
                      onChange={(value) => handleUpdateSkill(catIdx, skillIdx, value)}
                      placeholder="Skill or technology"
                    />
                  </Box>
                  <Button
                    type="button"
                    variant="danger.sm"
                    onClick={() => handleRemoveSkill(catIdx, skillIdx)}
                    sx={{ flexShrink: 0 }}
                  >
                    Remove
                  </Button>
                </Flex>
              ))}
              <Button
                type="button"
                variant="secondary.sm"
                onClick={() => handleAddSkill(catIdx)}
              >
                + Add Skill
              </Button>
            </Box>
          </Box>
        </Box>
      ))}

      <Button type="button" variant="primary.sm" onClick={handleAddCategory}>
        + Add Category
      </Button>
    </Box>
  )
}
