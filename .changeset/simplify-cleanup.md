---
"josh-wentworth-portfolio": minor
"contact-form-function": minor
---

Simplify the project and fix contact form issues found in review

- Rate limit by the real client IP instead of a spoofable header; lower max instances
- Log email failures with their message and stack; stop logging form contents
- Return 404 for unknown URLs and revalidate pages instead of caching them for an hour
- Validate message length in the form and handle non-JSON error responses
- Remove unused Firebase SDK, analytics, cookie banner, cache-version logic and dead function code
- Bundle the function with esbuild so deployed dependency versions come from the lockfile
- Restore the staging hosting target and deploy-on-push to `staging`
