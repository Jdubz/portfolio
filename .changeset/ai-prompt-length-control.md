---
"josh-wentworth-portfolio": patch
"contact-form-function": patch
---

Improve AI prompts to prioritize relevance, enforce strict length limits, and add casual/creative tone to cover letters

Updated both OpenAI and Gemini AI prompts with stronger length controls and quality-first approach:

**Resume Generation:**
- Strict 600-750 word limit (down from 700-800)
- Maximum 3-4 experience entries (AI selects most relevant)
- Maximum 4 bullet points per entry
- Professional summary: 2-3 sentences (50-75 words)
- Explicit instruction: relevance > recency
- Explicit instruction: quality > quantity
- Skip weak or irrelevant experiences entirely

**Cover Letter Generation - NEW CASUAL/CREATIVE APPROACH:**
- **Tone:** Casual, conversational, creative (not stiff corporate)
- **Content Strategy:** Weaves personal stories/values with professional experience
- **Company Research:** Cross-references company culture/mission with candidate bio
- **Data Sources:** Prioritizes personal blurbs/bio, then company culture, then professional experience
- **Selection:** 1-2 personal experiences + 1-2 professional accomplishments
- **Forbidden Phrases:** Explicitly avoids clichés like "I am excited to apply...", "I look forward to hearing from you..."
- **Creative Alternatives:** Story-based openings, genuine enthusiasm, conversational closings
- Strict 250-350 word limit
- Maximum 3 paragraphs (opening, body, closing)
- Each paragraph: 2-3 sentences maximum

**Key Philosophy Changes:**
- AI now SELECTS the best experiences rather than including everything
- Prioritizes quality over completeness
- Better to have 3 strong entries than 5 mediocre ones
- Cover letters show personality and cultural fit, not just technical skills
- Addresses common issues: documents too long, cover letters too stiff/generic

This significantly reduces document length while improving quality, relevance, and authentic personal connection.
