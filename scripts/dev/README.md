# Development Utilities

Scripts for Firebase emulator testing, debugging, and local development workflow.

## Firebase Emulator Scripts

### Authentication & Authorization

**`get-auth-token.sh`** - Get Firebase Auth ID token via password auth
```bash
./scripts/dev/get-auth-token.sh [email]
./scripts/dev/get-auth-token.sh contact@joshwentworth.com
```

**`get-emulator-token.js`** - Get Firebase Auth ID token via emulator API
```bash
node scripts/dev/get-emulator-token.js [email]
node scripts/dev/get-emulator-token.js contact@joshwentworth.com
```

**`set-editor-role.js`** - Set 'editor' custom claim on user
```bash
node scripts/dev/set-editor-role.js <email>
node scripts/dev/set-editor-role.js contact@joshwentworth.com
```

### Data Management

**`save-emulator-data.sh`** - Export emulator data to `./emulator-data/`
```bash
./scripts/dev/save-emulator-data.sh
```
Exports:
- Auth users → `emulator-data/auth_export.json`
- Firestore data → `emulator-data/firestore_export/`

Data automatically loads on emulator restart (configured in `firebase.json`).

## Other Development Scripts

See parent `scripts/` directory:
- `generate-test-token.js` - Generate test auth tokens
- `seed-emulator.js` - Seed emulator with test data
- `check-mailgun-delivery.sh` - Check email delivery status
- `update-email-secret.sh` - Update email secrets in GCP

## Firebase Emulator UI

- **Auth**: http://localhost:4000/auth
- **Firestore**: http://localhost:4000/firestore
- **Functions**: http://localhost:4000/logs
- **All Services**: http://localhost:4000

## Usage

Start Firebase emulators:
```bash
make firebase-serve
# or
npm run firebase:serve
```

## Testing Workflow

1. **Start emulators** (if not running)
2. **Sign in to app** to create user account
3. **Set editor role** for testing protected routes:
   ```bash
   node scripts/dev/set-editor-role.js your-email@example.com
   ```
4. **Get auth token** for API testing:
   ```bash
   node scripts/dev/get-emulator-token.js your-email@example.com
   ```
5. **Save data** between sessions:
   ```bash
   ./scripts/dev/save-emulator-data.sh
   ```

## E2E Tests

Use Playwright instead of manual scripts:
```bash
cd web
npm run test:e2e         # Run tests headless
npm run test:e2e:ui      # Run with UI
npm run test:e2e:debug   # Debug mode
```
