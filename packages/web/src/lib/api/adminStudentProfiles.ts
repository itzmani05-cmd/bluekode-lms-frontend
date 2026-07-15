import api from '../axios';

export type FormStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED';

export interface AdminStudentProfile {
  id:           number;
  userId:       number;
  institutionId: number;
  department:   string | null;
  academicYear: number | null;
  formStatus:   FormStatus;
  createdAt:    string;
  fullName:     string;
  lastName:     string | null;
  email:        string;
  institutionName: string;
}

interface ApiProfile {
  student_profile_id: number;
  user_id:            number;
  institution_id:     number;
  department:         string | null;
  academic_year:      number | null;
  form_status:        string;
  created_at:         string;
  user:        { user_id: number; full_name: string; last_name: string | null; email: string };
  institution: { institution_id: number; institution_name: string };
}

const map = (p: ApiProfile): AdminStudentProfile => ({
  id:              p.student_profile_id,
  userId:          p.user_id,
  institutionId:   p.institution_id,
  department:      p.department,
  academicYear:    p.academic_year,
  formStatus:      p.form_status as FormStatus,
  createdAt:       p.created_at,
  fullName:        p.user.full_name,
  lastName:        p.user.last_name,
  email:           p.user.email,
  institutionName: p.institution.institution_name,
});

export const fetchAllStudentProfilesApi = (params?: {
  search?: string;
  institutionId?: number;
  formStatus?: FormStatus;
  page?: number;
  limit?: number;
}) =>
  api
    .get<{ success: boolean; data: ApiProfile[]; meta: { total: number } }>(
      '/student-profiles',
      { params: { limit: 100, ...params } },
    )
    .then((r) => ({ data: r.data.data.map(map), total: r.data.meta.total }));

export const createStudentProfileApi = (
  userId:       number,
  institutionId: number,
  department?:   string,
  academicYear?: number,
  formStatus?:   FormStatus,
) =>
  api
    .post<{ success: boolean; data: ApiProfile }>(
      `/users/${userId}/student-profile`,
      { institutionId, department, academicYear, formStatus },
    )
    .then((r) => map(r.data.data));

export const updateStudentProfileApi = (
  id:            number,
  fields: {
    institutionId?: number;
    department?:    string;
    academicYear?:  number;
    formStatus?:    FormStatus;
  },
) =>
  api
    .patch<{ success: boolean; data: ApiProfile }>(`/student-profiles/${id}`, fields)
    .then((r) => map(r.data.data));

export const deleteStudentProfileApi = (id: number) =>
  api.delete(`/student-profiles/${id}`).then((r) => r.data);
