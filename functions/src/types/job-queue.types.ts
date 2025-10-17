/**
 * Job Queue Domain Types
 *
 * Re-exports from @jdubz/shared-types for backward compatibility
 * and additional portfolio-specific extensions
 */

export type {
  QueueStatus,
  QueueItemType,
  QueueSource,
  QueueItem,
  StopList,
  QueueSettings,
  AISettings,
  AIProvider,
  JobMatch,
  StopListCheckResult,
  QueueStats,
  SubmitJobRequest,
  SubmitJobResponse,
} from "@jdubz/shared-types"

export { isQueueStatus, isQueueItemType } from "@jdubz/shared-types"
