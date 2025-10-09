import { useState, useEffect, useCallback } from "react"
import type {
  ExperienceEntry,
  BlurbEntry,
  CreateExperienceData,
  UpdateExperienceData,
  CreateBlurbData,
  UpdateBlurbData,
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

interface CombinedApiResponse {
  success: boolean
  entries?: ExperienceEntry[]
  blurbs?: BlurbEntry[]
  entriesCount?: number
  blurbsCount?: number
  message?: string
  error?: string
  errorCode?: string
}

interface UseExperienceData {
  entries: ExperienceEntry[]
  blurbs: Record<string, BlurbEntry>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createEntry: (data: CreateExperienceData) => Promise<ExperienceEntry | null>
  updateEntry: (id: string, data: UpdateExperienceData) => Promise<ExperienceEntry | null>
  deleteEntry: (id: string) => Promise<boolean>
  createBlurb: (data: CreateBlurbData) => Promise<BlurbEntry | null>
  updateBlurb: (name: string, data: UpdateBlurbData) => Promise<BlurbEntry | null>
  deleteBlurb: (name: string) => Promise<boolean>
}

/**
 * Optimized hook for managing all experience page data
 * Fetches entries and blurbs in a single request for better performance
 */
export const useExperienceData = (): UseExperienceData => {
  const [entries, setEntries] = useState<ExperienceEntry[]>([])
  const [blurbs, setBlurbs] = useState<Record<string, BlurbEntry>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${getApiUrl()}/experience/all`)
      const data = (await response.json()) as CombinedApiResponse

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Failed to fetch experience data")
      }

      setEntries(data.entries ?? [])

      // Convert blurbs array to keyed object
      const blurbsMap: Record<string, BlurbEntry> = {}
      if (data.blurbs) {
        for (const blurb of data.blurbs) {
          blurbsMap[blurb.name] = blurb
        }
      }
      setBlurbs(blurbsMap)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load experience data"
      setError(errorMessage)
      console.error("Fetch experience data error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  // Experience Entry operations
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

      const responseData = (await response.json()) as { success: boolean; entry?: ExperienceEntry; message?: string }

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

      const responseData = (await response.json()) as { success: boolean; entry?: ExperienceEntry; message?: string }

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

      const responseData = (await response.json()) as { success: boolean; message?: string }

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

  // Blurb operations
  const createBlurb = useCallback(async (data: CreateBlurbData): Promise<BlurbEntry | null> => {
    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(`${getApiUrl()}/experience/blurbs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const responseData = (await response.json()) as { success: boolean; blurb?: BlurbEntry; message?: string }

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message ?? "Failed to create blurb")
      }

      if (responseData.blurb) {
        const blurb = responseData.blurb
        setBlurbs((prev) => ({
          ...prev,
          [blurb.name]: blurb,
        }))
        return blurb
      }

      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create blurb"
      setError(errorMessage)
      console.error("Create blurb error:", err)
      return null
    }
  }, [])

  const updateBlurb = useCallback(async (name: string, data: UpdateBlurbData): Promise<BlurbEntry | null> => {
    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(`${getApiUrl()}/experience/blurbs/${name}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const responseData = (await response.json()) as { success: boolean; blurb?: BlurbEntry; message?: string }

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message ?? "Failed to update blurb")
      }

      if (responseData.blurb) {
        const blurb = responseData.blurb
        setBlurbs((prev) => ({
          ...prev,
          [name]: blurb,
        }))
        return blurb
      }

      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update blurb"
      setError(errorMessage)
      console.error("Update blurb error:", err)
      return null
    }
  }, [])

  const deleteBlurb = useCallback(async (name: string): Promise<boolean> => {
    try {
      const token = await getIdToken()
      if (!token) {
        throw new Error("Authentication required")
      }

      const response = await fetch(`${getApiUrl()}/experience/blurbs/${name}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const responseData = (await response.json()) as { success: boolean; message?: string }

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message ?? "Failed to delete blurb")
      }

      setBlurbs((prev) => {
        const newBlurbs = { ...prev }
        delete newBlurbs[name]
        return newBlurbs
      })
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete blurb"
      setError(errorMessage)
      console.error("Delete blurb error:", err)
      return false
    }
  }, [])

  return {
    entries,
    blurbs,
    loading,
    error,
    refetch: fetchAll,
    createEntry,
    updateEntry,
    deleteEntry,
    createBlurb,
    updateBlurb,
    deleteBlurb,
  }
}
