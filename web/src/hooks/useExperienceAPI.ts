import { useState, useEffect, useCallback } from "react"
import type {
  ExperienceEntry,
  CreateExperienceData,
  UpdateExperienceData,
  ExperienceApiResponse,
} from "../types/experience"
import { getIdToken } from "./useAuth"

// API Configuration
const API_CONFIG = {
  projectId: "static-sites-257923",
  region: "us-central1",
  functionName: "manageExperience",
  emulatorPort: 5001,
  defaultEmulatorHost: "localhost",
}

const getApiUrl = () => {
  // Use emulator in development, production URL otherwise
  if (process.env.NODE_ENV === "development") {
    const emulatorHost = process.env.GATSBY_EMULATOR_HOST ?? API_CONFIG.defaultEmulatorHost
    return `http://${emulatorHost}:${API_CONFIG.emulatorPort}/${API_CONFIG.projectId}/${API_CONFIG.region}/${API_CONFIG.functionName}`
  }

  // Production/staging URL from env
  return (
    process.env.GATSBY_EXPERIENCE_API_URL ??
    `https://${API_CONFIG.region}-${API_CONFIG.projectId}.cloudfunctions.net/${API_CONFIG.functionName}`
  )
}

interface UseExperienceAPI {
  entries: ExperienceEntry[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createEntry: (data: CreateExperienceData) => Promise<ExperienceEntry | null>
  updateEntry: (id: string, data: UpdateExperienceData) => Promise<ExperienceEntry | null>
  deleteEntry: (id: string) => Promise<boolean>
}

/**
 * Hook for managing experience entries via API
 * Handles fetching, creating, updating, and deleting entries
 */
export const useExperienceAPI = (): UseExperienceAPI => {
  const [entries, setEntries] = useState<ExperienceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${getApiUrl()}/experience/entries`)
      const data = (await response.json()) as ExperienceApiResponse

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Failed to fetch entries")
      }

      setEntries(data.entries ?? [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load experience entries"
      setError(errorMessage)
      console.error("Fetch entries error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    void fetchEntries()
  }, [fetchEntries])

  const createEntry = useCallback(async (data: CreateExperienceData): Promise<ExperienceEntry | null> => {
    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(`${getApiUrl()}/experience/entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const responseData = (await response.json()) as ExperienceApiResponse

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message ?? "Failed to create entry")
      }

      if (responseData.entry) {
        setEntries((prev) => [...prev, responseData.entry as ExperienceEntry])
        return responseData.entry
      }

      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create entry"
      setError(errorMessage)
      console.error("Create entry error:", err)
      return null
    }
  }, [])

  const updateEntry = useCallback(async (id: string, data: UpdateExperienceData): Promise<ExperienceEntry | null> => {
    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(`${getApiUrl()}/experience/entries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const responseData = (await response.json()) as ExperienceApiResponse

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message ?? "Failed to update entry")
      }

      if (responseData.entry) {
        setEntries((prev) => prev.map((entry) => (entry.id === id ? (responseData.entry as ExperienceEntry) : entry)))
        return responseData.entry
      }

      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update entry"
      setError(errorMessage)
      console.error("Update entry error:", err)
      return null
    }
  }, [])

  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(`${getApiUrl()}/experience/entries/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const responseData = (await response.json()) as ExperienceApiResponse

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message ?? "Failed to delete entry")
      }

      setEntries((prev) => prev.filter((entry) => entry.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete entry"
      setError(errorMessage)
      console.error("Delete entry error:", err)
      return false
    }
  }, [])

  return {
    entries,
    loading,
    error,
    refetch: fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry,
  }
}
