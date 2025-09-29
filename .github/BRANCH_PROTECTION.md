# Branch Protection Configuration for Master Branch

This document outlines the recommended branch protection rules for the `master` branch to ensure code quality and prevent broken deployments.

## Required Status Checks

The following status checks must pass before PRs can be merged to master:

### GitHub Action Checks
- `Quality Gate` - Comprehensive testing and build validation
- `Accessibility Check` - WCAG compliance and accessibility testing  
- `All Checks Passed` - Meta-check ensuring all required checks completed successfully

### Individual Check Components
The Quality Gate includes:
- ✅ **Lint check** - Code style and quality validation
- ✅ **Type check** - TypeScript compilation validation
- ✅ **Unit tests** - Component and utility function testing
- ✅ **Build validation** - Gatsby build process verification
- ✅ **E2E tests** - End-to-end functionality testing

The Accessibility Check includes:
- ✅ **WCAG compliance** - Automated accessibility auditing
- ✅ **Screen reader compatibility** - Assistive technology testing
- ✅ **Keyboard navigation** - Accessibility interaction testing

## Recommended Branch Protection Settings

To configure these protections in GitHub:

1. Go to **Settings** → **Branches** in your repository
2. Add a branch protection rule for `master`
3. Configure the following settings:

### Protection Rules
```
✅ Require a pull request before merging
   ✅ Require approvals (1 reviewer minimum)
   ✅ Dismiss stale PR approvals when new commits are pushed
   ✅ Require review from code owners (if CODEOWNERS file exists)

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   
   Required status checks:
   - Quality Gate
   - Accessibility Check  
   - All Checks Passed

✅ Require conversation resolution before merging

✅ Restrict pushes that create files that have a path that matches a forbidden pattern
   Forbidden patterns: 
   - **/*.log
   - **/node_modules/**
   - **/.cache/**
   - **/coverage/**

✅ Do not allow bypassing the above settings (for administrators)
```

## GitHub CLI Configuration

You can also set up these protections using the GitHub CLI:

```bash
# Enable branch protection with required status checks
gh api repos/:owner/:repo/branches/master/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"checks":[{"context":"Quality Gate","app_id":null},{"context":"Accessibility Check","app_id":null},{"context":"All Checks Passed","app_id":null}]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

## Benefits

With these protections in place:

1. **No broken deployments** - All tests must pass before merge
2. **Code quality maintained** - Linting and type checking enforced  
3. **Accessibility compliance** - WCAG standards validated on every PR
4. **Performance protection** - Build process validates bundle optimization
5. **Review process** - Human oversight required for all changes
6. **Up-to-date branches** - Prevents merge conflicts and integration issues

## Workflow Overview

```
PR Created → Tests Run → Reviews Required → All Checks Pass → Merge Allowed
     ↓            ↓            ↓              ↓              ↓
  Draft Skip → Quality Gate → Code Review → Status Checks → Deploy
             → Accessibility              → Conversations
             → Type Check               → Build Success
             → Unit Tests
             → E2E Tests
```

This ensures your master branch remains stable and production-ready at all times! 🛡️