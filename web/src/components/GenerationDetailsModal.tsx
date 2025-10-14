/**
 * Generation Details Modal
 *
 * Displays detailed information about a generation request including:
 * - JSON view of all data
 * - Embedded PDF preview with toggle between resume/cover letter
 */

import React, { useState } from "react"
import { Box, Heading, Text, Button } from "theme-ui"
import ReactJson from "react-json-view"
import type { GenerationRequest } from "../types/generator"

interface GenerationDetailsModalProps {
  request: GenerationRequest | null
  onClose: () => void
}

type ViewMode = "json" | "pdf"
type DocumentType = "resume" | "coverLetter"

export const GenerationDetailsModal: React.FC<GenerationDetailsModalProps> = ({ request, onClose }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("pdf")
  const [documentType, setDocumentType] = useState<DocumentType>("resume")

  if (!request) {
    return null
  }

  // Extract PDF URLs from steps
  const resumeUrl = request.steps?.find((s) => s.result?.resumeUrl)?.result?.resumeUrl
  const coverLetterUrl = request.steps?.find((s) => s.result?.coverLetterUrl)?.result?.coverLetterUrl

  const hasBothDocuments = resumeUrl && coverLetterUrl

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        p: 3,
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          bg: "background",
          borderRadius: "8px",
          maxWidth: "1200px",
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box
          sx={{
            p: 4,
            borderBottom: "1px solid",
            borderColor: "muted",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Heading as="h2" sx={{ fontSize: 3, fontWeight: "heading", mb: 1 }}>
              {request.job.role} @ {request.job.company}
            </Heading>
            <Text sx={{ fontSize: 1, color: "textMuted" }}>
              Generated on{" "}
              {new Date(request.createdAt).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </Box>
          <Button
            onClick={onClose}
            variant="close"
            sx={{
              border: "none",
              bg: "transparent",
              fontSize: 4,
              cursor: "pointer",
              color: "textMuted",
              "&:hover": {
                color: "text",
              },
            }}
          >
            ×
          </Button>
        </Box>

        {/* View mode toggle */}
        <Box
          sx={{
            px: 4,
            pt: 3,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "muted",
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            onClick={() => setViewMode("pdf")}
            variant={viewMode === "pdf" ? "primary" : "secondary"}
            sx={{
              px: 3,
              py: 2,
            }}
          >
            PDF Preview
          </Button>
          <Button
            onClick={() => setViewMode("json")}
            variant={viewMode === "json" ? "primary" : "secondary"}
            sx={{
              px: 3,
              py: 2,
            }}
          >
            JSON Data
          </Button>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 4 }}>
          {viewMode === "pdf" ? (
            <Box>
              {/* Document type toggle (only show if both documents exist) */}
              {hasBothDocuments && (
                <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
                  <Button
                    onClick={() => setDocumentType("resume")}
                    variant={documentType === "resume" ? "primary" : "outline"}
                    sx={{
                      px: 3,
                      py: 2,
                    }}
                  >
                    Resume
                  </Button>
                  <Button
                    onClick={() => setDocumentType("coverLetter")}
                    variant={documentType === "coverLetter" ? "primary" : "outline"}
                    sx={{
                      px: 3,
                      py: 2,
                    }}
                  >
                    Cover Letter
                  </Button>
                </Box>
              )}

              {/* PDF embed */}
              {documentType === "resume" && resumeUrl ? (
                <Box>
                  <iframe
                    src={resumeUrl}
                    title="Resume PDF"
                    style={{
                      width: "100%",
                      height: "600px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              ) : documentType === "coverLetter" && coverLetterUrl ? (
                <Box>
                  <iframe
                    src={coverLetterUrl}
                    title="Cover Letter PDF"
                    style={{
                      width: "100%",
                      height: "600px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 5,
                    color: "textMuted",
                  }}
                >
                  {documentType === "resume" ? "Resume" : "Cover Letter"} PDF not available
                </Box>
              )}
            </Box>
          ) : (
            // JSON view with collapsible nodes
            <Box
              sx={{
                bg: "muted",
                p: 3,
                borderRadius: "8px",
                overflowX: "auto",
              }}
            >
              <ReactJson
                src={request}
                theme="monokai"
                collapsed={1}
                displayDataTypes={false}
                displayObjectSize={true}
                enableClipboard={true}
                name="generation-request"
                indentWidth={2}
                style={{
                  backgroundColor: "transparent",
                  fontSize: "13px",
                }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}
