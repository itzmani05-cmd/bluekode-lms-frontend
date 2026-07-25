import { z } from 'zod';

export const contentTypeValues  = ['LECTURE', 'ASSIGNMENT'] as const;
export const lessonStatusValues = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export const lectureSchema = z.object({
  title:                    z.string().min(1, 'Title is required.'),
  contentType:              z.enum(contentTypeValues),
  status:                   z.enum(lessonStatusValues),
  description:              z.string().optional(),
  estimatedDurationMinutes: z.number().int().positive().nullable().optional(),
  maxMarks:                 z.number().int().min(0).nullable().optional(),
});

export type LectureFields = z.infer<typeof lectureSchema>;
