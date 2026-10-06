# Scripts

| Script                       | Purpose                                                        | Run with                                         |
| ---------------------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| `auto-changeset.js`          | Prompts for a changeset when a commit changes `web/` or `functions/` | Runs from the pre-commit hook; `npm run changeset:auto` |
| `screenshot/capture.js`      | Captures component screenshots with Playwright                 | `make screenshot` (also `-ci`, `-quick`)         |
| `optimize-images.js`         | Generates WebP variants of images in `web/static`              | `npm run optimize:images`                        |
| `generate-banner.py`         | Regenerates the social sharing banner                          | `python scripts/generate-banner.py`              |
| `post-review-verdict.sh`     | Posts the Claude review verdict comment for a commit           | Called by `.github/workflows/claude-code-review.yml` |
| `update-email-secret.sh`     | Changes the contact form recipient (`to-email` secret)         | `./scripts/update-email-secret.sh <email>`       |
| `check-mailgun-delivery.sh`  | Looks up recent Mailgun delivery events                        | `./scripts/check-mailgun-delivery.sh`            |

Day-to-day commands (dev, build, lint, test, deploy) are npm scripts in the root `package.json`, with `make` aliases; see `make help`.
