# Skill: React Development

## Goal

Produce a well-structured, strictly typed, accessible React component or hook that fits the bluekode-lms feature-first architecture.

---

## Steps

### 1. Clarify scope

- Determine whether this is a **shared** component (`src/components/`) or **feature-scoped** (`src/features/<name>/components/`).
- Determine whether a custom hook is needed to isolate logic from the JSX.

### 2. Define types first

- Create a `Props` type (or `interface`) above the component.
- No `any`. Use `unknown` + type guard if the shape is uncertain.
- Export types that callers will need.

### 3. Write the component

- Arrow function, named export.
- Destructure props inline.
- Keep JSX shallow — extract sub-trees into named child components if they grow beyond ~15 lines.
- No inline business logic: conditions, transforms, and calculations go into a hook or `useMemo`.

```tsx
type Props = {
  title: string;
  onAction: (id: string) => void;
};

export const ExampleCard = ({ title, onAction }: Props) => {
  return (
    <div className="rounded-lg p-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button onClick={() => onAction("id")} type="button">
        Act
      </button>
    </div>
  );
};
```

### 4. Extract logic into a custom hook

- If the component manages async data, derived state, or event handlers with side-effects, extract them into `use<ComponentName>.ts` in the same feature slice.

```ts
export const useExampleCard = (id: string) => {
  const [data, setData] = useState<CourseDetail | null>(null);

  useEffect(() => {
    fetchCourseDetail(id).then(setData);
  }, [id]);

  return { data };
};
```

### 5. Apply Tailwind and shadcn/ui

- Mobile-first base classes; add `sm:` / `md:` / `lg:` breakpoints as needed.
- Use `cn()` for conditional classes.
- Base interactive elements on shadcn/ui primitives (`Button`, `Card`, `Dialog`, etc.).

### 6. Add accessibility

- Semantic HTML tags (`<button>`, `<nav>`, `<section>`) over bare `<div>`.
- Every interactive element has an `aria-label` or visible text.
- Keyboard navigation works without a mouse.

### 7. Check before finishing

- [ ] No `any` types
- [ ] Props fully typed
- [ ] No inline business logic in JSX
- [ ] Mobile-first Tailwind classes
- [ ] Accessible (keyboard + ARIA)
- [ ] File under ~200 lines; split if larger
- [ ] Named export matches file name
