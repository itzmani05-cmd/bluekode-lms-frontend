import { z } from 'zod';

export const moduleSchema = z.object({
  name:        z.string().min(1, 'Module name is required.'),
  description: z.string().optional(),
});

export type ModuleFields = z.infer<typeof moduleSchema>;
