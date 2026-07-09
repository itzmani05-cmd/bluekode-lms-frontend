# Skill: Code Review

## Goal

Review React + TypeScript code in the bluekode-lms frontend for correctness, type safety, accessibility, performance, and adherence to project conventions.

---

## Review Checklist

### TypeScript & Types

- [ ] No `any` — use `unknown` + type guard, or a concrete type
- [ ] No `// @ts-ignore` or `// @ts-expect-error` without a justifying comment
- [ ] Props interfaces defined above every component
- [ ] Return types annotated on all non-trivial functions
- [ ] Zod schemas used at all API/external data boundaries
- [ ] No unsafe type assertions (`as SomeType`) without runtime validation

### React & Component Design

- [ ] Functional components only — no class components
- [ ] No inline business logic in JSX (conditions, transforms belong in hooks or `useMemo`)
- [ ] Repeated JSX extracted into named components
- [ ] Custom hooks used for stateful/async logic
- [ ] No prop drilling beyond 2 levels — use Zustand or context
- [ ] Keys in lists are stable and unique (not array index)
- [ ] No missing `useEffect` dependency array entries

### State Management

- [ ] Local state for local concerns; Zustand for shared/cross-route state
- [ ] Derived values computed with `useMemo`, not duplicated in state
- [ ] Zustand selectors are narrow (select one value, not whole store)
- [ ] Store slices have a `reset()` action

### API Integration

- [ ] API calls in `features/<name>/api/`, not in components
- [ ] Responses validated with Zod before use
- [ ] Errors caught and surfaced — none silently swallowed
- [ ] No secrets or tokens in source files

### Styling

- [ ] Tailwind utility classes only — no plain CSS files (except global reset)
- [ ] `cn()` used for conditional class composition
- [ ] Mobile-first responsive classes applied
- [ ] No arbitrary Tailwind values without a comment

### Performance

- [ ] No anonymous functions passed as props to memoized children
- [ ] `useCallback` wraps stable handlers
- [ ] `useMemo` wraps expensive computations
- [ ] `React.memo` used only where profiler confirmed a bottleneck
- [ ] Routes lazy-loaded

### Accessibility

- [ ] Semantic HTML elements used (not `<div>` for everything)
- [ ] All interactive elements reachable by keyboard
- [ ] Labels associated with inputs via `htmlFor` / `id`
- [ ] `aria-label` on icon-only buttons
- [ ] Error messages use `role="alert"`
- [ ] Focus ring visible on focused elements

### Security

- [ ] No `dangerouslySetInnerHTML` without DOMPurify sanitization
- [ ] No sensitive data in `localStorage`
- [ ] Env variables accessed via `import.meta.env.VITE_*` only

### General Code Quality

- [ ] File under ~200 lines — split if larger
- [ ] No commented-out code
- [ ] No dead imports
- [ ] File and export names match
- [ ] Commit message is imperative and describes the "why"

---

## How to report findings

For each issue found, state:
1. **File and line** where the issue is
2. **What the problem is** (one sentence)
3. **Suggested fix** (code snippet if helpful)

Group findings by severity: **Critical** (bug / security) → **Warning** (standards violation) → **Suggestion** (improvement).
