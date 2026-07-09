import { z } from 'zod';

export const courseStatusValues = ['ACTIVE', 'DRAFT', 'ARCHIVED'] as const;

export const courseSchema = z.object({
  name:        z.string().min(1, 'Course name is required.'),
  description: z.string().min(1, 'Description is required.'),
  status:      z.enum(courseStatusValues),
});

export type CourseFields = z.infer<typeof courseSchema>;
