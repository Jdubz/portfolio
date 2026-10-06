# Josh Wentworth - Portfolio

> **Software × Hardware × Fabrication**

A professional portfolio showcasing multidisciplinary engineering projects that blend software development, electronics design, and digital fabrication.

**Josh Wentworth**
_Multidisciplinary Engineer_

- **Email**: hello@joshwentworth.com
- **LinkedIn**: [linkedin.com/in/joshwentworth](https://linkedin.com/in/joshwentworth)
- **GitHub**: [github.com/joshwentworth](https://github.com/joshwentworth)

## Project Structure

An npm workspace with two packages:

```
portfolio/
├── web/                   # Gatsby static site
│   ├── src/
│   │   ├── pages/         # Homepage, contact, project and legal pages
│   │   ├── components/    # React components
│   │   ├── content/       # MDX content for homepage sections
│   │   └── gatsby-plugin-theme-ui/  # Theme UI theme
│   ├── static/            # Static assets
│   └── e2e/               # Playwright tests
│
├── functions/             # Contact form Cloud Function
│   └── src/
│       ├── index.ts       # HTTP handler: CORS, validation, honeypot
│       ├── rate-limit.ts  # Per-IP rate limiting
│       ├── email.ts       # Mailgun delivery
│       └── logger.ts      # Structured logging
│
├── firebase.json          # Hosting config (production + staging targets)
├── .github/workflows/     # CI and deployment
└── package.json           # Workspace root
```

## Built With

- **Web:** Gatsby 5, React 18, Theme UI, React Spring (parallax), MDX
- **Function:** Cloud Functions Gen 2 (Node.js 20), TypeScript, Joi, express-rate-limit, Mailgun, bundled with esbuild
- **Hosting:** Firebase Hosting behind Cloudflare

## Quick Start

Requires Node.js >= 20 and npm >= 10.

```bash
npm install            # Installs both workspaces

npm run dev            # Gatsby dev server on http://localhost:8000
npm run dev:functions  # Contact form function on http://localhost:8080
```

`web/.env.development` already points the contact form at the local function.
To actually send email locally, copy `functions/.env.example` to `functions/.env`,
fill it in and export the variables before starting the function.

## Checks

```bash
npm run lint           # Type-check, ESLint and Prettier for both packages
npm test               # Jest unit tests for both packages
npm run build          # Production Gatsby build
npm run firebase:serve # Serve the build with the hosting rules in firebase.json

cd web && npm run test:e2e   # Playwright (needs a build; mocks the function)
```

`make help` lists the same commands as make targets.

## Deployment

Deployment is automatic:

| Trigger                                 | Result                                                 |
| --------------------------------------- | ------------------------------------------------------ |
| Push to `staging`                       | Site deployed to https://staging.joshwentworth.com     |
| Push to `main`                          | Site deployed to https://joshwentworth.com             |
| Push to `main` touching `functions/**`  | `handleContactForm` function redeployed                |
| Pull request to `main`                  | Lint, tests, and a temporary Firebase preview URL      |
| Any pull request                        | Claude code review, posted as a sha-stamped comment    |

Workflow: `feature → staging → main`. Staging shares the production contact form function.

Manual hosting deploys, if ever needed: `make deploy-staging` / `make deploy-prod`.
The function's memory, instance limit and secrets are defined only in
`.github/workflows/deploy-cloud-functions.yml`.

## Versioning

Versions are managed with [Changesets](./.changeset/README.md). Run `npm run changeset`
with any change to `web/` or `functions/`; versions are bumped automatically on merge to `main`.

## Documentation

- [functions/README.md](./functions/README.md) - Contact form function
- [docs/brand/README.md](./docs/brand/README.md) - Brand identity and assets
- [docs/DEVELOPMENT_WORKFLOW.md](./docs/DEVELOPMENT_WORKFLOW.md) - Git workflow

## License

0BSD - See [LICENSE](./LICENSE)
