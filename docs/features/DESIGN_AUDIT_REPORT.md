# Resume Builder Design Audit Report

**Date:** 2025-10-17
**Scope:** All components in `/home/jdubz/Development/portfolio/web/src/components/`
**Focus:** Modal patterns, tab layouts, form patterns, card/section patterns

---

## Executive Summary

This audit identified **4 major pattern categories** with significant code duplication across **23+ component files**. By extracting shared components, we can:

- **Reduce codebase by ~30-40%** in modal and tab files
- **Improve consistency** across 7 modals and 16+ tabs
- **Accelerate development** with reusable building blocks
- **Simplify maintenance** with single sources of truth

**Priority:** Extract modal patterns first (highest duplication), then tab headers, then form utilities.

---

## 1. Modal Patterns

### 1.1 Common Overlay Structure

**Files:** All 7 modal files use identical overlay patterns
**Duplication:** Lines 80-106 (AddSourceModal), 173-199 (ScrapeConfigModal), 40-66 (ScrapeResultModal), 138-164 (SourceDetailModal), 201-228 (GenerationDetailsModal), 165-192 (ReorderModal), 213-239 (CreateContentItemModal)

**Repeated Pattern:**
```tsx
// Outer overlay
<Box
  sx={{
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    bg: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,  // Varies: 9999 in ReorderModal
    p: 3,          // Sometimes 4
  }}
  onClick={onClose}
>
  <Box
    sx={{
      bg: "background",
      borderRadius: "md",  // Sometimes "8px"
      maxWidth: "600px",   // Varies: 500px, 800px, 900px, 1200px
      width: "100%",
      maxHeight: "90vh",   // Sometimes "80vh"
      overflow: "auto",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    }}
    onClick={(e) => e.stopPropagation()}
  >
```

**Variations:**
- `zIndex`: 1000 (most), 9999 (ReorderModal)
- `maxWidth`: 500px, 600px, 800px, 900px, 1200px
- `padding`: 3 or 4
- `borderRadius`: "md" or "8px"
- `maxHeight`: "90vh" or "80vh"

**Recommendation:**
```tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  size?: "sm" | "md" | "lg" | "xl" | "full"  // Maps to maxWidth
  zIndex?: number
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = "md",
  zIndex = 1000,
}) => {
  const maxWidths = {
    sm: "500px",
    md: "600px",
    lg: "800px",
    xl: "900px",
    full: "1200px",
  }

  if (!isOpen) return null

  return (
    <Box sx={overlayStyles(zIndex)} onClick={onClose}>
      <Box sx={contentStyles(maxWidths[size])} onClick={(e) => e.stopPropagation()}>
        {children}
      </Box>
    </Box>
  )
}
```

### 1.2 Common Header Pattern

**Files:** 6 of 7 modals (all except CreateContentItemModal)
**Duplication:** Lines 109-124 (AddSourceModal), 69-84 (ScrapeResultModal), 167-182 (SourceDetailModal), 230-246 (GenerationDetailsModal), 195-206 (ReorderModal)

**Repeated Pattern:**
```tsx
<Flex
  sx={{
    justifyContent: "space-between",
    alignItems: "center",
    p: 4,
    borderBottom: "1px solid",
    borderColor: "muted",
  }}
>
  <Heading as="h2" sx={{ fontSize: 4 }}>
    {title}
  </Heading>
  <Button variant="secondary" onClick={onClose} sx={{ fontSize: 2 }}>
    ✕
  </Button>
</Flex>
```

**Variations:**
- Close button sometimes has `disabled` prop
- GenerationDetailsModal has additional download buttons in header
- ReorderModal omits borderBottom

**Recommendation:**
```tsx
interface ModalHeaderProps {
  title: string
  onClose: () => void
  actions?: React.ReactNode  // For extra buttons like download
  disableClose?: boolean
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  title,
  onClose,
  actions,
  disableClose = false,
}) => (
  <Flex sx={headerStyles}>
    {typeof title === "string" ? (
      <Heading as="h2" sx={{ fontSize: 4 }}>{title}</Heading>
    ) : (
      title
    )}
    <Flex sx={{ gap: 2, alignItems: "center" }}>
      {actions}
      <Button
        variant="secondary"
        onClick={onClose}
        disabled={disableClose}
        sx={{ fontSize: 2 }}
      >
        ✕
      </Button>
    </Flex>
  </Flex>
)
```

### 1.3 Common Footer Pattern

**Files:** 4 modals have footer with action buttons
**Duplication:** Lines 185-192 (AddSourceModal), 350-357 (ScrapeConfigModal), 205-217 (ScrapeResultModal), 230-245 (ReorderModal)

**Repeated Pattern:**
```tsx
<Flex
  sx={{
    justifyContent: "flex-end",
    p: 4,
    borderTop: "1px solid",
    borderColor: "muted",
    gap: 2,
  }}
>
  <Button variant="secondary" onClick={onClose}>
    Cancel
  </Button>
  <Button onClick={onSave} disabled={isSubmitting}>
    {isSubmitting ? "Saving..." : "Save"}
  </Button>
</Flex>
```

**Recommendation:**
```tsx
interface ModalFooterProps {
  primaryAction: {
    label: string
    onClick: () => void
    loading?: boolean
    disabled?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  primaryAction,
  secondaryAction,
}) => (
  <Flex sx={footerStyles}>
    {secondaryAction && (
      <Button variant="secondary" onClick={secondaryAction.onClick}>
        {secondaryAction.label}
      </Button>
    )}
    <Button
      onClick={primaryAction.onClick}
      disabled={primaryAction.disabled || primaryAction.loading}
    >
      {primaryAction.loading ? `${primaryAction.label}ing...` : primaryAction.label}
    </Button>
  </Flex>
)
```

### 1.4 Modal Pattern Summary

**Recommended Shared Components:**

1. **`Modal`** - Base overlay + content wrapper (7 files → 1 component)
2. **`ModalHeader`** - Title + close button (6 files → 1 component)
3. **`ModalFooter`** - Action buttons (4 files → 1 component)
4. **`ModalBody`** - Content area with scroll (optional wrapper)

**Impact:**
- **Before:** 7 modal files, ~2800 lines total
- **After:** 7 modal files + 4 shared components, ~1800 lines total
- **Savings:** ~35% reduction in modal code

---

## 2. Tab Layout Patterns

### 2.1 Common Tab Header Pattern

**Files:** 10+ tabs have similar header structures
**Locations:**
- DocumentHistoryTab: Lines 16-20
- SettingsTab: Lines 221-224
- ContentItemsTab: No explicit header (uses inline button groups)
- SourcesTab: Lines 196-214
- JobApplicationsTab: Lines 360-375

**Repeated Pattern:**
```tsx
<Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
  <Heading as="h2" sx={{ fontSize: 4 }}>
    {title}
  </Heading>
  <Flex sx={{ gap: 2 }}>
    {/* Action buttons */}
    <Button onClick={handleAction}>Action</Button>
  </Flex>
</Flex>
```

**Recommendation:**
```tsx
interface TabHeaderProps {
  title: string
  actions?: React.ReactNode
  description?: string
}

export const TabHeader: React.FC<TabHeaderProps> = ({
  title,
  actions,
  description,
}) => (
  <Box sx={{ mb: 4 }}>
    <Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: description ? 2 : 0 }}>
      <Heading as="h2" sx={{ fontSize: 4 }}>
        {title}
      </Heading>
      {actions && <Flex sx={{ gap: 2 }}>{actions}</Flex>}
    </Flex>
    {description && (
      <Text sx={{ color: "textMuted", fontSize: 2, mt: 2 }}>
        {description}
      </Text>
    )}
  </Box>
)
```

### 2.2 Common Info/Description Text Pattern

**Files:** 8+ tabs
**Locations:**
- DocumentHistoryTab: Lines 18-20
- SettingsTab: Lines 222-224
- SourcesTab: Lines 211-213

**Repeated Pattern:**
```tsx
<Text sx={{ color: "textMuted", mb: 4, fontSize: 2 }}>
  {description}
</Text>
```

**Recommendation:**
```tsx
interface InfoTextProps {
  children: React.ReactNode
  variant?: "info" | "warning" | "error"
}

export const InfoText: React.FC<InfoTextProps> = ({
  children,
  variant = "info"
}) => {
  const colors = {
    info: "textMuted",
    warning: "warning",
    error: "danger",
  }

  return (
    <Text sx={{ color: colors[variant], fontSize: 2, opacity: 0.8 }}>
      {children}
    </Text>
  )
}
```

### 2.3 Common Stats Display Pattern

**Files:** SourcesTab (Lines 258-285), JobApplicationsTab (Lines 742-748)

**Repeated Pattern:**
```tsx
<Flex sx={{ gap: 3, mb: 4, flexWrap: "wrap" }}>
  <Box sx={{ variant: "cards.primary", p: 3, flex: "1 1 150px" }}>
    <Text sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>Label</Text>
    <Text sx={{ fontSize: 4, fontWeight: "bold" }}>{value}</Text>
  </Box>
</Flex>
```

**Recommendation:**
```tsx
interface StatCardProps {
  label: string
  value: string | number
  color?: string
  icon?: React.ReactNode
}

interface StatsGridProps {
  stats: StatCardProps[]
  columns?: number[]
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  columns = [2, 4]
}) => (
  <Grid columns={columns} gap={3} sx={{ mb: 4 }}>
    {stats.map((stat, i) => (
      <StatCard key={i} {...stat} />
    ))}
  </Grid>
)

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  color,
  icon,
}) => (
  <Box sx={{ variant: "cards.primary", p: 3 }}>
    {icon && <Box sx={{ mb: 2 }}>{icon}</Box>}
    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1, textTransform: "uppercase" }}>
      {label}
    </Text>
    <Text sx={{ fontSize: 4, fontWeight: "bold", color }}>{value}</Text>
  </Box>
)
```

### 2.4 Common Search/Filter Pattern

**Files:** SourcesTab (Lines 216-225), JobApplicationsTab (Lines 378-522)

**Repeated Pattern:**
```tsx
<Box sx={{ variant: "cards.primary", p: 3, mb: 4 }}>
  <Text sx={{ fontSize: 1, fontWeight: "medium", mb: 2 }}>Search</Text>
  <Input
    type="text"
    placeholder="Search..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</Box>
```

**Recommendation:**
```tsx
interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  label = "Search",
}) => (
  <Box sx={{ variant: "cards.primary", p: 3, mb: 4 }}>
    <Label sx={{ fontSize: 1, fontWeight: "medium", mb: 2 }}>
      {label}
    </Label>
    <Input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ variant: "forms.input" }}
    />
  </Box>
)
```

### 2.5 Tab Pattern Summary

**Recommended Shared Components:**

1. **`TabHeader`** - Title + actions + description (10+ files → 1 component)
2. **`InfoText`** - Descriptive text with variants (8+ files → 1 component)
3. **`StatsGrid` + `StatCard`** - Statistics display (2 files → 2 components)
4. **`SearchBox`** - Search input with label (2 files → 1 component)

**Impact:**
- Reduces header boilerplate from ~15 lines to ~3 lines per tab
- Standardizes information display across all tabs
- Makes stats and search patterns reusable

---

## 3. Form Patterns

### 3.1 Existing Form Components

**Already Implemented (Good!):**
- ✅ **`FormField`** - Input/textarea with label and error (Lines 96-160)
- ✅ **`FormActions`** - Cancel/Save/Delete buttons (Lines 82-121)
- ✅ **`FormError`** - Error message box (Lines 37-57)
- ✅ **`FormLabel`** - Standardized label (separate file)

### 3.2 Common Info Box Pattern

**Files:** AddSourceModal (Lines 177-182), ScrapeConfigModal (Lines 337-347), ScrapeResultModal (Lines 164-167), SourcesTab (Lines 242-248, 251-255)

**Repeated Pattern:**
```tsx
<Box sx={{ p: 3, bg: "highlight", borderRadius: "sm" }}>
  <Text sx={{ fontSize: 1 }}>
    <strong>Note:</strong> {message}
  </Text>
</Box>
```

**Variations:**
- `bg`: "highlight", "muted", "warning", "danger"
- Sometimes has `borderLeft` with color
- Sometimes includes icon

**Recommendation:**
```tsx
interface InfoBoxProps {
  children: React.ReactNode
  variant?: "info" | "success" | "warning" | "danger"
  icon?: string
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  children,
  variant = "info",
  icon,
}) => {
  const variants = {
    info: { bg: "highlight", color: "text" },
    success: { bg: "success", color: "background", borderLeft: "4px solid", borderColor: "success" },
    warning: { bg: "warning", color: "background" },
    danger: { bg: "danger", color: "background" },
  }

  const styles = variants[variant]

  return (
    <Box sx={{ p: 3, borderRadius: "sm", ...styles }}>
      {icon && <Text sx={{ mr: 2, display: "inline" }}>{icon}</Text>}
      {typeof children === "string" ? (
        <Text sx={{ fontSize: 1 }}>{children}</Text>
      ) : (
        children
      )}
    </Box>
  )
}
```

### 3.3 Common Alert Pattern

**Files:** SettingsTab (Lines 227-238), ContentItemsTab (Lines 298-302)

**Repeated Pattern:**
```tsx
{error && (
  <Alert variant="error" sx={{ mb: 3 }}>
    {error}
  </Alert>
)}

{success && (
  <Alert variant="success" sx={{ mb: 3 }}>
    ✓ Success message
  </Alert>
)}
```

**Note:** Theme UI `Alert` component is already used, but pattern could be standardized

**Recommendation:**
```tsx
interface AlertBoxProps {
  type: "error" | "success" | "warning" | "info"
  message: string | null | undefined
  dismissible?: boolean
  onDismiss?: () => void
}

export const AlertBox: React.FC<AlertBoxProps> = ({
  type,
  message,
  dismissible = false,
  onDismiss,
}) => {
  if (!message) return null

  return (
    <Alert variant={type} sx={{ mb: 3 }}>
      <Flex sx={{ justifyContent: "space-between", alignItems: "center" }}>
        <Text>{message}</Text>
        {dismissible && onDismiss && (
          <Button variant="ghost" onClick={onDismiss}>×</Button>
        )}
      </Flex>
    </Alert>
  )
}
```

### 3.4 Common Validation Error Display Pattern

**Files:** AddSourceModal (Lines 170-174), multiple form fields

**Repeated Pattern:**
```tsx
{error && (
  <Box sx={{ mb: 4, p: 3, bg: "danger", color: "background", borderRadius: "sm" }}>
    <Text sx={{ fontWeight: "medium" }}>{error}</Text>
  </Box>
)}
```

**Note:** This overlaps with `FormError` component but has slightly different styling

**Recommendation:** Unify with existing `FormError` component, possibly add variant support

### 3.5 Form Pattern Summary

**Recommended Additional Components:**

1. **`InfoBox`** - Info/warning/success boxes (5+ files → 1 component)
2. **`AlertBox`** - Enhanced Alert with dismiss (3+ files → 1 component)

**Unification Needed:**
- Consolidate error display patterns to use existing `FormError`
- Standardize success message display

**Impact:**
- Reduces info/alert boilerplate across all forms
- Consistent UX for notifications

---

## 4. Card/Section Patterns

### 4.1 Common Card Wrapper Pattern

**Files:** SourcesTab (Lines 301-408), JobApplicationsTab (table structure), SourceDetailModal (Lines 191-245, 254-310)

**Repeated Pattern:**
```tsx
<Box sx={{ variant: "cards.primary", p: 3 }}>
  {/* Card content */}
</Box>
```

**Note:** Theme UI variant system is already used well. Minimal extraction needed.

### 4.2 Common Grid Layout Pattern

**Files:** ScrapeResultModal (Lines 99-122, 130-155), SourceDetailModal (Lines 191-245, 254-310), SourcesTab (Lines 363-400)

**Repeated Pattern:**
```tsx
<Grid columns={[1, 2]} gap={3} sx={{ variant: "cards.primary", p: 3 }}>
  <Box>
    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>Label</Text>
    <Text sx={{ fontSize: 2, fontWeight: "medium" }}>{value}</Text>
  </Box>
</Grid>
```

**Recommendation:**
```tsx
interface DataGridProps {
  items: Array<{
    label: string
    value: string | number | React.ReactNode
  }>
  columns?: number[]
}

export const DataGrid: React.FC<DataGridProps> = ({
  items,
  columns = [1, 2]
}) => (
  <Grid columns={columns} gap={3}>
    {items.map((item, i) => (
      <DataGridItem key={i} label={item.label} value={item.value} />
    ))}
  </Grid>
)

interface DataGridItemProps {
  label: string
  value: string | number | React.ReactNode
}

export const DataGridItem: React.FC<DataGridItemProps> = ({ label, value }) => (
  <Box>
    <Text sx={{ fontSize: 0, color: "textMuted", mb: 1 }}>{label}</Text>
    <Text sx={{ fontSize: 2, fontWeight: "medium" }}>
      {value}
    </Text>
  </Box>
)
```

### 4.3 Common Section Divider Pattern

**Files:** Multiple modals and tabs use section headers

**Repeated Pattern:**
```tsx
<Heading as="h3" sx={{ fontSize: 3, mb: 3 }}>
  Section Title
</Heading>
```

**Recommendation:**
```tsx
interface SectionHeadingProps {
  children: React.ReactNode
  level?: 2 | 3 | 4
  divider?: boolean
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  children,
  level = 3,
  divider = false,
}) => (
  <Heading
    as={`h${level}` as const}
    sx={{
      fontSize: level === 2 ? 4 : level === 3 ? 3 : 2,
      mb: 3,
      ...(divider && {
        pb: 2,
        borderBottom: "1px solid",
        borderColor: "muted",
      }),
    }}
  >
    {children}
  </Heading>
)
```

### 4.4 Card/Section Pattern Summary

**Recommended Shared Components:**

1. **`DataGrid` + `DataGridItem`** - Key-value grid layouts (3+ files → 2 components)
2. **`SectionHeading`** - Standardized section headers (10+ files → 1 component)

**Impact:**
- Reduces data display boilerplate
- Consistent section headers throughout app

---

## 5. Loading/Empty State Patterns

### 5.1 Common Loading Spinner Pattern

**Files:** Multiple tabs and modals
**Locations:** SettingsTab (Lines 206-212), ContentItemsTab (Lines 291-294), SourcesTab (Lines 289-291), JobApplicationsTab (Lines 301-313)

**Repeated Pattern:**
```tsx
{loading && (
  <Box sx={{ textAlign: "center", py: 4 }}>
    <Spinner size={48} />
  </Box>
)}
```

**Recommendation:**
```tsx
interface LoadingStateProps {
  message?: string
  size?: number
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  size = 48,
}) => (
  <Flex sx={{ justifyContent: "center", alignItems: "center", py: 6, flexDirection: "column", gap: 3 }}>
    <Spinner size={size} />
    {message && <Text sx={{ color: "textMuted" }}>{message}</Text>}
  </Flex>
)
```

### 5.2 Common Empty State Pattern

**Files:** Multiple tabs
**Locations:** SourcesTab (Lines 293-297), JobApplicationsTab (Lines 344-356), SourceDetailModal (Lines 322-325)

**Repeated Pattern:**
```tsx
{items.length === 0 && (
  <Box sx={{ variant: "cards.primary", p: 4, textAlign: "center" }}>
    <Text sx={{ color: "textMuted" }}>No items found</Text>
  </Box>
)}
```

**Recommendation:**
```tsx
interface EmptyStateProps {
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  action,
  icon,
}) => (
  <Box sx={{ variant: "cards.primary", p: 5, textAlign: "center" }}>
    {icon && <Text sx={{ fontSize: 6, mb: 3 }}>{icon}</Text>}
    <Text sx={{ color: "textMuted", fontSize: 2, mb: action ? 3 : 0 }}>
      {message}
    </Text>
    {action && (
      <Button onClick={action.onClick} variant="primary">
        {action.label}
      </Button>
    )}
  </Box>
)
```

### 5.3 Loading/Empty Pattern Summary

**Recommended Shared Components:**

1. **`LoadingState`** - Centered spinner with message (6+ files → 1 component)
2. **`EmptyState`** - Empty state with optional action (5+ files → 1 component)

**Impact:**
- Consistent loading and empty experiences
- Reduces ~10 lines per occurrence

---

## 6. Priority Ranking

### High Priority (Implement First)

1. **Modal Components** (Impact: 7 files, ~1000 lines saved)
   - `Modal` - Base overlay wrapper
   - `ModalHeader` - Title + close button
   - `ModalFooter` - Action buttons
   - `ModalBody` - Content wrapper

2. **Tab Header Component** (Impact: 10+ files, ~150 lines saved)
   - `TabHeader` - Title + actions + description

3. **Loading/Empty States** (Impact: 10+ files, ~120 lines saved)
   - `LoadingState` - Loading spinner
   - `EmptyState` - Empty state message

### Medium Priority (Implement Second)

4. **Info/Alert Components** (Impact: 8+ files, ~100 lines saved)
   - `InfoBox` - Info/warning boxes
   - `AlertBox` - Alert messages

5. **Stats Display** (Impact: 2-3 files, ~80 lines saved)
   - `StatsGrid` + `StatCard` - Statistics grids

6. **Data Display** (Impact: 3+ files, ~60 lines saved)
   - `DataGrid` + `DataGridItem` - Key-value grids

### Low Priority (Implement Last)

7. **Search Components** (Impact: 2-3 files, ~30 lines saved)
   - `SearchBox` - Search input with label

8. **Section Headers** (Impact: 10+ files, ~40 lines saved)
   - `SectionHeading` - Standardized headings

---

## 7. Implementation Roadmap

### Phase 1: Modal System (Week 1)

**Create files:**
```
/web/src/components/ui/modal/
  ├── Modal.tsx          # Base overlay + wrapper
  ├── ModalHeader.tsx    # Header with title + close
  ├── ModalFooter.tsx    # Footer with actions
  ├── ModalBody.tsx      # Content wrapper
  └── index.ts           # Exports
```

**Refactor (in order):**
1. AddSourceModal
2. ScrapeConfigModal
3. ScrapeResultModal
4. CreateContentItemModal
5. SourceDetailModal
6. ReorderModal
7. GenerationDetailsModal

**Testing:**
- Verify all modals open/close correctly
- Check z-index layering
- Test responsive behavior

### Phase 2: Tab Components (Week 2)

**Create files:**
```
/web/src/components/ui/tab/
  ├── TabHeader.tsx      # Title + actions
  ├── TabContent.tsx     # Content wrapper (optional)
  └── index.ts
```

**Refactor (in order):**
1. DocumentHistoryTab
2. SettingsTab
3. SourcesTab
4. JobApplicationsTab
5. ContentItemsTab
6. Other tabs as needed

### Phase 3: State Components (Week 2)

**Create files:**
```
/web/src/components/ui/state/
  ├── LoadingState.tsx   # Loading spinner
  ├── EmptyState.tsx     # Empty message
  └── index.ts
```

**Refactor:** All tabs with loading/empty states

### Phase 4: Info/Alert Components (Week 3)

**Create files:**
```
/web/src/components/ui/feedback/
  ├── InfoBox.tsx        # Info/warning boxes
  ├── AlertBox.tsx       # Alert messages
  └── index.ts
```

**Refactor:** All forms and modals with alerts

### Phase 5: Data Display (Week 3)

**Create files:**
```
/web/src/components/ui/data/
  ├── StatsGrid.tsx      # Statistics grid
  ├── StatCard.tsx       # Individual stat
  ├── DataGrid.tsx       # Key-value grid
  ├── DataGridItem.tsx   # Key-value item
  └── index.ts
```

**Refactor:** SourcesTab, JobApplicationsTab, modals with data grids

### Phase 6: Minor Components (Week 4)

**Create files:**
```
/web/src/components/ui/form/
  ├── SearchBox.tsx      # Search input
  └── index.ts

/web/src/components/ui/typography/
  ├── SectionHeading.tsx # Section headers
  └── index.ts
```

**Refactor:** All remaining components

---

## 8. Code Examples

### Example 1: Before/After Modal Refactor

**Before (AddSourceModal.tsx):**
```tsx
return (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      bg: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      p: 3,
    }}
    onClick={handleClose}
  >
    <Box
      sx={{
        bg: "background",
        borderRadius: "md",
        maxWidth: "500px",
        width: "100%",
        maxHeight: "90vh",
        overflow: "auto",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Flex
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          p: 4,
          borderBottom: "1px solid",
          borderColor: "muted",
        }}
      >
        <Heading as="h2" sx={{ fontSize: 4 }}>Add New Job Source</Heading>
        <Button variant="secondary" onClick={handleClose}>✕</Button>
      </Flex>

      <Box sx={{ p: 4 }}>
        {/* Form content */}
      </Box>

      <Flex sx={{ justifyContent: "flex-end", p: 4, gap: 2 }}>
        <Button variant="secondary" onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </Flex>
    </Box>
  </Box>
)
```

**After (AddSourceModal.tsx):**
```tsx
return (
  <Modal isOpen={isOpen} onClose={handleClose} size="sm">
    <ModalHeader title="Add New Job Source" onClose={handleClose} />

    <ModalBody>
      {/* Form content */}
    </ModalBody>

    <ModalFooter
      primaryAction={{ label: "Submit", onClick: handleSubmit, loading: isSubmitting }}
      secondaryAction={{ label: "Cancel", onClick: handleClose }}
    />
  </Modal>
)
```

**Lines saved:** ~60 → ~12 (80% reduction)

### Example 2: Before/After Tab Header Refactor

**Before (SourcesTab.tsx):**
```tsx
<Flex sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
  <Heading as="h2" sx={{ fontSize: 4 }}>Job Sources</Heading>
  <Flex sx={{ alignItems: "center", gap: 2 }}>
    {loading && <Spinner size={16} />}
    <Button onClick={() => setIsAddModalOpen(true)}>Add Source</Button>
    <Button onClick={loadSources} variant="secondary.sm">Refresh</Button>
  </Flex>
</Flex>

<Text sx={{ color: "textMuted", mb: 4, fontSize: 2 }}>
  Job board and company career page sources tracked by the job-finder application.
</Text>
```

**After (SourcesTab.tsx):**
```tsx
<TabHeader
  title="Job Sources"
  description="Job board and company career page sources tracked by the job-finder application."
  actions={
    <>
      {loading && <Spinner size={16} />}
      <Button onClick={() => setIsAddModalOpen(true)}>Add Source</Button>
      <Button onClick={loadSources} variant="secondary.sm">Refresh</Button>
    </>
  }
/>
```

**Lines saved:** ~18 → ~10 (45% reduction)

### Example 3: Before/After Stats Display Refactor

**Before (SourcesTab.tsx):**
```tsx
<Flex sx={{ gap: 3, mb: 4, flexWrap: "wrap" }}>
  <Box sx={{ variant: "cards.primary", p: 3, flex: "1 1 150px" }}>
    <Text sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>Total Sources</Text>
    <Text sx={{ fontSize: 4, fontWeight: "bold" }}>{sources.length}</Text>
  </Box>
  <Box sx={{ variant: "cards.primary", p: 3, flex: "1 1 150px" }}>
    <Text sx={{ fontSize: 1, color: "textMuted", mb: 1 }}>Enabled</Text>
    <Text sx={{ fontSize: 4, fontWeight: "bold", color: "green" }}>
      {sources.filter(s => s.enabled).length}
    </Text>
  </Box>
  {/* More stats... */}
</Flex>
```

**After (SourcesTab.tsx):**
```tsx
<StatsGrid
  stats={[
    { label: "Total Sources", value: sources.length },
    { label: "Enabled", value: sources.filter(s => s.enabled).length, color: "green" },
    { label: "Total Jobs Found", value: totalJobs, color: "blue" },
    { label: "Avg Priority", value: avgPriority, color: "orange" },
  ]}
/>
```

**Lines saved:** ~40 → ~8 (80% reduction)

---

## 9. Benefits Summary

### Developer Experience

- **Faster development:** Compose UIs from building blocks
- **Less boilerplate:** 30-40% less code in modals/tabs
- **Easier maintenance:** Fix bugs in one place
- **Better consistency:** Shared components = shared behavior

### User Experience

- **Consistent interactions:** All modals behave the same way
- **Predictable layouts:** Tabs follow same structure
- **Better accessibility:** Centralized ARIA attributes
- **Improved performance:** Smaller bundle size

### Code Quality

- **DRY principle:** Don't Repeat Yourself
- **Single responsibility:** Each component does one thing
- **Type safety:** Shared prop types
- **Testability:** Test components once, not 7+ times

---

## 10. Acceptance Criteria

### Modal System

- [ ] All 7 modals refactored to use shared components
- [ ] No duplicated overlay/header/footer code
- [ ] All modals support keyboard navigation (ESC to close)
- [ ] Z-index issues resolved
- [ ] Tests pass for all modal interactions

### Tab Components

- [ ] 10+ tabs refactored to use TabHeader
- [ ] Consistent spacing and layout across all tabs
- [ ] Loading states use LoadingState component
- [ ] Empty states use EmptyState component

### Form Components

- [ ] InfoBox replaces all info/warning box patterns
- [ ] AlertBox used for all alerts
- [ ] Existing FormField/FormActions/FormError still work

### Data Display

- [ ] StatsGrid used in SourcesTab, JobApplicationsTab
- [ ] DataGrid used in modals with key-value layouts
- [ ] Consistent styling across all data displays

---

## 11. Maintenance Plan

### Component Documentation

Each new shared component should include:
- JSDoc comments with usage examples
- TypeScript prop interfaces
- Storybook stories (if applicable)
- Unit tests

### Review Process

Before merging:
1. Review all refactored files
2. Test modal/tab interactions manually
3. Run full test suite
4. Check bundle size impact
5. Verify no visual regressions

### Future Considerations

- Consider Storybook for component documentation
- Add visual regression tests (Percy, Chromatic)
- Create component usage guidelines
- Monitor bundle size impact

---

## 12. Conclusion

This audit identified **significant opportunities** for code reuse and standardization:

- **7 modals** can share 4 base components (35% reduction)
- **16+ tabs** can share header/state components (20-30% reduction)
- **10+ files** can use shared info/alert patterns (15-20% reduction)

**Total estimated impact:**
- **Before:** ~6000 lines of duplicated patterns
- **After:** ~4000 lines + ~500 lines of shared components
- **Net savings:** ~25-30% reduction in component code

**Next steps:**
1. Review and approve this audit report
2. Prioritize implementation phases
3. Create shared component library structure
4. Begin Phase 1 refactoring (modals)
5. Test and iterate

---

**Report compiled by:** Claude (Anthropic AI)
**Files analyzed:** 23 component files
**Patterns identified:** 40+ repeated patterns
**Recommended components:** 20+ shared components
