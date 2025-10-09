.PHONY: help dev dev-clean build serve clean kill status changeset deploy-staging deploy-prod deploy-function firebase-serve firebase-login firebase-emulators firebase-emulators-ui firebase-functions-shell test-contact-form test-contact-form-all test-experience-api seed-emulators screenshot screenshot-ci screenshot-quick dev-functions test test-functions lint lint-fix lint-web lint-web-fix lint-functions lint-functions-fix

# Detect OS
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
	OS = Linux
endif
ifeq ($(UNAME_S),Darwin)
	OS = macOS
endif
ifneq (,$(findstring MINGW,$(UNAME_S)))
	OS = Windows
endif
ifneq (,$(findstring MSYS,$(UNAME_S)))
	OS = Windows
endif
ifneq (,$(findstring CYGWIN,$(UNAME_S)))
	OS = Windows
endif

help:
	@echo "Monorepo Development Commands"
	@echo "=============================="
	@echo ""
	@echo "Web Development:"
	@echo "  make dev              - Start Gatsby development server (port 8000)"
	@echo "  make dev-clean        - Clean cache and start fresh dev server"
	@echo "  make build            - Build production bundle"
	@echo "  make serve            - Serve production build (port 9000)"
	@echo "  make clean            - Clean Gatsby cache and build files"
	@echo "  make test             - Run web tests"
	@echo "  make screenshot       - Generate component screenshots (full quality)"
	@echo "  make screenshot-ci    - Generate screenshots (CI mode - fast, lower quality)"
	@echo "  make screenshot-quick - Generate screenshots (skip build, use existing)"
	@echo "  make lint-web         - Lint web code (TypeScript, ESLint, Prettier)"
	@echo "  make lint-web-fix     - Auto-fix web linting issues"
	@echo ""
	@echo "Functions Development:"
	@echo "  make dev-functions    - Start Functions development server (port 8080)"
	@echo "  make test-functions   - Run functions tests"
	@echo "  make lint-functions   - Lint functions code"
	@echo "  make lint-functions-fix - Auto-fix functions linting issues"
	@echo ""
	@echo "Linting (All):"
	@echo "  make lint             - Lint all code (web + functions)"
	@echo "  make lint-fix         - Auto-fix all linting issues"
	@echo ""
	@echo "Process Management:"
	@echo "  make kill             - Clean Gatsby cache (stops dev server indirectly)"
	@echo ""
	@echo "Versioning (Changesets):"
	@echo "  make changeset        - Create a new changeset for versioning"
	@echo ""
	@echo "Firebase:"
	@echo "  make firebase-serve        - Serve Firebase hosting locally (port 5000)"
	@echo "  make firebase-emulators    - Start all Firebase emulators (hosting, functions, firestore)"
	@echo "  make firebase-emulators-ui - Start emulators with UI dashboard (port 4000)"
	@echo "  make firebase-functions-shell - Start interactive Functions shell for testing"
	@echo "  make firebase-login        - Login to Firebase"
	@echo "  make seed-emulators        - Seed emulators with test users and data"
	@echo "  make test-contact-form     - Test contact form function (single quick test)"
	@echo "  make test-contact-form-all - Run comprehensive contact form test suite"
	@echo "  make test-experience-api   - Test experience API with auth (auto-seeds data)"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy-staging        - Build and deploy to staging"
	@echo "  make deploy-prod           - Build and deploy to production"
	@echo "  make deploy-function FUNC=<name> - Deploy single Cloud Function with correct build SA"
	@echo ""

# Web commands
dev:
	@echo "Starting Gatsby development server (port 8000)..."
	@echo "Watch patterns optimized - ignoring build artifacts, screenshots, logs"
	cd web && npm run develop

dev-clean:
	@echo "Cleaning cache and starting fresh development server..."
	cd web && npm run clean && npm run develop

build:
	@echo "Building production bundle..."
	cd web && npm run build

serve:
	@echo "Serving production build..."
	cd web && npm run serve

clean:
	@echo "Cleaning Gatsby cache..."
	cd web && npm run clean

test:
	@echo "Running web tests..."
	cd web && npm test

# Functions commands
dev-functions:
	@echo "Starting Functions development server..."
	cd functions && npm run dev

test-functions:
	@echo "Running functions tests..."
	cd functions && npm test

# Versioning with Changesets
changeset:
	@echo "Creating a new changeset..."
	@echo "This will prompt you to:"
	@echo "1. Select which packages changed"
	@echo "2. Choose version bump type (patch/minor/major)"
	@echo "3. Write a summary of changes"
	@echo ""
	npm run changeset

# Process management
kill:
	@echo "Killing all dev servers and emulators..."
	@echo "Stopping Gatsby dev server (port 8000)..."
	@lsof -ti:8000 | xargs kill -9 2>/dev/null || true
	@echo "Stopping Gatsby serve (port 9000)..."
	@lsof -ti:9000 | xargs kill -9 2>/dev/null || true
	@echo "Stopping Functions dev server (port 8080)..."
	@lsof -ti:8080 | xargs kill -9 2>/dev/null || true
	@echo "Stopping Firebase Hosting emulator (port 5000)..."
	@lsof -ti:5000 | xargs kill -9 2>/dev/null || true
	@echo "Stopping Firebase Functions emulator (port 5001)..."
	@lsof -ti:5001 | xargs kill -9 2>/dev/null || true
	@echo "Stopping Firebase Emulator UI (port 4000)..."
	@lsof -ti:4000 | xargs kill -9 2>/dev/null || true
	@echo "Stopping Firebase Auth emulator (port 9099)..."
	@lsof -ti:9099 | xargs kill -9 2>/dev/null || true
	@echo "Cleaning Gatsby cache..."
	@cd web && npm run clean || true
	@echo "✓ All dev servers stopped and cache cleaned"

# Firebase commands
firebase-serve:
	@echo "Starting Firebase hosting emulator (port 5000)..."
	@echo "This serves the static site only, without functions"
	firebase serve --only hosting

firebase-emulators:
	@echo "Starting all Firebase emulators..."
	@echo "- Hosting:   http://localhost:5000"
	@echo "- Functions: http://localhost:5001"
	@echo "- Firestore: http://localhost:8080"
	@echo "- UI:        http://localhost:4000"
	@cd functions && npm run build
	firebase emulators:start

firebase-emulators-ui:
	@echo "Starting Firebase emulators with UI dashboard..."
	@cd functions && npm run build
	firebase emulators:start --ui

firebase-emulators-functions:
	@echo "Starting Firebase Functions emulator only (no Java required)..."
	@echo "- Functions: http://localhost:5001"
	@echo "- UI:        http://localhost:4000"
	@cd functions && npm run build
	firebase emulators:start --only functions,hosting

firebase-functions-shell:
	@echo "Starting interactive Firebase Functions shell..."
	@echo "Usage: handleContactForm({data: {name: 'Test', email: 'test@example.com', message: 'Test message'}})"
	@cd functions && npm run build
	firebase functions:shell

firebase-login:
	@echo "Logging into Firebase..."
	firebase login

test-contact-form:
	@echo "Testing contact form function locally..."
	@echo "Building function..."
	@cd functions && npm run build
	@echo ""
	@echo "Testing contact form submission..."
	@curl -s -X POST http://localhost:5001/static-sites-257923/us-central1/handleContactForm \
		-H "Content-Type: application/json" \
		-d '{"name": "Test User", "email": "test@example.com", "message": "This is a test message from the Makefile"}' \
		| jq . || echo "\n⚠️  Emulators not running. Start with: make firebase-emulators"

test-contact-form-all:
	@echo "Running comprehensive contact form test suite..."
	@./test-contact-form.sh emulator

seed-emulators:
	@echo "Seeding Firebase emulators with test data..."
	@echo "This will create test users and sample experience entries"
	@node scripts/seed-emulator.js

test-experience-api:
	@echo "Testing Experience API with authenticated endpoints..."
	@echo "This will auto-seed data and generate a test token"
	@./test-experience-auth.sh --auto

deploy-staging:
	@echo "Deploying to staging..."
	npm run deploy:staging

deploy-prod:
	@echo "Deploying to production..."
	npm run deploy:production

deploy-function:
	@if [ -z "$(FUNC)" ]; then \
		echo "Error: Function name required"; \
		echo "Usage: make deploy-function FUNC=<function-name>"; \
		echo ""; \
		echo "Available functions:"; \
		echo "  - uploadResume"; \
		echo "  - manageExperience"; \
		echo "  - handleContactForm"; \
		exit 1; \
	fi
	@echo "Deploying Cloud Function: $(FUNC)"
	@echo "Using build service account: cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com"
	@echo ""
	@gcloud functions deploy $(FUNC) \
		--gen2 \
		--runtime=nodejs20 \
		--region=us-central1 \
		--source=functions \
		--entry-point=$(FUNC) \
		--trigger-http \
		--build-service-account=projects/static-sites-257923/serviceAccounts/cloud-functions-builder@static-sites-257923.iam.gserviceaccount.com \
		--project=static-sites-257923
	@echo ""
	@echo "✅ Function deployed successfully!"
	@echo "URL: https://us-central1-static-sites-257923.cloudfunctions.net/$(FUNC)"

# Screenshots
screenshot:
	@echo "Generating component screenshots (full quality)..."
	cd web && npm run screenshot

screenshot-ci:
	@echo "Generating component screenshots (CI mode - fast & optimized)..."
	cd web && CI_MODE=true SKIP_BUILD=false npm run screenshot

screenshot-quick:
	@echo "Generating component screenshots (using existing build)..."
	cd web && SKIP_BUILD=true npm run screenshot

# Linting
lint-web:
	@echo "Linting web code..."
	cd web && npm run lint

lint-web-fix:
	@echo "Auto-fixing web linting issues..."
	cd web && npm run lint:fix

lint-functions:
	@echo "Linting functions code..."
	cd functions && npm run lint

lint-functions-fix:
	@echo "Auto-fixing functions linting issues..."
	cd functions && npm run lint:fix

lint: lint-web lint-functions

lint-fix: lint-web-fix lint-functions-fix
