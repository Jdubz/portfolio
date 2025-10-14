---
"josh-wentworth-portfolio": patch
---

fix: handle Firestore Timestamps in document history table

Fixed "Invalid Date" display in document history tab by properly converting Firestore Timestamp objects to JavaScript dates. The formatDate function now handles both Firestore Timestamp objects ({_seconds, _nanoseconds}) and ISO date strings.
