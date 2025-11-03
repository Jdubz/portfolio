# Job Finder FE Migration: 2-Worker Approach with Git Worktrees

**Created:** 2025-10-19
**Status:** Ready for Execution
**Context:** This plan splits the job-finder-FE migration work between two parallel workers using Git worktrees to prevent conflicts.

## Overview

The migration extracts Job Finder functionality from the portfolio monorepo into the standalone `job-finder-FE` React application. We're currently 45% complete (API layer, Job Finder page, Job Applications page done). This plan splits the remaining work between two workers using Git worktrees for isolated parallel development.

### Current Progress (45% Complete)

- ✅ Infrastructure scaffolded (React + Vite + TypeScript)
- ✅ API client layer with retry/backoff patterns
- ✅ Auth & session management (Firebase Auth + custom claims)
- ✅ Job Finder page (job submission)
- ✅ Job Applications page (matches display with filters/modal)
- ✅ Shared types package (`@jdubz/job-finder-shared-types`)

### Remaining Work (55%)

- 📋 Document Builder page (AI resume/cover letter generation) - **PRIORITY**
- 📋 Content Items page (experience/skills management)
- 📋 Admin pages (Queue Management, AI Prompts, Job Finder Config, Settings)
- 📋 E2E test suite
- 📋 CI/CD pipeline (GitHub Actions)
- 📋 Documentation & knowledge transfer

---

## Git Worktree Strategy

### Why Worktrees?

- **Parallel Development**: Workers can develop simultaneously without branch conflicts
- **Isolated Testing**: Each worker can run tests/builds without affecting the other
- **Easy Context Switching**: Switch between worker branches without stashing
- **Shared Git History**: Both workers share the same `.git` directory (commits, branches, remotes)

### Worktree Structure

```
job-finder-app/
├── job-finder-FE/              # Main working directory (main branch)
├── job-finder-FE-worker-a/     # Worker A worktree (worker-a branch)
└── job-finder-FE-worker-b/     # Worker B worktree (worker-b branch)
```

### Setup Commands

```bash
# Navigate to the main repo
cd /home/jdubz/Development/job-finder-app/job-finder-FE

# Create Worker A branch and worktree
git checkout -b worker-a main
git worktree add ../job-finder-FE-worker-a worker-a

# Create Worker B branch and worktree
git checkout -b worker-b main
git worktree add ../job-finder-FE-worker-b worker-b

# Verify worktrees
git worktree list

# Expected output:
# /home/jdubz/Development/job-finder-app/job-finder-FE              [main]
# /home/jdubz/Development/job-finder-app/job-finder-FE-worker-a    [worker-a]
# /home/jdubz/Development/job-finder-app/job-finder-FE-worker-b    [worker-b]
```

### Worktree Workflow

1. **Initial Setup**: Both workers branch from `main` (current 45% state)
2. **Development**: Each worker commits to their branch independently
3. **Testing**: Run tests in each worktree before merging
4. **Integration**: Merge worker-a → main, then worker-b → main
5. **Conflict Resolution**: Worker B rebases on main after Worker A merge
6. **Cleanup**: Remove worktrees after completion

---

## Worker Division Strategy

### **Worker A: Backend-Heavy Features**

Focus on features requiring deep backend integration, API calls, and data management.

**Responsibilities:**

- Document Builder (AI generation)
- Content Items (experience/skills CRUD)
- Queue Management (admin view)
- Backend API integration testing
- Firestore real-time listener optimization

**Rationale:** These features require understanding portfolio's Firebase Functions architecture, Firestore data models, and AI provider integration. Worker A will need to reference the portfolio codebase frequently.

---

### **Worker B: UI-Heavy Features & Infrastructure**

Focus on admin UI, settings, configuration pages, and deployment infrastructure.

**Responsibilities:**

- AI Prompts page (prompt customization)
- Job Finder Config page (settings management)
- Document History page (generated docs display)
- Settings page (user preferences)
- E2E test suite (Playwright)
- CI/CD pipeline (GitHub Actions)
- Documentation updates

**Rationale:** These features are more UI-focused with lighter backend dependencies. Worker B can work independently on configuration pages while Worker A handles heavy API integrations.

---

## Worker A: Detailed Task Breakdown

### Phase A1: Document Builder Page (Week 4 - Priority 1)

**Estimated Time:** 3-4 days

#### Tasks

1. **Component Setup**
   - [ ] Create `src/features/document-builder/` directory structure
   - [ ] Set up route in `src/router.tsx` (`/document-builder`)
   - [ ] Create `DocumentBuilderPage.tsx` shell with layout

2. **Form Implementation**
   - [ ] Port document type selector (resume/cover letter) from portfolio
   - [ ] Port job description textarea with validation
   - [ ] Port additional instructions input
   - [ ] Implement form state management (React Hook Form or controlled state)
   - [ ] Add loading states and error handling

3. **API Integration**
   - [ ] Create `documentApi.ts` in `src/api/` for generation endpoints
   - [ ] Implement `POST /generate` with retry logic
   - [ ] Add real-time generation status polling
   - [ ] Handle PDF download responses

4. **UI Components**
   - [ ] Generation history list (recent documents)
   - [ ] Generation status indicator (queued/processing/complete)
   - [ ] Download button with PDF preview
   - [ ] Error states and retry mechanisms

5. **Testing**
   - [ ] Unit tests for form validation
   - [ ] Integration tests for API calls
   - [ ] Mock generation flow tests

#### Portfolio Reference Files

```
web/src/components/tabs/DocumentBuilder.tsx
web/src/hooks/useDocumentGeneration.ts
functions/src/generator.ts
functions/src/services/ai-providers/*.ts
```

#### Acceptance Criteria

- [ ] User can select document type (resume/cover letter)
- [ ] Job description textarea validates minimum length
- [ ] Generation request triggers Cloud Function
- [ ] Real-time status updates show progress
- [ ] PDF downloads successfully on completion
- [ ] Error handling covers API failures and timeouts

---

### Phase A2: Content Items Page (Week 4 - Priority 2)

**Estimated Time:** 2-3 days

#### Tasks

1. **Component Setup**
   - [ ] Create `src/features/content-items/` directory structure
   - [ ] Set up route in `src/router.tsx` (`/content-items`)
   - [ ] Create `ContentItemsPage.tsx` with CRUD layout

2. **Experience Management**
   - [ ] Port work experience form from portfolio
   - [ ] Implement `ExperienceItem` type (from shared-types)
   - [ ] Create CRUD operations (create, read, update, delete)
   - [ ] Add date range validation (start/end dates)

3. **Skills & Blurbs**
   - [ ] Port skills/blurbs list component
   - [ ] Implement filtering/search functionality
   - [ ] Add tag management for categorization
   - [ ] Support markdown formatting for content

4. **API Integration**
   - [ ] Create `contentItemsApi.ts` in `src/api/`
   - [ ] Implement CRUD endpoints with optimistic updates
   - [ ] Add Firestore real-time listeners for live updates
   - [ ] Handle concurrent edit conflicts

5. **Testing**
   - [ ] Unit tests for form validation
   - [ ] Integration tests for CRUD operations
   - [ ] Real-time listener tests

#### Portfolio Reference Files

```
web/src/components/tabs/ExperienceManagement.tsx
web/src/components/tabs/BlurbsManagement.tsx
web/src/hooks/useExperience.ts
functions/src/experience.ts
functions/src/content-items.ts
```

#### Acceptance Criteria

- [ ] User can add/edit/delete work experience entries
- [ ] Date validation prevents invalid ranges
- [ ] Skills and blurbs sync with Firestore in real-time
- [ ] Markdown preview works for content items
- [ ] Optimistic UI updates provide instant feedback
- [ ] Concurrent edits handled gracefully

---

### Phase A3: Queue Management Page (Week 5 - Priority 3)

**Estimated Time:** 2 days

#### Tasks

1. **Component Setup**
   - [ ] Create `src/features/queue-management/` directory structure
   - [ ] Set up route with editor role guard (`/queue-management`)
   - [ ] Create `QueueManagementPage.tsx` with admin layout

2. **Queue Display**
   - [ ] Port queue items table from portfolio troubleshooting page
   - [ ] Implement filtering (status: queued/processing/complete/failed)
   - [ ] Add sorting (date, status, priority)
   - [ ] Show queue statistics (total items, processing time, etc.)

3. **Admin Actions**
   - [ ] Retry failed jobs button
   - [ ] Clear completed jobs button
   - [ ] Pause/resume queue processing
   - [ ] Manual job priority adjustment

4. **Real-Time Updates**
   - [ ] Firestore listener for queue collection
   - [ ] Auto-refresh when queue changes
   - [ ] Visual indicators for active processing

5. **Testing**
   - [ ] Admin role guard tests
   - [ ] Queue action tests (retry, clear, pause)
   - [ ] Real-time update tests

#### Portfolio Reference Files

```
web/src/components/tabs/Troubleshooting.tsx
web/src/hooks/useQueueManagement.ts
functions/src/job-queue.ts
functions/src/triggers/job-queue.trigger.ts
```

#### Acceptance Criteria

- [ ] Only editors can access queue management page
- [ ] Queue items display with real-time updates
- [ ] Filtering and sorting work correctly
- [ ] Admin actions (retry, clear, pause) execute successfully
- [ ] Statistics display accurate metrics

---

### Phase A4: Backend Integration Testing (Week 5)

**Estimated Time:** 2 days

#### Tasks

1. **API Client Testing**
   - [ ] Add integration tests for all API clients
   - [ ] Test retry/backoff patterns with mock failures
   - [ ] Validate error handling and user feedback

2. **Firestore Listener Testing**
   - [ ] Test real-time listener setup/teardown
   - [ ] Validate memory leak prevention
   - [ ] Test reconnection logic after network failures

3. **Auth Flow Testing**
   - [ ] Test custom claims (editor role) propagation
   - [ ] Validate token refresh logic
   - [ ] Test unauthorized access redirects

4. **Performance Testing**
   - [ ] Load test API endpoints (simulate concurrent requests)
   - [ ] Measure Firestore read/write costs
   - [ ] Identify optimization opportunities

#### Acceptance Criteria

- [ ] All API endpoints have integration tests
- [ ] Retry logic works correctly under failure conditions
- [ ] Real-time listeners clean up properly
- [ ] Auth flows handle edge cases (expired tokens, missing claims)

---

## Worker B: Detailed Task Breakdown

### Phase B1: AI Prompts Page (Week 4 - Priority 1)

**Estimated Time:** 2-3 days

#### Tasks

1. **Component Setup**
   - [ ] Create `src/features/ai-prompts/` directory structure
   - [ ] Set up route with editor role guard (`/ai-prompts`)
   - [ ] Create `AIPromptsPage.tsx` with prompt editor layout

2. **Prompt Management**
   - [ ] Port prompt templates from portfolio AI config
   - [ ] Create prompt editor with syntax highlighting
   - [ ] Add variable interpolation preview (e.g., `{{jobDescription}}`)
   - [ ] Implement save/reset functionality

3. **Prompt Types**
   - [ ] Resume generation prompts
   - [ ] Cover letter generation prompts
   - [ ] Job scraping prompts
   - [ ] Custom prompt templates

4. **API Integration**
   - [ ] Create `promptsApi.ts` in `src/api/`
   - [ ] Implement save/load endpoints
   - [ ] Add validation for prompt structure

5. **Testing**
   - [ ] Prompt validation tests
   - [ ] Variable interpolation tests
   - [ ] Save/load functionality tests

#### Portfolio Reference Files

```
web/src/components/tabs/AIConfiguration.tsx
functions/src/services/ai-providers/prompts.ts
```

#### Acceptance Criteria

- [ ] Only editors can access AI prompts page
- [ ] Prompt editor supports syntax highlighting
- [ ] Variable interpolation preview works correctly
- [ ] Save/reset functionality persists to Firestore
- [ ] Validation prevents malformed prompts

---

### Phase B2: Job Finder Config Page (Week 4 - Priority 2)

**Estimated Time:** 2 days

#### Tasks

1. **Component Setup**
   - [ ] Create `src/features/config/` directory structure
   - [ ] Set up route with editor role guard (`/config`)
   - [ ] Create `ConfigPage.tsx` with settings layout

2. **Configuration Sections**
   - [ ] AI provider settings (API keys, model selection)
   - [ ] Queue settings (max concurrent jobs, retry limits)
   - [ ] Scraping settings (timeout, rate limits, user agents)
   - [ ] Email notification settings (Mailgun config)

3. **Form Implementation**
   - [ ] Create tabbed interface for config sections
   - [ ] Add validation for all settings
   - [ ] Implement save/reset functionality
   - [ ] Show current vs. default values

4. **API Integration**
   - [ ] Create `configApi.ts` in `src/api/`
   - [ ] Implement save/load endpoints
   - [ ] Add config validation on backend

5. **Testing**
   - [ ] Config validation tests
   - [ ] Save/load functionality tests
   - [ ] Default value reset tests

#### Portfolio Reference Files

```
web/src/components/tabs/JobFinderConfiguration.tsx
functions/src/services/config/*.ts
scripts/seed-job-finder-config.ts
```

#### Acceptance Criteria

- [ ] Only editors can access config page
- [ ] All configuration sections display correctly
- [ ] Validation prevents invalid settings
- [ ] Save/reset functionality works correctly
- [ ] Changes persist to Firestore

---

### Phase B3: Document History Page (Week 5 - Priority 3)

**Estimated Time:** 1-2 days

#### Tasks

1. **Component Setup**
   - [ ] Create `src/features/document-history/` directory structure
   - [ ] Set up route in `src/router.tsx` (`/document-history`)
   - [ ] Create `DocumentHistoryPage.tsx` with list layout

2. **History Display**
   - [ ] Port generation history list from portfolio
   - [ ] Show document metadata (type, date, job title, status)
   - [ ] Add filtering (document type, date range)
   - [ ] Implement pagination or virtualization

3. **Document Actions**
   - [ ] Download PDF button
   - [ ] Preview modal (PDF viewer)
   - [ ] Delete document action
   - [ ] Regenerate document button

4. **API Integration**
   - [ ] Create `documentHistoryApi.ts` in `src/api/`
   - [ ] Implement list/delete/download endpoints
   - [ ] Add Firestore real-time listener for new documents

5. **Testing**
   - [ ] Document list display tests
   - [ ] Filtering and pagination tests
   - [ ] Download/delete action tests

#### Portfolio Reference Files

```
web/src/components/tabs/DocumentHistory.tsx
web/src/hooks/useGenerationHistory.ts
functions/src/generator.ts (history management)
```

#### Acceptance Criteria

- [ ] Document history displays all generated documents
- [ ] Filtering and pagination work correctly
- [ ] Download action retrieves PDF from Firebase Storage
- [ ] Delete action removes document and updates Firestore
- [ ] Real-time updates show new documents immediately

---

### Phase B4: Settings Page (Week 5 - Priority 4)

**Estimated Time:** 1 day

#### Tasks

1. **Component Setup**
   - [ ] Create `src/features/settings/` directory structure
   - [ ] Set up route in `src/router.tsx` (`/settings`)
   - [ ] Create `SettingsPage.tsx` with preferences layout

2. **User Preferences**
   - [ ] Theme selection (light/dark/system)
   - [ ] Notification preferences (email, in-app)
   - [ ] Default document settings (font, margins, etc.)
   - [ ] Display preferences (timezone, date format)

3. **Account Management**
   - [ ] Display user profile information
   - [ ] Email verification status
   - [ ] Editor role badge (if applicable)
   - [ ] Account deletion request (with confirmation)

4. **API Integration**
   - [ ] Create `settingsApi.ts` in `src/api/`
   - [ ] Implement save/load preferences endpoints
   - [ ] Persist theme preference to localStorage

5. **Testing**
   - [ ] Settings save/load tests
   - [ ] Theme switching tests
   - [ ] Account info display tests

#### Portfolio Reference Files

```
web/src/components/tabs/Settings.tsx (if exists)
web/src/hooks/useTheme.ts
```

#### Acceptance Criteria

- [ ] User can change theme and see immediate updates
- [ ] Preferences persist across sessions
- [ ] Account information displays correctly
- [ ] Theme preference syncs with system setting (if selected)

---

### Phase B5: E2E Test Suite (Week 5 - Priority 5)

**Estimated Time:** 2-3 days

#### Tasks

1. **Playwright Setup**
   - [ ] Install `@playwright/test` and dependencies
   - [ ] Configure `playwright.config.ts` for staging/production
   - [ ] Set up test fixtures (auth, test data)

2. **Critical Path Tests**
   - [ ] User login flow
   - [ ] Job submission and queue status
   - [ ] Job applications view and filters
   - [ ] Document generation flow (end-to-end)
   - [ ] Content items CRUD operations

3. **Admin Flow Tests**
   - [ ] Editor login and role verification
   - [ ] Queue management actions
   - [ ] AI prompts editing
   - [ ] Configuration changes

4. **Accessibility Tests**
   - [ ] Keyboard navigation
   - [ ] Screen reader compatibility (aria labels)
   - [ ] Color contrast validation

5. **Performance Tests**
   - [ ] Lighthouse CI integration
   - [ ] Page load time validation
   - [ ] Core Web Vitals monitoring

#### Acceptance Criteria

- [ ] All critical paths have E2E tests
- [ ] Tests run in CI/CD pipeline
- [ ] Accessibility violations flagged in CI
- [ ] Lighthouse scores meet thresholds (>90 performance, >90 accessibility)

---

### Phase B6: CI/CD Pipeline (Week 5-6 - Priority 6)

**Estimated Time:** 2-3 days

#### Tasks

1. **GitHub Actions Setup**
   - [ ] Create `.github/workflows/ci.yml` for PR checks
   - [ ] Create `.github/workflows/deploy-staging.yml` for staging deploys
   - [ ] Create `.github/workflows/deploy-production.yml` for production deploys

2. **CI Pipeline (PR Checks)**

   ```yaml
   name: CI
   on: [pull_request]
   jobs:
     lint:
       - Install deps
       - Run ESLint with max-warnings 0
       - Run Prettier check
     test:
       - Install deps
       - Run Vitest unit tests
       - Upload coverage to Codecov
     build:
       - Install deps
       - Run Vite build
       - Check for TypeScript errors
     e2e:
       - Install deps
       - Run Playwright tests against staging
   ```

3. **Staging Deploy Pipeline**

   ```yaml
   name: Deploy Staging
   on:
     push:
       branches: [staging]
   jobs:
     deploy:
       - Build production bundle
       - Deploy to Firebase Hosting (staging)
       - Run smoke tests
       - Notify on failure
   ```

4. **Production Deploy Pipeline**

   ```yaml
   name: Deploy Production
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       - Build production bundle
       - Deploy to Firebase Hosting (production)
       - Run smoke tests
       - Update DNS (if needed)
       - Notify on success/failure
   ```

5. **Secrets Management**
   - [ ] Add GitHub secrets for Firebase service account
   - [ ] Add secrets for Cloudflare API tokens
   - [ ] Add secrets for test credentials

6. **Testing**
   - [ ] Trigger CI pipeline on test PR
   - [ ] Validate staging deploy works
   - [ ] Validate production deploy works (dry-run first)

#### Portfolio Reference Files

```
.github/workflows/deploy-cloud-functions.yml
.github/workflows/ci.yml (if exists)
```

#### Acceptance Criteria

- [ ] CI pipeline runs on all PRs
- [ ] Staging deploys on merge to `staging` branch
- [ ] Production deploys on merge to `main` branch
- [ ] All secrets stored securely in GitHub
- [ ] Deploy failures trigger notifications

---

### Phase B7: Documentation & Knowledge Transfer (Week 6-7)

**Estimated Time:** 2-3 days

#### Tasks

1. **README Updates**
   - [ ] Update `README.md` with setup instructions
   - [ ] Document environment variables
   - [ ] Add deployment instructions
   - [ ] Include troubleshooting section

2. **API Documentation**
   - [ ] Document all API endpoints (OpenAPI/Swagger if possible)
   - [ ] Add request/response examples
   - [ ] Document error codes and handling

3. **Architecture Documentation**
   - [ ] Create architecture diagram (frontend + backend + Firebase)
   - [ ] Document data flow for key features
   - [ ] Add sequence diagrams for complex workflows

4. **Developer Guides**
   - [ ] Local development setup guide
   - [ ] Testing guide (unit, integration, E2E)
   - [ ] Deployment guide (staging, production)
   - [ ] Rollback procedures

5. **Claude Context Management**
   - [ ] Update `CLAUDE.md` in root
   - [ ] Create feature-specific `CLAUDE.md` files
   - [ ] Add `docs/claude-context-index.md`
   - [ ] Document prompt patterns for AI assistance

6. **Migration FAQ**
   - [ ] Document differences from portfolio Gatsby version
   - [ ] Add routing comparison table
   - [ ] List deprecated features (if any)

#### Acceptance Criteria

- [ ] All documentation is up-to-date and accurate
- [ ] New developers can set up locally using README
- [ ] API documentation covers all endpoints
- [ ] Architecture diagrams are clear and comprehensive
- [ ] Claude context files are concise and useful

---

## Dependency Management & Handoff Points

### Critical Dependencies

These tasks must be completed in order to avoid blocking:

1. **Worker A Phase A1 (Document Builder) → Worker B Phase B3 (Document History)**
   - Document History displays documents created via Document Builder
   - Worker B should wait for Worker A to complete document generation API integration

2. **Worker A Phase A2 (Content Items) → Worker A Phase A1 (Document Builder)**
   - Document Builder uses content items (experience, skills) in generation
   - Worker A should complete Content Items before finalizing Document Builder

3. **Worker B Phase B6 (CI/CD) → All Other Phases**
   - CI/CD setup can run in parallel but should be tested after key features are done
   - Both workers should coordinate on CI/CD testing

### Recommended Handoff Points

**End of Week 4:**

- Worker A commits: Document Builder + Content Items
- Worker B commits: AI Prompts + Job Finder Config
- **Handoff Meeting:** Review progress, resolve merge conflicts, plan Week 5

**End of Week 5:**

- Worker A commits: Queue Management + Backend testing
- Worker B commits: Document History + Settings + E2E tests
- **Handoff Meeting:** Review integration points, plan CI/CD deployment

**End of Week 6:**

- Worker B commits: CI/CD pipeline + Documentation
- **Final Review:** Full system test, staging deployment, production cutover plan

---

## Merge Strategy

### Approach: Sequential Merges

To minimize conflicts, merge workers sequentially rather than simultaneously.

#### Step 1: Worker A Merge (End of Week 4)

```bash
# Worker A completes their work
cd /home/jdubz/Development/job-finder-app/job-finder-FE-worker-a
git add -A
git commit -m "feat: add Document Builder and Content Items pages"
git push origin worker-a

# Switch to main and merge Worker A
cd /home/jdubz/Development/job-finder-app/job-finder-FE
git checkout main
git pull origin main
git merge worker-a --no-ff -m "Merge Worker A: Document Builder + Content Items"

# Run tests to validate merge
npm test

# Push to main
git push origin main
```

#### Step 2: Worker B Rebase (After Worker A Merge)

```bash
# Worker B rebases on updated main to get Worker A's changes
cd /home/jdubz/Development/job-finder-app/job-finder-FE-worker-b
git fetch origin
git rebase origin/main

# Resolve any conflicts
# Test after rebase
npm test

# Continue work on Worker B branch
```

#### Step 3: Worker B Merge (End of Week 5)

```bash
# Worker B completes their work
cd /home/jdubz/Development/job-finder-app/job-finder-FE-worker-b
git add -A
git commit -m "feat: add admin pages, E2E tests, and CI/CD"
git push origin worker-b

# Switch to main and merge Worker B
cd /home/jdubz/Development/job-finder-app/job-finder-FE
git checkout main
git pull origin main
git merge worker-b --no-ff -m "Merge Worker B: Admin pages + CI/CD + Docs"

# Run full test suite
npm test
npm run test:e2e

# Push to main
git push origin main
```

### Conflict Resolution Strategy

- **File-Level Conflicts:** Most likely in `src/router.tsx`, `package.json`
- **Resolution:** Worker B rebases on main after Worker A merge, manually resolves conflicts
- **Testing:** Always run full test suite after resolving conflicts

---

## Testing & Validation Checkpoints

### Week 4 Checkpoint (After Worker A Phase A1 + A2)

**Worker A Tests:**

- [ ] Document Builder form validation tests pass
- [ ] Document generation API integration tests pass
- [ ] Content Items CRUD operations tests pass
- [ ] Firestore real-time listeners work correctly
- [ ] No TypeScript errors
- [ ] ESLint passes with max-warnings 0

### Week 5 Checkpoint (After Worker A Phase A3 + A4)

**Worker A Tests:**

- [ ] Queue Management admin actions work
- [ ] Backend integration tests pass
- [ ] Real-time updates work across all features
- [ ] Performance tests show acceptable metrics

### Week 5 Checkpoint (After Worker B Phase B1 + B2)

**Worker B Tests:**

- [ ] AI Prompts editor saves/loads correctly
- [ ] Job Finder Config validation works
- [ ] Settings page preferences persist
- [ ] All pages have proper editor role guards

### Week 6 Checkpoint (After Worker B Phase B5 + B6)

**Worker B Tests:**

- [ ] E2E test suite passes on staging
- [ ] CI pipeline runs successfully on test PR
- [ ] Staging deploy completes without errors
- [ ] Lighthouse scores meet thresholds

### Final Validation (Week 7)

**Full System Tests:**

- [ ] All features work end-to-end on staging
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness verified
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] Load testing shows acceptable performance
- [ ] Security audit (OWASP top 10)

---

## Risk Mitigation

### Risk 1: Worker A and Worker B create overlapping components

**Mitigation:**

- Clear task boundaries in this plan
- Regular standups to discuss progress
- Worker B rebases on Worker A's merge before continuing

### Risk 2: Breaking changes in shared-types package

**Mitigation:**

- Lock shared-types version in `package.json`
- Coordinate schema changes with both workers
- Version shared-types package before breaking changes

### Risk 3: CI/CD pipeline breaks existing deployments

**Mitigation:**

- Test CI/CD on separate test repository first
- Use dry-run deployments before production
- Keep rollback plan documented

### Risk 4: Merge conflicts in router or API client files

**Mitigation:**

- Worker A focuses on data-heavy routes
- Worker B focuses on config/admin routes
- Use feature-based file organization to minimize overlap

### Risk 5: Firestore schema changes break existing data

**Mitigation:**

- Run migrations in staging first
- Use Firestore schema versioning
- Keep portfolio functions running during migration for comparison

---

## Rollback Plan

### If Worker A Merge Fails

```bash
# Revert the merge
cd /home/jdubz/Development/job-finder-app/job-finder-FE
git checkout main
git revert -m 1 HEAD  # Revert merge commit
git push origin main

# Worker A fixes issues on worker-a branch
cd /home/jdubz/Development/job-finder-app/job-finder-FE-worker-a
# Fix issues, test, recommit
```

### If Worker B Merge Fails

```bash
# Revert the merge
cd /home/jdubz/Development/job-finder-app/job-finder-FE
git checkout main
git revert -m 1 HEAD  # Revert merge commit
git push origin main

# Worker B fixes issues on worker-b branch
cd /home/jdubz/Development/job-finder-app/job-finder-FE-worker-b
# Fix issues, test, recommit
```

### If Production Deploy Fails

```bash
# Use Firebase Hosting rollback
firebase hosting:clone job-finder-fe:live job-finder-fe:previous

# Or revert last commit and redeploy
git revert HEAD
git push origin main
# CI/CD will automatically redeploy previous version
```

---

## Timeline Summary

| Week | Worker A Focus                           | Worker B Focus                        | Integration Points |
| ---- | ---------------------------------------- | ------------------------------------- | ------------------ |
| 4    | Document Builder, Content Items          | AI Prompts, Job Finder Config         | End-of-week merge  |
| 5    | Queue Management, Backend testing        | Document History, Settings, E2E tests | Worker B rebase    |
| 6    | Support Worker B with integration issues | CI/CD pipeline, Documentation         | Final merge        |
| 7    | Final testing and validation             | Final testing and validation          | Production deploy  |

---

## Worktree Cleanup (After Completion)

Once both workers complete their work and all merges are done:

```bash
# Remove worktrees
cd /home/jdubz/Development/job-finder-app/job-finder-FE
git worktree remove ../job-finder-FE-worker-a
git worktree remove ../job-finder-FE-worker-b

# Delete worker branches (optional)
git branch -d worker-a
git branch -d worker-b

# Verify worktrees removed
git worktree list
# Expected output: Only main worktree remains
```

---

## Communication & Coordination

### Daily Standups (Recommended)

- **Time:** 15 minutes at start of day
- **Format:** What did you complete? What are you working on today? Any blockers?
- **Goal:** Keep both workers aligned and identify conflicts early

### Weekly Handoff Meetings

- **Week 4 End:** Review Document Builder + Content Items (Worker A) and AI Prompts + Config (Worker B)
- **Week 5 End:** Review Queue Management + Testing (Worker A) and Settings + E2E (Worker B)
- **Week 6 End:** Review CI/CD + Documentation (Worker B) and final integration

### Slack/Discord Channel

- Use dedicated channel for quick questions
- Share code snippets and screenshots
- Tag each other for reviews

---

## Success Criteria

### Worker A Success

- ✅ Document Builder generates resumes/cover letters successfully
- ✅ Content Items CRUD operations work with real-time sync
- ✅ Queue Management displays admin controls correctly
- ✅ All backend integration tests pass
- ✅ No TypeScript or ESLint errors

### Worker B Success

- ✅ AI Prompts editor saves/loads correctly
- ✅ Job Finder Config persists settings
- ✅ Document History displays generated documents
- ✅ Settings page works with theme switching
- ✅ E2E test suite passes on staging
- ✅ CI/CD pipeline deploys to staging/production
- ✅ Documentation is comprehensive and accurate

### Overall Migration Success

- ✅ All features from portfolio are present in new app
- ✅ User experience matches or exceeds portfolio version
- ✅ Performance metrics meet or exceed targets
- ✅ Accessibility audit passes WCAG 2.1 AA
- ✅ Production deployment completes without errors
- ✅ Monitoring and logging capture expected data
- ✅ No security vulnerabilities detected

---

## Next Steps

1. **Review this plan** with both workers
2. **Set up Git worktrees** using commands in "Worktree Setup" section
3. **Assign workers** to Worker A or Worker B roles
4. **Kick off Week 4** with Worker A starting Document Builder and Worker B starting AI Prompts
5. **Schedule daily standups** and weekly handoff meetings
6. **Execute the plan** following the phased approach outlined above

---

**Document Owner:** Josh Wentworth
**Contributors:** Worker A, Worker B
**Last Updated:** 2025-10-19
