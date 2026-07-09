# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the **repo root** using npm workspaces. Never `cd` into a package.

```bash
# Install all dependencies (api + web)
npm install

# Start both dev servers concurrently (api :8000, web :5173)
npm run dev

# Run only one package
npm run dev -w packages/web
npm run dev -w packages/api

# Lint
npm run lint
npm run lint -w packages/web

# Build
npm run build

# Add a dependency to a specific package
npm install <pkg> -w packages/web
npm install -D <pkg> -w packages/web
```

There are no tests yet in this project.

## Architecture

### Monorepo Layout
```
packages/
  api/   — NestJS backend (stub only, single hello-world controller)
  web/   — React 19 + Vite 8 frontend (all active development)
```

### Frontend Navigation (No React Router)
Despite `react-router-dom` being installed, routing is **not used**. Navigation is handled by a `currentView` state in `App.tsx` which conditionally renders pages via `if/else`. Every page receives an `onViewChange` callback prop that it threads through to `Header` and `Sidebar`.

The current view union type is: `'dashboard' | 'courses' | 'assignments' | 'learning'`

When adding a new page:
1. Add its key to the union type in `App.tsx`, `Header.tsx`, and `Sidebar.tsx`
2. Add the `if (currentView === '...')` branch in `App.tsx`
3. Add the nav item to `navItems` arrays in both `Header.tsx` and `Sidebar.tsx`

### State Management
Two Zustand stores in `src/store/`:
- `login.ts` — auth state (`currentUser`, `isAuthenticated`, `login` action). Auth is currently **mocked** (no API call; validates that email contains the role name and password ≥ 4 chars).
- `Student.ts` — UI state for course search/tab and assignment search/filter. When adding a new student page with searchable content, add its fields here.

### Styling
Tailwind CSS v4 with `@import "tailwindcss"` in `index.css`. No config file needed.

The global CSS defines CSS custom properties (`--background`, `--foreground`, etc.) but the pages themselves use Tailwind utility classes directly rather than consuming those variables. The brand palette used throughout pages:
- Primary navy: `#001D6E` / `text-[#001D6E]`
- Accent blue: `blue-600`
- Page background: `bg-[#F8FAFC]`

The `.login-page` class on the Login wrapper switches the CSS variables to a light theme.

### Form Validation
Zod schemas live in `src/schemas/`. The login schema (`schemas/login.ts`) defines the role enum — update it when roles change.

### API Layer
`src/lib/axios.ts` is empty. There is no backend integration yet — all page data is hardcoded as static arrays inside component functions.

## Known Issues

- **`Certificates` page is built but unreachable** — `src/pages/student/Certificates.tsx` exists but is not wired into `App.tsx`. It also references `certificateSearchQuery`/`setCertificateSearchQuery` from `useStudentStore` which are not defined in `store/Student.ts` — adding these fields is required before the page will work.
- **`AdminDashboard` and `TrainerDashboard`** are 1-line stub files.
- **`DashboardLayout.tsx`** is an empty export stub (`export {}`).
- `recharts` is installed but unused.
