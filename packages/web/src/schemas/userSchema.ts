import { z } from 'zod';

export const userRoleValues = ['student', 'trainer', 'technical head', 'project head', 'admin'] as const;

export const createUserSchema = z.object({
  email: z.string().min(1, 'Email is required.').email('Please enter a valid email address.'),
  role:  z.enum(userRoleValues),
});

export type CreateUserFields = z.infer<typeof createUserSchema>;
