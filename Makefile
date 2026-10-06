.PHONY: help dev dev-clean build serve clean test lint lint-fix dev-functions test-functions \
	changeset firebase-serve firebase-login deploy-staging deploy-prod health-check screenshot screenshot-ci screenshot-quick

FUNCTION_URL = https://us-central1-static-sites-257923.cloudfunctions.net/handleContactForm

help:
	@echo "Web:"
	@echo "  make dev              - Start Gatsby development server (port 8000)"
	@echo "  make dev-clean        - Clean cache and start fresh dev server"
	@echo "  make build            - Build production bundle"
	@echo "  make serve            - Serve production build (port 9000)"
	@echo "  make clean            - Clean Gatsby cache and build files"
	@echo "  make screenshot       - Generate component screenshots (also -ci, -quick)"
	@echo ""
	@echo "Contact form function:"
	@echo "  make dev-functions    - Build and run the function locally (port 8080)"
	@echo "  make health-check     - Check the deployed function"
	@echo ""
	@echo "All packages:"
	@echo "  make test             - Run web and functions tests"
	@echo "  make test-functions   - Run functions tests only"
	@echo "  make lint             - Type-check and lint web and functions"
	@echo "  make lint-fix         - Auto-fix lint issues"
	@echo "  make changeset        - Create a changeset for versioning"
	@echo ""
	@echo "Firebase:"
	@echo "  make firebase-serve   - Serve the built site with production hosting rules (port 5000)"
	@echo "  make firebase-login   - Login to Firebase"
	@echo "  make deploy-staging   - Build and deploy hosting to staging manually (CI does this on push to staging)"
	@echo "  make deploy-prod      - Build and deploy hosting manually (CI does this on merge to main)"

dev:
	npm run dev:web

dev-clean:
	npm run clean && npm run dev:web

build:
	npm run build

serve:
	npm run serve

clean:
	npm run clean

test:
	npm test

test-functions:
	npm run test:functions

lint:
	npm run lint

lint-fix:
	npm run lint:fix --workspaces --if-present

dev-functions:
	npm run dev:functions

changeset:
	npm run changeset

firebase-serve:
	npm run firebase:serve

firebase-login:
	npm run firebase:login

deploy-staging:
	npm run deploy:staging

deploy-prod:
	npm run deploy:production

health-check:
	@curl -fsS $(FUNCTION_URL)/health && echo

screenshot:
	cd web && npm run screenshot

screenshot-ci:
	cd web && CI_MODE=true SKIP_BUILD=false npm run screenshot

screenshot-quick:
	cd web && SKIP_BUILD=true npm run screenshot
