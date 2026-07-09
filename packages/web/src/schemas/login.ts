import { z } from 'zod';

export const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export type LoginFields = z.infer<typeof loginSchema>;
