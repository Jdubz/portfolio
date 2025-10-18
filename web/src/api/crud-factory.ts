/**
 * Generic CRUD Client Factory
 *
 * Eliminates code duplication by providing a factory function
 * that creates fully-typed CRUD clients for different resources.
 *
 * Usage:
 * ```typescript
 * const client = createCrudClient<Experience, CreateData, UpdateData>({
 *   baseUrl: getApiUrl(),
 *   resourcePath: '/experience/entries',
 *   resourceName: 'entry',
 *   resourceNamePlural: 'entries'
 * })
 * ```
 */

import { EnhancedApiClient, type RequestOptions } from "./enhanced-client"

export interface CrudClientConfig {
  baseUrl: string
  resourcePath: string
  resourceName: string
  resourceNamePlural: string
  requiresAuth?: boolean
}

export interface CrudClient<TResource, TCreate, TUpdate> {
  getAll(): Promise<TResource[]>
  getById(id: string): Promise<TResource>
  create(data: TCreate): Promise<TResource>
  update(id: string, data: TUpdate): Promise<TResource>
  delete(id: string): Promise<void>
}

/**
 * Create a typed CRUD client for a specific resource
 *
 * @example
 * ```typescript
 * interface Experience {
 *   id: string
 *   company: string
 *   title: string
 * }
 *
 * interface CreateExperience {
 *   company: string
 *   title: string
 * }
 *
 * const experienceClient = createCrudClient<Experience, CreateExperience, CreateExperience>({
 *   baseUrl: getApiUrl(),
 *   resourcePath: '/experience/entries',
 *   resourceName: 'entry',
 *   resourceNamePlural: 'entries'
 * })
 *
 * // Usage:
 * const experiences = await experienceClient.getAll()
 * const newExp = await experienceClient.create({ company: 'Acme', title: 'Engineer' })
 * ```
 */
export function createCrudClient<TResource, TCreate = Partial<TResource>, TUpdate = Partial<TResource>>(
  config: CrudClientConfig
): CrudClient<TResource, TCreate, TUpdate> {
  const { baseUrl, resourcePath, resourceName, resourceNamePlural, requiresAuth = true } = config

  const client = new EnhancedApiClient(baseUrl)

  return {
    /**
     * Fetch all resources
     */
    async getAll(): Promise<TResource[]> {
      const response = await client["get"]<{ [key: string]: TResource[] }>(
        resourcePath,
        false // Public endpoint by default
      )
      return response[resourceNamePlural] || []
    },

    /**
     * Fetch a single resource by ID
     */
    async getById(id: string): Promise<TResource> {
      const response = await client["get"]<{ [key: string]: TResource }>(
        `${resourcePath}/${id}`,
        false // Public endpoint by default
      )
      return response[resourceName]
    },

    /**
     * Create a new resource
     */
    async create(data: TCreate): Promise<TResource> {
      const response = await client["post"]<{ [key: string]: TResource }>(resourcePath, data, requiresAuth)
      return response[resourceName]
    },

    /**
     * Update an existing resource
     */
    async update(id: string, data: TUpdate): Promise<TResource> {
      const response = await client["put"]<{ [key: string]: TResource }>(`${resourcePath}/${id}`, data, requiresAuth)
      return response[resourceName]
    },

    /**
     * Delete a resource
     */
    async delete(id: string): Promise<void> {
      await client["delete"]<void>(`${resourcePath}/${id}`, requiresAuth)
    },
  }
}

/**
 * Extended CRUD client interface with custom methods
 *
 * Use this when your resource needs additional methods beyond standard CRUD
 */
export class ExtendedCrudClient<TResource, TCreate = Partial<TResource>, TUpdate = Partial<TResource>> {
  protected client: EnhancedApiClient
  protected resourcePath: string
  protected resourceName: string
  protected resourceNamePlural: string
  protected requiresAuth: boolean

  constructor(config: CrudClientConfig) {
    this.client = new EnhancedApiClient(config.baseUrl)
    this.resourcePath = config.resourcePath
    this.resourceName = config.resourceName
    this.resourceNamePlural = config.resourceNamePlural
    this.requiresAuth = config.requiresAuth ?? true
  }

  /**
   * Fetch all resources
   */
  async getAll(): Promise<TResource[]> {
    const response = await this.client["get"]<{ [key: string]: TResource[] }>(this.resourcePath, false)
    return response[this.resourceNamePlural] || []
  }

  /**
   * Fetch a single resource by ID
   */
  async getById(id: string): Promise<TResource> {
    const response = await this.client["get"]<{ [key: string]: TResource }>(`${this.resourcePath}/${id}`, false)
    return response[this.resourceName]
  }

  /**
   * Create a new resource
   */
  async create(data: TCreate): Promise<TResource> {
    const response = await this.client["post"]<{ [key: string]: TResource }>(this.resourcePath, data, this.requiresAuth)
    return response[this.resourceName]
  }

  /**
   * Update an existing resource
   */
  async update(id: string, data: TUpdate): Promise<TResource> {
    const response = await this.client["put"]<{ [key: string]: TResource }>(
      `${this.resourcePath}/${id}`,
      data,
      this.requiresAuth
    )
    return response[this.resourceName]
  }

  /**
   * Delete a resource
   */
  async delete(id: string): Promise<void> {
    await this.client["delete"]<void>(`${this.resourcePath}/${id}`, this.requiresAuth)
  }

  /**
   * Make a custom GET request
   */
  protected async customGet<T>(endpoint: string, requiresAuth?: boolean): Promise<T> {
    return this.client["get"]<T>(endpoint, requiresAuth ?? this.requiresAuth)
  }

  /**
   * Make a custom POST request
   */
  protected async customPost<T>(endpoint: string, body: unknown, requiresAuth?: boolean): Promise<T> {
    return this.client["post"]<T>(endpoint, body, requiresAuth ?? this.requiresAuth)
  }

  /**
   * Make a custom PUT request
   */
  protected async customPut<T>(endpoint: string, body: unknown, requiresAuth?: boolean): Promise<T> {
    return this.client["put"]<T>(endpoint, body, requiresAuth ?? this.requiresAuth)
  }

  /**
   * Make a custom DELETE request
   */
  protected async customDelete<T>(endpoint: string, requiresAuth?: boolean): Promise<T> {
    return this.client["delete"]<T>(endpoint, requiresAuth ?? this.requiresAuth)
  }
}
