---
"josh-wentworth-portfolio": minor
---

Simplify the project to a static site

- Remove the contact form, its Cloud Function and deploy pipeline; contact links are now `mailto:hello@joshwentworth.com`
- Return 404 for unknown URLs and revalidate pages instead of caching them for an hour
- Remove unused Firebase SDK, analytics, cookie banner, cache-version logic and dead components
- Restore the staging hosting target and deploy-on-push to `staging`
- Add an automated Claude code review on pull requests
