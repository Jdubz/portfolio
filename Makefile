.PHONY: help dev dev-clean build serve clean test lint lint-fix changeset \
	firebase-serve firebase-login deploy-staging deploy-prod screenshot screenshot-ci screenshot-quick

help:
	@echo "  make dev              - Start Gatsby development server (port 8000)"
	@echo "  make dev-clean        - Clean cache and start fresh dev server"
	@echo "  make build            - Build production bundle"
	@echo "  make serve            - Serve production build (port 9000)"
	@echo "  make clean            - Clean Gatsby cache and build files"
	@echo "  make test             - Run tests"
	@echo "  make lint             - Type-check, ESLint and Prettier"
	@echo "  make lint-fix         - Auto-fix lint issues"
	@echo "  make screenshot       - Generate component screenshots (also -ci, -quick)"
	@echo "  make changeset        - Create a changeset for versioning"
	@echo ""
	@echo "Firebase:"
	@echo "  make firebase-serve   - Serve the built site with production hosting rules (port 5000)"
	@echo "  make firebase-login   - Login to Firebase"
	@echo "  make deploy-staging   - Build and deploy hosting to staging manually (CI does this on push to staging)"
	@echo "  make deploy-prod      - Build and deploy hosting manually (CI does this on merge to main)"

dev:
	npm run dev

dev-clean:
	npm run clean && npm run dev

build:
	npm run build

serve:
	npm run serve

clean:
	npm run clean

test:
	npm test

lint:
	npm run lint

lint-fix:
	npm run lint:fix

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

screenshot:
	cd web && npm run screenshot

screenshot-ci:
	cd web && CI_MODE=true SKIP_BUILD=false npm run screenshot

screenshot-quick:
	cd web && SKIP_BUILD=true npm run screenshot
