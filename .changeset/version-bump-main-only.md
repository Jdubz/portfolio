---
"josh-wentworth-portfolio": patch
"contact-form-function": patch
---

Configure version bumps to only run on main branch

Changed auto version bump workflow to follow industry standard:
- Version bumps now only occur when merging to main
- Staging keeps changesets for review
- Prevents duplicate version bumps
- Cleaner release workflow

This is the standard changesets pattern used across the industry.
