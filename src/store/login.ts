import { create } from 'zustand';

interface AuthState {
  currentUser: { email: string; role: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  successMsg: string | null;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  clearStatus: () => void;
}

export const useAppStore = create<AuthState>((set) => ({
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  successMsg: null,

  login: async (email, password, role) => {
    set({ isLoading: true, error: null, successMsg: null });
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const roleKey = role.toLowerCase().replace(/\s+/g, '');
    const isValid = email.toLowerCase().includes(roleKey) && password.length >= 4;

    if (isValid) {
      set({
        currentUser: { email, role },
        isAuthenticated: true,
        successMsg: 'Access Authorized! Redirecting...',
        isLoading: false,
      });
      return true;
    }

    set({
      error: 'Invalid credentials or role privilege mismatch.',
      isLoading: false,
    });
    return false;
  },

  clearStatus: () => set({ error: null, successMsg: null })
}));
