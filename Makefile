.PHONY: help dev build serve clean kill status deploy-staging deploy-prod firebase-serve firebase-login

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
	@echo "Development Server Management"
	@echo "=============================="
	@echo ""
	@echo "Available commands:"
	@echo "  make dev              - Start Gatsby development server (port 8000)"
	@echo "  make build            - Build production bundle"
	@echo "  make serve            - Serve production build (port 9000)"
	@echo "  make clean            - Clean Gatsby cache and build files"
	@echo "  make kill             - Kill all Node.js processes"
	@echo "  make status           - Check what's running on dev ports"
	@echo ""
	@echo "Firebase commands:"
	@echo "  make firebase-serve   - Serve Firebase hosting locally (port 5000)"
	@echo "  make firebase-login   - Login to Firebase"
	@echo "  make deploy-staging   - Build and deploy to staging"
	@echo "  make deploy-prod      - Build and deploy to production"
	@echo ""

dev:
	@echo "Starting Gatsby development server..."
	npm run develop

build:
	@echo "Building production bundle..."
	npm run build

serve:
	@echo "Serving production build..."
	npm run serve

clean:
	@echo "Cleaning Gatsby cache..."
	npm run clean

kill:
	@echo "Killing processes on ports 8000, 9000, and 5000..."
ifeq ($(OS),Windows)
	@for pid in $$(netstat -ano | grep :8000 | grep LISTENING | awk '{print $$5}' | sort -u); do \
		taskkill //F //PID $$pid 2>&1 >/dev/null && echo "Port 8000: Killed PID $$pid" || true; \
	done
	@for pid in $$(netstat -ano | grep :9000 | grep LISTENING | awk '{print $$5}' | sort -u); do \
		taskkill //F //PID $$pid 2>&1 >/dev/null && echo "Port 9000: Killed PID $$pid" || true; \
	done
	@for pid in $$(netstat -ano | grep :5000 | grep LISTENING | awk '{print $$5}' | sort -u); do \
		taskkill //F //PID $$pid 2>&1 >/dev/null && echo "Port 5000: Killed PID $$pid" || true; \
	done
else
	@lsof -ti :8000 | xargs kill -9 2>/dev/null && echo "Port 8000: Killed" || echo "Port 8000: Nothing to kill"
	@lsof -ti :9000 | xargs kill -9 2>/dev/null && echo "Port 9000: Killed" || echo "Port 9000: Nothing to kill"
	@lsof -ti :5000 | xargs kill -9 2>/dev/null && echo "Port 5000: Killed" || echo "Port 5000: Nothing to kill"
endif
	@echo "Done."

status:
	@echo "Checking ports 8000, 9000, and 5000..."
	@echo ""
ifeq ($(OS),Windows)
	@netstat -ano | grep :8000 || echo "Port 8000: Nothing running"
	@echo ""
	@netstat -ano | grep :9000 || echo "Port 9000: Nothing running"
	@echo ""
	@netstat -ano | grep :5000 || echo "Port 5000: Nothing running"
else
	@lsof -i :8000 || echo "Port 8000: Nothing running"
	@echo ""
	@lsof -i :9000 || echo "Port 9000: Nothing running"
	@echo ""
	@lsof -i :5000 || echo "Port 5000: Nothing running"
endif

firebase-serve:
	@echo "Starting Firebase hosting locally..."
	npm run firebase:serve

firebase-login:
	@echo "Logging into Firebase..."
	npm run firebase:login

deploy-staging:
	@echo "Building and deploying to staging..."
	npm run deploy:staging

deploy-prod:
	@echo "Building and deploying to production..."
	@read -p "Are you sure you want to deploy to production? (y/N) " confirm && \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		npm run deploy:production; \
	else \
		echo "Deployment cancelled."; \
	fi
