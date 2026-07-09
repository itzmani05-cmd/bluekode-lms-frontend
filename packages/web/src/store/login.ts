import { create } from 'zustand';

export type UserRole = 'student' | 'trainer' | 'technical head' | 'project head' | 'admin';

interface CreatedUser {
  email:    string;
  password: string;
  role:     UserRole;
}

interface AuthState {
  currentUser:  { email: string; role: string } | null;
  isAuthenticated: boolean;
  isLoading:    boolean;
  error:        string | null;
  successMsg:   string | null;
  createdUsers: CreatedUser[];
  login:        (email: string, password: string) => Promise<boolean>;
  createUser:   (email: string, role: UserRole) => string;
  clearStatus:  () => void;
}

const generatePassword = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Seeded accounts so the demo works out of the box
const seedUsers: CreatedUser[] = [
  { email: 'admin@bluekode.com',    password: 'Admin12345',  role: 'admin'          },
  { email: 'trainer@company.com',   password: 'Train12345',  role: 'trainer'        },
  { email: 'student@bluekode.com',  password: 'Stud12345',   role: 'student'        },
  { email: 'techhead@bluekode.com', password: 'Tech12345',   role: 'technical head' },
  { email: 'projhead@bluekode.com', password: 'Proj12345',   role: 'project head'   },
];

export const useAppStore = create<AuthState>((set, get) => ({
  currentUser:     null,
  isAuthenticated: false,
  isLoading:       false,
  error:           null,
  successMsg:      null,
  createdUsers:    seedUsers,

  login: async (email, password) => {
    set({ isLoading: true, error: null, successMsg: null });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { createdUsers } = get();
    const match = createdUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (match) {
      set({
        currentUser:     { email: match.email, role: match.role },
        isAuthenticated: true,
        successMsg:      'Access Authorized! Redirecting...',
        isLoading:       false,
      });
      return true;
    }

    set({ error: 'Invalid email or password.', isLoading: false });
    return false;
  },

  createUser: (email, role) => {
    const password = generatePassword();
    set((state) => ({
      createdUsers: [...state.createdUsers, { email, password, role }],
    }));
    return password;
  },

  clearStatus: () => set({ error: null, successMsg: null }),
}));
