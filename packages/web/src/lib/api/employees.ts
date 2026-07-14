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
});

export const fetchEmployees = () =>
  api.get<{ data: ApiEmployeeProfile[] }>('/employee-profiles', { params: { limit: 100 } })
    .then((r) => r.data.data.map(mapEmployee));
