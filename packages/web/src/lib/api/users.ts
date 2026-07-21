import api from '../axios';
import type { AdminUser, AccountStatus, UserRole } from '../../store/Admin';

interface ApiUser {
  user_id: number;
  full_name: string;
  last_name: string;
  email: string;
  account_status: AccountStatus;
  created_at: string;
  userRoles: { role: { role_name: string } }[];
}

const mapUser = (u: ApiUser): AdminUser => ({
  id:            u.user_id,
  fullName:      `${u.full_name} ${u.last_name}`.trim(),
  email:         u.email,
  role:          ((u.userRoles[0]?.role.role_name ?? 'admin').toLowerCase()) as UserRole,
  accountStatus: u.account_status,
  createdAt:     new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
});

export const fetchUsers = () =>
  api.get<{ data: ApiUser[] }>('/users', { params: { limit: 100 } })
    .then((r) => r.data.data.map(mapUser));

export const createUserApi = (email: string, password: string, full_name: string, last_name: string, roleName: string) =>
  api.post('/users', { email, password, full_name, last_name, roleName }).then((r) => r.data);

export const updateUserStatusApi = (id: number, status: AccountStatus) =>
  api.patch(`/users/${id}`, { status }).then((r) => r.data);
