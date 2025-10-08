import React, { useState } from "react"
import { Box, Heading, Text, Button, Flex, Spinner, Alert } from "theme-ui"
import { useAuth, signInWithGoogle, signOut } from "../hooks/useAuth"
import { useExperienceAPI } from "../hooks/useExperienceAPI"
import { ExperienceEntry } from "../components/ExperienceEntry"
import { CreateExperienceForm } from "../components/CreateExperienceForm"
import type { UpdateExperienceData, CreateExperienceData } from "../types/experience"

/**
 * Experience Portfolio Page
 *
 * Public: Displays all experience entries (read-only)
 * Editors: Can edit/delete entries inline when authenticated with role: 'editor'
 *
 * This is a hidden page shared via direct URL with recruiters/tools
 */
const ExperiencePage: React.FC = () => {
  const { user, isEditor, loading: authLoading } = useAuth()
  const {
    entries,
    loading: entriesLoading,
    error: entriesError,
    createEntry,
    updateEntry,
    deleteEntry,
  } = useExperienceAPI()
  const [signingIn, setSigningIn] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleSignIn = () => {
    setSigningIn(true)
    setAuthError(null)
    void signInWithGoogle()
      .then(() => {
        // Success handled by auth state listener
      })
      .catch((error) => {
        setAuthError(error instanceof Error ? error.message : "Sign-in failed")
      })
      .finally(() => {
        setSigningIn(false)
      })
  }

  const handleSignOut = () => {
    void signOut().catch((error) => {
      console.error("Sign out failed:", error)
    })
  }

  const handleUpdateEntry = async (id: string, data: UpdateExperienceData) => {
    const result = await updateEntry(id, data)
    if (!result) {
      throw new Error("Update failed")
    }
  }

  const handleDeleteEntry = async (id: string) => {
    const result = await deleteEntry(id)
    if (!result) {
      throw new Error("Delete failed")
    }
  }

  const handleCreateEntry = async (data: CreateExperienceData) => {
    const result = await createEntry(data)
    if (!result) {
      throw new Error("Create failed")
    }
    setShowCreateForm(false)
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bg: "background",
        px: [4, 5, 6],
        py: [5, 6, 7],
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
        }}
      >
        {/* Header */}
        <Flex
          sx={{
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 5,
            flexDirection: ["column", "row"],
            gap: [3, 0],
          }}
        >
          <Box>
            <Heading
              as="h1"
              sx={{
                fontSize: [5, 6, 7],
                mb: 2,
                color: "text",
              }}
            >
              Experience Portfolio
            </Heading>

            <Text
              sx={{
                fontSize: [2, 3],
                color: "textMuted",
              }}
            >
              Complete professional experience and work history
            </Text>
          </Box>

          {/* Auth Controls */}
          <Box>
            {authLoading ? (
              <Spinner size={24} />
            ) : user ? (
              <Flex
                sx={{
                  alignItems: "center",
                  gap: 3,
                  flexDirection: ["column", "row"],
                }}
              >
                <Text
                  sx={{
                    fontSize: 1,
                    color: "textMuted",
                  }}
                >
                  {user.email}
                </Text>
                <Button onClick={handleSignOut} variant="secondary.sm">
                  Sign Out
                </Button>
              </Flex>
            ) : (
              <Box>
                <Text
                  onClick={handleSignIn}
                  sx={{
                    fontSize: 1,
                    color: "textMuted",
                    cursor: signingIn ? "wait" : "pointer",
                    userSelect: "none",
                    "&:hover": {
                      opacity: 0.7,
                    },
                  }}
                >
                  {signingIn ? "..." : "Viewer"}
                </Text>
                {authError && (
                  <Text
                    sx={{
                      mt: 2,
                      fontSize: 1,
                      color: "red",
                    }}
                  >
                    {authError}
                  </Text>
                )}
              </Box>
            )}
          </Box>
        </Flex>

        {/* Experience Entries List */}
        <Box sx={{ mt: 5 }}>
          {entriesLoading ? (
            <Flex sx={{ justifyContent: "center", py: 6 }}>
              <Spinner size={48} />
            </Flex>
          ) : entriesError ? (
            <Alert variant="error" sx={{ mb: 4 }}>
              {entriesError}
            </Alert>
          ) : entries.length === 0 ? (
            <Text sx={{ textAlign: "center", py: 6, color: "textMuted", fontSize: 2 }}>
              No experience entries yet.
              {isEditor && " Click '+ New Section' below to create one."}
            </Text>
          ) : (
            <Box>
              {entries.map((entry) => (
                <ExperienceEntry
                  key={entry.id}
                  entry={entry}
                  isEditor={isEditor}
                  onUpdate={handleUpdateEntry}
                  onDelete={handleDeleteEntry}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Create New Entry Button (Editors Only) - Bottom of list */}
        {isEditor && !showCreateForm && (
          <Box sx={{ mt: 4 }}>
            <Button onClick={() => setShowCreateForm(true)} variant="primary.sm">
              + New Section
            </Button>
          </Box>
        )}

        {/* Create Form - Bottom of list */}
        {showCreateForm && (
          <Box sx={{ mt: 4 }}>
            <CreateExperienceForm onCreate={handleCreateEntry} onCancel={() => setShowCreateForm(false)} />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default ExperiencePage
