/**
 * Generation History Component
 *
 * Displays a table of past document generation requests with ability to view details.
 * Features:
 * - Pagination (10 items per page)
 * - Filters (status, type, AI provider)
 * - AI model column
 * - Bulk download (all records on current page as nested zip)
 */

import React, { useState, useEffect } from "react"
import { Box, Heading, Text, Button, Flex, Label, Select } from "theme-ui"
import JSZip from "jszip"
import type { GenerationRequest, FirestoreTimestamp } from "../types/generator"
import { generatorClient } from "../api/generator-client"
import { logger } from "../utils/logger"
import { useAuth } from "../hooks/useAuth"

interface GenerationHistoryProps {
  onViewDetails?: (request: GenerationRequest) => void
}

type StatusFilter = "all" | "pending" | "processing" | "completed" | "failed"
type TypeFilter = "all" | "resume" | "coverLetter" | "both"
type ProviderFilter = "all" | "openai" | "gemini"

const ITEMS_PER_PAGE = 10

/**
 * Strip query parameters from GCS URLs
 *
 * Historical note: Some old documents may have query parameters from when we used
 * time-limited signed URLs. Those have been replaced with permanent public URLs.
 *
 * This helper ensures we access files using clean public URLs:
 * https://storage.googleapis.com/bucket/path.pdf
 */
const stripUrlQueryParams = (url: string): string => {
  const questionMarkIndex = url.indexOf("?")
  return questionMarkIndex !== -1 ? url.substring(0, questionMarkIndex) : url
}

export const GenerationHistory: React.FC<GenerationHistoryProps> = ({ onViewDetails }) => {
  const [requests, setRequests] = useState<GenerationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingBulk, setDownloadingBulk] = useState(false)
  const { user, loading: authLoading } = useAuth()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  // Filter state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>("all")

  useEffect(() => {
    // Only load history if user is authenticated and auth is not loading
    if (!authLoading && user) {
      void loadHistory()
    }
  }, [authLoading, user])

  const loadHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const history = await generatorClient.listRequests(500) // Fetch more for filtering
      setRequests(history)
    } catch (err) {
      logger.error("Failed to load generation history", err as Error, { component: "GenerationHistory" })
      setError(err instanceof Error ? err.message : "Failed to load history")
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  const filteredRequests = requests.filter((request) => {
    // Status filter
    if (statusFilter !== "all" && request.status !== statusFilter) {
      return false
    }

    // Type filter
    if (typeFilter !== "all" && request.generateType !== typeFilter) {
      return false
    }

    // Provider filter
    if (providerFilter !== "all" && request.provider !== providerFilter) {
      return false
    }

    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, typeFilter, providerFilter])

  const formatDate = (timestamp: string | FirestoreTimestamp | undefined) => {
    let date: Date

    // Handle Firestore Timestamp object (from backend)
    if (timestamp && typeof timestamp === "object" && "_seconds" in timestamp) {
      date = new Date(timestamp._seconds * 1000)
    }
    // Handle ISO string
    else if (timestamp && typeof timestamp === "string") {
      date = new Date(timestamp)
    }
    // Invalid or missing timestamp
    else {
      return "Invalid Date"
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid Date"
    }

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981" // green
      case "processing":
        return "#f59e0b" // amber
      case "failed":
        return "#ef4444" // red
      default:
        return "#6b7280" // gray
    }
  }

  const getProviderDisplay = (provider?: string) => {
    if (!provider) {
      return "N/A"
    }
    return provider === "openai" ? "OpenAI" : "Gemini"
  }

  const getProviderColor = (provider?: string) => {
    if (!provider) {
      return "#6b7280" // gray
    }
    return provider === "openai" ? "#10a37f" : "#4285f4" // OpenAI green / Google blue
  }

  /**
   * Bulk download all records on current page as nested zip
   * Structure: master.zip containing folders like:
   *   - Company_Name_Role/
   *     - resume.pdf
   *     - cover_letter.pdf
   *     - generation.json
   */
  const handleBulkDownload = async () => {
    try {
      setDownloadingBulk(true)

      const masterZip = new JSZip()
      let totalPdfs = 0
      let successfulPdfs = 0
      let failedPdfs = 0

      // Process each request on current page
      for (const request of paginatedRequests) {
        // Create folder name: {company}_{role}
        const companySafe = request.job.company.replace(/[^a-z0-9]/gi, "_")
        const roleSafe = request.job.role.replace(/[^a-z0-9]/gi, "_")
        const folderName = `${companySafe}_${roleSafe}`

        // Create subfolder in master zip
        const folder = masterZip.folder(folderName)

        if (!folder) {
          logger.error("Failed to create folder in zip", undefined, { folderName })
          continue
        }

        // Add JSON data
        const jsonString = JSON.stringify(request, null, 2)
        folder.file("generation.json", jsonString)

        // Extract PDF URLs from steps and strip query parameters
        // (removes any legacy query params from historical documents)
        const rawResumeUrl = request.steps?.find((s) => s.result?.resumeUrl)?.result?.resumeUrl
        const rawCoverLetterUrl = request.steps?.find((s) => s.result?.coverLetterUrl)?.result?.coverLetterUrl

        const resumeUrl = rawResumeUrl ? stripUrlQueryParams(rawResumeUrl) : undefined
        const coverLetterUrl = rawCoverLetterUrl ? stripUrlQueryParams(rawCoverLetterUrl) : undefined

        logger.info(`Processing request ${request.id}`, {
          company: request.job.company,
          role: request.job.role,
          hasResumeUrl: !!resumeUrl,
          hasCoverLetterUrl: !!coverLetterUrl,
          status: request.status,
        })

        // Fetch and add resume PDF if available
        if (resumeUrl) {
          totalPdfs++
          try {
            logger.info(`Fetching resume PDF`, { url: resumeUrl.substring(0, 100) })
            const resumeResponse = await fetch(resumeUrl)
            if (resumeResponse.ok) {
              const resumeBlob = await resumeResponse.blob()
              folder.file("resume.pdf", resumeBlob)
              successfulPdfs++
              logger.info(`Resume fetched successfully`, { size: resumeBlob.size })
            } else {
              failedPdfs++
              logger.error(`Resume fetch failed`, undefined, {
                status: resumeResponse.status,
                statusText: resumeResponse.statusText,
                request: request.id,
              })
            }
          } catch (err) {
            failedPdfs++
            logger.error("Error fetching resume PDF", err as Error, { request: request.id })
          }
        } else {
          logger.warn(`No resume URL found`, { request: request.id })
        }

        // Fetch and add cover letter PDF if available
        if (coverLetterUrl) {
          totalPdfs++
          try {
            logger.info(`Fetching cover letter PDF`, { url: coverLetterUrl.substring(0, 100) })
            const coverLetterResponse = await fetch(coverLetterUrl)
            if (coverLetterResponse.ok) {
              const coverLetterBlob = await coverLetterResponse.blob()
              folder.file("cover_letter.pdf", coverLetterBlob)
              successfulPdfs++
              logger.info(`Cover letter fetched successfully`, { size: coverLetterBlob.size })
            } else {
              failedPdfs++
              logger.error(`Cover letter fetch failed`, undefined, {
                status: coverLetterResponse.status,
                statusText: coverLetterResponse.statusText,
                request: request.id,
              })
            }
          } catch (err) {
            failedPdfs++
            logger.error("Error fetching cover letter PDF", err as Error, { request: request.id })
          }
        } else {
          logger.warn(`No cover letter URL found`, { request: request.id })
        }
      }

      logger.info(`Bulk download summary`, {
        totalPdfs,
        successfulPdfs,
        failedPdfs,
        requests: paginatedRequests.length,
      })

      // Generate master zip file
      const zipBlob = await masterZip.generateAsync({ type: "blob" })
      logger.info(`Zip generated`, { size: zipBlob.size })

      // Create download link
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `generation_history_page_${currentPage}.zip`

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setDownloadingBulk(false)

      // Show alert if some PDFs failed
      if (failedPdfs > 0) {
        logger.warn(`Bulk download completed with ${failedPdfs} failed PDFs`, {
          successfulPdfs,
          totalPdfs,
          failedPdfs,
        })
        // Use window.alert to satisfy ESLint
        window.alert(
          `Downloaded ${successfulPdfs}/${totalPdfs} PDFs successfully.\n\n` +
            `${failedPdfs} PDF(s) failed to download (possibly expired URLs).\n\n` +
            `Check browser console for details.`
        )
      }
    } catch (error) {
      logger.error("Failed to bulk download", error as Error, { component: "GenerationHistory" })
      setDownloadingBulk(false)
      window.alert(`Download failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  if (authLoading || loading) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 4,
          color: "textMuted",
        }}
      >
        Loading history...
      </Box>
    )
  }

  if (!user) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 4,
          color: "textMuted",
        }}
      >
        Please sign in to view document history
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          bg: "muted",
          borderRadius: "8px",
          color: "red",
        }}
      >
        Error: {error}
      </Box>
    )
  }

  if (requests.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 4,
          color: "textMuted",
        }}
      >
        No generation history yet
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Heading as="h2" sx={{ fontSize: 3, fontWeight: "heading" }}>
          Generation History
        </Heading>
        <Button
          onClick={() => {
            void handleBulkDownload()
          }}
          disabled={downloadingBulk || paginatedRequests.length === 0}
          variant="primary"
          sx={{
            px: 3,
            py: 2,
            fontSize: 1,
            cursor: downloadingBulk ? "wait" : "pointer",
          }}
          title={`Download all ${paginatedRequests.length} records on this page as zip`}
        >
          {downloadingBulk ? "Downloading..." : `Download Page (${paginatedRequests.length})`}
        </Button>
      </Flex>

      {/* Filters */}
      <Flex sx={{ gap: 3, mb: 3, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 200px" }}>
          <Label htmlFor="status-filter" sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>
            Status
          </Label>
          <Select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            sx={{
              px: 3,
              py: 2,
              fontSize: 1,
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "muted",
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </Select>
        </Box>

        <Box sx={{ flex: "1 1 200px" }}>
          <Label htmlFor="type-filter" sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>
            Type
          </Label>
          <Select
            id="type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            sx={{
              px: 3,
              py: 2,
              fontSize: 1,
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "muted",
            }}
          >
            <option value="all">All Types</option>
            <option value="resume">Resume</option>
            <option value="coverLetter">Cover Letter</option>
            <option value="both">Both</option>
          </Select>
        </Box>

        <Box sx={{ flex: "1 1 200px" }}>
          <Label htmlFor="provider-filter" sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>
            AI Model
          </Label>
          <Select
            id="provider-filter"
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value as ProviderFilter)}
            sx={{
              px: 3,
              py: 2,
              fontSize: 1,
              borderRadius: "8px",
              border: "1px solid",
              borderColor: "muted",
            }}
          >
            <option value="all">All Models</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
          </Select>
        </Box>
      </Flex>

      {/* Results info */}
      <Text sx={{ fontSize: 1, color: "textMuted", mb: 3 }}>
        Showing {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} results
      </Text>

      {filteredRequests.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            color: "textMuted",
          }}
        >
          No results match your filters
        </Box>
      ) : (
        <>
          {/* Table */}
          <Box sx={{ overflowX: "auto" }}>
            <Box
              as="table"
              sx={{
                width: "100%",
                borderCollapse: "collapse",
                "& th": {
                  textAlign: "left",
                  py: 2,
                  px: 3,
                  borderBottom: "2px solid",
                  borderColor: "muted",
                  fontWeight: "heading",
                  fontSize: 1,
                  color: "textMuted",
                },
                "& td": {
                  py: 2,
                  px: 3,
                  borderBottom: "1px solid",
                  borderColor: "muted",
                },
                "& tbody tr": {
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bg: "highlight",
                  },
                },
              }}
            >
              <Box as="thead">
                <Box as="tr">
                  <Box as="th">Date</Box>
                  <Box as="th">Position</Box>
                  <Box as="th">Company</Box>
                  <Box as="th">Type</Box>
                  <Box as="th">AI Model</Box>
                  <Box as="th">Status</Box>
                </Box>
              </Box>
              <Box as="tbody">
                {paginatedRequests.map((request) => (
                  <Box as="tr" key={request.id} onClick={() => onViewDetails?.(request)}>
                    <Box as="td">
                      <Text sx={{ fontSize: 1 }}>{formatDate(request.createdAt)}</Text>
                    </Box>
                    <Box as="td">
                      <Text sx={{ fontSize: 1, fontWeight: "medium" }}>{request.job.role}</Text>
                    </Box>
                    <Box as="td">
                      <Text sx={{ fontSize: 1 }}>{request.job.company}</Text>
                    </Box>
                    <Box as="td">
                      <Text sx={{ fontSize: 1, textTransform: "capitalize" }}>{request.generateType}</Text>
                    </Box>
                    <Box as="td">
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 2,
                          py: 1,
                          borderRadius: "99px",
                          fontSize: 0,
                          fontWeight: "medium",
                          color: "white",
                          bg: getProviderColor(request.provider),
                        }}
                      >
                        {getProviderDisplay(request.provider)}
                      </Box>
                    </Box>
                    <Box as="td">
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 2,
                          py: 1,
                          borderRadius: "99px",
                          fontSize: 0,
                          fontWeight: "medium",
                          color: "white",
                          bg: getStatusColor(request.status),
                        }}
                      >
                        {request.status}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Flex sx={{ justifyContent: "center", alignItems: "center", gap: 2, mt: 4 }}>
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="secondary"
                sx={{
                  px: 3,
                  py: 2,
                  fontSize: 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                Previous
              </Button>

              <Text sx={{ fontSize: 1, color: "textMuted" }}>
                Page {currentPage} of {totalPages}
              </Text>

              <Button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="secondary"
                sx={{
                  px: 3,
                  py: 2,
                  fontSize: 1,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                Next
              </Button>
            </Flex>
          )}
        </>
      )}
    </Box>
  )
}
