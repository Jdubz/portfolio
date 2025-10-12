/**
 * Genkit Configuration
 *
 * Initializes Firebase Genkit with plugins and configuration
 * for AI model providers (Google AI).
 *
 * NOTE: This is preparatory work for migrating to Genkit.
 * See docs/development/FIREBASE_GENKIT_MIGRATION.md for full migration plan.
 */

import { genkit } from "genkit"
import { googleAI } from "@genkit-ai/google-genai"

// Initialize Genkit with Google AI plugin
export const ai = genkit({
  plugins: [googleAI()],
  // Default model configuration
  model: googleAI.model("gemini-2.0-flash-exp"),
})

export default ai
