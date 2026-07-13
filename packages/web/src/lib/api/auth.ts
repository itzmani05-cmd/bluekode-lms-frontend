import api from '../axios';

export interface LoginResponse {
  access_token: string;
  user: {
    user_id: number;
    full_name: string;
    email: string;
    roles: string[];
    account_status: string;
  };
}

export const loginApi = (email: string, password: string) =>
  api.post<LoginResponse>('/auth/login', { email, password }).then((r) => r.data);
