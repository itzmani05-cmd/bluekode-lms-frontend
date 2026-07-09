# Skill: API Integration

## Goal

Add a fully typed, error-safe API module for a feature using the shared Axios instance, with Zod validation at the response boundary.

---

## Steps

### 1. Use the shared Axios instance

Always import from `src/services/axiosInstance.ts`. Never create a new `axios.create()` per feature.

```ts
// src/services/axiosInstance.ts (ensure this exists)
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // normalise error shape here
    return Promise.reject(error);
  }
);
```

### 2. Define Zod schemas for responses

Place schemas in `src/features/<name>/schemas/<name>Schemas.ts`.

```ts
import { z } from "zod";

export const courseSchema = z.object({
  id: z.string(),
  title: z.string(),
  instructor: z.string(),
  enrolledCount: z.number(),
  status: z.enum(["active", "archived", "draft"]),
});

export const courseListSchema = z.array(courseSchema);

export type Course = z.infer<typeof courseSchema>;
```

### 3. Write typed API functions

Place in `src/features/<name>/api/<name>Api.ts`.

```ts
import { api } from "@/services/axiosInstance";
import { courseListSchema, courseSchema, type Course } from "../schemas/courseSchemas";

export const fetchCourses = async (): Promise<Course[]> => {
  const res = await api.get("/courses");
  return courseListSchema.parse(res.data);
};

export const fetchCourseById = async (id: string): Promise<Course> => {
  const res = await api.get(`/courses/${id}`);
  return courseSchema.parse(res.data);
};

export const enrollInCourse = async (courseId: string): Promise<void> => {
  await api.post(`/courses/${courseId}/enroll`);
};
```

### 4. Consume in a custom hook — never directly in components

```ts
// src/features/courses/hooks/useCourses.ts
import { useEffect } from "react";
import { useCourseStore } from "../store/courseStore";
import { fetchCourses } from "../api/courseApi";

export const useCourses = () => {
  const { setCourses, setLoading, setError } = useCourseStore();

  useEffect(() => {
    setLoading(true);
    fetchCourses()
      .then(setCourses)
      .catch((err) => setError(err.message ?? "Failed to load courses"))
      .finally(() => setLoading(false));
  }, []);
};
```

### 5. Never expose secrets

- Base URL and all config from `import.meta.env.VITE_*`.
- No tokens hardcoded in source; read from in-memory store or `httpOnly` cookie.

### 6. Check before finishing

- [ ] Uses shared Axios instance
- [ ] Response validated with Zod before use
- [ ] API function returns typed value (no `any`)
- [ ] Called from a hook, not directly from a component
- [ ] Errors caught and forwarded to the store or caller
- [ ] No secrets in source files
