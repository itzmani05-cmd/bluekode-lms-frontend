import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: z.enum(['student', 'trainer', 'technical head', 'project head', 'admin']),
});

export type LoginFields = z.infer<typeof loginSchema>;
