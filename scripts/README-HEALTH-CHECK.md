# Health Check System

## Overview

The health check system monitors the status of all Cloud Functions across different environments (local emulators, staging, and production).

## Files

- `health-check.sh` - Main health check script
- `test-health-check.sh` - Regression test suite

## Usage

### Running Health Checks

```bash
# Check all environments
make health-check

# Check specific environment
make health-check-local      # Local emulators
make health-check-staging    # Staging functions
make health-check-prod       # Production functions
```

### Running Tests

```bash
# Run regression tests
make test-health-check
```

## Health Check Script

### Features

- ✅ Checks HTTP health endpoints for all Cloud Functions
- ✅ Validates JSON response format
- ✅ Reports detailed status (healthy/unhealthy/timeout/failed)
- ✅ Color-coded output for easy reading
- ✅ Exit codes: 0 (all healthy), 1 (failures detected)
- ✅ Safe arithmetic operations with `set -e`

### Supported Functions

#### Local Emulators (port 5001)
- contact-form
- manageExperience
- manageGenerator

#### Staging
- contact-form-staging
- manageExperience-staging
- manageGenerator-staging

#### Production
- contact-form
- manageExperience
- ~~manageGenerator~~ (not yet deployed)

### Expected Response Format

Health endpoints should return HTTP 200 with JSON:

```json
{
  "success": true,
  "service": "service-name",
  "status": "healthy",
  "timestamp": "2025-10-11T18:35:22.555Z"
}
```

## Regression Tests

### Test Coverage

The test suite includes 15 tests covering:

1. **File Checks** (2 tests)
   - Script file exists
   - Script is executable

2. **Arithmetic Expression Regression** (1 test)
   - Tests the `((total++))` with `set -e` bug fix
   - Ensures counters increment correctly without causing exit

3. **Multi-Check Execution** (1 test)
   - Verifies all checks run sequentially
   - Ensures no early exit after first check

4. **Failure Tracking** (1 test)
   - Validates failure counter works correctly
   - Tests mixed success/failure scenarios

5. **Script Validation** (1 test)
   - Bash syntax validation

6. **Pattern Validation** (3 tests)
   - All `((total++))` have `|| true` safeguard
   - Script uses `set -e`
   - `check_health` function is defined

7. **Environment Parameters** (4 tests)
   - Accepts valid environment parameters
   - Tests: local, staging, production, all

8. **Exit Codes** (2 tests)
   - Returns 0 when all checks pass
   - Returns 1 when checks fail

### Test Output

```
==================================================
Health Check Script - Regression Tests
==================================================

━━━ File Checks ━━━
✓ Health check script exists
✓ Health check script is executable

━━━ Arithmetic Expression Regression Tests ━━━
✓ Arithmetic increment with set -e works correctly

...

==================================================
Test Results Summary
==================================================

Tests run:    15
Tests passed: 15
Tests failed: 0

✓ All regression tests passed!
```

## Bug History

### Issue #1: Arithmetic Expression with `set -e`

**Symptom:** Health check script would exit after the first check, never running subsequent checks.

**Root Cause:** When using `set -e`, the expression `((total++))` evaluates to 0 when `total` is 0, which bash treats as a failure, causing immediate exit.

**Fix:** Added `|| true` to all `((total++))` statements:

```bash
# Before (broken)
((total++))

# After (fixed)
((total++)) || true
```

**Regression Test:** Test suite validates this fix works correctly and checks that all `((total++))` statements in the script have the safeguard.

### Issue #2: Generator API URL

**Symptom:** Staging website tried to connect to `localhost:5001` instead of the Cloud Function.

**Root Cause:** Using `process.env.NODE_ENV === "development"` at build time, which is set to "production" for all Gatsby builds.

**Fix:** Changed to runtime hostname check in `web/src/api/generator-client.ts`:

```typescript
// Before (broken)
if (process.env.NODE_ENV === "development") {

// After (fixed)
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")

if (isLocalhost) {
```

## Best Practices

### When Adding New Functions

1. Add health endpoint to the function
2. Update `health-check.sh` with new endpoint
3. Add `|| true` to the `((total++))` increment
4. Run `make test-health-check` to verify
5. Test the actual health check works

### When Modifying Scripts

1. Always run regression tests before committing: `make test-health-check`
2. If adding new features, add corresponding tests
3. Keep `set -e` enabled for safety
4. Use `|| true` with arithmetic expressions that might evaluate to 0

## CI/CD Integration

Consider adding health check tests to CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run health check regression tests
  run: make test-health-check
```

## Troubleshooting

### Health Check Fails

1. Check if the function is deployed: `gcloud functions list`
2. Test endpoint manually: `curl -v https://...`
3. Check function logs: `gcloud functions logs read FUNCTION_NAME`
4. Verify health endpoint returns correct JSON format

### Tests Fail

1. Check script syntax: `bash -n scripts/health-check.sh`
2. Run tests with debug: `bash -x scripts/test-health-check.sh`
3. Verify all `((total++))` have `|| true`
4. Check that `set -e` is present in script

## Future Enhancements

- [ ] Add timeout configuration
- [ ] Support for custom health check endpoints
- [ ] Slack/email notifications for failures
- [ ] Historical health check data
- [ ] Integration with monitoring systems (e.g., Datadog, New Relic)
- [ ] Automated remediation for common issues
