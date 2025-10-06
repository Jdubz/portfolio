.PHONY: help install dev build test lint clean deploy-staging deploy-production

help: ## Show available commands
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Run function in development mode with watch
	npm run dev

build: ## Build TypeScript
	npm run build

test: ## Run all tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

lint: ## Run linting
	npm run lint

lint-fix: ## Run linting with auto-fix
	npm run lint:fix

clean: ## Clean build artifacts
	rm -rf dist/ coverage/ node_modules/

setup-secrets: ## Create GCP secrets (run once)
	@echo "Creating secrets in Google Secret Manager..."
	@echo -n "smtp.sendgrid.net" | gcloud secrets create smtp-host --data-file=- || true
	@echo "Enter SMTP username:" && read smtp_user && echo -n "$$smtp_user" | gcloud secrets create smtp-user --data-file=-
	@echo "Enter SMTP password:" && read smtp_pass && echo -n "$$smtp_pass" | gcloud secrets create smtp-password --data-file=-
	@echo -n "noreply@joshwentworth.com" | gcloud secrets create from-email --data-file=- || true
	@echo "Enter your email:" && read to_email && echo -n "$$to_email" | gcloud secrets create to-email --data-file=-
	@echo -n "hello@joshwentworth.com" | gcloud secrets create reply-to-email --data-file=- || true

deploy-staging: build ## Deploy to staging environment
	gcloud functions deploy contact-form-staging \
		--gen2 \
		--runtime=nodejs20 \
		--region=us-central1 \
		--source=. \
		--entry-point=handleContactForm \
		--trigger-http \
		--allow-unauthenticated \
		--memory=256Mi \
		--timeout=60s \
		--set-env-vars="NODE_ENV=staging,ENVIRONMENT=staging"

deploy-production: build ## Deploy to production environment
	gcloud functions deploy contact-form \
		--gen2 \
		--runtime=nodejs20 \
		--region=us-central1 \
		--source=. \
		--entry-point=handleContactForm \
		--trigger-http \
		--allow-unauthenticated \
		--memory=512Mi \
		--timeout=60s \
		--set-env-vars="NODE_ENV=production,ENVIRONMENT=production"

test-local: ## Test local function endpoint
	curl -X POST http://localhost:8080 \
		-H "Content-Type: application/json" \
		-d '{ \
			"name": "Test User", \
			"email": "test@example.com", \
			"message": "This is a test message from local development." \
		}'

test-staging: ## Test staging function endpoint
	curl -X POST https://us-central1-static-sites-257923.cloudfunctions.net/contact-form-staging \
		-H "Content-Type: application/json" \
		-d '{ \
			"name": "Test User", \
			"email": "test@example.com", \
			"message": "This is a test message from staging environment." \
		}'

test-production: ## Test production function endpoint
	curl -X POST https://us-central1-static-sites-257923.cloudfunctions.net/contact-form \
		-H "Content-Type: application/json" \
		-d '{ \
			"name": "Test User", \
			"email": "test@example.com", \
			"message": "This is a test message from production environment." \
		}'
