# Network Development Setup

This guide explains how to run the Gatsby client on a different machine than the Firebase emulators for cross-device testing.

## Overview

The development setup supports two configurations:
- **Local**: Emulators and client on the same machine (default)
- **Network**: Emulators on one machine, client on another (e.g., testing on mobile device or separate laptop)

## Quick Start

### Server Machine (Running Emulators)

1. **Start Firebase Emulators** (already listening on `0.0.0.0` - accessible from network):
   ```bash
   make firebase-emulators
   ```

   Emulators will be available at:
   - Auth: `http://192.168.86.35:9099`
   - Functions: `http://192.168.86.35:5001`
   - Firestore: `http://192.168.86.35:8080`
   - UI: `http://192.168.86.35:4000`

2. **Start Gatsby Dev Server** (also accessible from network):
   ```bash
   cd web && npm run develop
   ```

   The site will be available at:
   - Local: `http://localhost:8000`
   - Network: `http://192.168.86.35:8000`

### Client Machine (Different Device)

1. **Copy the network config**:
   ```bash
   cd web
   cp .env.development.network .env.development
   ```

2. **Start the Gatsby dev server**:
   ```bash
   npm run develop
   ```

3. **Access the site**:
   - Open browser to: `http://192.168.86.35:8000`
   - Or on the client machine: `http://localhost:8000`

## Configuration Details

### Environment Variables

The `GATSBY_EMULATOR_HOST` variable controls which host the client connects to:

**Local Development** (`.env.development` default):
```env
GATSBY_EMULATOR_HOST=localhost
```

**Network Development** (`.env.development.network`):
```env
GATSBY_EMULATOR_HOST=192.168.86.35
```

### What Gets Updated

The `GATSBY_EMULATOR_HOST` variable is used by:

1. **Firebase Auth Emulator** (`useAuth.ts`):
   ```typescript
   connectAuthEmulator(auth, `http://${emulatorHost}:9099`)
   ```

2. **Experience API** (`useExperienceAPI.ts`):
   ```typescript
   return `http://${emulatorHost}:5001/static-sites-257923/us-central1/manageExperience`
   ```

3. **Contact Form** (via `GATSBY_CONTACT_FUNCTION_URL` in `.env.development`):
   ```env
   GATSBY_CONTACT_FUNCTION_URL=http://192.168.86.35:5001/static-sites-257923/us-central1/handleContactForm
   ```

## Network IP Discovery

To find your current network IP:

```bash
hostname -I | awk '{print $1}'
```

If your IP changes, update:
- `.env.development.network`
- `.env.development` (if using network mode)

## Switching Between Modes

### Switch to Network Mode:
```bash
cd web
cp .env.development.network .env.development
npm run develop
```

### Switch to Local Mode:
```bash
cd web
git restore .env.development  # Restore default localhost config
npm run develop
```

## Firewall Configuration

If the client can't connect to emulators, ensure these ports are open on the server machine:

- **8000** - Gatsby dev server
- **5001** - Cloud Functions emulator
- **9099** - Auth emulator
- **8080** - Firestore emulator
- **4000** - Emulator UI

### Ubuntu/Debian:
```bash
sudo ufw allow 8000
sudo ufw allow 5001
sudo ufw allow 9099
sudo ufw allow 8080
sudo ufw allow 4000
```

### macOS:
System Preferences → Security & Privacy → Firewall → Firewall Options → Allow incoming connections for node

## Testing from Mobile Device

1. **Ensure both devices are on the same network**
2. **On server machine**: Start emulators and dev server
3. **On mobile device**:
   - Open browser
   - Navigate to: `http://192.168.86.35:8000`
   - Test the Experience page: `http://192.168.86.35:8000/experience/`

## Troubleshooting

### Client shows "Connection Refused" errors

**Check emulators are running:**
```bash
lsof -i :5001 -i :9099 -i :8080
```

**Verify network connectivity:**
```bash
ping 192.168.86.35
curl http://192.168.86.35:5001/static-sites-257923/us-central1/manageExperience/experience/entries
```

### "Invalid API Key" error

Make sure `.env.development` has:
```env
GATSBY_FIREBASE_API_KEY=fake-api-key-for-emulator
GATSBY_USE_FIREBASE_EMULATORS=true
GATSBY_EMULATOR_HOST=192.168.86.35
```

### Mobile device can't access site

1. Check firewall allows port 8000
2. Ensure both devices on same WiFi network
3. Verify IP with `hostname -I`
4. Try accessing emulator UI: `http://192.168.86.35:4000`

## Production Note

These network configurations are **only for development**. Production builds automatically use the correct production Firebase configuration and Cloud Function URLs from environment variables.
