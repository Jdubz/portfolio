import { useState, useEffect, useCallback } from "react"
import type {
  ExperienceEntry,
  BlurbEntry,
  CreateExperienceData,
  UpdateExperienceData,
  CreateBlurbData,
  UpdateBlurbData,
} from "../types/experience"
import { experienceClient, blurbClient } from "../api"
import { logger } from "../utils/logger"

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

      // Fetch entries and blurbs in parallel
      const [entriesData, blurbsData] = await Promise.all([experienceClient.getEntries(), blurbClient.getBlurbs()])

      setEntries(entriesData)

      // Convert blurbs array to keyed object
      const blurbsMap: Record<string, BlurbEntry> = {}
      for (const blurb of blurbsData) {
        blurbsMap[blurb.name] = blurb
      }
      setBlurbs(blurbsMap)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load experience data"
      setError(errorMessage)
      logger.error("Failed to fetch experience data", err as Error, {
        hook: "useExperienceData",
        action: "fetchData",
      })
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
      const entry = await experienceClient.createEntry(data)
      setEntries((prev) => [...prev, entry])
      return entry
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create entry"
      setError(errorMessage)
      logger.error("Failed to create experience entry", err as Error, {
        hook: "useExperienceData",
        action: "createEntry",
      })
      return null
    }
  }, [])

  const updateEntry = useCallback(async (id: string, data: UpdateExperienceData): Promise<ExperienceEntry | null> => {
    try {
      const entry = await experienceClient.updateEntry(id, data)
      setEntries((prev) => prev.map((e) => (e.id === id ? entry : e)))
      return entry
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update entry"
      setError(errorMessage)
      logger.error("Failed to update experience entry", err as Error, {
        hook: "useExperienceData",
        action: "updateEntry",
        entryId: id,
      })
      return null
    }
  }, [])

  const deleteEntry = useCallback(async (id: string): Promise<boolean> => {
    try {
      await experienceClient.deleteEntry(id)
      setEntries((prev) => prev.filter((entry) => entry.id !== id))
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete entry"
      setError(errorMessage)
      logger.error("Failed to delete experience entry", err as Error, {
        hook: "useExperienceData",
        action: "deleteEntry",
        entryId: id,
      })
      return false
    }
  }, [])

  // Blurb operations
  const createBlurb = useCallback(async (data: CreateBlurbData): Promise<BlurbEntry | null> => {
    try {
      const blurb = await blurbClient.createBlurb(data)
      setBlurbs((prev) => ({
        ...prev,
        [blurb.name]: blurb,
      }))
      return blurb
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create blurb"
      setError(errorMessage)
      logger.error("Failed to create blurb", err as Error, {
        hook: "useExperienceData",
        action: "createBlurb",
        blurbName: data.name,
      })
      return null
    }
  }, [])

  const updateBlurb = useCallback(async (name: string, data: UpdateBlurbData): Promise<BlurbEntry | null> => {
    try {
      const blurb = await blurbClient.updateBlurb(name, data)
      setBlurbs((prev) => ({
        ...prev,
        [name]: blurb,
      }))
      return blurb
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update blurb"
      setError(errorMessage)
      logger.error("Failed to update blurb", err as Error, {
        hook: "useExperienceData",
        action: "updateBlurb",
        blurbName: name,
      })
      return null
    }
  }, [])

  const deleteBlurb = useCallback(async (name: string): Promise<boolean> => {
    try {
      await blurbClient.deleteBlurb(name)
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
        hook: "useExperienceData",
        action: "deleteBlurb",
        blurbName: name,
      })
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
