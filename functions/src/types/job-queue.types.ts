/**
 * Job Queue Domain Types
 *
 * Re-exports from @jsdubzw/job-finder-shared-types for backward compatibility
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
} from "@jsdubzw/job-finder-shared-types"

export { isQueueStatus, isQueueItemType } from "@jsdubzw/job-finder-shared-types"
