# Migration Archive

This directory contains historical documentation from the migration of AI resume generation features from the portfolio project to the separate job-finder application.

## Migration Summary

In October 2024, the AI-powered resume and cover letter generation features were extracted from this portfolio project and moved to a dedicated job-finder application. This migration separated concerns and allowed for better scalability and independent development.

## What Was Migrated

### Features Moved to Job-Finder
- AI resume generation (OpenAI GPT-4o & Google Gemini)
- Cover letter generation
- PDF export with custom branding
- Generator defaults and customization
- Generator history tracking
- Resume upload functionality
- AI provider abstraction layer
- PDF generation service
- Cloud Storage integration

### What Remains in Portfolio
- Static portfolio website (Gatsby)
- Contact form
- Experience/blurbs/content management (for editors)
- Job queue integration (submits jobs to job-finder)
- Job matches display (reads results from job-finder)

## Documents in This Archive

- **MIGRATION_COMPLETE.md** - Final migration completion report
- **MIGRATION_PLAN_TWO_WORKERS.md** - Original migration strategy
- **MIGRATION_SUMMARY.md** - High-level migration overview
- **MIGRATION_STATUS.md** - Intermediate migration status
- **WORKER_A_COMPLETE.md** - Worker A completion report
- **WORKER_B_COMPLETE.md** - Worker B completion report
- **job-finder-fe-migration-plan.md** - Frontend migration plan
- **job-finder-discovery-inventory.md** - Discovery phase inventory

## Related Projects

- **Portfolio** (this repo): `https://github.com/your-username/portfolio`
- **Job-Finder**: Python application handling job discovery and AI matching
- **Shared Types**: `@jdubz/job-finder-shared-types` - TypeScript types shared between projects

## Date Archived

November 3, 2024

---

These documents are kept for historical reference and to understand the architecture evolution of both projects.
