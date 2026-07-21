import api from '../axios';
import type { Employee, EmployeeStatus } from '../../store/Admin';

interface ApiEmployeeProfile {
  employee_profile_id: number;
  designation:         string | null;
  specialization:       string | null;
  years_of_experience:  number | null;
  joining_date:         string | null;
  is_active:            boolean | null;
  created_at:           string;
  user: {
    full_name: string;
    last_name: string;
    email:     string;
    userRoles: { role: { role_name: string } }[];
  };
  employeeInstitutions: { institution: { institution_name: string } }[];
}

const mapEmployee = (e: ApiEmployeeProfile): Employee => ({
  id:                e.employee_profile_id,
  fullName:          `${e.user.full_name} ${e.user.last_name}`.trim(),
  email:             e.user.email,
  designation:       e.designation ?? '—',
  role:              e.user.userRoles[0]?.role.role_name ?? '—',
  specialization:    e.specialization ?? '—',
  yearsOfExperience: e.years_of_experience ?? 0,
  institution:       e.employeeInstitutions[0]?.institution.institution_name ?? '—',
  status:            (e.is_active === false ? 'INACTIVE' : 'ACTIVE') as EmployeeStatus,
  joiningDate:       e.joining_date
    ? new Date(e.joining_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    : '—',
  joiningDateRaw:    e.joining_date ? e.joining_date.split('T')[0] : null,
  designationRaw:    e.designation,
  specializationRaw: e.specialization,
  isActive:          e.is_active !== false,
});

export const fetchEmployees = () =>
  api.get<{ data: ApiEmployeeProfile[] }>('/employee-profiles', { params: { limit: 100 } })
    .then((r) => r.data.data.map(mapEmployee));

export interface EmployeeProfileFields {
  designation?:       string;
  specialization?:    string;
  yearsOfExperience?: number;
  joiningDate?:       string;
  isActive?:          boolean;
}

export const createEmployeeProfileApi = (userId: number, fields: EmployeeProfileFields) =>
  api
    .post<{ success: boolean; data: ApiEmployeeProfile }>(`/users/${userId}/employee-profile`, fields)
    .then((r) => mapEmployee(r.data.data));

export const updateEmployeeProfileApi = (id: number, fields: EmployeeProfileFields) =>
  api
    .patch<{ success: boolean; data: ApiEmployeeProfile }>(`/employee-profiles/${id}`, fields)
    .then((r) => mapEmployee(r.data.data));

export const deleteEmployeeProfileApi = (id: number) =>
  api.delete(`/employee-profiles/${id}`).then((r) => r.data);

export const fetchMyEmployeeProfile = (userId: number) =>
  api
    .get<{ success: boolean; data: ApiEmployeeProfile }>(`/users/${userId}/employee-profile`)
    .then((r) => mapEmployee(r.data.data));
