# Contributing to necrobot-dashboard

Thank you for contributing to necrobot-dashboard! This module provides the web UI for NecromundaBot management.

---

## Before You Start

1. Read the [Definition of Done](./DEFINITION-OF-DONE.md)
2. Review the [Code of Conduct](./CODE_OF_CONDUCT.md)
3. Follow [Main Contributing Guidelines](../../CONTRIBUTING.md)
4. Review existing components and pages

---

## Contribution Types

### 1. New Components

Components should be:
- **Functional** (React Hooks)
- **Reusable** across pages
- **Well-documented** with props
- **Fully tested**
- **Accessible**

Example:
```javascript
/**
 * Button - Reusable button component
 * @param {Object} props
 * @param {string} props.label - Button text
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.loading - Loading state
 */
function Button({ label, onClick, loading = false }) {
  return (
    <button 
      onClick={onClick} 
      disabled={loading}
      aria-busy={loading}
    >
      {loading ? 'Loading...' : label}
    </button>
  );
}

export default Button;
```

### 2. Custom Hooks

Hooks should:
- **Handle side effects** (fetch, timers, etc)
- **Be pure** (no mutations)
- **Be testable** (clear interface)
- **Follow naming** (use prefix)

Example:
```javascript
function useFetch(url) {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(e => setError(e))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, error, loading };
}
```

### 3. Pages

Pages should:
- **Have metadata** (title, description)
- **Handle loading/error states**
- **Be responsive** (mobile-first)
- **Be accessible**

### 4. Styling

Styles should:
- **Use CSS modules** or styled-components
- **Follow design system**
- **Support dark mode** (if applicable)
- **Be responsive**

---

## Testing Requirements

All components require tests:

```bash
# Run all tests
npm test

# Run specific test
npm test -- tests/MyComponent.test.js

# Check coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

Test requirements:
- ✅ Component renders correctly
- ✅ Props work as expected
- ✅ User interactions work
- ✅ Loading states
- ✅ Error states
- ✅ Accessibility

Example test:
```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders button with label', () => {
    render(<Button label="Click me" />);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button label="Click" onClick={handleClick} />);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button label="Submit" loading={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## Commit Message Format

This project uses **Semantic Versioning** with **Conventional Commits**:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature/component (MINOR version bump)
- `fix` - Bug fix (PATCH version bump)
- `docs` - Documentation (no version change)
- `test` - Tests (no version change)
- `refactor` - Refactoring (no version change)
- `chore` - Maintenance (no version change)

**Examples:**
```bash
# New component
git commit -m "feat(components): add UserProfile component"

# Bug fix
git commit -m "fix(pages): resolve layout issue on mobile"

# Style updates
git commit -m "style(dashboard): update color scheme for dark mode"
```

---

## Development Workflow

1. **Fork & Clone**: Fork the repository
2. **Create Branch**: `feature/new-component` or `bugfix/layout-fix`
3. **Write Tests First**: TDD is mandatory
4. **Implement Component**: Code implementation
5. **Run Tests**: `npm test` must pass
6. **Lint Code**: `npm run lint` must pass
7. **Format**: `npm run format` for consistency
8. **Visual Testing**: Test in browser
9. **Accessibility Check**: Test keyboard navigation
10. **Commit**: Use semantic commit messages
11. **Push**: Push to your fork
12. **Pull Request**: Create PR with description

---

## Pull Request Checklist

- [ ] Tests written first (TDD)
- [ ] All tests pass: `npm test`
- [ ] Coverage thresholds met (80%+)
- [ ] ESLint passes: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] Visual testing completed
- [ ] Responsive design tested (mobile/tablet/desktop)
- [ ] Accessibility tested (keyboard nav, screen reader)
- [ ] CHANGELOG.md updated
- [ ] Semantic commit message used
- [ ] Related issues referenced
- [ ] Documentation updated if needed

---

## Accessibility Guidelines

All components must be accessible:

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] ARIA labels present where needed
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus indicators visible
- [ ] Form fields properly labeled
- [ ] Error messages are clear
- [ ] Images have alt text

---

## Performance Tips

- Use `React.memo()` for expensive components
- Use `useMemo()` for expensive calculations
- Use `useCallback()` for stable function references
- Lazy load components/routes with `React.lazy()`
- Optimize bundle size (check imports)
- Profile with React DevTools

---

## Responsive Design

Design mobile-first:

- [ ] 320px - Small phones
- [ ] 768px - Tablets
- [ ] 1024px - Desktops
- [ ] 1440px - Large screens

Use media queries:
```css
@media (min-width: 768px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

---

## Questions?

- Review [Main CONTRIBUTING.md](../../CONTRIBUTING.md)
- Check [Definition of Done](./DEFINITION-OF-DONE.md)
- Read [README.md](./README.md)
- Look at existing components
