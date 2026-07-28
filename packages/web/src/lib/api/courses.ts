import api from '../axios';
import type { Course, CourseStatus } from '../../store/Admin';

interface ApiCourse {
  course_id:   number;
  course_name: string;
  description: string | null;
  status:      CourseStatus;
  created_at:  string;
  _count:      { modules: number; enrollments: number };
}

const mapCourse = (c: ApiCourse): Course => ({
  id:          c.course_id,
  name:        c.course_name,
  description: c.description ?? '',
  status:      c.status,
  moduleCount: c._count.modules,
  enrollments: c._count.enrollments,
  createdAt:   new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
});

export const fetchCourses = () =>
  api.get<{ data: ApiCourse[] }>('/courses', { params: { limit: 100 } })
    .then((r) => r.data.data.map(mapCourse));

export const createCourseApi = (name: string, description: string, status: CourseStatus) =>
  api.post<{ data: ApiCourse }>('/courses', { name, description, status }).then((r) => mapCourse(r.data.data));

export const updateCourseApi = (id: number, name: string, description: string, status: CourseStatus) =>
  api.patch<{ data: ApiCourse }>(`/courses/${id}`, { name, description, status }).then((r) => mapCourse(r.data.data));

export const deleteCourseApi = (id: number) =>
  api.delete(`/courses/${id}`).then((r) => r.data);

export interface CourseDetail {
  id:          number;
  name:        string;
  description: string;
  status:      CourseStatus;
  enrollments: number;
}

export const fetchCourseByIdApi = (id: number) =>
  api
    .get<{ success: boolean; data: ApiCourse }>(`/courses/${id}`)
    .then((r) => {
      const c = r.data.data;
      return {
        id:          c.course_id,
        name:        c.course_name,
        description: c.description ?? '',
        status:      c.status,
        enrollments: c._count.enrollments,
      } satisfies CourseDetail;
    });
