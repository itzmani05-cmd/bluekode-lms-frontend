import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginApi } from '../lib/api/auth';
import { setAuthToken, clearAuthToken } from '../lib/axios';

export type UserRole = 'student' | 'trainer' | 'technical head' | 'project head' | 'admin';

interface AuthState {
  currentUser:     { user_id: number; email: string; role: UserRole } | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  error:           string | null;
  successMsg:      string | null;
  login:           (email: string, password: string) => Promise<boolean>;
  logout:          () => void;
  clearStatus:     () => void;
}

const normaliseRole = (apiRole: string): UserRole => {
  const r = apiRole.toLowerCase();
  if (r === 'admin')          return 'admin';
  if (r === 'trainer')        return 'trainer';
  if (r === 'technical head') return 'technical head';
  if (r === 'project head')   return 'project head';
  return 'student';
};

export const useAppStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser:     null,
      isAuthenticated: false,
      isLoading:       false,
      error:           null,
      successMsg:      null,

      login: async (email, password) => {
        set({ isLoading: true, error: null, successMsg: null });
        try {
          const { access_token, user } = await loginApi(email, password);
          setAuthToken(access_token);
          const role = normaliseRole(user.roles[0] ?? 'student');
          set({
            currentUser:     { user_id: user.user_id, email: user.email, role },
            isAuthenticated: true,
            successMsg:      'Access Authorized! Redirecting...',
            isLoading:       false,
          });
          return true;
        } catch {
          set({ error: 'Invalid email or password.', isLoading: false });
          return false;
        }
      },

      logout: () => {
        clearAuthToken();
        set({ currentUser: null, isAuthenticated: false, error: null, successMsg: null });
      },

      clearStatus: () => set({ error: null, successMsg: null }),
    }),
    {
      name: 'bluekode_auth',
      partialize: (state) => ({
        currentUser:     state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
