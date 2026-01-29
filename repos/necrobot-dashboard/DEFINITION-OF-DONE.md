# NecromundaBot Dashboard - Definition of Done (DoD)

**Version:** 1.0  
**Effective Date:** January 26, 2026  
**Scope:** All code changes in necrobot-dashboard submodule  
**Parent Document:** [Main DoD](../../DEFINITION-OF-DONE.md)

---

## Overview

necrobot-dashboard provides the web UI for NecromundaBot management. This Definition of Done ensures consistent, high-quality frontend implementations.

**All changes to necrobot-dashboard must meet these criteria before merging.**

---

## Core Requirements

### 1. Code Quality

- [ ] ESLint passes: `npm run lint` → Zero errors
- [ ] Prettier formatting applied: `npm run format`
- [ ] No console.log in production code
- [ ] Proper error boundaries in components
- [ ] Accessibility standards met (WCAG 2.1 AA)
- [ ] No hardcoded values (use constants/env)
- [ ] TypeScript strict mode (if using TS)

### 2. Testing (TDD - MANDATORY)

- [ ] Tests written BEFORE implementation
- [ ] All components have tests
- [ ] Coverage targets: Lines 80%+, Functions 85%+, Branches 75%+
- [ ] Happy path scenarios tested
- [ ] Error scenarios tested
- [ ] User interactions tested
- [ ] Tests pass: `npm test` → 100% pass rate

### 3. Component Structure

- [ ] Components are functional (React Hooks)
- [ ] Props properly typed/documented
- [ ] State management clear
- [ ] Side effects managed with useEffect
- [ ] Performance optimized (useMemo, useCallback)
- [ ] Custom hooks extracted where needed

### 4. Styling

- [ ] Consistent with design system
- [ ] Responsive design (mobile-first)
- [ ] Dark/light mode support if applicable
- [ ] Accessibility tested
- [ ] No inline styles (use CSS modules or CSS-in-JS)

### 5. Documentation

- [ ] Component purpose documented
- [ ] Props documented with JSDoc
- [ ] Usage examples provided
- [ ] Complex logic explained
- [ ] CHANGELOG.md entry added
- [ ] README.md updated if UI changed

### 6. API Integration

- [ ] Proper error handling for API calls
- [ ] Loading states implemented
- [ ] Retry logic for failed requests
- [ ] No hardcoded API URLs
- [ ] Environment variables used

### 7. Backwards Compatibility

- [ ] Page layouts unchanged (or documented)
- [ ] API endpoints compatible
- [ ] No breaking changes to components
- [ ] Theme/styling backwards compatible

---

## Component-Specific Criteria

### React Components

```javascript
/**
 * MyComponent - Description of component
 * @param {Object} props
 * @param {string} props.title - Component title
 * @param {Function} props.onAction - Callback handler
 */
function MyComponent({ title, onAction }) {
  const [state, setState] = React.useState(null);

  React.useEffect(() => {
    // Setup/cleanup
  }, []);

  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
}

export default MyComponent;
```

### Custom Hooks

```javascript
/**
 * useData - Fetch data from API
 * @param {string} endpoint - API endpoint
 * @returns {Object} { data, loading, error }
 */
function useData(endpoint) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    // Fetch logic
  }, [endpoint]);

  return { data, loading, error };
}

export default useData;
```

### Pages

- [ ] SEO metadata set (if SSR/Next.js)
- [ ] Loading states handled
- [ ] Error boundaries present
- [ ] Responsive layout tested
- [ ] Performance acceptable

---

## Accessibility Requirements

- [ ] ARIA labels where needed
- [ ] Keyboard navigation supported
- [ ] Color contrast meets WCAG AA
- [ ] Form fields properly labeled
- [ ] Error messages accessible
- [ ] Focus indicators visible

---

## Before Merging

- [ ] All tests pass locally: `npm test`
- [ ] Coverage thresholds met: `npm test -- --coverage`
- [ ] ESLint passes: `npm run lint`
- [ ] Prettier applied: `npm run format`
- [ ] Visual testing (if UI changed)
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Accessibility check (keyboard nav, screen reader)
- [ ] CHANGELOG.md updated
- [ ] Semantic versioning commit message used
- [ ] GitHub Actions pass (CI/CD)
- [ ] Pull request reviewed and approved

---

## See Also

- [Main Definition of Done](../../DEFINITION-OF-DONE.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Repository README](./README.md)
