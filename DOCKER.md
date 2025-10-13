# Docker Development Setup

This project includes an **optional** Docker-based development environment to ensure consistent behavior across different operating systems, especially Windows where native Node.js development can have issues with certain packages.

**Note**: Docker is an alternative development workflow. The standard local development workflow using `npm install` and `npm run dev:web` remains fully supported and is the primary development method. Docker is provided as an option for developers who:
- Experience native module compilation issues on Windows
- Want a consistent development environment across different machines
- Prefer containerized development workflows

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### Start the development server

```bash
docker-compose up web
```

The Gatsby development server will be available at `http://localhost:8000`

### Start Firebase emulators

```bash
docker-compose up firebase-emulator
```

The Firebase emulator UI will be available at `http://localhost:4000`

### Start everything

```bash
docker-compose up
```

This will start both the web development server and Firebase emulators.

## Common Commands

### Build the Docker image

```bash
docker-compose build
```

### Rebuild from scratch (no cache)

```bash
docker-compose build --no-cache
```

### Stop all services

```bash
docker-compose down
```

### Stop and remove volumes (clean slate)

```bash
docker-compose down -v
```

### View logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs web
docker-compose logs firebase-emulator

# Follow logs in real-time
docker-compose logs -f web
```

### Execute commands inside the container

```bash
# Run a command
docker-compose exec web npm run build

# Open a shell
docker-compose exec web sh

# Run tests
docker-compose exec web npm test
```

### Install new dependencies

When you add new dependencies to `package.json`:

```bash
# Rebuild the container to install new dependencies
docker-compose build web

# Or, install without rebuilding
docker-compose exec web npm install
```

## Development Workflow

1. Start the development server:
   ```bash
   docker-compose up web
   ```

2. Make changes to your code - hot reloading is enabled

3. Run tests:
   ```bash
   docker-compose exec web npm test
   ```

4. Build for production:
   ```bash
   docker-compose exec web npm run build
   ```

5. When done, stop the containers:
   ```bash
   docker-compose down
   ```

## Ports

- **8000**: Gatsby development server
- **9000**: Gatsby serve (production preview)
- **5000**: Firebase hosting emulator
- **5001**: Firebase functions emulator
- **4000**: Firebase emulator UI
- **9005**: Firebase Auth emulator
- **8080**: Firebase Firestore emulator

## Volumes

The setup uses Docker volumes for `node_modules` directories to avoid Windows filesystem issues while still allowing hot reloading of source code:

- `web-node-modules`: Web workspace node_modules
- `functions-node-modules`: Functions workspace node_modules
- `root-node-modules`: Root workspace node_modules
- `gatsby-cache`: Gatsby cache directory
- `gatsby-public`: Gatsby public directory

## Troubleshooting

### Port already in use

If you get a "port already in use" error:

```bash
# Find and stop the process using the port (on Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change the port in docker-compose.yml
```

### Changes not reflecting

If hot reloading isn't working:

```bash
# Restart the container
docker-compose restart web

# Or rebuild
docker-compose up --build web
```

### Permission issues

If you encounter permission issues with files created by Docker:

```bash
# On Windows, this shouldn't be an issue
# On Linux/Mac, you may need to adjust ownership
docker-compose exec web chown -R node:node /app
```

### Clean everything and start fresh

```bash
# Stop containers and remove volumes
docker-compose down -v

# Remove Docker images
docker-compose rm -f

# Rebuild from scratch
docker-compose build --no-cache

# Start fresh
docker-compose up
```

## Why Docker?

- **Consistency**: Same environment across Windows, Mac, and Linux
- **Isolation**: Dependencies don't interfere with your local system
- **Node.js native modules**: Packages like `sharp` and `lmdb` that require native compilation work reliably
- **Easy onboarding**: New developers just need Docker
- **No "works on my machine" issues**
