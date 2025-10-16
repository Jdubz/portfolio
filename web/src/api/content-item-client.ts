/**
 * Content Item API Client
 *
 * Handles all content-items CRUD operations for the unified content schema.
 */

import { ApiClient } from "./client"
import { getContentItemsApiUrl } from "../config/api"
import type {
  ContentItem,
  ContentItemWithChildren,
  CreateContentItemData,
  UpdateContentItemData,
  ContentItemType,
  ContentItemVisibility,
} from "../types/content-item"

export interface ListContentItemsOptions {
  type?: ContentItemType
  parentId?: string | null
  visibility?: ContentItemVisibility
  limit?: number
}

export interface ReorderItem {
  id: string
  order: number
}

export class ContentItemClient extends ApiClient {
  constructor() {
    super()
    // Override baseUrl to use content-items function
    this.baseUrl = getContentItemsApiUrl()
  }

  /**
   * Fetches all content items with optional filters
   */
  async listItems(options?: ListContentItemsOptions): Promise<ContentItem[]> {
    const params = new URLSearchParams()
    if (options?.type) params.append("type", options.type)
    if (options?.parentId !== undefined) params.append("parentId", options.parentId ?? "")
    if (options?.visibility) params.append("visibility", options.visibility)
    if (options?.limit) params.append("limit", String(options.limit))

    const queryString = params.toString()
    const endpoint = queryString ? `/content-items?${queryString}` : "/content-items"

    const response = await this.get<{ items: ContentItem[] }>(endpoint, false)
    return response.items
  }

  /**
   * Fetches content items organized in a hierarchical tree
   */
  async getHierarchy(): Promise<ContentItemWithChildren[]> {
    const response = await this.get<{ hierarchy: ContentItemWithChildren[] }>(
      "/content-items/hierarchy",
      false
    )
    return response.hierarchy
  }

  /**
   * Fetches a single content item by ID
   */
  async getItem(id: string): Promise<ContentItem> {
    const response = await this.get<{ item: ContentItem }>(`/content-items/${id}`, false)
    return response.item
  }

  /**
   * Fetches all children of a specific parent item
   */
  async getChildren(parentId: string): Promise<ContentItem[]> {
    return this.listItems({ parentId })
  }

  /**
   * Fetches all root items (items with no parent)
   */
  async getRootItems(): Promise<ContentItem[]> {
    return this.listItems({ parentId: null })
  }

  /**
   * Fetches all items of a specific type
   */
  async getItemsByType(type: ContentItemType): Promise<ContentItem[]> {
    return this.listItems({ type })
  }

  /**
   * Creates a new content item
   */
  async createItem(data: CreateContentItemData): Promise<ContentItem> {
    const response = await this.post<{ item: ContentItem }>("/content-items", data, true)
    return response.item
  }

  /**
   * Updates an existing content item
   */
  async updateItem(id: string, data: UpdateContentItemData): Promise<ContentItem> {
    const response = await this.put<{ item: ContentItem }>(`/content-items/${id}`, data, true)
    return response.item
  }

  /**
   * Deletes a single content item (fails if item has children)
   */
  async deleteItem(id: string): Promise<void> {
    await this.delete<void>(`/content-items/${id}`, true)
  }

  /**
   * Deletes a content item and all its children recursively
   */
  async deleteWithChildren(id: string): Promise<number> {
    const response = await this.delete<{ deletedCount: number }>(
      `/content-items/${id}/cascade`,
      true
    )
    return response.deletedCount
  }

  /**
   * Reorders multiple content items in one operation
   */
  async reorderItems(items: ReorderItem[]): Promise<void> {
    await this.post<void>("/content-items/reorder", { items }, true)
  }

  /**
   * Updates the visibility status of a content item
   */
  async setVisibility(id: string, visibility: ContentItemVisibility): Promise<ContentItem> {
    return this.updateItem(id, { visibility })
  }
}

// Export singleton instance
export const contentItemClient = new ContentItemClient()
