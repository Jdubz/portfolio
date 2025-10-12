/**
 * Genkit Configuration
 *
 * Initializes Firebase Genkit with plugins and configuration
 * for AI model providers (Google AI, OpenAI).
 */

import { configureGenkit } from "@genkit-ai/core"
import { firebase } from "@genkit-ai/firebase"
import { googleAI } from "@genkit-ai/googleai"

// Initialize Genkit with Firebase and Google AI plugins
export const ai = configureGenkit({
  plugins: [
    // Firebase plugin for Cloud Functions integration
    firebase(),

    // Google AI plugin for Gemini models
    googleAI(),
  ],
  // Enable tracing in development
  enableTracingAndMetrics: process.env.NODE_ENV !== "production",
  // Log level
  logLevel: process.env.NODE_ENV === "test" ? "error" : "info",
})

export default ai
