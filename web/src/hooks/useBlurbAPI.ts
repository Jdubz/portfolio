import { useState, useEffect, useCallback } from "react"
import type { BlurbEntry, CreateBlurbData, UpdateBlurbData, BlurbApiResponse } from "../types/experience"
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

interface UseBlurbAPI {
  blurbs: Record<string, BlurbEntry>
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createBlurb: (data: CreateBlurbData) => Promise<BlurbEntry | null>
  updateBlurb: (name: string, data: UpdateBlurbData) => Promise<BlurbEntry | null>
  deleteBlurb: (name: string) => Promise<boolean>
}

/**
 * Hook for managing blurbs via API
 * Handles fetching, creating, updating, and deleting blurbs
 */
export const useBlurbAPI = (): UseBlurbAPI => {
  const [blurbs, setBlurbs] = useState<Record<string, BlurbEntry>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBlurbs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${getApiUrl()}/experience/blurbs`)
      const data = (await response.json()) as BlurbApiResponse

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Failed to fetch blurbs")
      }

      // Convert array to keyed object for easy lookup
      const blurbsMap: Record<string, BlurbEntry> = {}
      if (data.blurbs) {
        for (const blurb of data.blurbs) {
          blurbsMap[blurb.name] = blurb
        }
      }

      setBlurbs(blurbsMap)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load blurbs"
      setError(errorMessage)
      console.error("Fetch blurbs error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    void fetchBlurbs()
  }, [fetchBlurbs])

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

      const responseData = (await response.json()) as BlurbApiResponse

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

      const responseData = (await response.json()) as BlurbApiResponse

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

      const responseData = (await response.json()) as BlurbApiResponse

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
    blurbs,
    loading,
    error,
    refetch: fetchBlurbs,
    createBlurb,
    updateBlurb,
    deleteBlurb,
  }
}
