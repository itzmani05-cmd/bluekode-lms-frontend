
# bluekode-lms — Frontend Claude Guide

## Project Overview

E-learning platform built as a React + TypeScript SPA. The frontend handles student portals, course browsing, assignments, dashboards, and authentication. All state, API calls, validation, and UI live here; the backend is a separate service.

---

## Tech Stack

| Layer | Library |
|---|---|
| UI framework | React 18 (functional components only) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + shadcn/ui |
| Global state | Zustand |
| HTTP client | Axios |
| Validation | Zod |
| Routing | React Router v6 |
| Hooks | useState · useEffect · useMemo · useCallback |

---

## Recommended Folder Structure

```
src/
├── app/                  # App-level setup (router, providers, global styles)
├── assets/               # Static images, fonts, icons
├── components/           # Truly shared, domain-agnostic UI components
│   └── ui/               # shadcn/ui wrappers and re-exports
├── features/             # Feature-first slices (student, courses, assignments…)
│   └── <feature>/
│       ├── api/          # Axios calls for this feature
│       ├── components/   # Feature-scoped components
│       ├── hooks/        # Custom hooks
│       ├── store/        # Zustand slice
│       ├── types/        # Feature-specific TypeScript types
│       └── schemas/      # Zod schemas
├── hooks/                # Truly global custom hooks
├── lib/                  # Utility functions (pure, no side-effects)
├── services/             # Axios instance, interceptors, base API helpers
├── types/                # Shared global TypeScript types
└── pages/                # Route-entry components (thin wrappers only)
```

---

## Coding Standards

- Strict TypeScript — `any` is banned; prefer `unknown` + type guards.
- One component per file; file name matches the exported component name.
- Functional components with arrow function syntax.
- Destructure props inline; define a `Props` type above each component.
- No class components, no mixins.
- Keep files under ~200 lines; split if larger.
- No commented-out code; delete dead code.

---

## Component Architecture

- **Presentational** components receive props, render UI, emit callbacks.
- **Container** components own data-fetching and state; pass data down.
- **Page** components are thin: import a feature container, add a page title.
- Compose via children / render-props rather than deep prop drilling.
- Extract repeated JSX blocks into a named component immediately.

---

## State Management Guidelines

- Local, ephemeral UI state → `useState` / `useReducer`.
- Shared cross-feature or persistent state → Zustand slice inside `features/<name>/store/`.
- Never store derived data in state; compute it with `useMemo`.
- Keep Zustand slices small and focused (one domain per slice).
- Use `useCallback` for handlers passed as props to child components.

---

## API Integration Guidelines

- All Axios calls live in `features/<name>/api/` or `services/`.
- Create a single Axios instance in `services/axiosInstance.ts` with base URL and interceptors.
- Wrap every call in a typed async function; never call `axios.get` directly in a component.
- Return typed responses; validate with Zod at the boundary.
- Handle errors in the call site; propagate via thrown errors or return discriminated unions.
- Never put API keys or tokens in source files; read from `import.meta.env`.

---

## Form Validation Guidelines

- All form schemas are Zod objects in `features/<name>/schemas/`.
- Use `react-hook-form` with `zodResolver` for form wiring.
- Show field-level errors inline, immediately below the input.
- Validate on submit first, then on blur after the first submission attempt.
- Never trust client validation alone; server errors must also surface in the UI.

---

## Styling Guidelines

- Tailwind utility classes only; no plain CSS files except for global resets in `app/`.
- Use `cn()` (clsx + tailwind-merge) for conditional class composition.
- Design mobile-first: base classes for mobile, `sm:`/`md:`/`lg:` for larger breakpoints.
- Use shadcn/ui primitives as the component base; extend with Tailwind, never override component internals directly.
- No inline `style` props except for dynamic values that Tailwind cannot express.
- Color, spacing, and typography must use design-token values from `tailwind.config`.

---

## Performance Best Practices

- Wrap expensive computations in `useMemo`; wrap stable callbacks in `useCallback`.
- Lazy-load routes with `React.lazy` + `Suspense`.
- Avoid anonymous functions in JSX renders for components that memoize children.
- Use `React.memo` only after profiling proves a render bottleneck.
- Paginate or virtualize lists longer than ~100 items.
- Minimize Zustand selector surface — select only the slice of state needed.

---

## Naming Conventions

| Kind | Convention | Example |
|---|---|---|
| Component file | PascalCase | `CourseCard.tsx` |
| Hook file | camelCase prefixed `use` | `useEnrollment.ts` |
| Store file | camelCase | `courseStore.ts` |
| Utility file | camelCase | `formatDate.ts` |
| Type / Interface | PascalCase | `CourseDetail` |
| Zod schema | camelCase + `Schema` | `loginSchema` |
| CSS class var | kebab-case via Tailwind | `text-primary-600` |
| Env variable | `VITE_` prefix | `VITE_API_BASE_URL` |

---

## Git Workflow

- Branch from `master`; name branches `feat/`, `fix/`, `chore/`, `refactor/`.
- One logical change per commit; write imperative commit messages.
- Open a PR to `setup-frontend` → `master`; request one reviewer minimum.
- Never force-push `master`; rebase feature branches before merge.
- All CI checks must pass before merge.

---

## Testing Expectations

- Unit test pure utilities and Zod schemas with Vitest.
- Test custom hooks with `@testing-library/react`.
- Integration-test key user flows (login, enroll, submit assignment) with React Testing Library.
- Avoid mocking internals; mock at the network boundary (MSW).
- Aim for meaningful coverage over 100% line coverage.

---

## Security Best Practices

- Never store JWTs or sensitive data in `localStorage`; prefer `httpOnly` cookies or in-memory state.
- Sanitize any user-generated HTML before rendering (use DOMPurify).
- Use Zod to validate all external data before use.
- Do not expose `import.meta.env` values beyond what the UI strictly needs.
- Rely on CSP headers from the server; do not inline scripts.

---

## Accessibility Guidelines

- Every interactive element must be keyboard reachable and have an accessible label.
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<section>`) before reaching for `<div>`.
- shadcn/ui primitives include ARIA; do not remove or override ARIA attributes.
- Maintain a color-contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for UI components.
- Test with a screen reader (NVDA/VoiceOver) for key flows.

---

## Error Handling Strategy

- Wrap route-level components in an `ErrorBoundary`; show a friendly fallback UI.
- API errors: catch in the API layer, surface a user-readable message via toast or inline alert.
- Zod parse failures: treat as programmer error in dev (throw); in prod, log and show generic error.
- Never swallow errors silently; always log to the console in dev.

---

## Instructions for Future Claude Sessions

- Read this file first before making any changes.
- Prefer editing existing files over creating new ones.
- Follow the feature-first folder structure above.
- Do not install packages without explicit user approval.
- Do not delete or overwrite files without confirmation.
- Do not use `any`; do not bypass TypeScript errors with `// @ts-ignore`.
- Keep components small, typed, and focused.
- Run `tsc --noEmit` and the linter mentally before proposing code.
- When in doubt, ask — do not guess at business logic.
