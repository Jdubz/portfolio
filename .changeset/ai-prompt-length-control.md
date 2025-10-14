---
"josh-wentworth-portfolio": patch
"contact-form-function": patch
---

Improve AI prompts to prioritize relevance and enforce strict length limits

Updated both OpenAI and Gemini AI prompts with stronger length controls and quality-first approach:

**Resume Generation:**
- Strict 600-750 word limit (down from 700-800)
- Maximum 3-4 experience entries (AI selects most relevant)
- Maximum 4 bullet points per entry
- Professional summary: 2-3 sentences (50-75 words)
- Explicit instruction: relevance > recency
- Explicit instruction: quality > quantity
- Skip weak or irrelevant experiences entirely

**Cover Letter Generation:**
- Strict 250-350 word limit
- Maximum 3 paragraphs (opening, body, closing)
- Each paragraph: 2-3 sentences maximum
- Focus on 2-3 most relevant accomplishments only
- Remove clichés and generic phrases

**Key Philosophy Change:**
- AI now SELECTS the best experiences rather than including everything
- Prioritizes quality over completeness
- Better to have 3 strong entries than 5 mediocre ones
- Addresses common issue of documents being too long

This should significantly reduce document length while improving quality and relevance.
