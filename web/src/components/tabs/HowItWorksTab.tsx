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
          An Intelligent Job Application Pipeline
        </Heading>
        <Text sx={{ fontSize: [2, 3], color: "text", lineHeight: 1.6, mb: 3 }}>
          This isn&apos;t just a resume builder—it&apos;s an integrated system that combines AI-powered job discovery,
          intelligent matching, and hyper-personalized document generation to create the best applications possible.
        </Text>
      </Box>

      {/* Architecture Overview */}
      <Box sx={{ mb: 5 }}>
        <Heading as="h3" sx={{ fontSize: [3, 4], mb: 3, color: "primary" }}>
          The Pipeline
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
          {/* Step 1 */}
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
                Job Discovery & Analysis
              </Heading>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
                The{" "}
                <Link href="https://github.com/Jdubz/job-finder" target="_blank" sx={{ color: "primary" }}>
                  job-finder
                </Link>{" "}
                tool continuously scans job boards, scrapes postings, and uses AI to analyze each opportunity. It
                extracts key information like required skills, company culture, and role responsibilities.
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
                Technologies: Python, web scraping, OpenAI GPT-4, Firestore
              </Text>
            </Box>
          </Flex>

          {/* Arrow */}
          <Box sx={{ textAlign: "center", fontSize: 3, color: "primary" }}>↓</Box>

          {/* Step 2 */}
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
                Intelligent Matching
              </Heading>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
                Each job is scored against my experience portfolio using semantic analysis. The system identifies
                matched skills, key strengths to emphasize, and potential gaps—providing strategic insights for
                customization.
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
                Match scoring, skill extraction, semantic analysis
              </Text>
            </Box>
          </Flex>

          {/* Arrow */}
          <Box sx={{ textAlign: "center", fontSize: 3, color: "primary" }}>↓</Box>

          {/* Step 3 */}
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
                AI-Powered Document Generation
              </Heading>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
                This tool (the portfolio builder) receives rich context from job-finder and generates hyper-customized
                resumes and cover letters. The AI is instructed to emphasize matched skills, address potential concerns,
                and highlight relevant achievements—all while maintaining complete factual accuracy.
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
                Multi-provider AI (OpenAI GPT-4o, Google Gemini 2.0), Firebase Cloud Functions, Puppeteer PDF rendering
              </Text>
            </Box>
          </Flex>

          {/* Arrow */}
          <Box sx={{ textAlign: "center", fontSize: 3, color: "primary" }}>↓</Box>

          {/* Step 4 */}
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
                Professional Delivery
              </Heading>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
                Generated PDFs are stored in Google Cloud Storage with automatic lifecycle management (archived to
                COLDLINE after 90 days for cost optimization). Public URLs never expire, and all generations are tracked
                with full metadata for continuous improvement.
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
                Google Cloud Storage, lifecycle policies, Firestore tracking
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Box>

      {/* Technical Highlights */}
      <Box sx={{ mb: 5 }}>
        <Heading as="h3" sx={{ fontSize: [3, 4], mb: 3, color: "primary" }}>
          Technical Highlights
        </Heading>

        <Flex sx={{ flexDirection: "column", gap: 3 }}>
          {/* Multi-Provider AI */}
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
              💰 Cost-Optimized Multi-Provider AI
            </Heading>
            <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
              The system supports both OpenAI GPT-4o and Google Gemini 2.0 Flash. By defaulting to Gemini for most
              generations, the cost per document is reduced by 96%—from $0.015 to $0.0006—without sacrificing quality.
            </Text>
            <Text sx={{ fontSize: 0, color: "textMuted" }}>
              Real-world savings: Generating 100 applications costs $0.06 with Gemini vs. $1.50 with OpenAI
            </Text>
          </Box>

          {/* Architecture */}
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
              🏗️ Scalable Serverless Architecture
            </Heading>
            <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
              Built on Firebase Cloud Functions (Gen 2) with a Gatsby static frontend. The system scales automatically
              from zero to thousands of requests without managing servers. Firestore serves as the integration layer
              between job-finder and the portfolio tool.
            </Text>
            <Text sx={{ fontSize: 0, color: "textMuted" }}>
              Stack: Gatsby + React 18, TypeScript, Firebase (Cloud Functions Gen 2, Firestore, Auth, Storage), Theme UI
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
              🔒 Security & Access Control
            </Heading>
            <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
              Firebase Authentication with custom claims enforces role-based access (editor vs. viewer). Rate limiting
              prevents abuse (20 requests per 15 minutes for editors, 10 for viewers). All API endpoints require valid
              JWT tokens, and Cloud Functions validate requests server-side.
            </Text>
            <Text sx={{ fontSize: 0, color: "textMuted" }}>
              Defense-in-depth: Firebase Auth, custom claims, rate limiting, JWT validation, CORS policies
            </Text>
          </Box>

          {/* Progressive Generation */}
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
              ⚡ Progressive Generation with Real-Time Updates
            </Heading>
            <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
              Document generation is broken into discrete steps (fetch data → generate content → render PDF → upload).
              Each step reports progress in real-time, allowing early access to completed documents without waiting for
              the entire batch to finish.
            </Text>
            <Text sx={{ fontSize: 0, color: "textMuted" }}>
              Multi-step API design, optimistic UI updates, state management, async/await patterns
            </Text>
          </Box>

          {/* Data Integration */}
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
              🔗 Seamless Tool Integration
            </Heading>
            <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 2 }}>
              Firestore acts as the shared data layer between job-finder (Python) and the portfolio tool
              (TypeScript/JavaScript). Job matches flow automatically from discovery to generation, with both tools
              reading and writing to the same collections for maximum efficiency.
            </Text>
            <Text sx={{ fontSize: 0, color: "textMuted" }}>
              Cross-language integration, shared schema design, eventual consistency, real-time sync
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Quality Philosophy */}
      <Box sx={{ mb: 5 }}>
        <Heading as="h3" sx={{ fontSize: [3, 4], mb: 3, color: "primary" }}>
          Quality Philosophy
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
            cannot add metrics, accomplishments, or technologies that aren&apos;t in the source data. Instead, it
            focuses on:
          </Text>

          <Box as="ul" sx={{ pl: 4, mb: 3 }}>
            <Box as="li" sx={{ mb: 2 }}>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6 }}>
                <strong>Selection</strong>: Choosing the most relevant experiences for each role
              </Text>
            </Box>
            <Box as="li" sx={{ mb: 2 }}>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6 }}>
                <strong>Emphasis</strong>: Highlighting matched skills and achievements through ordering and placement
              </Text>
            </Box>
            <Box as="li" sx={{ mb: 2 }}>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6 }}>
                <strong>Clarity</strong>: Reformatting content for readability while preserving all facts
              </Text>
            </Box>
            <Box as="li" sx={{ mb: 2 }}>
              <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6 }}>
                <strong>ATS Optimization</strong>: Ensuring documents parse correctly in applicant tracking systems
              </Text>
            </Box>
          </Box>

          <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6 }}>
            The result: authentic, accurate documents that showcase real qualifications while being perfectly tailored
            to each opportunity.
          </Text>
        </Box>
      </Box>

      {/* Portfolio Piece */}
      <Box sx={{ mb: 5 }}>
        <Heading as="h3" sx={{ fontSize: [3, 4], mb: 3, color: "primary" }}>
          This Tool is the Portfolio
        </Heading>

        <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 3 }}>
          Every resume generated by this system includes a subtle footer:{" "}
          <Text as="em">&quot;Generated by a custom AI resume builder built by the candidate&quot;</Text> with a link to
          this tool. The resume itself becomes a demonstration of technical capability.
        </Text>

        <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6 }}>
          This project showcases full-stack development, AI integration, cloud architecture, cost optimization, security
          best practices, and system design—all while solving a real problem in my own job search.
        </Text>
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
          Want to see the code?
        </Heading>
        <Text sx={{ fontSize: 1, color: "text", lineHeight: 1.6, mb: 3 }}>
          Both the portfolio tool and job-finder are open source. Explore the implementation, architecture decisions,
          and technical details on GitHub.
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
            View Portfolio Tool →
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
            View Job Finder →
          </Link>
        </Flex>
      </Box>
    </Box>
  )
}
