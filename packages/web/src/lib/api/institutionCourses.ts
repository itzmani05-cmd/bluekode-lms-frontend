import api from '../axios';
import type { CourseStatus } from '../../store/Admin';

export interface InstitutionCourseLink {
  institutionCourseId: number;
  courseId:             number;
  courseName:           string;
  courseStatus:         CourseStatus;
  assignedAt:           string;
}

interface ApiInstitutionCourse {
  institution_course_id: number;
  institution_id:        number;
  course_id:              number;
  created_at:             string;
  updated_at:             string | null;
  institution: { institution_id: number; institution_name: string };
  course:      { course_id: number; course_name: string; status: CourseStatus };
}

const mapInstitutionCourse = (ic: ApiInstitutionCourse): InstitutionCourseLink => ({
  institutionCourseId: ic.institution_course_id,
  courseId:             ic.course_id,
  courseName:           ic.course.course_name,
  courseStatus:         ic.course.status,
  assignedAt:           new Date(ic.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
});

export const fetchInstitutionCourses = (institutionId: number) =>
  api.get<{ data: ApiInstitutionCourse[] }>(`/institutions/${institutionId}/courses`, { params: { limit: 100 } })
    .then((r) => r.data.data.map(mapInstitutionCourse));

export const assignCourseToInstitutionApi = (institutionId: number, courseId: number) =>
  api.post(`/institutions/${institutionId}/courses`, { courseId }).then((r) => r.data);

export const removeInstitutionCourseApi = (institutionCourseId: number) =>
  api.delete(`/institution-courses/${institutionCourseId}`).then((r) => r.data);
