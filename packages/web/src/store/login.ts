import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginApi, changePasswordApi, completeProfileApi } from '../lib/api/auth';
import type { CompleteProfilePayload } from '../lib/api/auth';
import { setAuthToken, clearAuthToken } from '../lib/axios';
import { useStudentStore } from './Student';

export type UserRole        = 'student' | 'trainer' | 'technical head' | 'project head' | 'admin';
export type AccountStatus   = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';

export interface CurrentUser {
  user_id:       number;
  email:         string;
  role:          UserRole;
  accountStatus: AccountStatus;
}

interface AuthState {
  currentUser:     CurrentUser | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  error:           string | null;
  successMsg:      string | null;
  login:           (email: string, password: string) => Promise<boolean>;
  changePassword:  (newPassword: string) => Promise<boolean>;
  completeProfile: (data: CompleteProfilePayload) => Promise<boolean>;
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
            currentUser:     {
              user_id:       user.user_id,
              email:         user.email,
              role,
              accountStatus: user.account_status as AccountStatus,
            },
            isAuthenticated: true,
            successMsg:      'Access Authorized! Redirecting...',
            isLoading:       false,
          });
          return true;
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          const msg =
            status === 401 ? 'Invalid email or password.' :
            status === 400 ? 'Please check your email and password format.' :
            status ? `Login failed (server error ${status}). Please try again.` :
            'Cannot reach the server. Please check your connection.';
          set({ error: msg, isLoading: false });
          return false;
        }
      },

      changePassword: async (newPassword) => {
        set({ isLoading: true, error: null });
        try {
          const { account_status } = await changePasswordApi(newPassword);
          set((s) => ({
            currentUser: s.currentUser
              ? { ...s.currentUser, accountStatus: account_status as AccountStatus }
              : null,
            isLoading: false,
          }));
          return true;
        } catch {
          set({ error: 'Failed to change password. Please try again.', isLoading: false });
          return false;
        }
      },

      completeProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { account_status } = await completeProfileApi(data);
          set((s) => ({
            currentUser: s.currentUser
              ? { ...s.currentUser, accountStatus: account_status as AccountStatus }
              : null,
            isLoading: false,
          }));
          return true;
        } catch {
          set({ error: 'Failed to save profile. Please try again.', isLoading: false });
          return false;
        }
      },

      logout: () => {
        clearAuthToken();
        useStudentStore.getState().resetStudentStore();
        localStorage.removeItem('bk_studentView');
        localStorage.removeItem('bk_adminView');
        localStorage.removeItem('bk_trainerView');
        set({ currentUser: null, isAuthenticated: false, error: null, successMsg: null });
      },

      clearStatus: () => set({ error: null, successMsg: null }),
    }),
    {
      name: 'bluekode_auth',
      partialize: (state) => ({
        currentUser:     state.currentUser ?? undefined,
        isAuthenticated: state.isAuthenticated,
      }),
      // migrate persisted state: add accountStatus if missing
      migrate: (persisted: unknown) => {
        const s = persisted as { currentUser?: Partial<CurrentUser>; isAuthenticated?: boolean };
        if (s.currentUser && !s.currentUser.accountStatus) {
          s.currentUser.accountStatus = 'ACTIVE';
        }
        return s;
      },
      version: 1,
    }
  )
);
