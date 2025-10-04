.PHONY: help dev build serve clean kill status version-patch version-minor version-major deploy-staging deploy-prod firebase-serve firebase-login screenshot dev-functions test test-functions

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
	@echo "  make build            - Build production bundle"
	@echo "  make serve            - Serve production build (port 9000)"
	@echo "  make clean            - Clean Gatsby cache and build files"
	@echo "  make test             - Run web tests"
	@echo ""
	@echo "Functions Development:"
	@echo "  make dev-functions    - Start Functions development server (port 8080)"
	@echo "  make test-functions   - Run functions tests"
	@echo ""
	@echo "Process Management:"
	@echo "  make kill             - Kill all Node.js processes"
	@echo "  make status           - Check what's running on dev ports"
	@echo ""
	@echo "Versioning:"
	@echo "  make version-patch    - Bump patch version (1.0.0 -> 1.0.1)"
	@echo "  make version-minor    - Bump minor version (1.0.0 -> 1.1.0)"
	@echo "  make version-major    - Bump major version (1.0.0 -> 2.0.0)"
	@echo ""
	@echo "Firebase:"
	@echo "  make firebase-serve   - Serve Firebase hosting locally (port 5000)"
	@echo "  make firebase-login   - Login to Firebase"
	@echo "  make deploy-staging   - Build and deploy to staging"
	@echo "  make deploy-prod      - Build and deploy to production"
	@echo ""

# Web commands
dev:
	@echo "Starting Gatsby development server..."
	cd web && npm run develop

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

# Versioning
version-patch:
	@echo "Bumping patch version..."
	npm run version:patch

version-minor:
	@echo "Bumping minor version..."
	npm run version:minor

version-major:
	@echo "Bumping major version..."
	npm run version:major

# Process management
kill:
	@echo "Killing processes..."
	cd web && npm run clean || true

# Firebase commands
firebase-serve:
	@echo "Starting Firebase emulators..."
	npm run firebase:serve

firebase-login:
	@echo "Logging into Firebase..."
	npm run firebase:login

deploy-staging:
	@echo "Deploying to staging..."
	npm run deploy:staging

deploy-prod:
	@echo "Deploying to production..."
	npm run deploy:production
