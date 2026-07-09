# Skill: Debugging

## Goal

Systematically diagnose and fix bugs in React components, Zustand stores, Axios calls, TypeScript types, and routing in the bluekode-lms frontend.

---

## Steps

### 1. Reproduce the bug precisely

Before touching any code:
- State the exact steps to trigger the bug.
- Note the **expected** vs **actual** behavior.
- Note where the error appears: browser console, network tab, UI, TypeScript compiler.

### 2. Classify the bug type

| Symptom | Likely cause |
|---|---|
| Component doesn't update after state change | Stale closure, mutated state, wrong Zustand selector |
| Infinite render loop | `useEffect` missing/wrong deps, state update in render |
| TypeScript error | Wrong type, missing type guard, unsafe assertion |
| API call fails or returns wrong data | Wrong URL, missing auth header, Zod parse failure |
| Form field doesn't validate | Wrong schema field name, missing `zodResolver` |
| UI shows stale data after action | Store not updated, selector too broad/narrow |
| Route doesn't render | Missing `<Route>`, wrong path, lazy import error |

### 3. Isolate the problem

**For component bugs** — add temporary `console.log` in render and effect:
```ts
useEffect(() => {
  console.log("[DEBUG] effect ran, value:", value);
}, [value]);
```

**For Zustand bugs** — log store state before and after the action:
```ts
const before = useCourseStore.getState();
setCourses(newCourses);
const after = useCourseStore.getState();
console.log("[DEBUG] store diff", { before, after });
```

**For API bugs** — inspect the raw Axios response before Zod parses it:
```ts
const res = await api.get("/courses");
console.log("[DEBUG] raw response", res.data);
const parsed = courseListSchema.safeParse(res.data);
console.log("[DEBUG] zod result", parsed);
```

**For TypeScript errors** — narrow types step by step:
```ts
// Replace `as SomeType` with a type guard
if (!isCourse(data)) {
  throw new Error(`Unexpected shape: ${JSON.stringify(data)}`);
}
```

### 4. Common React pitfalls

**Stale closure in `useEffect`**
```ts
// Wrong — `count` captured at mount
useEffect(() => {
  const id = setInterval(() => console.log(count), 1000);
  return () => clearInterval(id);
}, []); // missing `count`

// Fixed
useEffect(() => {
  const id = setInterval(() => console.log(count), 1000);
  return () => clearInterval(id);
}, [count]);
```

**State mutation (Zustand / useState)**
```ts
// Wrong — mutating the array directly
courses.push(newCourse); // Zustand won't detect this
set({ courses });

// Fixed — return a new array
set({ courses: [...courses, newCourse] });
```

**Missing key in list**
```tsx
// Wrong
{courses.map((c) => <CourseCard course={c} />)}

// Fixed
{courses.map((c) => <CourseCard key={c.id} course={c} />)}
```

### 5. Fix and verify

- Apply the minimal change that resolves the root cause.
- Re-run the reproduction steps to confirm it is fixed.
- Check for regressions in adjacent behaviour.
- Remove all `[DEBUG]` console logs before committing.

### 6. Check before finishing

- [ ] Root cause identified (not just symptoms patched)
- [ ] Minimal fix applied — no unrelated changes
- [ ] All debug logs removed
- [ ] TypeScript compiles with no new errors
- [ ] Reproduction steps verified as resolved
