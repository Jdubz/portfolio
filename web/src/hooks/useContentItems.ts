import { useState, useEffect, useCallback } from "react"
import type {
  ContentItem,
  ContentItemWithChildren,
  CreateContentItemData,
  UpdateContentItemData,
  ContentItemType,
} from "../types/content-item"
import { contentItemClient } from "../api"
import { logger } from "../utils/logger"

interface UseContentItems {
  items: ContentItem[]
  hierarchy: ContentItemWithChildren[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createItem: (data: CreateContentItemData) => Promise<ContentItem | null>
  updateItem: (id: string, data: UpdateContentItemData) => Promise<ContentItem | null>
  deleteItem: (id: string) => Promise<boolean>
  deleteItemWithChildren: (id: string) => Promise<number>
  reorderItems: (items: Array<{ id: string; order: number }>) => Promise<boolean>
  getItemsByType: (type: ContentItemType) => ContentItem[]
  getRootItems: () => ContentItem[]
  getChildItems: (parentId: string) => ContentItem[]
}

/**
 * Hook for managing content items (unified experiences + blurbs)
 * Provides both flat list and hierarchical tree structure
 */
export const useContentItems = (): UseContentItems => {
  const [items, setItems] = useState<ContentItem[]>([])
  const [hierarchy, setHierarchy] = useState<ContentItemWithChildren[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch both flat list and hierarchy in parallel
      const [itemsData, hierarchyData] = await Promise.all([
        contentItemClient.listItems(),
        contentItemClient.getHierarchy(),
      ])

      setItems(itemsData)
      setHierarchy(hierarchyData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load content items"
      setError(errorMessage)
      logger.error("Failed to fetch content items", err as Error, {
        hook: "useContentItems",
        action: "fetchAll",
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  // Create item
  const createItem = useCallback(async (data: CreateContentItemData): Promise<ContentItem | null> => {
    try {
      const item = await contentItemClient.createItem(data)

      // Optimistically update local state
      setItems((prev) => [...prev, item])

      // Refetch hierarchy to update tree structure
      const hierarchyData = await contentItemClient.getHierarchy()
      setHierarchy(hierarchyData)

      return item
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create item"
      setError(errorMessage)
      logger.error("Failed to create content item", err as Error, {
        hook: "useContentItems",
        action: "createItem",
      })
      return null
    }
  }, [])

  // Update item
  const updateItem = useCallback(async (id: string, data: UpdateContentItemData): Promise<ContentItem | null> => {
    try {
      const item = await contentItemClient.updateItem(id, data)

      // Update in flat list
      setItems((prev) => prev.map((i) => (i.id === id ? item : i)))

      // Refetch hierarchy if parent changed or order changed
      if (data.parentId !== undefined || data.order !== undefined) {
        const hierarchyData = await contentItemClient.getHierarchy()
        setHierarchy(hierarchyData)
      }

      return item
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update item"
      setError(errorMessage)
      logger.error("Failed to update content item", err as Error, {
        hook: "useContentItems",
        action: "updateItem",
        itemId: id,
      })
      return null
    }
  }, [])

  // Delete item (single)
  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      await contentItemClient.deleteItem(id)

      // Remove from flat list
      setItems((prev) => prev.filter((item) => item.id !== id))

      // Refetch hierarchy
      const hierarchyData = await contentItemClient.getHierarchy()
      setHierarchy(hierarchyData)

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete item"
      setError(errorMessage)
      logger.error("Failed to delete content item", err as Error, {
        hook: "useContentItems",
        action: "deleteItem",
        itemId: id,
      })
      return false
    }
  }, [])

  // Delete item with all children (cascade)
  const deleteItemWithChildren = useCallback(
    async (id: string): Promise<number> => {
      try {
        const deletedCount = await contentItemClient.deleteWithChildren(id)

        // Refetch all data after cascade delete
        await fetchAll()

        return deletedCount
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to delete item with children"
        setError(errorMessage)
        logger.error("Failed to delete content item with children", err as Error, {
          hook: "useContentItems",
          action: "deleteItemWithChildren",
          itemId: id,
        })
        return 0
      }
    },
    [fetchAll]
  )

  // Reorder items
  const reorderItems = useCallback(async (itemsToReorder: Array<{ id: string; order: number }>): Promise<boolean> => {
    try {
      await contentItemClient.reorderItems(itemsToReorder)

      // Update local state
      setItems((prev) =>
        prev.map((item) => {
          const reorderData = itemsToReorder.find((r) => r.id === item.id)
          return reorderData ? { ...item, order: reorderData.order } : item
        })
      )

      // Refetch hierarchy
      const hierarchyData = await contentItemClient.getHierarchy()
      setHierarchy(hierarchyData)

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reorder items"
      setError(errorMessage)
      logger.error("Failed to reorder content items", err as Error, {
        hook: "useContentItems",
        action: "reorderItems",
      })
      return false
    }
  }, [])

  // Helper: Get items by type
  const getItemsByType = useCallback(
    (type: ContentItemType): ContentItem[] => {
      return items.filter((item) => item.type === type)
    },
    [items]
  )

  // Helper: Get root items (no parent)
  const getRootItems = useCallback((): ContentItem[] => {
    return items.filter((item) => item.parentId === null)
  }, [items])

  // Helper: Get child items of a parent
  const getChildItems = useCallback(
    (parentId: string): ContentItem[] => {
      return items.filter((item) => item.parentId === parentId)
    },
    [items]
  )

  return {
    items,
    hierarchy,
    loading,
    error,
    refetch: fetchAll,
    createItem,
    updateItem,
    deleteItem,
    deleteItemWithChildren,
    reorderItems,
    getItemsByType,
    getRootItems,
    getChildItems,
  }
}
