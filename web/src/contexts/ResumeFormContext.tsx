import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { GenerationType, AIProviderType } from "../types/generator"

/**
 * Resume Form State
 *
 * Maintains form state during page navigation within the same session.
 * Does NOT persist to localStorage (form resets on page refresh).
 */
interface ResumeFormState {
  // Generation options
  generateType: GenerationType
  aiProvider: AIProviderType

  // Job information
  role: string
  company: string
  companyWebsite: string
  jobDescriptionUrl: string
  jobDescriptionText: string

  // Preferences
  emphasize: string
}

/**
 * Resume Form Context Value
 *
 * Provides access to form state and update functions
 */
interface ResumeFormContextValue {
  // State
  formState: ResumeFormState

  // Update functions
  setGenerateType: (type: GenerationType) => void
  setAIProvider: (provider: AIProviderType) => void
  setRole: (role: string) => void
  setCompany: (company: string) => void
  setCompanyWebsite: (website: string) => void
  setJobDescriptionUrl: (url: string) => void
  setJobDescriptionText: (text: string) => void
  setEmphasize: (emphasize: string) => void

  // Bulk update function for job match hydration
  updateFormFields: (fields: Partial<ResumeFormState>) => void

  // Utility functions
  clearForm: () => void
  isFormEmpty: () => boolean
}

/**
 * Default form state
 */
const DEFAULT_FORM_STATE: ResumeFormState = {
  generateType: "both",
  aiProvider: "gemini",
  role: "",
  company: "",
  companyWebsite: "",
  jobDescriptionUrl: "",
  jobDescriptionText: "",
  emphasize: "",
}

/**
 * Resume Form Context
 */
const ResumeFormContext = createContext<ResumeFormContextValue | undefined>(undefined)

/**
 * Resume Form Provider Props
 */
interface ResumeFormProviderProps {
  children: ReactNode
}

/**
 * Resume Form Provider
 *
 * Wraps the resume builder page (or app) to provide form state.
 * State persists during navigation but resets on page refresh.
 */
export const ResumeFormProvider: React.FC<ResumeFormProviderProps> = ({ children }) => {
  const [formState, setFormState] = useState<ResumeFormState>(DEFAULT_FORM_STATE)

  // Update functions (memoized to prevent infinite loops in useEffect dependencies)
  const setGenerateType = useCallback((type: GenerationType) => {
    setFormState((prev) => ({ ...prev, generateType: type }))
  }, [])

  const setAIProvider = useCallback((provider: AIProviderType) => {
    setFormState((prev) => ({ ...prev, aiProvider: provider }))
  }, [])

  const setRole = useCallback((role: string) => {
    setFormState((prev) => ({ ...prev, role }))
  }, [])

  const setCompany = useCallback((company: string) => {
    setFormState((prev) => ({ ...prev, company }))
  }, [])

  const setCompanyWebsite = useCallback((website: string) => {
    setFormState((prev) => ({ ...prev, companyWebsite: website }))
  }, [])

  const setJobDescriptionUrl = useCallback((url: string) => {
    setFormState((prev) => ({ ...prev, jobDescriptionUrl: url }))
  }, [])

  const setJobDescriptionText = useCallback((text: string) => {
    setFormState((prev) => ({ ...prev, jobDescriptionText: text }))
  }, [])

  const setEmphasize = useCallback((emphasize: string) => {
    setFormState((prev) => ({ ...prev, emphasize }))
  }, [])

  // Bulk update function (for hydrating form from job match in a single operation)
  const updateFormFields = useCallback((fields: Partial<ResumeFormState>) => {
    setFormState((prev) => ({ ...prev, ...fields }))
  }, [])

  // Utility functions (memoized to prevent infinite loops in useEffect dependencies)
  const clearForm = useCallback(() => {
    setFormState(DEFAULT_FORM_STATE)
  }, [])

  const isFormEmpty = useCallback(() => {
    return (
      formState.role.trim() === "" &&
      formState.company.trim() === "" &&
      formState.companyWebsite.trim() === "" &&
      formState.jobDescriptionUrl.trim() === "" &&
      formState.jobDescriptionText.trim() === "" &&
      formState.emphasize.trim() === ""
    )
  }, [formState])

  const value: ResumeFormContextValue = {
    formState,
    setGenerateType,
    setAIProvider,
    setRole,
    setCompany,
    setCompanyWebsite,
    setJobDescriptionUrl,
    setJobDescriptionText,
    setEmphasize,
    updateFormFields,
    clearForm,
    isFormEmpty,
  }

  return <ResumeFormContext.Provider value={value}>{children}</ResumeFormContext.Provider>
}

/**
 * useResumeForm Hook
 *
 * Access resume form state and update functions from any component.
 *
 * @throws Error if used outside of ResumeFormProvider
 *
 * @example
 * ```tsx
 * const { formState, setRole, clearForm } = useResumeForm()
 *
 * <Input value={formState.role} onChange={(e) => setRole(e.target.value)} />
 * <Button onClick={clearForm}>Clear</Button>
 * ```
 */
export const useResumeForm = (): ResumeFormContextValue => {
  const context = useContext(ResumeFormContext)

  if (context === undefined) {
    throw new Error("useResumeForm must be used within a ResumeFormProvider")
  }

  return context
}
