---
"josh-wentworth-portfolio": patch
"contact-form-function": patch
---

Production-ready release: generator improvements, database fixes, and documentation cleanup

**Generator Improvements:**
- Remove Firestore listener in favor of API-based progress updates
- Fix download URLs and step progress returned directly from API
- Resolve 400 Bad Request errors on staging by using correct database

**Critical Database Fix:**
- Fix firestore.service.ts to use environment-aware DATABASE_ID instead of hardcoded "portfolio"
- Contact form now correctly routes to portfolio-staging in staging environment
- Prevents staging submissions from going to production database

**Documentation Cleanup:**
- Delete 19 obsolete files (audit docs, archive folder, temp refactor docs)
- Update generator/PLAN.md to mark Progressive Generation UI as complete
- Add Frontend Terminology Migration task (defaults → personalInfo)
- Reorganize docs/README.md with cleaner 3-type structure (Architecture, Setup, Plans)

**Database Migration:**
- Complete Firestore migration: generator/default → generator/personal-info
- Applied to both staging and production databases
- Backend fully supports new terminology with backward-compatible deprecated aliases
