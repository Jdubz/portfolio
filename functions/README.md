# Contact Form Cloud Function

A single HTTP Cloud Function (Gen 2, Node.js 20) that emails contact form submissions from the portfolio site via Mailgun.

## Request Flow

1. CORS allowlist (`joshwentworth.com`, `www`, `staging`, localhost)
2. `GET /health` returns status and version
3. Rate limit: 5 requests per 15 minutes per IP
4. Validation (Joi)
5. Honeypot check: bots get a fake success and no email is sent
6. Email sent to the site owner with `Reply-To` set to the sender

Nothing is stored. Form contents are never written to logs.

## Source

```
src/
├── index.ts       # Handler and entry point (handleContactForm)
├── rate-limit.ts  # Rate limiter and client IP detection
├── email.ts       # Mailgun delivery and email templates
├── logger.ts      # Structured JSON logging for Cloud Logging
└── __tests__/
```

## Development

Run from the repository root (this is an npm workspace):

```bash
npm run dev:functions    # Bundle and serve on http://localhost:8080
npm run test:functions   # Jest
npm run lint:functions   # tsc --noEmit + ESLint
npm run build:functions  # esbuild bundle -> dist/index.js
```

Try it:

```bash
curl http://localhost:8080/health

curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Hello from local development"}'
```

Sending needs the variables in [.env.example](./.env.example) exported in your shell; without them the POST returns 500 and logs which ones are missing.

## API

### `POST /`

```json
{ "name": "1-100 chars", "email": "valid email", "message": "10-2000 chars", "honeypot": "" }
```

| Status | `error`               | Meaning                                  |
| ------ | --------------------- | ---------------------------------------- |
| 200    | -                     | Sent (or silently dropped as a bot)      |
| 400    | `VALIDATION_FAILED`   | `message` describes the first problem    |
| 405    | `METHOD_NOT_ALLOWED`  | Not a POST                               |
| 429    | `RATE_LIMIT_EXCEEDED` | Too many requests from this IP           |
| 500    | `INTERNAL_ERROR`      | Email could not be sent; see logs        |

Every JSON response includes `success`, and all but 429 include a `requestId` that appears in the logs.

The validation limits are duplicated in `web/src/components/ContactForm.tsx`; change both together.

## Deployment

Pushing to `main` with changes under `functions/` runs
[`.github/workflows/deploy-cloud-functions.yml`](../.github/workflows/deploy-cloud-functions.yml), which lints, tests, bundles and deploys with `gcloud`. That workflow is the single source of truth for memory, timeout, max instances and secrets.

The deployed package is the esbuild bundle plus a generated `package.json` that depends only on the Functions Framework, so dependency versions come from the root `package-lock.json`.

`max-instances` is deliberately low: rate-limit counters live in memory per instance.

## Configuration

Environment variables, mounted from Secret Manager in production:

| Variable          | Secret            |
| ----------------- | ----------------- |
| `MAILGUN_API_KEY` | `mailgun-api-key` |
| `MAILGUN_DOMAIN`  | `mailgun-domain`  |
| `FROM_EMAIL`      | `from-email`      |
| `TO_EMAIL`        | `to-email`        |

`./setup-secrets.sh` creates the secrets; `../scripts/update-email-secret.sh` changes the recipient.

## Troubleshooting

```bash
npm run logs --workspace=functions   # Recent Cloud Logging entries
make health-check                    # From the repo root: GET /health on production
```

- **500 on submit:** look for the `Contact form request failed` log entry with the same `requestId`. A Mailgun `status: 401` means the API key secret is wrong; `Missing email configuration` names unset variables.
- **Emails accepted but not arriving:** `../scripts/check-mailgun-delivery.sh`.
- **429 for everyone:** the client IP is read from the last `X-Forwarded-For` entry; if the function is ever put behind another proxy, that entry becomes the proxy.
