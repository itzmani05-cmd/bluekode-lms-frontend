# Skill: UI Components

## Goal

Build a reusable, accessible, Tailwind-styled UI component grounded in shadcn/ui primitives that fits the bluekode-lms design system.

---

## Steps

### 1. Choose the right base primitive

Pick the shadcn/ui primitive that most closely matches the component's purpose:

| Need | Primitive |
|---|---|
| Clickable action | `Button` |
| Container with header | `Card` |
| Modal overlay | `Dialog` |
| Dropdown menu | `DropdownMenu` |
| Form field | `Input`, `Select`, `Textarea` |
| Navigation | `NavigationMenu`, `Tabs` |
| Status indicator | `Badge`, `Alert` |
| Loading | `Skeleton` |

### 2. Wrap, don't fork

- Re-export or wrap the shadcn/ui primitive; never copy-paste its internals.
- Add only the props your feature needs; forward the rest via `...props`.

```tsx
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = ButtonProps & {
  loading?: boolean;
};

export const LoadingButton = ({ loading, children, className, ...props }: Props) => (
  <Button
    className={cn("min-w-24", className)}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading ? <span className="animate-spin">⟳</span> : children}
  </Button>
);
```

### 3. Compose with `cn()`

- Use `cn()` (clsx + tailwind-merge) for all conditional class logic.
- Never concatenate class strings with template literals.

```tsx
className={cn(
  "base-class",
  isActive && "active-class",
  size === "lg" && "large-class",
  className   // always accept and merge external className
)}
```

### 4. Design tokens only

- Use only values from `tailwind.config` (colors, spacing, typography).
- No arbitrary values (`w-[347px]`) unless no token exists and a comment explains why.
- No inline `style` props except for truly dynamic CSS (e.g., a progress bar width from state).

### 5. Responsive and mobile-first

- Base styles target mobile; scale up with `sm:` / `md:` / `lg:`.
- Stack on mobile, row on desktop: `flex flex-col sm:flex-row`.
- Touch targets minimum `44px` height for interactive elements.

### 6. Accessibility checklist

- [ ] Primitive's ARIA attributes are preserved (not stripped)
- [ ] Custom icons have `aria-hidden="true"` + sibling visible/sr-only text
- [ ] Focus ring visible (`focus-visible:ring-2`)
- [ ] Color is not the only indicator of state (add icon or text)
- [ ] Contrast ≥ 4.5:1 for text, ≥ 3:1 for UI boundaries

### 7. Place the file correctly

| Scope | Location |
|---|---|
| Used across features | `src/components/ui/<ComponentName>.tsx` |
| Feature-only | `src/features/<name>/components/<ComponentName>.tsx` |
