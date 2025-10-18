import React from "react"
import { Box, Heading, Text, Flex, Link } from "theme-ui"

export const HowItWorksTab: React.FC = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ mb: 5 }}>
        <Heading
          as="h2"
          sx={{
            fontSize: [4, 5],
            mb: 3,
            color: "primary",
          }}
        >
          An End-to-End Job Application System
        </Heading>
        <Text sx={{ fontSize: [2, 3], color: "text", lineHeight: 1.6, mb: 3 }}>
          This is a fully integrated platform that automates the entire job search workflow—from discovering
          opportunities to generating tailored applications. It combines automated job scraping, AI-powered matching,
          hyper-personalized document generation, and comprehensive application tracking in a single cohesive system.
        </Text>
        <Text sx={{ fontSize: [1, 2], color: "textMuted", lineHeight: 1.6, fontStyle: "italic" }}>
          Built to solve my own job search challenges, this system processes hundreds of opportunities, identifies the
          best matches, and creates professional applications—all while serving as a live demonstration of technical
          capabilities.
        </Text>
      </Box>

      {/* System Architecture */}
      <Box sx={{ mb: 5 }}>
        <Heading as="h3" sx={{ fontSize: [3, 4], mb: 3, color: "primary" }}>
          Complete System Flow
        </Heading>

        <Flex
          sx={{
            flexDirection: "column",
            gap: 3,
            p: 4,
            bg: "muted",
            borderRadius: "md",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Step 1: Job Discovery */}
          <Flex sx={{ alignItems: "flex-start", gap: 3 }}>
            <Box
              sx={{
                minWidth: "40px",
                height: "40px",
                borderRadius: "50%",
                bg: "primary",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 2,
              }}
            >
              1
            </Box>
            <Box sx={{ flex: 1 }}>
              <Heading as="h4" sx={{ fontSize: 2, mb: 2 }}>
                🔍 Automated Job Discovery
              </Heading>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
                The{" "}
                <Link href="https://github.com/Jdubz/job-finder" target="_blank" sx={{ color: "primary" }}>
                  job-finder
                </Link>{" "}
                Python service continuously monitors company career pages and job boards. It scrapes new postings in
                real-time, extracts structured data (title, description, requirements, location, salary), and
                automatically adds them to the processing queue.
              </Text>
              <Box as="ul" sx={{ pl: 4, mb: 2, fontSize: 1 }}>
                <Box as="li" sx={{ mb: 1 }}>
                  Configurable job sources tracked in the <strong>Sources</strong> tab
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  Company blocklist to filter unwanted employers
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  Automated scraping schedules with retry logic
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  Manual job submission via the <strong>Job Applications</strong> tab
                </Box>
              </Box>
              <Text
                sx={{
                  fontSize: 0,
                  fontFamily: "monospace",
                  color: "textMuted",
                  bg: "background",
                  p: 2,
                  borderRadius: "sm",
                }}
              >
                Tech: Python, BeautifulSoup, Selenium, Playwright, Firestore queue
              </Text>
            </Box>
          </Flex>

          <Box sx={{ textAlign: "center", fontSize: 3, color: "primary" }}>↓</Box>

          {/* Step 2: Queue Processing */}
          <Flex sx={{ alignItems: "flex-start", gap: 3 }}>
            <Box
              sx={{
                minWidth: "40px",
                height: "40px",
                borderRadius: "50%",
                bg: "primary",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 2,
              }}
            >
              2
            </Box>
            <Box sx={{ flex: 1 }}>
              <Heading as="h4" sx={{ fontSize: 2, mb: 2 }}>
                ⚙️ Queue Management & Processing
              </Heading>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
                Jobs enter a Firestore-based queue with configurable retry logic, timeout handling, and status tracking.
                The queue processor validates URLs, extracts job data, and prepares them for AI analysis. Real-time
                status updates are visible in the <strong>Queue Management</strong> tab.
              </Text>
              <Box as="ul" sx={{ pl: 4, mb: 2, fontSize: 1 }}>
                <Box as="li" sx={{ mb: 1 }}>
                  Status tracking: pending → processing → success/failed
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  Automatic retry with exponential backoff (configurable)
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  Error logging with detailed failure reasons
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  Priority queue support for urgent applications
                </Box>
              </Box>
              <Text
                sx={{
                  fontSize: 0,
                  fontFamily: "monospace",
                  color: "textMuted",
                  bg: "background",
                  p: 2,
                  borderRadius: "sm",
                }}
              >
                Tech: Firestore transactions, async queue processing, state management
              </Text>
            </Box>
          </Flex>

          <Box sx={{ textAlign: "center", fontSize: 3, color: "primary" }}>↓</Box>

          {/* Step 3: AI Analysis */}
          <Flex sx={{ alignItems: "flex-start", gap: 3 }}>
            <Box
              sx={{
                minWidth: "40px",
                height: "40px",
                borderRadius: "50%",
                bg: "primary",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 2,
              }}
            >
              3
            </Box>
            <Box sx={{ flex: 1 }}>
              <Heading as="h4" sx={{ fontSize: 2, mb: 2 }}>
                🤖 AI-Powered Job Matching
              </Heading>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
                OpenAI GPT-4 analyzes each job against my complete experience portfolio using semantic understanding.
                The AI extracts required skills, evaluates match quality, identifies strengths to emphasize, and flags
                potential gaps or concerns. Only high-quality matches (configurable threshold) proceed to the next
                stage.
              </Text>
              <Box as="ul" sx={{ pl: 4, mb: 2, fontSize: 1 }}>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Match Score</strong>: 0-100% based on skills, experience, and culture fit
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Matched Skills</strong>: Specific technologies and competencies aligned with the role
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Key Strengths</strong>: What to emphasize in the application
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Potential Gaps</strong>: Skills to address or downplay
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Strategic Notes</strong>: AI-generated insights for customization
                </Box>
              </Box>
              <Text
                sx={{
                  fontSize: 0,
                  fontFamily: "monospace",
                  color: "textMuted",
                  bg: "background",
                  p: 2,
                  borderRadius: "sm",
                }}
              >
                Tech: OpenAI GPT-4, semantic analysis, structured JSON extraction
              </Text>
            </Box>
          </Flex>

          <Box sx={{ textAlign: "center", fontSize: 3, color: "primary" }}>↓</Box>

          {/* Step 4: Document Generation */}
          <Flex sx={{ alignItems: "flex-start", gap: 3 }}>
            <Box
              sx={{
                minWidth: "40px",
                height: "40px",
                borderRadius: "50%",
                bg: "primary",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 2,
              }}
            >
              4
            </Box>
            <Box sx={{ flex: 1 }}>
              <Heading as="h4" sx={{ fontSize: 2, mb: 2 }}>
                📄 Hyper-Personalized Document Generation
              </Heading>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
                This portfolio tool receives rich match context and generates custom resumes and cover letters. The AI
                selects the most relevant experiences, emphasizes matched skills, addresses potential concerns, and
                optimizes for ATS parsing—all while maintaining complete factual accuracy.
              </Text>
              <Box as="ul" sx={{ pl: 4, mb: 2, fontSize: 1 }}>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Multi-Provider AI</strong>: Choose between OpenAI GPT-4o (premium) or Google Gemini 2.0
                  (cost-optimized)
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Customizable Prompts</strong>: Edit AI instructions in the <strong>AI Prompts</strong> tab
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Progressive Generation</strong>: Real-time progress updates for each step
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Professional PDF Export</strong>: Puppeteer-rendered documents with custom branding
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Cloud Storage</strong>: Automatic GCS upload with public URLs
                </Box>
              </Box>
              <Text
                sx={{
                  fontSize: 0,
                  fontFamily: "monospace",
                  color: "textMuted",
                  bg: "background",
                  p: 2,
                  borderRadius: "sm",
                }}
              >
                Tech: Firebase Cloud Functions, OpenAI/Gemini, Puppeteer, GCS, Theme UI templates
              </Text>
            </Box>
          </Flex>

          <Box sx={{ textAlign: "center", fontSize: 3, color: "primary" }}>↓</Box>

          {/* Step 5: Application Tracking */}
          <Flex sx={{ alignItems: "flex-start", gap: 3 }}>
            <Box
              sx={{
                minWidth: "40px",
                height: "40px",
                borderRadius: "50%",
                bg: "primary",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 2,
              }}
            >
              5
            </Box>
            <Box sx={{ flex: 1 }}>
              <Heading as="h4" sx={{ fontSize: 2, mb: 2 }}>
                📊 Application Tracking & Management
              </Heading>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
                The <strong>Job Applications</strong> tab provides a comprehensive view of all matched jobs with
                advanced filtering, sorting, and status tracking. One-click document generation for new matches,
                instant access to previously generated documents, and application status management—all in a
                mobile-responsive interface.
              </Text>
              <Box as="ul" sx={{ pl: 4, mb: 2, fontSize: 1 }}>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Advanced Filters</strong>: Applied status, document generation, match score threshold
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Multi-Sort</strong>: Sort by age, match score, company, or role
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Quick Actions</strong>: Mark applied, view job posting, generate documents
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Mobile-First Design</strong>: Responsive table/card layouts
                </Box>
                <Box as="li" sx={{ mb: 1 }}>
                  <strong>Document Preview</strong>: Click generated jobs to view PDFs
                </Box>
              </Box>
              <Text
                sx={{
                  fontSize: 0,
                  fontFamily: "monospace",
                  color: "textMuted",
                  bg: "background",
                  p: 2,
                  borderRadius: "sm",
                }}
              >
                Tech: React hooks, optimistic UI updates, Firestore real-time sync
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Box>

      {/* Cross-System Integration */}
      <Box sx={{ mb: 5 }}>
        <Heading as="h3" sx={{ fontSize: [3, 4], mb: 3, color: "primary" }}>
          🔗 Seamless Integration Architecture
        </Heading>

        <Box
          sx={{
            p: 4,
            bg: "muted",
            borderRadius: "md",
            border: "1px solid",
            borderColor: "divider",
            mb: 3,
          }}
        >
          <Heading as="h4" sx={{ fontSize: 2, mb: 2, color: "primary" }}>
            Shared TypeScript Types via Local Package
          </Heading>
          <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
            Both systems share a single source of truth for data structures through the{" "}
            <Text as="code" sx={{ fontFamily: "monospace", bg: "background", px: 1, py: 0.5, borderRadius: "sm" }}>
              @jdubz/shared-types
            </Text>{" "}
            local package. TypeScript types are mirrored as Python Pydantic models, ensuring perfect data consistency
            across the entire pipeline.
          </Text>
          <Box as="ul" sx={{ pl: 4, mb: 0, fontSize: 1 }}>
            <Box as="li" sx={{ mb: 1 }}>
              <strong>QueueItem</strong>: Job queue structure with status, retry logic, and metadata
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              <strong>JobMatch</strong>: AI analysis results with match scores and strategic insights
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              <strong>Configuration Types</strong>: QueueSettings, StopList, AISettings
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              <strong>API Contracts</strong>: Request/response types for all endpoints
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            p: 4,
            bg: "muted",
            borderRadius: "md",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Heading as="h4" sx={{ fontSize: 2, mb: 2, color: "primary" }}>
            Firestore as Integration Layer
          </Heading>
          <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
            Firestore serves as the real-time data bridge between the Python job-finder and TypeScript portfolio tool.
            Both systems read and write to shared collections, enabling seamless data flow without direct coupling.
          </Text>
          <Box as="ul" sx={{ pl: 4, mb: 0, fontSize: 1 }}>
            <Box as="li" sx={{ mb: 1 }}>
              <Text as="code" sx={{ fontFamily: "monospace", bg: "background", px: 1, borderRadius: "sm" }}>
                job-queue
              </Text>
              : Written by both systems, read by job-finder worker
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              <Text as="code" sx={{ fontFamily: "monospace", bg: "background", px: 1, borderRadius: "sm" }}>
                job-matches
              </Text>
              : Written by job-finder, read/updated by portfolio
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              <Text as="code" sx={{ fontFamily: "monospace", bg: "background", px: 1, borderRadius: "sm" }}>
                job-finder-config
              </Text>
              : Configuration shared between both systems
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              <Text as="code" sx={{ fontFamily: "monospace", bg: "background", px: 1, borderRadius: "sm" }}>
                companies
              </Text>
              ,{" "}
              <Text as="code" sx={{ fontFamily: "monospace", bg: "background", px: 1, borderRadius: "sm" }}>
                job-sources
              </Text>
              : Reference data for scraping
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Technical Highlights */}
      <Box sx={{ mb: 5 }}>
        <Heading as="h3" sx={{ fontSize: [3, 4], mb: 3, color: "primary" }}>
          💡 Technical Highlights
        </Heading>

        <Flex sx={{ flexDirection: "column", gap: 3 }}>
          {/* Cost Optimization */}
          <Box
            sx={{
              p: 3,
              bg: "muted",
              borderRadius: "md",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Heading as="h4" sx={{ fontSize: 2, mb: 2, color: "primary" }}>
              💰 96% Cost Reduction with Multi-Provider AI
            </Heading>
            <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
              The system supports both OpenAI GPT-4o ($0.015/generation) and Google Gemini 2.0 Flash
              ($0.0006/generation). By defaulting to Gemini for standard jobs and reserving OpenAI for critical
              applications, costs are dramatically reduced without sacrificing quality.
            </Text>
            <Text
              sx={{
                fontSize: 0,
                fontFamily: "monospace",
                color: "textMuted",
                bg: "background",
                p: 2,
                borderRadius: "sm",
              }}
            >
              Real savings: 100 applications = $0.06 (Gemini) vs $1.50 (OpenAI)
            </Text>
          </Box>

          {/* Serverless Scale */}
          <Box
            sx={{
              p: 3,
              bg: "muted",
              borderRadius: "md",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Heading as="h4" sx={{ fontSize: 2, mb: 2, color: "primary" }}>
              ⚡ Serverless Architecture with Auto-Scaling
            </Heading>
            <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
              Built entirely on serverless infrastructure: Gatsby static site (instant global CDN delivery), Firebase
              Cloud Functions Gen 2 (auto-scaling from 0 to thousands of requests), and Firestore (managed NoSQL with
              real-time sync). Zero server management, infinite horizontal scale.
            </Text>
            <Text
              sx={{
                fontSize: 0,
                fontFamily: "monospace",
                color: "textMuted",
                bg: "background",
                p: 2,
                borderRadius: "sm",
              }}
            >
              Stack: Gatsby + React 18 + TypeScript, Firebase (Functions Gen 2, Firestore, Auth, Storage), Python
              workers
            </Text>
          </Box>

          {/* Security */}
          <Box
            sx={{
              p: 3,
              bg: "muted",
              borderRadius: "md",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Heading as="h4" sx={{ fontSize: 2, mb: 2, color: "primary" }}>
              🔒 Defense-in-Depth Security
            </Heading>
            <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
              Multiple security layers protect the system: Firebase Auth with custom claims for role-based access
              (editor vs viewer), rate limiting per user role (20/15min for editors, 10/15min for viewers), JWT
              validation on all API endpoints, CORS policies per function, and Firestore security rules enforcing
              server-side authorization.
            </Text>
            <Text
              sx={{
                fontSize: 0,
                fontFamily: "monospace",
                color: "textMuted",
                bg: "background",
                p: 2,
                borderRadius: "sm",
              }}
            >
              Security stack: Firebase Auth, custom claims, express-rate-limit, JWT validation, Firestore rules, CORS
            </Text>
          </Box>

          {/* Progressive UX */}
          <Box
            sx={{
              p: 3,
              bg: "muted",
              borderRadius: "md",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Heading as="h4" sx={{ fontSize: 2, mb: 2, color: "primary" }}>
              🎯 Progressive Generation with Real-Time Feedback
            </Heading>
            <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
              Document generation breaks into discrete steps (fetch defaults → generate resume → generate cover letter
              → render PDFs → upload to storage). Each step reports progress in real-time via WebSocket-like streaming,
              allowing users to access completed documents immediately without waiting for the entire batch.
            </Text>
            <Text
              sx={{
                fontSize: 0,
                fontFamily: "monospace",
                color: "textMuted",
                bg: "background",
                p: 2,
                borderRadius: "sm",
              }}
            >
              UX patterns: Multi-step state machine, optimistic updates, async/await, React hooks
            </Text>
          </Box>

          {/* Mobile-First */}
          <Box
            sx={{
              p: 3,
              bg: "muted",
              borderRadius: "md",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Heading as="h4" sx={{ fontSize: 2, mb: 2, color: "primary" }}>
              📱 Mobile-First Responsive Design
            </Heading>
            <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
              Every interface adapts seamlessly from mobile to desktop. Tables transform into cards on small screens,
              filters collapse to save space, and all interactions are touch-optimized. The Job Applications tab alone
              has separate desktop (data table) and mobile (card) layouts for optimal usability.
            </Text>
            <Text
              sx={{
                fontSize: 0,
                fontFamily: "monospace",
                color: "textMuted",
                bg: "background",
                p: 2,
                borderRadius: "sm",
              }}
            >
              Design system: Theme UI, responsive breakpoints, CSS Grid/Flexbox, collapsible sections
            </Text>
          </Box>

          {/* Testing */}
          <Box
            sx={{
              p: 3,
              bg: "muted",
              borderRadius: "md",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Heading as="h4" sx={{ fontSize: 2, mb: 2, color: "primary" }}>
              ✅ Comprehensive Testing Strategy
            </Heading>
            <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
              Both web and functions have extensive Jest test suites (319 total tests). Playwright E2E tests validate
              critical user flows. Pre-commit hooks enforce linting and type-checking. GitHub Actions CI/CD runs all
              tests before deployment to staging and production.
            </Text>
            <Text
              sx={{
                fontSize: 0,
                fontFamily: "monospace",
                color: "textMuted",
                bg: "background",
                p: 2,
                borderRadius: "sm",
              }}
            >
              Testing stack: Jest, Playwright, ESLint, TypeScript, Prettier, Husky hooks, GitHub Actions
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Feature Tabs Overview */}
      <Box sx={{ mb: 5 }}>
        <Heading as="h3" sx={{ fontSize: [3, 4], mb: 3, color: "primary" }}>
          📑 Available Features
        </Heading>

        <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 3 }}>
          This platform is organized into three main sections, each with specialized tabs for managing different
          aspects of the job search workflow:
        </Text>

        <Flex sx={{ flexDirection: "column", gap: 3 }}>
          {/* Resume Section */}
          <Box
            sx={{
              p: 3,
              bg: "muted",
              borderRadius: "md",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Heading as="h4" sx={{ fontSize: 2, mb: 2, color: "primary" }}>
              📝 Resume Tools
            </Heading>
            <Box as="ul" sx={{ pl: 4, mb: 0, fontSize: 1 }}>
              <Box as="li" sx={{ mb: 1 }}>
                <strong>How It Works</strong>: System overview and architecture (this tab)
              </Box>
              <Box as="li" sx={{ mb: 1 }}>
                <strong>Work Experience</strong>: Manage experience entries and content blurbs
              </Box>
              <Box as="li" sx={{ mb: 1 }}>
                <strong>Document Builder</strong>: Generate custom resumes and cover letters
              </Box>
              <Box as="li" sx={{ mb: 1 }}>
                <strong>AI Prompts</strong>: Customize AI generation instructions
              </Box>
              <Box as="li" sx={{ mb: 1 }}>
                <strong>Personal Info</strong>: Default contact info and personal details
              </Box>
            </Box>
          </Box>

          {/* Job Finder Section */}
          <Box
            sx={{
              p: 3,
              bg: "muted",
              borderRadius: "md",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Heading as="h4" sx={{ fontSize: 2, mb: 2, color: "primary" }}>
              🔍 Job Finder Tools
            </Heading>
            <Box as="ul" sx={{ pl: 4, mb: 0, fontSize: 1 }}>
              <Box as="li" sx={{ mb: 1 }}>
                <strong>Job Applications</strong>: View matched jobs, generate documents, track applications
              </Box>
              <Box as="li" sx={{ mb: 1 }}>
                <strong>Job Scraping</strong>: Monitor scraping activity and view scrape history
              </Box>
              <Box as="li" sx={{ mb: 1 }}>
                <strong>Queue Management</strong>: Real-time queue status with retry and error handling
              </Box>
              <Box as="li" sx={{ mb: 1 }}>
                <strong>Configuration</strong>: Queue settings, stop lists, and AI matching configuration
              </Box>
              <Box as="li" sx={{ mb: 1 }}>
                <strong>Companies</strong>: Manage company blocklist and preferences
              </Box>
              <Box as="li" sx={{ mb: 1 }}>
                <strong>Sources</strong>: Configure job sources and career page tracking
              </Box>
            </Box>
          </Box>

          {/* Admin Section */}
          <Box
            sx={{
              p: 3,
              bg: "muted",
              borderRadius: "md",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Heading as="h4" sx={{ fontSize: 2, mb: 2, color: "primary" }}>
              ⚙️ Admin Tools
            </Heading>
            <Box as="ul" sx={{ pl: 4, mb: 0, fontSize: 1 }}>
              <Box as="li" sx={{ mb: 1 }}>
                <strong>Document History</strong>: View all generated documents with metadata
              </Box>
              <Box as="li" sx={{ mb: 1 }}>
                <strong>Troubleshooting</strong>: System health checks and diagnostics
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* Quality Philosophy */}
      <Box sx={{ mb: 5 }}>
        <Heading as="h3" sx={{ fontSize: [3, 4], mb: 3, color: "primary" }}>
          🎯 Quality Philosophy
        </Heading>

        <Box
          sx={{
            p: 4,
            bg: "muted",
            borderRadius: "md",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 3 }}>
            The AI is explicitly instructed to prioritize <strong>factual accuracy</strong> over embellishment. It
            cannot invent metrics, add accomplishments, or claim skills that aren&apos;t in the source data. Instead,
            it optimizes applications through:
          </Text>

          <Box as="ul" sx={{ pl: 4, mb: 3 }}>
            <Box as="li" sx={{ mb: 2 }}>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6 }}>
                <strong>Intelligent Selection</strong>: Choosing the most relevant experiences and accomplishments for
                each specific role
              </Text>
            </Box>
            <Box as="li" sx={{ mb: 2 }}>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6 }}>
                <strong>Strategic Emphasis</strong>: Highlighting matched skills and achievements through careful
                ordering, placement, and phrasing
              </Text>
            </Box>
            <Box as="li" sx={{ mb: 2 }}>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6 }}>
                <strong>Clear Communication</strong>: Reformatting content for readability and impact while preserving
                all factual details
              </Text>
            </Box>
            <Box as="li" sx={{ mb: 2 }}>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6 }}>
                <strong>ATS Optimization</strong>: Ensuring documents parse correctly in applicant tracking systems with
                proper keyword placement
              </Text>
            </Box>
            <Box as="li" sx={{ mb: 2 }}>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6 }}>
                <strong>Gap Addressing</strong>: Acknowledging potential skill gaps honestly while framing existing
                experience positively
              </Text>
            </Box>
          </Box>

          <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6 }}>
            The result: authentic, accurate documents that showcase real qualifications while being perfectly tailored
            to each opportunity. No lies, no exaggeration—just intelligent presentation of genuine experience.
          </Text>
        </Box>
      </Box>

      {/* Development Workflow */}
      <Box sx={{ mb: 5 }}>
        <Heading as="h3" sx={{ fontSize: [3, 4], mb: 3, color: "primary" }}>
          🚀 Production-Ready Development Workflow
        </Heading>

        <Box
          sx={{
            p: 4,
            bg: "muted",
            borderRadius: "md",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 3 }}>
            This project follows professional development practices with automated testing, CI/CD, and multi-environment
            deployment:
          </Text>

          <Box as="ul" sx={{ pl: 4, mb: 3, fontSize: 1 }}>
            <Box as="li" sx={{ mb: 1 }}>
              <strong>Git Workflow</strong>: feature → staging → main with PR reviews
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              <strong>Local Development</strong>: Firebase emulators for offline testing
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              <strong>Staging Environment</strong>: Full production replica at staging.joshwentworth.com
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              <strong>Production</strong>: Auto-deploy to joshwentworth.com on main merge
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              <strong>Version Management</strong>: Changesets for semantic versioning
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              <strong>Pre-Commit Hooks</strong>: Linting, type-checking, and test validation
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              <strong>GitHub Actions</strong>: Automated testing and deployment
            </Box>
          </Box>

          <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6 }}>
            All code is linted, type-checked, and tested before deployment. The staging environment allows full testing
            before production releases.
          </Text>
        </Box>
      </Box>

      {/* Portfolio Meta */}
      <Box sx={{ mb: 5 }}>
        <Heading as="h3" sx={{ fontSize: [3, 4], mb: 3, color: "primary" }}>
          🎨 This Tool is the Portfolio
        </Heading>

        <Box
          sx={{
            p: 4,
            bg: "muted",
            borderRadius: "md",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 3 }}>
            Every resume generated by this system includes a footer:{" "}
            <Text
              as="em"
              sx={{ fontStyle: "italic", bg: "background", px: 2, py: 1, borderRadius: "sm", display: "inline-block" }}
            >
              &quot;Generated by a custom AI resume builder built by the candidate&quot;
            </Text>{" "}
            with a link to this tool. The resume itself becomes a demonstration of technical capability.
          </Text>

          <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 3 }}>
            This project showcases:
          </Text>

          <Box as="ul" sx={{ pl: 4, mb: 3, fontSize: 1 }}>
            <Box as="li" sx={{ mb: 1 }}>
              Full-stack development (React, TypeScript, Python, Firebase)
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              AI/ML integration (OpenAI, Google Gemini)
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              Cloud architecture and serverless design (GCP, Firebase)
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              Cost optimization strategies (96% AI cost reduction)
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              Security best practices (Auth, rate limiting, RBAC)
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              System integration and cross-language data sharing
            </Box>
            <Box as="li" sx={{ mb: 1 }}>
              Real-world problem solving (automating my job search)
            </Box>
          </Box>

          <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6 }}>
            It&apos;s not just a project—it&apos;s a working solution to a real problem that demonstrates practical
            engineering skills across the entire stack.
          </Text>
        </Box>
      </Box>

      {/* Source Code */}
      <Box
        sx={{
          p: 4,
          bg: "highlight",
          borderRadius: "md",
          border: "1px solid",
          borderColor: "primary",
          textAlign: "center",
        }}
      >
        <Heading as="h4" sx={{ fontSize: 2, mb: 2, color: "primary" }}>
          📂 Explore the Code
        </Heading>
        <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 3 }}>
          Both the portfolio tool and job-finder are open source. Review the implementation, architecture decisions,
          API design, testing strategies, and deployment configuration on GitHub.
        </Text>
        <Flex sx={{ gap: 3, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="https://github.com/Jdubz/portfolio"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "inline-block",
              px: 4,
              py: 2,
              bg: "primary",
              color: "white",
              borderRadius: "md",
              textDecoration: "none",
              fontWeight: "bold",
              transition: "opacity 0.2s",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            📝 Portfolio Tool →
          </Link>
          <Link
            href="https://github.com/Jdubz/job-finder"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: "inline-block",
              px: 4,
              py: 2,
              bg: "secondary",
              color: "white",
              borderRadius: "md",
              textDecoration: "none",
              fontWeight: "bold",
              transition: "opacity 0.2s",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            🔍 Job Finder →
          </Link>
        </Flex>
      </Box>
    </Box>
  )
}
