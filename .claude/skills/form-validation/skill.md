# Skill: Form Validation

## Goal

Build a fully validated, accessible form using Zod schemas and react-hook-form with inline field errors and server error surfacing.

---

## Steps

### 1. Define the Zod schema first

Place in `src/features/<name>/schemas/<name>Schemas.ts`.

```ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
```

### 2. Wire up react-hook-form with zodResolver

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "../schemas/loginSchemas";

const {
  register,
  handleSubmit,
  setError,
  formState: { errors, isSubmitting },
} = useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
});
```

### 3. Build the form component

```tsx
const onSubmit = async (values: LoginFormValues) => {
  try {
    await loginUser(values);
  } catch (err) {
    // Surface server error on the relevant field or as a root error
    setError("root", { message: "Invalid email or password" });
  }
};

return (
  <form onSubmit={handleSubmit(onSubmit)} noValidate>
    <div>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" {...register("email")} />
      {errors.email && (
        <p role="alert" className="text-sm text-red-600">{errors.email.message}</p>
      )}
    </div>

    <div>
      <label htmlFor="password">Password</label>
      <input id="password" type="password" {...register("password")} />
      {errors.password && (
        <p role="alert" className="text-sm text-red-600">{errors.password.message}</p>
      )}
    </div>

    {errors.root && (
      <p role="alert" className="text-sm text-red-600">{errors.root.message}</p>
    )}

    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Signing in…" : "Sign in"}
    </button>
  </form>
);
```

### 4. Validation timing

- Validate on **submit** first.
- After the first submit attempt, switch to **on blur** per field: pass `mode: "onTouched"` to `useForm`.

```ts
useForm<LoginFormValues>({
  resolver: zodResolver(loginSchema),
  mode: "onTouched",
});
```

### 5. Server error handling

- Use `setError("fieldName", { message })` to put server errors on specific fields.
- Use `setError("root", { message })` for non-field errors (auth failure, network error).
- Always surface server errors — never swallow them silently.

### 6. Accessibility checklist

- [ ] `<label>` with `htmlFor` matching input `id` on every field
- [ ] Error messages use `role="alert"` so screen readers announce them
- [ ] Submit button disabled during submission
- [ ] `noValidate` on `<form>` to prevent native browser validation interfering
- [ ] Required fields marked with `aria-required="true"` or `required`

### 7. Check before finishing

- [ ] Zod schema in `schemas/` folder
- [ ] `zodResolver` wired to `useForm`
- [ ] Field-level errors displayed inline below inputs
- [ ] Server errors surfaced via `setError`
- [ ] `mode: "onTouched"` for progressive validation
- [ ] Form accessible (labels, alerts, keyboard)
