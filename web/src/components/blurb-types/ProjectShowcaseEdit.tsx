import React from "react"
import { Box, Text, Button, Flex, Heading } from "theme-ui"
import { FormField } from "../FormField"
import type { BlurbEntry } from "../../types/experience"

interface ProjectShowcaseEditProps {
  data: BlurbEntry["structuredData"]
  onChange: (data: BlurbEntry["structuredData"]) => void
}

export const ProjectShowcaseEdit: React.FC<ProjectShowcaseEditProps> = ({ data, onChange }) => {
  const showcaseData = data || {}
  const projects = showcaseData.projects || []

  const handleAddProject = () => {
    onChange({
      ...showcaseData,
      projects: [
        ...projects,
        {
          name: "",
          description: "",
          technologies: [],
          links: [],
        },
      ],
    })
  }

  const handleRemoveProject = (index: number) => {
    const newProjects = [...projects]
    newProjects.splice(index, 1)
    onChange({
      ...showcaseData,
      projects: newProjects,
    })
  }

  const handleUpdateProject = (
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    const newProjects = [...projects]
    newProjects[index] = { ...newProjects[index], [field]: value }
    onChange({
      ...showcaseData,
      projects: newProjects,
    })
  }

  const handleAddTech = (projectIndex: number) => {
    const newProjects = [...projects]
    const technologies = newProjects[projectIndex].technologies || []
    newProjects[projectIndex] = {
      ...newProjects[projectIndex],
      technologies: [...technologies, ""],
    }
    onChange({
      ...showcaseData,
      projects: newProjects,
    })
  }

  const handleRemoveTech = (projectIndex: number, techIndex: number) => {
    const newProjects = [...projects]
    const technologies = [...(newProjects[projectIndex].technologies || [])]
    technologies.splice(techIndex, 1)
    newProjects[projectIndex] = {
      ...newProjects[projectIndex],
      technologies,
    }
    onChange({
      ...showcaseData,
      projects: newProjects,
    })
  }

  const handleUpdateTech = (projectIndex: number, techIndex: number, value: string) => {
    const newProjects = [...projects]
    const technologies = [...(newProjects[projectIndex].technologies || [])]
    technologies[techIndex] = value
    newProjects[projectIndex] = {
      ...newProjects[projectIndex],
      technologies,
    }
    onChange({
      ...showcaseData,
      projects: newProjects,
    })
  }

  const handleAddLink = (projectIndex: number) => {
    const newProjects = [...projects]
    const links = newProjects[projectIndex].links || []
    newProjects[projectIndex] = {
      ...newProjects[projectIndex],
      links: [...links, { label: "", url: "" }],
    }
    onChange({
      ...showcaseData,
      projects: newProjects,
    })
  }

  const handleRemoveLink = (projectIndex: number, linkIndex: number) => {
    const newProjects = [...projects]
    const links = [...(newProjects[projectIndex].links || [])]
    links.splice(linkIndex, 1)
    newProjects[projectIndex] = {
      ...newProjects[projectIndex],
      links,
    }
    onChange({
      ...showcaseData,
      projects: newProjects,
    })
  }

  const handleUpdateLink = (
    projectIndex: number,
    linkIndex: number,
    field: "label" | "url",
    value: string
  ) => {
    const newProjects = [...projects]
    const links = [...(newProjects[projectIndex].links || [])]
    links[linkIndex] = { ...links[linkIndex], [field]: value }
    newProjects[projectIndex] = {
      ...newProjects[projectIndex],
      links,
    }
    onChange({
      ...showcaseData,
      projects: newProjects,
    })
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {projects.map((project, projectIdx) => (
        <Box
          key={projectIdx}
          sx={{
            p: 3,
            border: "1px solid",
            borderColor: "muted",
            borderRadius: "4px",
          }}
        >
          <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Heading as="h4" sx={{ fontSize: 3 }}>
              Project {projectIdx + 1}
            </Heading>
            <Button
              type="button"
              variant="danger.sm"
              onClick={() => handleRemoveProject(projectIdx)}
            >
              Remove Project
            </Button>
          </Flex>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <FormField
              label="Project Name"
              name={`project-name-${projectIdx}`}
              value={project.name}
              onChange={(value) => handleUpdateProject(projectIdx, "name", value)}
            />

            <FormField
              label="Description"
              name={`project-desc-${projectIdx}`}
              value={project.description}
              onChange={(value) => handleUpdateProject(projectIdx, "description", value)}
              type="textarea"
              rows={3}
            />

            <Box>
              <Text sx={{ fontSize: 2, fontWeight: "bold", mb: 2 }}>Technologies</Text>
              {(project.technologies || []).map((tech, techIdx) => (
                <Flex key={techIdx} sx={{ gap: 2, mb: 2, alignItems: "center" }}>
                  <Box sx={{ flex: 1 }}>
                    <FormField
                      label=""
                      name={`project-${projectIdx}-tech-${techIdx}`}
                      value={tech}
                      onChange={(value) => handleUpdateTech(projectIdx, techIdx, value)}
                      placeholder="Technology name"
                    />
                  </Box>
                  <Button
                    type="button"
                    variant="danger.sm"
                    onClick={() => handleRemoveTech(projectIdx, techIdx)}
                    sx={{ flexShrink: 0 }}
                  >
                    Remove
                  </Button>
                </Flex>
              ))}
              <Button
                type="button"
                variant="secondary.sm"
                onClick={() => handleAddTech(projectIdx)}
              >
                + Add Technology
              </Button>
            </Box>

            <Box>
              <Text sx={{ fontSize: 2, fontWeight: "bold", mb: 2 }}>Links</Text>
              {(project.links || []).map((link, linkIdx) => (
                <Flex key={linkIdx} sx={{ gap: 2, mb: 2, alignItems: "flex-start" }}>
                  <Box sx={{ flex: 1 }}>
                    <FormField
                      label=""
                      name={`project-${projectIdx}-link-label-${linkIdx}`}
                      value={link.label}
                      onChange={(value) => handleUpdateLink(projectIdx, linkIdx, "label", value)}
                      placeholder="Label (e.g., Source Code)"
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormField
                      label=""
                      name={`project-${projectIdx}-link-url-${linkIdx}`}
                      value={link.url}
                      onChange={(value) => handleUpdateLink(projectIdx, linkIdx, "url", value)}
                      placeholder="URL"
                    />
                  </Box>
                  <Button
                    type="button"
                    variant="danger.sm"
                    onClick={() => handleRemoveLink(projectIdx, linkIdx)}
                    sx={{ flexShrink: 0, mt: 2 }}
                  >
                    Remove
                  </Button>
                </Flex>
              ))}
              <Button
                type="button"
                variant="secondary.sm"
                onClick={() => handleAddLink(projectIdx)}
              >
                + Add Link
              </Button>
            </Box>
          </Box>
        </Box>
      ))}

      <Button type="button" variant="primary.sm" onClick={handleAddProject}>
        + Add Project
      </Button>
    </Box>
  )
}
