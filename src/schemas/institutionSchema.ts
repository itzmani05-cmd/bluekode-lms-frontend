import { z } from 'zod';

export const institutionSchema = z.object({
  name:    z.string().min(1, 'Institution name is required.'),
  address: z.string().min(1, 'Address is required.'),
  city:    z.string().min(1, 'City is required.'),
});

export type InstitutionFields = z.infer<typeof institutionSchema>;
