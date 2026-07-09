# Skill: Performance

## Goal

Identify and eliminate unnecessary renders, reduce bundle size, and ensure the bluekode-lms UI stays responsive as data and component trees grow.

---

## Steps

### 1. Profile before optimizing

- Open React DevTools Profiler and record the interaction that feels slow.
- Identify components that render more times than expected.
- Never apply `React.memo`, `useMemo`, or `useCallback` speculatively.

### 2. Fix unnecessary re-renders

**Narrow Zustand selectors**
```ts
// Bad — re-renders on any store change
const { courses, isLoading } = useCourseStore();

// Good — each selector is independent
const courses = useCourseStore((s) => s.courses);
const isLoading = useCourseStore((s) => s.isLoading);
```

**Stable callbacks with `useCallback`**
```ts
// Wrap handlers passed as props to memoized children
const handleSelect = useCallback((id: string) => {
  selectCourse(id);
}, [selectCourse]);
```

**Memoize expensive computations**
```ts
const sortedCourses = useMemo(
  () => [...courses].sort((a, b) => a.title.localeCompare(b.title)),
  [courses]
);
```

**`React.memo` for stable leaf components**
```ts
// Only after profiling proves a bottleneck
export const CourseCard = React.memo(({ course }: Props) => { ... });
```

### 3. Code-split routes

```tsx
// src/app/router.tsx
const CoursesPage = React.lazy(() => import("@/pages/CoursesPage"));
const AssignmentsPage = React.lazy(() => import("@/pages/AssignmentsPage"));

<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/courses" element={<CoursesPage />} />
    <Route path="/assignments" element={<AssignmentsPage />} />
  </Routes>
</Suspense>
```

### 4. Virtualize long lists

Use a windowing library (e.g., `@tanstack/react-virtual`) for lists longer than ~100 items.

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

const rowVirtualizer = useVirtualizer({
  count: courses.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 72,
});
```

### 5. Avoid expensive renders in JSX

```tsx
// Bad — new function reference every render
<Button onClick={() => handleAction(item.id)} />

// Good — stable reference
const handleClick = useCallback(() => handleAction(item.id), [item.id, handleAction]);
<Button onClick={handleClick} />
```

### 6. Image and asset optimization

- Use `loading="lazy"` on all images below the fold.
- Serve correctly sized images; avoid CSS scaling of oversized sources.
- Use SVG sprites or icon components instead of icon font libraries.

### 7. Check before finishing

- [ ] Profiler used to confirm the bottleneck before applying fixes
- [ ] Zustand selectors are narrow (one value per selector)
- [ ] `useCallback` wraps handlers passed to child components
- [ ] `useMemo` wraps sort/filter/transform operations on large arrays
- [ ] Routes are lazy-loaded with `React.lazy` + `Suspense`
- [ ] Lists > 100 items are virtualized
- [ ] No anonymous functions on hot render paths
