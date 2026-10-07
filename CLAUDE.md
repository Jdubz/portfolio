# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Josh Wentworth's professional portfolio: a static Gatsby site on Firebase Hosting behind Cloudflare. Keep it that small.

- **Stack:** Gatsby 5 + React 18 + Theme UI + TypeScript (`web/`)
- **No backend.** No Cloud Functions, database, authentication, analytics or forms.
- **Contact is a `mailto:hello@joshwentworth.com` link.** The contact form and its Cloud Function were removed deliberately; do not reintroduce them.
- The resume builder and job tools live in the separate Job Finder app; `/resume-builder` and `/app` redirect there.

## Project Structure

```
portfolio/
├── web/                    # Gatsby site (the only npm workspace)
│   ├── src/
│   │   ├── components/     # homepage/*, elements/*
│   │   ├── content/        # MDX for homepage sections
│   │   ├── pages/          # index, projects/full-stack, privacy, terms, 404
│   │   ├── templates/      # home.tsx (parallax homepage)
│   │   └── gatsby-plugin-theme-ui/  # Theme
│   └── static/             # Static assets
│
├── firebase.json           # Hosting: production + staging targets, headers, redirects
├── .github/workflows/      # CI/CD
├── scripts/                # Changeset helper, screenshots, image optimisation
└── Makefile                # Thin aliases for npm scripts (`make help`)
```

## Commands

```bash
npm run dev             # Gatsby dev server (port 8000)
npm run lint            # tsc + ESLint + Prettier
npm test                # Jest
npm run build           # Production Gatsby build
npm run firebase:serve  # Hosting emulator for the built site (port 5000)
```

Run `npm run lint && npm test` before finishing a change; CI runs both on every PR and before every deploy.

## Environments

| Environment | Site                      | `GATSBY_ACTIVE_ENV` |
| ----------- | ------------------------- | ------------------- |
| Local       | localhost:8000            | unset               |
| Staging     | staging.joshwentworth.com | `staging`           |
| Production  | joshwentworth.com         | `production`        |

There are no `.env` files. `GATSBY_ACTIVE_ENV` is set by the deploy workflow and only selects which Job Finder URL the menu links to.

## Git Workflow and Deployment

```
feature_branch → staging → main
```

1. Branch from `staging`, PR into `staging`
2. Push to `staging` auto-deploys to `staging.joshwentworth.com`
3. After testing there, PR `staging → main`
4. Merge to `main` auto-deploys to `joshwentworth.com`

Every PR gets an automated Claude review (`.github/workflows/claude-code-review.yml`). It runs on the Claude subscription via the `CLAUDE_CODE_OAUTH_TOKEN` secret, never an API key. The workflow, not the model, posts the verdict as `## Claude review — <sha>`, including whether every changed file was read (the lockfile is checked against the `package.json` changes rather than line by line); a green check with no verdict comment for the head commit means the review did not run. Re-run with `gh run rerun <id>`.

Never push directly to `main`. Every change to `web/` needs a changeset (`npm run changeset`); versions bump automatically on merge.

## Hosting Notes (`firebase.json`)

- Pages are served at clean URLs (`/privacy`), so the default `Cache-Control` is revalidate; fingerprinted JS/CSS and images override it with immutable caching. Rule order matters: later rules win.
- No catch-all rewrite: unknown URLs must return Gatsby's `404.html`.
- The staging target is a copy of production plus `X-Robots-Tag: noindex`. Change both together.
- The CSP only allows what the site loads today (self, Bunny Fonts, Cloudflare Insights). Adding a third-party script or API call means updating it.
- `/contact` redirects to `/` for old links.
- `firestore.rules` and `storage.rules` deny everything; nothing in this repo uses those services.

## Common Issues

1. **Gatsby build fails oddly:** `npm run clean`, then rebuild. Builds want Node 20 and several GB of RAM.
2. **Prettier flags every line on Windows:** the checkout has CRLF endings; `.gitattributes` forces LF, so re-checkout the files.
