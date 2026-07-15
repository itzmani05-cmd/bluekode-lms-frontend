import api from '../axios';

export interface LoginResponse {
  access_token: string;
  user: {
    user_id:        number;
    full_name:      string;
    email:          string;
    roles:          string[];
    account_status: string;
  };
}

export interface CompleteProfilePayload {
  firstName:          string;
  lastName?:          string;
  phone?:             string;
  institutionId?:     number;
  department?:        string;
  academicYear?:      number;
  designation?:       string;
  specialization?:    string;
  yearsOfExperience?: number;
  joiningDate?:       string;
}

export const loginApi = (email: string, password: string) =>
  api.post<LoginResponse>('/auth/login', { email, password }).then((r) => r.data);

export const changePasswordApi = (newPassword: string) =>
  api.post<{ success: boolean; account_status: string }>(
    '/auth/change-password',
    { newPassword },
  ).then((r) => r.data);

export const completeProfileApi = (payload: CompleteProfilePayload) =>
  api.patch<{ success: boolean; account_status: string }>(
    '/auth/complete-profile',
    payload,
  ).then((r) => r.data);
