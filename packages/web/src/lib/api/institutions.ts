import api from '../axios';
import type { Institution } from '../../store/Admin';

interface ApiInstitution {
  institution_id:   number;
  institution_name: string;
  address:          string | null;
  city:             string | null;
  is_deleted:       boolean;
  created_at:       string;
  _count: {
    institutionCourses:   number;
    employeeInstitutions: number;
    studentProfiles:      number;
  };
}

const mapInstitution = (i: ApiInstitution): Institution => ({
  id:                i.institution_id,
  name:              i.institution_name,
  city:              i.city ?? '',
  address:           i.address ?? '',
  coursesAssigned:   i._count.institutionCourses,
  employeesAssigned: i._count.employeeInstitutions,
  studentsEnrolled:  i._count.studentProfiles,
  status:            i.is_deleted ? 'INACTIVE' : 'ACTIVE',
  createdAt:         new Date(i.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
});

export const fetchInstitutions = () =>
  api.get<{ data: ApiInstitution[] }>('/institutions', { params: { limit: 100 } })
    .then((r) => r.data.data.map(mapInstitution));

export const createInstitutionApi = (name: string, address: string, city: string) =>
  api.post('/institutions', { name, address, city }).then((r) => r.data);

export const updateInstitutionApi = (id: number, name: string, address: string, city: string) =>
  api.patch(`/institutions/${id}`, { name, address, city }).then((r) => r.data);

export const deleteInstitutionApi = (id: number) =>
  api.delete(`/institutions/${id}`).then((r) => r.data);
