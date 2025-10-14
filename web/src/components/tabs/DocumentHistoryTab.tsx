import React, { useState } from "react"
import { Box, Text } from "theme-ui"
import type { GenerationRequest } from "../../types/generator"
import { GenerationHistory } from "../GenerationHistory"
import { GenerationDetailsModal } from "../GenerationDetailsModal"

interface DocumentHistoryTabProps {
  isEditor: boolean
}

export const DocumentHistoryTab: React.FC<DocumentHistoryTabProps> = () => {
  const [selectedRequest, setSelectedRequest] = useState<GenerationRequest | null>(null)

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Text sx={{ color: "text", opacity: 0.8 }}>
          View your document generation history. Click on any row to see details and preview PDFs.
        </Text>
      </Box>

      {/* History Table */}
      <GenerationHistory onViewDetails={setSelectedRequest} />

      {/* Details Modal */}
      <GenerationDetailsModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </Box>
  )
}
