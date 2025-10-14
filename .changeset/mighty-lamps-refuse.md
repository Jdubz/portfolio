---
"josh-wentworth-portfolio": patch
"contact-form-function": patch
---

Fix document generator by removing Firestore listener and returning URLs from API

- Removed broken Firestore listener that was causing 400 Bad Request errors by connecting to wrong database
- Updated backend `handleExecuteStep` to return download URLs and step progress in API response
- Updated frontend to extract URLs and progress directly from API instead of Firestore subscription
- Fixed missing download buttons and checklist not updating on staging
- API now provides complete real-time updates without needing Firestore subscriptions
