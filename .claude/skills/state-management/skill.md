# Skill: State Management

## Goal

Design and implement the correct state layer for a feature — local React state, Zustand slice, or derived/computed state — with no unnecessary coupling or re-renders.

---

## Steps

### 1. Decide what kind of state this is

| State type | Solution |
|---|---|
| Component-local, ephemeral (open/close, input value) | `useState` |
| Complex local state with multiple sub-values | `useReducer` |
| Shared across sibling components within a feature | Lift to parent or Zustand |
| Shared across features / persisted across routes | Zustand slice |
| Derived from existing state | `useMemo` — never duplicate in state |

### 2. Create a Zustand slice (when needed)

Place the file at `src/features/<name>/store/<name>Store.ts`.

```ts
import { create } from "zustand";

type CourseState = {
  courses: Course[];
  selectedId: string | null;
  isLoading: boolean;
  error: string | null;
};

type CourseActions = {
  setCourses: (courses: Course[]) => void;
  selectCourse: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
};

const initialState: CourseState = {
  courses: [],
  selectedId: null,
  isLoading: false,
  error: null,
};

export const useCourseStore = create<CourseState & CourseActions>((set) => ({
  ...initialState,
  setCourses: (courses) => set({ courses }),
  selectCourse: (id) => set({ selectedId: id }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
```

### 3. Use narrow selectors in components

- Select only the exact slice needed — never subscribe to the whole store.
- Prevents re-renders when unrelated state changes.

```ts
// Good — component only re-renders when `isLoading` changes
const isLoading = useCourseStore((s) => s.isLoading);

// Bad — re-renders on any store change
const store = useCourseStore();
```

### 4. Keep slices small and focused

- One domain per slice (courses, auth, assignments — not "global").
- No cross-slice imports; communicate via actions or a coordination hook.
- No API calls inside the store; call from a hook and then dispatch to the store.

### 5. Derived state with `useMemo`

```ts
const activeCourses = useMemo(
  () => courses.filter((c) => c.status === "active"),
  [courses]
);
```

### 6. Check before finishing

- [ ] No duplicate state (derived values computed, not stored)
- [ ] Narrow selectors in every component
- [ ] Slice has a `reset()` action for cleanup on unmount / logout
- [ ] No API calls inside the Zustand store
- [ ] File placed at `src/features/<name>/store/`
