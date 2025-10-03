# Known Issues

## TypeScript Theme UI Compatibility

**Status**: Needs Resolution  
**Priority**: Medium  
**Files Affected**:

- `src/@lekoarts/gatsby-theme-cara/components/AvatarFrame.tsx`
- `src/@lekoarts/gatsby-theme-cara/sections/intro.tsx`
- `src/pages/404.tsx`

### Problem

Theme UI components are throwing TypeScript errors:

```typescript
'Box' cannot be used as a JSX component.
Its return type 'ReactNode' is not a valid JSX element.
Type 'string' is not assignable to type 'ReactElement<any, any>'.
```

### Root Cause

Mismatch between:

- Theme UI JSX pragma: `/** @jsx jsx */`
- TypeScript JSX configuration: `"jsx": "react"`
- React 18 type definitions

### Impact

- TypeScript linting fails in pre-commit hooks
- IDE shows type errors (but build and runtime work fine)
- Code still functions correctly

### Temporary Workaround

Currently using `"jsx": "react"` with `ignoreDeprecations: "5.0"` to suppress moduleResolution warnings.

### Potential Solutions

1. **Update to Theme UI v6+** (breaking changes)
2. **Migrate to CSS-in-JS alternative** (styled-components, emotion)
3. **Add TypeScript suppression comments** (quick fix)
4. **Create custom type definitions** (complex)

### Action Items

- [ ] Research Theme UI v6 compatibility
- [ ] Test migration to newer Theme UI version
- [ ] Consider alternative styling solutions
- [ ] Add proper TypeScript configuration for Theme UI JSX pragma

### Related Files

- `tsconfig.json` - TypeScript configuration
- `.husky/pre-commit` - Pre-commit hook configuration
- Component files using Theme UI JSX pragma
