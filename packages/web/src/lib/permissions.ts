// Course/module/lesson create/update/delete is restricted to this single trainer account
// (mirrors the backend rule enforced by AllowedEmailsGuard on courses/modules/lectures controllers).
const COURSE_MANAGER_EMAIL = 'trainer@company.com';

export const canManageCourses = (email?: string | null) =>
  (email ?? '').toLowerCase() === COURSE_MANAGER_EMAIL;
