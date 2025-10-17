/**
 * Troubleshooting Tab
 *
 * Editor-only diagnostic tools and links to Google Cloud resources
 */

import React, { useState } from "react"
import { Box, Heading, Text, Button, Grid, Flex, Link as ThemeLink } from "theme-ui"
import { logger } from "../../utils/logger"

const PROJECT_ID = "static-sites-257923"
const REGION = "us-central1"

interface ServiceStatus {
  name: string
  status: "checking" | "healthy" | "unhealthy" | "unknown"
  message?: string
  responseTime?: number
}

interface ServiceConfig {
  name: string
  displayName: string
  healthEndpoint: string
  logsQuery: string
  description: string
}

const SERVICES: ServiceConfig[] = [
  {
    name: "handleContactForm",
    displayName: "Contact Form",
    healthEndpoint: "https://us-central1-static-sites-257923.cloudfunctions.net/handleContactForm/health",
    logsQuery: `resource.type="cloud_function" resource.labels.function_name="handleContactForm"`,
    description: "Contact form submission handler",
  },
  {
    name: "manageExperience",
    displayName: "Experience API",
    healthEndpoint: "https://us-central1-static-sites-257923.cloudfunctions.net/manageExperience/health",
    logsQuery: `resource.type="cloud_function" resource.labels.function_name="manageExperience"`,
    description: "Work experience and blurb management",
  },
  {
    name: "manageGenerator",
    displayName: "Resume Generator",
    healthEndpoint: "https://us-central1-static-sites-257923.cloudfunctions.net/manageGenerator/health",
    logsQuery: `resource.type="cloud_function" resource.labels.function_name="manageGenerator"`,
    description: "AI-powered resume generation",
  },
  {
    name: "manageJobQueue",
    displayName: "Job Queue",
    healthEndpoint: "https://us-central1-static-sites-257923.cloudfunctions.net/manageJobQueue/health",
    logsQuery: `resource.type="cloud_function" resource.labels.function_name="manageJobQueue"`,
    description: "Job finder queue management",
  },
  {
    name: "uploadResume",
    displayName: "Resume Upload",
    healthEndpoint: "https://us-central1-static-sites-257923.cloudfunctions.net/uploadResume/health",
    logsQuery: `resource.type="cloud_function" resource.labels.function_name="uploadResume"`,
    description: "Resume file upload handler",
  },
  {
    name: "manageContentItems",
    displayName: "Content Items",
    healthEndpoint: "https://us-central1-static-sites-257923.cloudfunctions.net/manageContentItems/health",
    logsQuery: `resource.type="cloud_function" resource.labels.function_name="manageContentItems"`,
    description: "Content management API",
  },
]

const QUICK_LINKS = [
  {
    title: "All Functions Logs",
    url: `https://console.cloud.google.com/logs/query;query=resource.type%3D%22cloud_function%22?project=${PROJECT_ID}`,
    description: "View logs for all Cloud Functions",
    icon: "📋",
  },
  {
    title: "Error Logs (Last 24h)",
    url: `https://console.cloud.google.com/logs/query;query=resource.type%3D%22cloud_function%22%0Aseverity%3E%3DERROR%0Atimestamp%3E%3D%22${new Date(
      Date.now() - 24 * 60 * 60 * 1000
    ).toISOString()}%22?project=${PROJECT_ID}`,
    description: "View all errors in the last 24 hours",
    icon: "🔴",
  },
  {
    title: "Firestore Database",
    url: `https://console.firebase.google.com/project/${PROJECT_ID}/firestore`,
    description: "View Firestore collections and documents",
    icon: "🗄️",
  },
  {
    title: "Cloud Functions Dashboard",
    url: `https://console.cloud.google.com/functions/list?project=${PROJECT_ID}`,
    description: "View all deployed functions",
    icon: "⚡",
  },
  {
    title: "Cloud Storage",
    url: `https://console.cloud.google.com/storage/browser?project=${PROJECT_ID}`,
    description: "View stored files (resumes, PDFs)",
    icon: "📦",
  },
  {
    title: "Secret Manager",
    url: `https://console.cloud.google.com/security/secret-manager?project=${PROJECT_ID}`,
    description: "View API keys and secrets",
    icon: "🔐",
  },
  {
    title: "Firebase Authentication",
    url: `https://console.firebase.google.com/project/${PROJECT_ID}/authentication/users`,
    description: "View authenticated users",
    icon: "👤",
  },
  {
    title: "Hosting Deployments",
    url: `https://console.firebase.google.com/project/${PROJECT_ID}/hosting`,
    description: "View hosting history and rollbacks",
    icon: "🌐",
  },
]

export const TroubleshootingTab: React.FC = () => {
  const [serviceStatuses, setServiceStatuses] = useState<Map<string, ServiceStatus>>(new Map())
  const [checkingAll, setCheckingAll] = useState(false)

  const checkServiceHealth = async (service: ServiceConfig): Promise<ServiceStatus> => {
    const startTime = Date.now()
    try {
      const response = await fetch(service.healthEndpoint, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const responseTime = Date.now() - startTime
      const data = await response.json()

      if (response.ok && data.status === "healthy") {
        return {
          name: service.name,
          status: "healthy",
          message: `Service is healthy (${responseTime}ms)`,
          responseTime,
        }
      }
      return {
        name: service.name,
        status: "unhealthy",
        message: data.message || "Service returned non-healthy status",
        responseTime,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        name: service.name,
        status: "unhealthy",
        message: error instanceof Error ? error.message : "Failed to reach service",
        responseTime,
      }
    }
  }

  const checkAllServices = async () => {
    setCheckingAll(true)
    logger.info("Checking health of all services")

    // Set all services to "checking" state
    const checkingMap = new Map<string, ServiceStatus>()
    SERVICES.forEach((service) => {
      checkingMap.set(service.name, {
        name: service.name,
        status: "checking",
      })
    })
    setServiceStatuses(new Map(checkingMap))

    // Check all services in parallel
    const results = await Promise.all(SERVICES.map((service) => checkServiceHealth(service)))

    // Update with results
    const resultMap = new Map<string, ServiceStatus>()
    results.forEach((result) => {
      resultMap.set(result.name, result)
    })
    setServiceStatuses(resultMap)
    setCheckingAll(false)

    logger.info("Service health check complete", {
      healthy: results.filter((r) => r.status === "healthy").length,
      unhealthy: results.filter((r) => r.status === "unhealthy").length,
    })
  }

  const getLogsUrl = (query: string): string => {
    const encodedQuery = encodeURIComponent(query)
    return `https://console.cloud.google.com/logs/query;query=${encodedQuery}?project=${PROJECT_ID}`
  }

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "healthy":
        return "success"
      case "unhealthy":
        return "danger"
      case "checking":
        return "textMuted"
      default:
        return "textMuted"
    }
  }

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "healthy":
        return "✅"
      case "unhealthy":
        return "❌"
      case "checking":
        return "⏳"
      default:
        return "❓"
    }
  }

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto" }}>
      <Heading as="h2" sx={{ mb: 2, fontSize: 4 }}>
        Troubleshooting & Diagnostics
      </Heading>
      <Text sx={{ color: "textMuted", mb: 4, fontSize: 2 }}>
        Editor-only tools for monitoring service health and accessing logs
      </Text>

      {/* Service Health Checks */}
      <Box sx={{ variant: "cards.primary", p: 4, mb: 4 }}>
        <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Heading as="h3" sx={{ fontSize: 3 }}>
            Service Health
          </Heading>
          <Button onClick={() => void checkAllServices()} disabled={checkingAll} variant="secondary">
            {checkingAll ? "Checking..." : "Check All Services"}
          </Button>
        </Flex>
        <Text sx={{ color: "textMuted", mb: 4, fontSize: 1 }}>Check the health status of all Cloud Functions</Text>

        <Grid columns={[1, 1, 2]} gap={3}>
          {SERVICES.map((service) => {
            const status = serviceStatuses.get(service.name)
            return (
              <Box
                key={service.name}
                sx={{
                  p: 3,
                  bg: "backgroundSecondary",
                  borderRadius: "md",
                  borderLeft: "4px solid",
                  borderColor: status ? getStatusColor(status.status) : "divider",
                }}
              >
                <Flex sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box>
                    <Text sx={{ fontWeight: "bold", fontSize: 2, mb: 1 }}>{service.displayName}</Text>
                    <Text sx={{ color: "textMuted", fontSize: 1 }}>{service.description}</Text>
                  </Box>
                  {status && <Text sx={{ fontSize: 3 }}>{getStatusIcon(status.status)}</Text>}
                </Flex>

                {status?.message && (
                  <Text sx={{ fontSize: 1, color: getStatusColor(status.status), mb: 2 }}>{status.message}</Text>
                )}

                <Flex sx={{ gap: 2, flexWrap: "wrap" }}>
                  <ThemeLink
                    href={getLogsUrl(service.logsQuery)}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontSize: 1,
                      color: "primary",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    📋 View Logs
                  </ThemeLink>
                  <ThemeLink
                    href={service.healthEndpoint}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      fontSize: 1,
                      color: "primary",
                      textDecoration: "none",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    🔗 Health Endpoint
                  </ThemeLink>
                </Flex>
              </Box>
            )
          })}
        </Grid>
      </Box>

      {/* Quick Links */}
      <Box sx={{ variant: "cards.primary", p: 4, mb: 4 }}>
        <Heading as="h3" sx={{ mb: 3, fontSize: 3 }}>
          Google Cloud Console
        </Heading>
        <Text sx={{ color: "textMuted", mb: 4, fontSize: 1 }}>Quick access to Google Cloud Platform resources</Text>

        <Grid columns={[1, 2, 3]} gap={3}>
          {QUICK_LINKS.map((link) => (
            <ThemeLink
              key={link.title}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "block",
                p: 3,
                bg: "backgroundSecondary",
                borderRadius: "md",
                textDecoration: "none",
                color: "text",
                transition: "all 0.2s ease",
                "&:hover": {
                  bg: "divider",
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                },
              }}
            >
              <Text sx={{ fontSize: 3, mb: 2 }}>{link.icon}</Text>
              <Text sx={{ fontWeight: "bold", fontSize: 2, mb: 1 }}>{link.title}</Text>
              <Text sx={{ color: "textMuted", fontSize: 1 }}>{link.description}</Text>
            </ThemeLink>
          ))}
        </Grid>
      </Box>

      {/* Project Information */}
      <Box sx={{ variant: "cards.primary", p: 4 }}>
        <Heading as="h3" sx={{ mb: 3, fontSize: 3 }}>
          Project Information
        </Heading>

        <Grid columns={[1, 2]} gap={3}>
          <Box>
            <Text sx={{ color: "textMuted", fontSize: 1, mb: 1 }}>Project ID</Text>
            <Text sx={{ fontFamily: "monospace", fontSize: 2, mb: 3 }}>{PROJECT_ID}</Text>

            <Text sx={{ color: "textMuted", fontSize: 1, mb: 1 }}>Region</Text>
            <Text sx={{ fontFamily: "monospace", fontSize: 2, mb: 3 }}>{REGION}</Text>
          </Box>

          <Box>
            <Text sx={{ color: "textMuted", fontSize: 1, mb: 1 }}>Production Domain</Text>
            <ThemeLink href="https://joshwentworth.com" target="_blank" sx={{ display: "block", fontSize: 2, mb: 3 }}>
              joshwentworth.com
            </ThemeLink>

            <Text sx={{ color: "textMuted", fontSize: 1, mb: 1 }}>Staging Domain</Text>
            <ThemeLink href="https://staging.joshwentworth.com" target="_blank" sx={{ display: "block", fontSize: 2 }}>
              staging.joshwentworth.com
            </ThemeLink>
          </Box>
        </Grid>
      </Box>
    </Box>
  )
}
