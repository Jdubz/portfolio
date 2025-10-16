import React from "react"
import { Box, Text, Button, Flex } from "theme-ui"
import { FormField } from "../FormField"
import type { ExperienceEntry } from "../../types/experience"

interface StructuredEntryEditProps {
  data: {
    summary?: string
    accomplishments?: string[]
    technologies?: string[]
    projects?: Array<{
      name: string
      description: string
      technologies?: string[]
      challenges?: string[]
    }>
  }
  onChange: (data: StructuredEntryEditProps["data"]) => void
}

export const StructuredEntryEdit: React.FC<StructuredEntryEditProps> = ({ data, onChange }) => {
  const structuredData = data || {}

  // Accomplishments handlers
  const handleAddAccomplishment = () => {
    const accomplishments = structuredData.accomplishments || []
    onChange({
      ...structuredData,
      accomplishments: [...accomplishments, ""],
    })
  }

  const handleRemoveAccomplishment = (index: number) => {
    const accomplishments = [...(structuredData.accomplishments || [])]
    accomplishments.splice(index, 1)
    onChange({
      ...structuredData,
      accomplishments,
    })
  }

  const handleUpdateAccomplishment = (index: number, value: string) => {
    const accomplishments = [...(structuredData.accomplishments || [])]
    accomplishments[index] = value
    onChange({
      ...structuredData,
      accomplishments,
    })
  }

  // Technologies handlers
  const handleAddTech = () => {
    const technologies = structuredData.technologies || []
    onChange({
      ...structuredData,
      technologies: [...technologies, ""],
    })
  }

  const handleRemoveTech = (index: number) => {
    const technologies = [...(structuredData.technologies || [])]
    technologies.splice(index, 1)
    onChange({
      ...structuredData,
      technologies,
    })
  }

  const handleUpdateTech = (index: number, value: string) => {
    const technologies = [...(structuredData.technologies || [])]
    technologies[index] = value
    onChange({
      ...structuredData,
      technologies,
    })
  }

  // Projects handlers
  const handleAddProject = () => {
    const projects = structuredData.projects || []
    onChange({
      ...structuredData,
      projects: [
        ...projects,
        {
          name: "",
          description: "",
          technologies: [],
          challenges: [],
        },
      ],
    })
  }

  const handleRemoveProject = (index: number) => {
    const projects = [...(structuredData.projects || [])]
    projects.splice(index, 1)
    onChange({
      ...structuredData,
      projects,
    })
  }

  const handleUpdateProject = (
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    const projects = [...(structuredData.projects || [])]
    projects[index] = { ...projects[index], [field]: value }
    onChange({
      ...structuredData,
      projects,
    })
  }

  const handleAddProjectTech = (projectIndex: number) => {
    const projects = [...(structuredData.projects || [])]
    const technologies = projects[projectIndex].technologies || []
    projects[projectIndex] = {
      ...projects[projectIndex],
      technologies: [...technologies, ""],
    }
    onChange({
      ...structuredData,
      projects,
    })
  }

  const handleRemoveProjectTech = (projectIndex: number, techIndex: number) => {
    const projects = [...(structuredData.projects || [])]
    const technologies = [...(projects[projectIndex].technologies || [])]
    technologies.splice(techIndex, 1)
    projects[projectIndex] = {
      ...projects[projectIndex],
      technologies,
    }
    onChange({
      ...structuredData,
      projects,
    })
  }

  const handleUpdateProjectTech = (
    projectIndex: number,
    techIndex: number,
    value: string
  ) => {
    const projects = [...(structuredData.projects || [])]
    const technologies = [...(projects[projectIndex].technologies || [])]
    technologies[techIndex] = value
    projects[projectIndex] = {
      ...projects[projectIndex],
      technologies,
    }
    onChange({
      ...structuredData,
      projects,
    })
  }

  const handleAddProjectChallenge = (projectIndex: number) => {
    const projects = [...(structuredData.projects || [])]
    const challenges = projects[projectIndex].challenges || []
    projects[projectIndex] = {
      ...projects[projectIndex],
      challenges: [...challenges, ""],
    }
    onChange({
      ...structuredData,
      projects,
    })
  }

  const handleRemoveProjectChallenge = (projectIndex: number, challengeIndex: number) => {
    const projects = [...(structuredData.projects || [])]
    const challenges = [...(projects[projectIndex].challenges || [])]
    challenges.splice(challengeIndex, 1)
    projects[projectIndex] = {
      ...projects[projectIndex],
      challenges,
    }
    onChange({
      ...structuredData,
      projects,
    })
  }

  const handleUpdateProjectChallenge = (
    projectIndex: number,
    challengeIndex: number,
    value: string
  ) => {
    const projects = [...(structuredData.projects || [])]
    const challenges = [...(projects[projectIndex].challenges || [])]
    challenges[challengeIndex] = value
    projects[projectIndex] = {
      ...projects[projectIndex],
      challenges,
    }
    onChange({
      ...structuredData,
      projects,
    })
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Summary */}
      <FormField
        label="Summary"
        name="summary"
        value={structuredData.summary || ""}
        onChange={(value) => onChange({ ...structuredData, summary: value })}
        type="textarea"
        rows={3}
        placeholder="Brief overview of your role and impact"
      />

      {/* Accomplishments */}
      <Box>
        <Text sx={{ fontSize: 2, fontWeight: "bold", mb: 2 }}>Accomplishments</Text>
        {(structuredData.accomplishments || []).map((item, idx) => (
          <Flex key={idx} sx={{ gap: 2, mb: 2, alignItems: "flex-start" }}>
            <Box sx={{ flex: 1 }}>
              <FormField
                label=""
                name={`accomplishment-${idx}`}
                value={item}
                onChange={(value) => handleUpdateAccomplishment(idx, value)}
                type="textarea"
                rows={2}
                placeholder="Describe a key accomplishment or contribution"
              />
            </Box>
            <Button
              type="button"
              variant="danger.sm"
              onClick={() => handleRemoveAccomplishment(idx)}
              sx={{ flexShrink: 0, mt: 2 }}
            >
              Remove
            </Button>
          </Flex>
        ))}
        <Button type="button" variant="secondary.sm" onClick={handleAddAccomplishment}>
          + Add Accomplishment
        </Button>
      </Box>

      {/* Technologies */}
      <Box>
        <Text sx={{ fontSize: 2, fontWeight: "bold", mb: 2 }}>Technologies</Text>
        {(structuredData.technologies || []).map((tech, idx) => (
          <Flex key={idx} sx={{ gap: 2, mb: 2, alignItems: "center" }}>
            <Box sx={{ flex: 1 }}>
              <FormField
                label=""
                name={`tech-${idx}`}
                value={tech}
                onChange={(value) => handleUpdateTech(idx, value)}
                placeholder="Technology, framework, or tool"
              />
            </Box>
            <Button
              type="button"
              variant="danger.sm"
              onClick={() => handleRemoveTech(idx)}
              sx={{ flexShrink: 0 }}
            >
              Remove
            </Button>
          </Flex>
        ))}
        <Button type="button" variant="secondary.sm" onClick={handleAddTech}>
          + Add Technology
        </Button>
      </Box>

      {/* Projects */}
      <Box>
        <Text sx={{ fontSize: 2, fontWeight: "bold", mb: 3 }}>Projects</Text>
        {(structuredData.projects || []).map((project, projIdx) => (
          <Box
            key={projIdx}
            sx={{
              p: 3,
              mb: 3,
              border: "1px solid",
              borderColor: "gray",
              borderRadius: 4,
              bg: "muted",
            }}
          >
            <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Text sx={{ fontSize: 2, fontWeight: "bold" }}>Project {projIdx + 1}</Text>
              <Button
                type="button"
                variant="danger.sm"
                onClick={() => handleRemoveProject(projIdx)}
              >
                Remove Project
              </Button>
            </Flex>

            <FormField
              label="Project Name"
              name={`project-name-${projIdx}`}
              value={project.name}
              onChange={(value) => handleUpdateProject(projIdx, "name", value)}
              placeholder="Project or initiative name"
              sx={{ mb: 3 }}
            />

            <FormField
              label="Description"
              name={`project-desc-${projIdx}`}
              value={project.description}
              onChange={(value) => handleUpdateProject(projIdx, "description", value)}
              type="textarea"
              rows={3}
              placeholder="What did you build and why?"
              sx={{ mb: 3 }}
            />

            {/* Project Technologies */}
            <Box sx={{ mb: 3 }}>
              <Text sx={{ fontSize: 1, fontWeight: "bold", mb: 2 }}>Technologies Used</Text>
              {(project.technologies || []).map((tech, techIdx) => (
                <Flex key={techIdx} sx={{ gap: 2, mb: 2, alignItems: "center" }}>
                  <Box sx={{ flex: 1 }}>
                    <FormField
                      label=""
                      name={`project-${projIdx}-tech-${techIdx}`}
                      value={tech}
                      onChange={(value) =>
                        handleUpdateProjectTech(projIdx, techIdx, value)
                      }
                      placeholder="Technology"
                    />
                  </Box>
                  <Button
                    type="button"
                    variant="danger.sm"
                    onClick={() => handleRemoveProjectTech(projIdx, techIdx)}
                    sx={{ flexShrink: 0, fontSize: 0 }}
                  >
                    Remove
                  </Button>
                </Flex>
              ))}
              <Button
                type="button"
                variant="secondary.sm"
                onClick={() => handleAddProjectTech(projIdx)}
                sx={{ fontSize: 0 }}
              >
                + Add Technology
              </Button>
            </Box>

            {/* Project Challenges */}
            <Box>
              <Text sx={{ fontSize: 1, fontWeight: "bold", mb: 2 }}>
                Technical Challenges
              </Text>
              {(project.challenges || []).map((challenge, chalIdx) => (
                <Flex key={chalIdx} sx={{ gap: 2, mb: 2, alignItems: "flex-start" }}>
                  <Box sx={{ flex: 1 }}>
                    <FormField
                      label=""
                      name={`project-${projIdx}-challenge-${chalIdx}`}
                      value={challenge}
                      onChange={(value) =>
                        handleUpdateProjectChallenge(projIdx, chalIdx, value)
                      }
                      type="textarea"
                      rows={2}
                      placeholder="Technical challenge and how you solved it"
                    />
                  </Box>
                  <Button
                    type="button"
                    variant="danger.sm"
                    onClick={() => handleRemoveProjectChallenge(projIdx, chalIdx)}
                    sx={{ flexShrink: 0, mt: 2, fontSize: 0 }}
                  >
                    Remove
                  </Button>
                </Flex>
              ))}
              <Button
                type="button"
                variant="secondary.sm"
                onClick={() => handleAddProjectChallenge(projIdx)}
                sx={{ fontSize: 0 }}
              >
                + Add Challenge
              </Button>
            </Box>
          </Box>
        ))}
        <Button type="button" variant="secondary.sm" onClick={handleAddProject}>
          + Add Project
        </Button>
      </Box>
    </Box>
  )
}
