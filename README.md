# Josh Wentworth - Portfolio

> **Software × Hardware × Fabrication**

A professional portfolio showcasing multidisciplinary engineering projects that blend software development, electronics design, and digital fabrication.

**Josh Wentworth**
_Multidisciplinary Engineer_

- **Email**: hello@joshwentworth.com
- **LinkedIn**: [linkedin.com/in/joshwentworth](https://linkedin.com/in/joshwentworth)
- **GitHub**: [github.com/joshwentworth](https://github.com/joshwentworth)

## Project Structure

A static Gatsby site. There is no backend: contact is a `mailto:` link.

```
portfolio/
├── web/                   # Gatsby static site (npm workspace)
│   ├── src/
│   │   ├── pages/         # Homepage, project and legal pages
│   │   ├── components/    # React components
│   │   ├── content/       # MDX content for homepage sections
│   │   └── gatsby-plugin-theme-ui/  # Theme UI theme
│   └── static/            # Static assets
│
├── firebase.json          # Hosting config (production + staging targets)
├── .github/workflows/     # CI and deployment
├── scripts/               # Changeset helper, screenshots, image optimisation
└── package.json           # Workspace root
```

## Built With

- Gatsby 5, React 18, Theme UI, React Spring (parallax), MDX
- Firebase Hosting behind Cloudflare

## Quick Start

Requires Node.js >= 20 and npm >= 10.

```bash
npm install     # Installs the workspace
npm run dev     # Gatsby dev server on http://localhost:8000
```

## Checks

```bash
npm run lint           # Type-check, ESLint and Prettier
npm test               # Jest unit tests
npm run build          # Production Gatsby build
npm run firebase:serve # Serve the build with the hosting rules in firebase.json
```

`make help` lists the same commands as make targets.

## Deployment

Deployment is automatic:

| Trigger                | Result                                                |
| ---------------------- | ----------------------------------------------------- |
| Push to `staging`      | Site deployed to https://staging.joshwentworth.com    |
| Push to `main`         | Site deployed to https://joshwentworth.com            |
| Pull request to `main` | Lint, tests, and a temporary Firebase preview URL     |
| Any pull request       | Claude code review, posted as a sha-stamped comment   |

Workflow: `feature → staging → main`.

Manual hosting deploys, if ever needed: `make deploy-staging` / `make deploy-prod`.

## Versioning

Versions are managed with [Changesets](./.changeset/README.md). Run `npm run changeset`
with any change to `web/`; versions are bumped automatically on merge to `main`.

## Documentation

- [docs/brand/README.md](./docs/brand/README.md) - Brand identity and assets
- [docs/DEVELOPMENT_WORKFLOW.md](./docs/DEVELOPMENT_WORKFLOW.md) - Git workflow

## License

0BSD - See [LICENSE](./LICENSE)
