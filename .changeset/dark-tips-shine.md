---
"josh-wentworth-portfolio": patch
"contact-form-function": patch
---

Fix React hooks error and image upload signed URL expiration

- Fixed React error #418 (hook order change) and #423 (update during render) in document builder by batching setState calls
- Reduced image upload signed URL expiration from 1 year to 7 days to comply with GCS maximum
- Improved Firestore listener performance by extracting values before state updates
