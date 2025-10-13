# Development Workflow

## Branch Strategy

```
feature_branch → staging → main
```

### Branches
- **main**: Production branch - deployed to joshwentworth.com
- **staging**: Pre-production branch - deployed to staging.joshwentworth.com
- **feature branches**: Development branches (e.g., `resume-generator`, `auth-fixes`)

## Workflow Rules

### 1. Feature Development
```bash
# Create feature branch from staging
git checkout staging
git pull origin staging
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Create PR: feature/my-feature → staging
gh pr create --base staging --head feature/my-feature
```

### 2. Staging Deployment
- All PRs merge to **staging** first
- Merging to staging auto-deploys to `staging.joshwentworth.com`
- Test thoroughly on staging

**Exception:** Hotfixes for broken staging can be committed directly to staging branch

### 3. Production Deployment
```bash
# After staging is tested and confirmed working
# Create PR: staging → main
gh pr create --base main --head staging --title "Deploy to production"

# After PR approval and merge, auto-deploys to joshwentworth.com
```

### 4. Never Direct Push to Main
- **Always** use PRs from staging → main
- Branch protection should be enabled on main to enforce this
- Only exception: Emergency hotfixes (with caution)

## Environment-Specific Configuration

### Staging
- Domain: `staging.joshwentworth.com`
- Env file: `web/.env.staging`
- Firebase: `portfolio-staging` database
- Cloud Functions: `manageGenerator-staging`

### Production
- Domain: `joshwentworth.com`
- Env file: `web/.env.production`
- Firebase: `(default)` database
- Cloud Functions: `manageGenerator`

## Testing Checklist

Before merging staging → main:
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Feature tested on staging.joshwentworth.com
- [ ] Auth works (if auth-related changes)
- [ ] No console errors
- [ ] Mobile responsive (if UI changes)

## Common Commands

```bash
# Check current branch
git branch --show-current

# Switch to staging
git checkout staging

# Create feature branch
git checkout -b feature/name

# Push and create PR to staging
git push origin feature/name
gh pr create --base staging

# Create production deployment PR
git checkout staging
gh pr create --base main --head staging
```
