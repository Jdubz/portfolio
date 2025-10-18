import React, { useState } from "react"
import { Box, Button, Flex, Heading } from "theme-ui"
import { FormField } from "./FormField"
import { FormActions } from "./FormActions"
import { Modal, ModalHeader, ModalBody, InfoBox } from "./ui"
import type { CreateContentItemData, ContentItemType } from "../types/content-item"
import { logger } from "../utils/logger"

// Modal step constants
const MODAL_STEPS = {
  SELECT_TYPE: "select-type",
  FILL_FORM: "fill-form",
} as const

type ModalStep = (typeof MODAL_STEPS)[keyof typeof MODAL_STEPS]

interface CreateContentItemModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: CreateContentItemData) => Promise<void>
  preselectedType?: string
}

/**
 * Modal for creating new content items
 * Step 1: Select content type
 * Step 2: Fill in type-specific form
 */
export const CreateContentItemModal: React.FC<CreateContentItemModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  preselectedType,
}) => {
  const [step, setStep] = useState<ModalStep>(preselectedType ? MODAL_STEPS.FILL_FORM : MODAL_STEPS.SELECT_TYPE)
  const [selectedType, setSelectedType] = useState<ContentItemType | null>((preselectedType as ContentItemType) || null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data for different types
  const [companyData, setCompanyData] = useState({
    company: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    summary: "",
  })

  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    role: "",
  })

  const [skillGroupData, setSkillGroupData] = useState({
    category: "",
    skills: "",
  })

  const [educationData, setEducationData] = useState({
    institution: "",
    degree: "",
    field: "",
  })

  const [profileSectionData, setProfileSectionData] = useState({
    heading: "",
    content: "",
  })

  const [textSectionData, setTextSectionData] = useState({
    heading: "",
    content: "",
  })

  const [accomplishmentData, setAccomplishmentData] = useState({
    description: "",
  })

  const [timelineEventData, setTimelineEventData] = useState({
    title: "",
    description: "",
  })

  const handleTypeSelect = (type: ContentItemType) => {
    setSelectedType(type)
    setStep(MODAL_STEPS.FILL_FORM)
  }

  const handleBack = () => {
    setStep(MODAL_STEPS.SELECT_TYPE)
    setSelectedType(null)
  }

  const handleSubmit = async () => {
    if (!selectedType) {
      return
    }

    setIsSubmitting(true)
    try {
      let createData: CreateContentItemData

      switch (selectedType) {
        case "company":
          createData = {
            type: "company",
            company: companyData.company,
            role: companyData.role || undefined,
            location: companyData.location || undefined,
            startDate: companyData.startDate,
            endDate: companyData.endDate || null,
            summary: companyData.summary || undefined,
            parentId: null,
            order: 0,
          }
          break

        case "project":
          createData = {
            type: "project",
            name: projectData.name,
            description: projectData.description,
            role: projectData.role || undefined,
            parentId: null,
            order: 0,
          }
          break

        case "skill-group":
          createData = {
            type: "skill-group",
            category: skillGroupData.category,
            skills: skillGroupData.skills.split(",").map((s) => s.trim()),
            parentId: null,
            order: 0,
          }
          break

        case "education":
          createData = {
            type: "education",
            institution: educationData.institution,
            degree: educationData.degree || undefined,
            field: educationData.field || undefined,
            parentId: null,
            order: 0,
          }
          break

        case "profile-section":
          createData = {
            type: "profile-section",
            heading: profileSectionData.heading,
            content: profileSectionData.content,
            parentId: null,
            order: 0,
          }
          break

        case "text-section":
          createData = {
            type: "text-section",
            heading: textSectionData.heading || undefined,
            content: textSectionData.content,
            parentId: null,
            order: 0,
          }
          break

        case "accomplishment":
          createData = {
            type: "accomplishment",
            description: accomplishmentData.description,
            parentId: null,
            order: 0,
          }
          break

        case "timeline-event":
          createData = {
            type: "timeline-event",
            title: timelineEventData.title,
            description: timelineEventData.description || undefined,
            parentId: null,
            order: 0,
          }
          break

        default:
          throw new Error("Invalid content type")
      }

      await onCreate(createData)

      // Reset form
      handleBack()
      onClose()
    } catch (error) {
      logger.error("Failed to create content item", error as Error, {
        component: "CreateContentItemModal",
        type: selectedType,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader
        title={step === MODAL_STEPS.SELECT_TYPE ? "Select Content Type" : `Create ${selectedType}`}
        onClose={onClose}
      />

      <ModalBody>
        {step === MODAL_STEPS.SELECT_TYPE ? (
          <Box>
            <InfoBox variant="info" icon="ℹ️">
              Choose the type of content you want to add:
            </InfoBox>

            <Flex sx={{ flexDirection: "column", gap: 3, mt: 4 }}>
              <Button variant="secondary" onClick={() => handleTypeSelect("company")}>
                Company / Work Experience
              </Button>
              <Button variant="secondary" onClick={() => handleTypeSelect("project")}>
                Project
              </Button>
              <Button variant="secondary" onClick={() => handleTypeSelect("skill-group")}>
                Skill Group
              </Button>
              <Button variant="secondary" onClick={() => handleTypeSelect("education")}>
                Education / Certification
              </Button>
              <Button variant="secondary" onClick={() => handleTypeSelect("profile-section")}>
                Profile Section
              </Button>
              <Button variant="secondary" onClick={() => handleTypeSelect("text-section")}>
                Text Section
              </Button>
              <Button variant="secondary" onClick={() => handleTypeSelect("accomplishment")}>
                Accomplishment
              </Button>
              <Button variant="secondary" onClick={() => handleTypeSelect("timeline-event")}>
                Timeline Event
              </Button>
            </Flex>
          </Box>
        ) : (
          <Box>
            {/* Company Form */}
            {selectedType === "company" && (
              <Box>
                <FormField
                  label="Company Name"
                  name="company"
                  value={companyData.company}
                  onChange={(value) => setCompanyData({ ...companyData, company: value })}
                  required
                />
                <FormField
                  label="Role"
                  name="role"
                  value={companyData.role}
                  onChange={(value) => setCompanyData({ ...companyData, role: value })}
                />
                <FormField
                  label="Location"
                  name="location"
                  value={companyData.location}
                  onChange={(value) => setCompanyData({ ...companyData, location: value })}
                />
                <FormField
                  label="Start Date (YYYY-MM)"
                  name="startDate"
                  placeholder="2023-01"
                  value={companyData.startDate}
                  onChange={(value) => setCompanyData({ ...companyData, startDate: value })}
                  required
                />
                <FormField
                  label="End Date (YYYY-MM or leave empty for Present)"
                  name="endDate"
                  placeholder="2024-12"
                  value={companyData.endDate}
                  onChange={(value) => setCompanyData({ ...companyData, endDate: value })}
                />
                <FormField
                  label="Summary"
                  name="summary"
                  type="textarea"
                  rows={4}
                  value={companyData.summary}
                  onChange={(value) => setCompanyData({ ...companyData, summary: value })}
                />
              </Box>
            )}

            {/* Project Form */}
            {selectedType === "project" && (
              <Box>
                <FormField
                  name="project_name"
                  label="Project Name"
                  value={projectData.name}
                  onChange={(value) => setProjectData({ ...projectData, name: value })}
                  required
                />
                <FormField
                  name="description"
                  label="Description"
                  type="textarea"
                  rows={4}
                  value={projectData.description}
                  onChange={(value) => setProjectData({ ...projectData, description: value })}
                  required
                />
                <FormField
                  name="your_role"
                  label="Your Role"
                  value={projectData.role}
                  onChange={(value) => setProjectData({ ...projectData, role: value })}
                />
              </Box>
            )}

            {/* Skill Group Form */}
            {selectedType === "skill-group" && (
              <Box>
                <FormField
                  name="category"
                  label="Category"
                  placeholder="e.g., Languages, Frameworks, Tools"
                  value={skillGroupData.category}
                  onChange={(value) => setSkillGroupData({ ...skillGroupData, category: value })}
                  required
                />
                <FormField
                  name="skills"
                  label="Skills (comma-separated)"
                  type="textarea"
                  rows={3}
                  placeholder="React, TypeScript, Node.js"
                  value={skillGroupData.skills}
                  onChange={(value) => setSkillGroupData({ ...skillGroupData, skills: value })}
                  required
                />
              </Box>
            )}

            {/* Education Form */}
            {selectedType === "education" && (
              <Box>
                <FormField
                  name="institution"
                  label="Institution"
                  value={educationData.institution}
                  onChange={(value) => setEducationData({ ...educationData, institution: value })}
                  required
                />
                <FormField
                  name="degree"
                  label="Degree"
                  value={educationData.degree}
                  onChange={(value) => setEducationData({ ...educationData, degree: value })}
                />
                <FormField
                  name="field_of_study"
                  label="Field of Study"
                  value={educationData.field}
                  onChange={(value) => setEducationData({ ...educationData, field: value })}
                />
              </Box>
            )}

            {/* Profile Section Form */}
            {selectedType === "profile-section" && (
              <Box>
                <FormField
                  name="heading"
                  label="Heading"
                  value={profileSectionData.heading}
                  onChange={(value) => setProfileSectionData({ ...profileSectionData, heading: value })}
                  required
                />
                <FormField
                  name="content"
                  label="Content (Markdown)"
                  type="textarea"
                  rows={6}
                  value={profileSectionData.content}
                  onChange={(value) => setProfileSectionData({ ...profileSectionData, content: value })}
                  required
                />
              </Box>
            )}

            {/* Text Section Form */}
            {selectedType === "text-section" && (
              <Box>
                <FormField
                  name="heading"
                  label="Heading (optional)"
                  value={textSectionData.heading}
                  onChange={(value) => setTextSectionData({ ...textSectionData, heading: value })}
                />
                <FormField
                  name="content"
                  label="Content (Markdown)"
                  type="textarea"
                  rows={6}
                  value={textSectionData.content}
                  onChange={(value) => setTextSectionData({ ...textSectionData, content: value })}
                  required
                />
              </Box>
            )}

            {/* Accomplishment Form */}
            {selectedType === "accomplishment" && (
              <Box>
                <FormField
                  name="description"
                  label="Description"
                  type="textarea"
                  rows={3}
                  value={accomplishmentData.description}
                  onChange={(value) => setAccomplishmentData({ ...accomplishmentData, description: value })}
                  required
                />
              </Box>
            )}

            {/* Timeline Event Form */}
            {selectedType === "timeline-event" && (
              <Box>
                <FormField
                  name="title"
                  label="Title"
                  value={timelineEventData.title}
                  onChange={(value) => setTimelineEventData({ ...timelineEventData, title: value })}
                  required
                />
                <FormField
                  name="description"
                  label="Description"
                  type="textarea"
                  rows={3}
                  value={timelineEventData.description}
                  onChange={(value) => setTimelineEventData({ ...timelineEventData, description: value })}
                />
              </Box>
            )}

            <FormActions onCancel={handleBack} onSave={handleSubmit} isSubmitting={isSubmitting} saveText="Create" />
          </Box>
        )}
      </ModalBody>
    </Modal>
  )
}
