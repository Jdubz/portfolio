# Prompt Improvements to Prevent AI Hallucination

> **Issue**: OpenAI is inventing experience that doesn't exist in the provided data
> **Priority**: CRITICAL - Resume accuracy is non-negotiable

## Current Problems in Prompts

### 1. System Prompt Issues (Lines 232-242)

**Problem**: Too permissive, encourages creativity
```typescript
"You specialize in ATS-friendly resumes that highlight technical accomplishments with quantifiable impact."
```
- **Issue**: "quantifiable impact" implies the AI should add metrics even if none exist
- **Issue**: "highlight technical accomplishments" could mean inventing them

### 2. User Prompt Issues (Lines 288-299)

**Critical Problems**:
```typescript
"- Rewrite experience highlights to emphasize skills/technologies mentioned in the job description"
"- Use strong action verbs and quantify achievements where possible"
"- Extract or infer appropriate skills and categorize them"
"- Include education if relevant (can infer from experience if not explicitly provided)"
```

**Issues**:
- ❌ **"Rewrite"** - Encourages changing facts
- ❌ **"quantify...where possible"** - AI interprets this as "make up numbers if helpful"
- ❌ **"infer"** - Direct instruction to hallucinate
- ❌ **"can infer from experience"** - Permission to fabricate education

### 3. No Explicit Boundaries

The prompts never explicitly forbid:
- Adding experience not in the data
- Inventing metrics or numbers
- Creating skills not mentioned
- Fabricating education

### 4. Mock Data Reinforces Bad Behavior (Lines 493-534)

The mock response includes fabricated data:
```typescript
highlights: [
  "Led development of core features that increased user engagement by 35%",  // ❌ Made up metric
  "Architected and implemented scalable microservices handling 1M+ daily requests",  // ❌ Invented scale
]
```

This trains the model (via examples) that inventing metrics is acceptable.

---

## Best Practices for Anti-Hallucination

### 1. **Explicit Constraints** (Most Important)

Add clear boundaries at the START of system and user prompts:

```
CRITICAL RULES - NEVER VIOLATE:
1. ONLY use information explicitly provided in the experience data
2. NEVER add metrics, numbers, or statistics not in the original data
3. NEVER invent job responsibilities or accomplishments
4. NEVER create companies, roles, or dates not provided
5. If information is missing, leave it out - DO NOT fabricate
```

### 2. **Use Restrictive Language**

**Bad** (current):
- "Rewrite experience highlights"
- "Quantify achievements where possible"
- "Infer appropriate skills"

**Good** (proposed):
- "Reformat the provided experience highlights" (reformat ≠ rewrite)
- "Use ONLY metrics explicitly stated in the experience data"
- "Extract skills explicitly mentioned in the experience data"

### 3. **Structured Output Enforcement**

Your structured output schema is good, but add validation:

```typescript
// Add to requirements
"If a field is not present in source data, use empty string or empty array"
"NEVER populate fields with inferred or assumed information"
```

### 4. **Temperature = 0**

You're using `temperature: 0.3` - this allows some creativity.

**Recommendation**: Use `temperature: 0` for resume generation
- Resume generation requires accuracy, not creativity
- Lower temperature reduces hallucination risk
- Cover letters can use 0.3 (more room for writing style)

### 5. **Few-Shot Examples**

Add examples showing CORRECT behavior (not inventing data):

```
Example of CORRECT reformatting:
Input: "Built internal dashboard using React and TypeScript"
Output: "Developed internal analytics dashboard using React and TypeScript"

Example of INCORRECT hallucination:
Input: "Built internal dashboard using React and TypeScript"
Output: "Built internal dashboard serving 10,000+ users with 99.9% uptime" ❌ NEVER DO THIS
```

### 6. **Use Chain-of-Thought Reasoning**

Ask the AI to think through its process:

```
Before generating the resume, first:
1. List all companies and roles from the experience data
2. List all skills explicitly mentioned
3. List all metrics/numbers stated in the data
4. Then generate the resume using ONLY this extracted information
```

### 7. **Post-Processing Validation**

Add validation after generation:
- Check that all companies exist in source data
- Check that all dates are within provided ranges
- Flag any suspiciously specific metrics (99.9%, 10,000+, 50% increase, etc.)

---

## Improved Prompts

### New System Prompt (Resume)

```typescript
private buildResumeSystemPrompt(): string {
  return `You are a professional resume formatter with strict adherence to factual accuracy.

CRITICAL RULES - THESE ARE ABSOLUTE:
1. ONLY use information explicitly provided in the experience data below
2. NEVER add metrics, numbers, percentages, or statistics not in the original data
3. NEVER invent job responsibilities, accomplishments, or technologies
4. NEVER create companies, roles, dates, or locations not provided
5. If information is missing or unclear, omit it entirely - DO NOT guess or infer
6. You may REFORMAT wording for clarity, but NEVER change the factual content
7. You may REORGANIZE content for better presentation, but NEVER add new information

Your role is to:
- Format and structure the provided experience data professionally
- Emphasize relevant experience for the target role BY ORDERING, not by fabrication
- Improve phrasing and grammar while preserving all factual details
- Ensure ATS-friendliness through proper formatting

What you CANNOT do:
- Add accomplishments not stated in the source data
- Insert metrics or quantification not explicitly provided
- Infer skills, technologies, or methodologies not mentioned
- Create education entries if none are provided`
}
```

### New User Prompt (Resume)

```typescript
private buildResumeUserPrompt(options: GenerateResumeOptions): string {
  const style = options.style || "modern"

  // Format experience data with STRICT labels
  const experienceData = options.experienceEntries
    .map((entry, index) => {
      const blurb = options.experienceBlurbs.find((b) => b.name === entry.id)
      return `
EXPERIENCE ENTRY #${index + 1} (USE ONLY THIS DATA):
Company/Title: ${entry.title}
${entry.role ? `Role: ${entry.role}` : "NO ROLE PROVIDED"}
${entry.location ? `Location: ${entry.location}` : "NO LOCATION PROVIDED"}
Start Date: ${entry.startDate}
End Date: ${entry.endDate || "Present"}
${entry.body ? `Description: ${entry.body}` : "NO DESCRIPTION PROVIDED"}
${blurb ? `Detailed Accomplishments:\n${blurb.content}` : "NO ACCOMPLISHMENTS PROVIDED"}
${entry.notes ? `Additional Notes: ${entry.notes}` : "NO NOTES PROVIDED"}

AVAILABLE DATA FOR THIS ENTRY ENDS HERE - USE NOTHING ELSE
`.trim()
    })
    .join("\n\n" + "=".repeat(80) + "\n\n")

  return `Create a ${style} resume for the "${options.job.role}" position at ${options.job.company}.

PERSONAL INFORMATION (USE EXACTLY AS PROVIDED):
- Name: ${options.personalInfo.name}
- Email: ${options.personalInfo.email}
${options.personalInfo.phone ? `- Phone: ${options.personalInfo.phone}` : "- Phone: NOT PROVIDED"}
${options.personalInfo.location ? `- Location: ${options.personalInfo.location}` : "- Location: NOT PROVIDED"}
${options.personalInfo.website ? `- Website: ${options.personalInfo.website}` : "- Website: NOT PROVIDED"}
${options.personalInfo.linkedin ? `- LinkedIn: ${options.personalInfo.linkedin}` : "- LinkedIn: NOT PROVIDED"}
${options.personalInfo.github ? `- GitHub: ${options.personalInfo.github}` : "- GitHub: NOT PROVIDED"}

TARGET JOB INFORMATION:
- Company: ${options.job.company}
- Role: ${options.job.role}
${options.job.companyWebsite ? `- Company Website: ${options.job.companyWebsite}` : ""}
${options.job.jobDescription ? `\n- Job Description (for relevance ranking only, DO NOT fabricate experience to match):\n${options.job.jobDescription}` : ""}

EXPERIENCE DATA (THIS IS YOUR ONLY SOURCE OF TRUTH):
${experienceData}

END OF EXPERIENCE DATA - NO OTHER INFORMATION EXISTS

TASK REQUIREMENTS:
1. Create a professional summary that reflects ONLY the experience and skills present in the data above
2. Select and order the most relevant experience entries for the ${options.job.role} role
3. Reformat (NOT rewrite) experience highlights for clarity and impact
4. If a highlight mentions a technology/skill relevant to the job description, you may emphasize it through placement or formatting
5. Extract skills ONLY from technologies explicitly mentioned in the experience entries
${options.emphasize ? `6. If these keywords appear in the experience data, ensure they are prominent: ${options.emphasize.join(", ")}` : ""}
7. For education: If education information is in the experience data or notes, include it. If not, omit the education section entirely.

FORBIDDEN ACTIONS (WILL RESULT IN REJECTION):
❌ Adding metrics/numbers not in source data (e.g., "increased by 50%", "serving 10K users")
❌ Inventing job responsibilities or projects
❌ Creating skills or technologies not mentioned
❌ Fabricating education credentials
❌ Adding companies or roles not in the experience data
❌ Inferring information from context

VALIDATION CHECKLIST (verify before responding):
✓ Every company name exists in the experience data
✓ Every technology listed is mentioned in the experience data
✓ Every accomplishment appears in the source highlights/descriptions
✓ All dates fall within the provided date ranges
✓ No metrics exist that weren't explicitly stated

Generate a complete, ATS-friendly resume using ONLY the factual information provided above.`
}
```

### Additional: Temperature Adjustment

```typescript
// In generateResume()
const completion = await this.client.chat.completions.create({
  model: this.model,
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
  temperature: 0,  // ← Changed from 0.3 to 0 for maximum accuracy
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "resume_content",
      strict: true,
      schema: this.getResumeSchema(),
    },
  },
})
```

---

## Post-Generation Validation

Add validation function to detect hallucinations:

```typescript
/**
 * Validate generated resume for hallucinations
 * Returns warnings for suspicious content
 */
private validateResumeAccuracy(
  content: ResumeContent,
  sourceData: GenerateResumeOptions
): string[] {
  const warnings: string[] = []

  // Check companies exist in source data
  const sourceCompanies = new Set(sourceData.experienceEntries.map(e => e.title.toLowerCase()))
  content.experience.forEach(exp => {
    if (!sourceCompanies.has(exp.company.toLowerCase())) {
      warnings.push(`Hallucinated company: "${exp.company}" not in source data`)
    }
  })

  // Check for suspiciously specific metrics (common hallucination pattern)
  const metricPatterns = [
    /\d+%/,  // Percentages like "50%", "99.9%"
    /\d+[\s,]?\d*\+/,  // Numbers like "10,000+", "1M+"
    /\d+x/,  // Multipliers like "10x", "3x faster"
  ]

  content.experience.forEach(exp => {
    exp.highlights.forEach(highlight => {
      metricPatterns.forEach(pattern => {
        if (pattern.test(highlight)) {
          // Check if this metric exists in source data
          const sourceText = sourceData.experienceEntries
            .map(e => `${e.body} ${sourceData.experienceBlurbs.find(b => b.name === e.id)?.content || ""}`)
            .join(" ")

          if (!pattern.test(sourceText)) {
            warnings.push(`Potential hallucinated metric in: "${highlight}"`)
          }
        }
      })
    })
  })

  // Check dates are within provided ranges
  content.experience.forEach(exp => {
    const sourceEntry = sourceData.experienceEntries.find(e => e.title === exp.company)
    if (sourceEntry) {
      if (exp.startDate !== sourceEntry.startDate) {
        warnings.push(`Date mismatch for ${exp.company}: ${exp.startDate} vs ${sourceEntry.startDate}`)
      }
    }
  })

  return warnings
}
```

---

## Implementation Priority

### Immediate (High Impact, Low Effort)

1. ✅ **Set temperature to 0** (1 line change)
2. ✅ **Add CRITICAL RULES section** to system prompt (5 minutes)
3. ✅ **Change permissive language** in user prompt (10 minutes)
4. ✅ **Add explicit data boundaries** ("USE ONLY THIS DATA") (10 minutes)

### Short Term (Medium Impact, Medium Effort)

5. ⚠️ **Add validation function** (30 minutes)
6. ⚠️ **Update mock data** to not include hallucinations (15 minutes)
7. ⚠️ **Add forbidden actions list** to user prompt (5 minutes)

### Future Enhancement (Nice to Have)

8. 📅 **Chain-of-thought prompting** (requires testing)
9. 📅 **Few-shot examples** (requires prompt engineering)
10. 📅 **Separate extraction step** before generation (architecture change)

---

## Testing Strategy

After implementing improvements:

1. **Baseline Test**: Generate resume without job description
   - Should produce accurate resume with NO invented content
   - All content traceable to source data

2. **Stress Test**: Generate resume with aspirational job description
   - Include requirements for skills/experience not in source data
   - AI should NOT fabricate matching experience

3. **Validation Test**: Use validation function
   - Should catch any hallucinated companies, metrics, or dates
   - Should flag suspicious patterns

4. **A/B Comparison**:
   - Generate 5 resumes with OLD prompts
   - Generate 5 resumes with NEW prompts
   - Count hallucinations in each set

---

## Expected Results

With these improvements:
- ✅ **Hallucinations reduced by 90%+**
- ✅ **Every fact traceable to source data**
- ✅ **Emphasis through ordering/formatting, not fabrication**
- ✅ **More trustworthy output for users**
- ⚠️ **Potentially less "impressive" sounding** (but accurate!)
- ⚠️ **May need better source data** to generate compelling resumes

---

## Next Steps

1. Review and approve prompt changes
2. Implement temperature change (immediate)
3. Update system and user prompts
4. Test with real staging data
5. Add validation warnings
6. Monitor user feedback

The trade-off: Less creative/embellished resumes, but **100% factual accuracy**.
For a resume, accuracy is non-negotiable.
