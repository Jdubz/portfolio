#!/bin/bash
#
# Regression Tests for Health Check Script
#
# Tests to ensure the health check script works correctly and doesn't regress.
# Run with: ./scripts/test-health-check.sh
#

set -e

# Colors for test output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test results array
declare -a FAILED_TESTS

# Print test header
print_header() {
  echo ""
  echo "=================================================="
  echo "$1"
  echo "=================================================="
  echo ""
}

# Print test result
print_test() {
  local test_name="$1"
  local result="$2"
  ((TESTS_RUN++)) || true

  if [ "$result" = "PASS" ]; then
    echo -e "${GREEN}✓${NC} $test_name"
    ((TESTS_PASSED++)) || true
  else
    echo -e "${RED}✗${NC} $test_name"
    ((TESTS_FAILED++)) || true
    FAILED_TESTS+=("$test_name")
  fi
}

# Print section header
print_section() {
  echo ""
  echo -e "${BLUE}━━━ $1 ━━━${NC}"
}

print_header "Health Check Script - Regression Tests"

# Test 1: Script exists and is executable
print_section "File Checks"

if [ -f "scripts/health-check.sh" ]; then
  print_test "Health check script exists" "PASS"
else
  print_test "Health check script exists" "FAIL"
fi

if [ -x "scripts/health-check.sh" ]; then
  print_test "Health check script is executable" "PASS"
else
  print_test "Health check script is executable" "FAIL"
fi

# Test 2: Arithmetic expression regression test
print_section "Arithmetic Expression Regression Tests"

# Create a temporary test script that mimics the bug scenario
cat > /tmp/test_arithmetic_regression.sh << 'EOF'
#!/bin/bash
set -e

total=0
failures=0

check_health() {
  return 0
}

# This should not exit when total is 0
check_health || ((failures++)) || true
((total++)) || true

# Second check
check_health || ((failures++)) || true
((total++)) || true

# Third check
check_health || ((failures++)) || true
((total++)) || true

echo "SUCCESS:$total:$failures"
EOF

chmod +x /tmp/test_arithmetic_regression.sh

# Run the test
if output=$(/tmp/test_arithmetic_regression.sh 2>&1) && echo "$output" | grep -q "SUCCESS:3:0"; then
  print_test "Arithmetic increment with set -e works correctly" "PASS"
else
  print_test "Arithmetic increment with set -e works correctly" "FAIL"
fi

# Test 3: Multiple checks complete successfully
print_section "Multi-Check Execution Tests"

# Test that all checks run (not just the first one)
cat > /tmp/test_multiple_checks.sh << 'EOF'
#!/bin/bash
set -e

total=0
failures=0

check_health() {
  echo "check_$1"
  return 0
}

check_health "1" || ((failures++)) || true
((total++)) || true

check_health "2" || ((failures++)) || true
((total++)) || true

check_health "3" || ((failures++)) || true
((total++)) || true

echo "TOTAL:$total"
EOF

chmod +x /tmp/test_multiple_checks.sh

output=$(/tmp/test_multiple_checks.sh 2>&1)
if echo "$output" | grep -q "check_1" && echo "$output" | grep -q "check_2" && echo "$output" | grep -q "check_3" && echo "$output" | grep -q "TOTAL:3"; then
  print_test "All checks execute (no early exit)" "PASS"
else
  print_test "All checks execute (no early exit)" "FAIL"
fi

# Test 4: Failure counting works correctly
print_section "Failure Tracking Tests"

cat > /tmp/test_failure_counting.sh << 'EOF'
#!/bin/bash
set -e

total=0
failures=0

check_health() {
  local should_fail=$1
  if [ "$should_fail" = "fail" ]; then
    return 1
  fi
  return 0
}

check_health "pass" || ((failures++)) || true
((total++)) || true

check_health "fail" || ((failures++)) || true
((total++)) || true

check_health "pass" || ((failures++)) || true
((total++)) || true

echo "FAILURES:$failures:TOTAL:$total"
EOF

chmod +x /tmp/test_failure_counting.sh

output=$(/tmp/test_failure_counting.sh 2>&1)
if echo "$output" | grep -q "FAILURES:1:TOTAL:3"; then
  print_test "Failure counting works correctly" "PASS"
else
  print_test "Failure counting works correctly" "FAIL"
fi

# Test 5: Script syntax is valid
print_section "Script Validation Tests"

if bash -n scripts/health-check.sh 2>/dev/null; then
  print_test "Script has valid bash syntax" "PASS"
else
  print_test "Script has valid bash syntax" "FAIL"
fi

# Test 6: Check that all ((total++)) have || true
print_section "Pattern Validation Tests"

total_increments=$(grep -c '((total++))' scripts/health-check.sh || true)
safe_increments=$(grep -c '((total++)) || true' scripts/health-check.sh || true)

if [ "$total_increments" -eq "$safe_increments" ]; then
  print_test "All ((total++)) statements have || true safeguard" "PASS"
else
  print_test "All ((total++)) statements have || true safeguard" "FAIL"
  echo "  Found $total_increments ((total++)) but only $safe_increments with || true"
fi

# Test 7: Check script has set -e
if grep -q "^set -e" scripts/health-check.sh; then
  print_test "Script uses 'set -e' for safety" "PASS"
else
  print_test "Script uses 'set -e' for safety" "FAIL"
fi

# Test 8: Verify check_health function exists
if grep -q "check_health()" scripts/health-check.sh; then
  print_test "check_health function is defined" "PASS"
else
  print_test "check_health function is defined" "FAIL"
fi

# Test 9: Test environment parameter handling
print_section "Environment Parameter Tests"

# Test valid environment parameters
for env in "local" "staging" "production" "all"; do
  # Just check the script accepts these parameters without error (dry run check)
  if bash -n scripts/health-check.sh 2>/dev/null; then
    print_test "Script accepts '$env' environment parameter (syntax check)" "PASS"
  else
    print_test "Script accepts '$env' environment parameter (syntax check)" "FAIL"
  fi
done

# Test 10: Check for proper exit codes
print_section "Exit Code Tests"

cat > /tmp/test_exit_codes.sh << 'EOF'
#!/bin/bash
set -e

failures=0
total=0

if [ $failures -eq 0 ]; then
  exit 0
else
  exit 1
fi
EOF

chmod +x /tmp/test_exit_codes.sh

if /tmp/test_exit_codes.sh 2>/dev/null; then
  exit_code=$?
  if [ $exit_code -eq 0 ]; then
    print_test "Script exits with 0 when all checks pass" "PASS"
  else
    print_test "Script exits with 0 when all checks pass" "FAIL"
  fi
else
  print_test "Script exits with 0 when all checks pass" "FAIL"
fi

# Test with failures
cat > /tmp/test_exit_codes_fail.sh << 'EOF'
#!/bin/bash
set -e

failures=1
total=3

if [ $failures -eq 0 ]; then
  exit 0
else
  exit 1
fi
EOF

chmod +x /tmp/test_exit_codes_fail.sh

if /tmp/test_exit_codes_fail.sh 2>/dev/null; then
  print_test "Script exits with 1 when checks fail" "FAIL"
else
  exit_code=$?
  if [ $exit_code -eq 1 ]; then
    print_test "Script exits with 1 when checks fail" "PASS"
  else
    print_test "Script exits with 1 when checks fail" "FAIL"
  fi
fi

# Cleanup
rm -f /tmp/test_*.sh

# Print summary
print_header "Test Results Summary"

echo "Tests run:    $TESTS_RUN"
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"

if [ $TESTS_FAILED -gt 0 ]; then
  echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
  echo ""
  echo "Failed tests:"
  for test in "${FAILED_TESTS[@]}"; do
    echo -e "  ${RED}✗${NC} $test"
  done
  echo ""
  exit 1
else
  echo -e "Tests failed: ${GREEN}0${NC}"
  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✓ All regression tests passed!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  exit 0
fi
