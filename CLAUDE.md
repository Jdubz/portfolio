# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Josh Wentworth's professional portfolio: a Gatsby static site plus one Cloud Function for the contact form. Keep it that small. The resume builder and job tools moved to the separate Job Finder app; `/resume-builder` and `/app` redirect there.

- **Frontend:** Gatsby 5 + React 18 + Theme UI + TypeScript (`web/`)
- **Backend:** one HTTP Cloud Function, Gen 2, Node.js 20 (`functions/`)
- **Hosting:** Firebase Hosting behind Cloudflare
- **Email:** Mailgun

There is no database, no authentication, no analytics and no App Check. Do not reintroduce the Firebase client SDK without a reason.

## Project Structure

```
portfolio/
├── web/                    # Gatsby frontend (npm workspace)
│   ├── src/
│   │   ├── components/     # ContactForm, homepage/*, elements/*
│   │   ├── content/        # MDX for homepage sections
│   │   ├── pages/          # index, contact, projects/full-stack, privacy, terms, 404
│   │   ├── templates/      # home.tsx (parallax homepage)
│   │   └── gatsby-plugin-theme-ui/  # Theme
│   ├── e2e/                # Playwright tests
│   └── static/             # Static assets
│
├── functions/              # Contact form function (npm workspace)
│   └── src/
│       ├── index.ts        # Handler: CORS, validation, honeypot (entry: handleContactForm)
│       ├── rate-limit.ts   # Per-IP rate limiter
│       ├── email.ts        # Mailgun delivery, reads config from env vars
│       └── logger.ts       # Structured JSON logging
│
├── firebase.json           # Hosting: production + staging targets, headers, redirects
├── .github/workflows/      # CI/CD
├── scripts/                # Changeset helper, screenshots, image optimisation
└── Makefile                # Thin aliases for npm scripts (`make help`)
```

## Commands

```bash
npm run dev             # Gatsby dev server (port 8000)
npm run dev:functions   # Build and run the function locally (port 8080)

npm run lint            # tsc + ESLint + Prettier, both packages
npm test                # Jest, both packages
npm run build           # Production Gatsby build
npm run build:functions # esbuild bundle -> functions/dist/index.js

npm run firebase:serve  # Hosting emulator for the built site (port 5000)
cd web && npm run test:e2e   # Playwright
```

Run `npm run lint && npm test` before finishing a change; CI runs both on every PR and before every hosting deploy.

## Contact Form

**Frontend** (`web/src/components/ContactForm.tsx`): client-side validation, hidden honeypot field, POST as JSON to `GATSBY_CONTACT_FUNCTION_URL`.

**Backend** (`functions/src/index.ts`), in order:

1. CORS allowlist (production, staging, localhost)
2. `GET /health` returns status and package version
3. Rate limit: 5 requests / 15 minutes / IP
4. Joi validation
5. Honeypot: filled means bot, respond 200 without sending
6. Send email via Mailgun

Things that are easy to get wrong:

- **Validation limits live in two places** (the Joi schema and `ContactForm.tsx`). Change both.
- **Client IP is the last `X-Forwarded-For` entry.** Google appends it; earlier entries are client-supplied and spoofable.
- **Rate limit counts are in memory per instance**, so `--max-instances` in the deploy workflow is part of the limit. Keep it low.
- **Never log form contents** (name, email, message). Log request IDs.
- **Log errors through `logger`** so `Error` message and stack survive serialisation.
- The function is bundled, so `functions/dist/index.js` has no runtime dependencies beyond the Functions Framework.

## Environments

| Environment | Site                        | Gatsby env file        | Contact function                  |
| ----------- | --------------------------- | ---------------------- | --------------------------------- |
| Local       | localhost:8000              | `web/.env.development` | localhost:8080                    |
| Staging     | staging.joshwentworth.com   | `web/.env.staging`     | production `handleContactForm`    |
| Production  | joshwentworth.com           | `web/.env.production`  | production `handleContactForm`    |

`GATSBY_ACTIVE_ENV` selects the env file. Everything in those files is public.

Function secrets (`MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `FROM_EMAIL`, `TO_EMAIL`) are Secret Manager secrets mounted as environment variables by `.github/workflows/deploy-cloud-functions.yml`. That workflow is the only place the function's memory, instance limit and secrets are defined.

## Git Workflow and Deployment

```
feature_branch → staging → main
```

1. Branch from `staging`, PR into `staging`
2. Push to `staging` auto-deploys the site to `staging.joshwentworth.com`
3. After testing there, PR `staging → main`
4. Merge to `main` auto-deploys the site to `joshwentworth.com`, and the function if `functions/**` changed

Never push directly to `main`. Every change to `web/` or `functions/` needs a changeset (`npm run changeset`); versions bump automatically on merge.

## Hosting Notes (`firebase.json`)

- Pages are served at clean URLs (`/contact`), so the default `Cache-Control` is revalidate; fingerprinted JS/CSS and images override it with immutable caching. Rule order matters: later rules win.
- No catch-all rewrite: unknown URLs must return Gatsby's `404.html`.
- The staging target is a copy of production plus `X-Robots-Tag: noindex`. Change both together.
- The CSP only allows what the site loads today (self, Bunny Fonts, the function, Cloudflare Insights). Adding a third-party script means updating it.
- `firestore.rules` and `storage.rules` deny everything; nothing in this repo uses those services.

## Common Issues

1. **Gatsby build fails oddly:** `npm run clean`, then rebuild. Builds want Node 20 and several GB of RAM.
2. **Prettier flags every line on Windows:** the checkout has CRLF endings; `.gitattributes` forces LF, so re-checkout the files.
3. **Contact form returns 500 locally:** the Mailgun env vars are not set (see `functions/.env.example`).
