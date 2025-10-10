import { useState, useEffect, useCallback } from "react"
import type { BlurbEntry, CreateBlurbData, UpdateBlurbData, BlurbApiResponse } from "../types/experience"
import { getIdToken } from "./useAuth"
import { getApiUrl } from "../config/api"
import { logger } from "../utils/logger"

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
      logger.error("Failed to fetch blurbs", err as Error, {
        hook: "useBlurbAPI",
        action: "fetchBlurbs",
      })
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
      logger.error("Failed to create blurb", err as Error, {
        hook: "useBlurbAPI",
        action: "createBlurb",
        blurbName: data.name,
      })
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
      logger.error("Failed to update blurb", err as Error, {
        hook: "useBlurbAPI",
        action: "updateBlurb",
        blurbName: name,
      })
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
      logger.error("Failed to delete blurb", err as Error, {
        hook: "useBlurbAPI",
        action: "deleteBlurb",
        blurbName: name,
      })
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
