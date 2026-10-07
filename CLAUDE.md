# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Josh Wentworth's professional portfolio: a static Gatsby site on Firebase Hosting behind Cloudflare. Keep it that small.

- **Stack:** Gatsby 5 + React 18 + Theme UI + TypeScript (`web/`)
- **No backend.** No Cloud Functions, database, authentication, analytics or forms.
- **Recordings are not in the repo.** `/recordings` loads a manifest and audio from the public `joshwentworth-recordings` Cloud Storage bucket in the browser (see Recordings below).
- **Contact is a `mailto:hello@joshwentworth.com` link.** The contact form and its Cloud Function were removed deliberately; do not reintroduce them.
- The resume builder and job tools live in the separate Job Finder app; `/resume-builder` and `/app` redirect there.

## Project Structure

```
portfolio/
├── web/                    # Gatsby site (the only npm workspace)
│   ├── src/
│   │   ├── components/     # homepage/*, elements/*, recordings/*, LegalPage (shared privacy/terms shell)
│   │   ├── content/        # MDX for homepage sections
│   │   ├── pages/          # index, projects/full-stack, recordings, privacy, terms, 404
│   │   ├── templates/      # home.tsx (parallax homepage)
│   │   └── gatsby-plugin-theme-ui/  # Theme
│   └── static/             # Static assets: only files the site references, plus manifest.webmanifest
│
├── firebase.json           # Hosting: production + staging targets, headers, redirects
├── .github/workflows/      # CI/CD
├── scripts/                # Changeset helper, screenshots, audio publishing
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
- The CSP only allows what the site loads today (self, Bunny Fonts, Cloudflare Insights, and Cloud Storage for the recordings manifest and audio). Adding a third-party script or API call means updating it.
- `/contact` redirects to `/` for old links.

## Recordings

`/recordings` (titled "Analog Synthesis") plays audio from the public bucket `gs://joshwentworth-recordings` (project `static-sites-257923`). The page loads the bucket's `index.json` from the browser on every visit, so publishing involves no build or deploy.

**Publish** with `npm run publish-audio -- <library-folder>` (add `--dry-run` to preview). It needs `ffmpeg`/`ffprobe` and an authenticated `gcloud` on PATH. The script (`scripts/publish-audio.js`) uploads the folder's audio and cover images (nothing else: the bucket is public, so notes and project files stay local), reads tags and durations, computes each waveform, and rewrites `index.json`.

- **Sections** are the first level of folders. `albums`, `tracks`, `dailies`, `stems` and `one-shots` appear in that order; any other folder name becomes a section after them.
- **Groups** are folders inside a section: an album, a song's stems, a sample pack. Audio directly in a section folder is listed without a group heading.
- **Layout** per section: `album` (cover and numbered tracks, the default for `albums`), `grid` (compact tiles, the default for `one-shots`), otherwise `list`.
- **Track details** come from the file's tags (title, track number, date, BPM, key), falling back to the file name. The date is a full date in the tags, else a leading `YYYY-MM-DD` in the name, else a tagged year. Audio must be inside a section folder. Leading numbers are track numbers when every file in the folder has a different one.
- **`meta.json`** in a folder is optional and overrides the above. In a group: `title`, `description`, `date`, `cover`. In a section: `title`, `description`, `layout`, `sort` (`name` or `newest`; applies to its tracks and its groups; groups are newest first by default, and numbered tracks follow their numbers unless `sort` is `newest`). In either: `tracks`, keyed by file name, to set a track's `title`, `number`, `date`, `bpm`, `key` or `description`.
- **Cover art** is `cover.jpg`/`.png`/`.webp` in an album folder.
- **Publishing is additive.** Tracks already in the bucket stay on the page even if they are not in the folder being published, so one new album can be published alone. A folder published without its `meta.json` keeps the details it was last published with; include the file to change or clear them. To remove something, delete it from the bucket and publish again.
- **Replacing a file** under the same name can take up to an hour to reach listeners (Cloud Storage caches public objects).

The `index.json` shape is the `Section` type in `web/src/utils/recordings.ts`; the script and that file share the bucket name and the waveform encoding, so change them together.

## Conventions

- **One web manifest:** `web/static/manifest.webmanifest`, linked from `Seo.tsx`. There is no manifest plugin.
- **Static assets:** `web/static` holds only what the site references. The full brand kit (all favicon variants, logo sources, individual icons) lives in `docs/brand`; copy a file over when the site starts using it.
- **Theme variants:** `gatsby-plugin-theme-ui/index.ts` only defines variants that are used. Add one when you need it rather than keeping spares.
- **Test mocks:** shared mocks for `Divider`, `Content`, `Inner`, `Svg` and `animations` live in `__mocks__` next to each module; tests call `jest.mock(path)` with no factory.

## Common Issues

1. **Gatsby build fails oddly:** `npm run clean`, then rebuild. Builds want Node 20 and several GB of RAM.
2. **Prettier flags every line on Windows:** the checkout has CRLF endings; `.gitattributes` forces LF, so re-checkout the files.
