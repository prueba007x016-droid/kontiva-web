import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'admin' | 'supervisor' | 'cashier';

export interface User {
  username: string;
  name: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const DEMO_USERS: Record<string, { password: string; name: string; role: Role }> = {
  admin: { password: 'admin123', name: 'Administrador KONTIVA', role: 'admin' },
  supervisor: { password: 'supervisor123', name: 'Supervisor de Ventas', role: 'supervisor' },
  cajero: { password: 'cajero123', name: 'Cajero Demo', role: 'cashier' },
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (username, password) => {
        const u = DEMO_USERS[username.trim().toLowerCase()];
        if (u && u.password === password) {
          set({ user: { username, name: u.name, role: u.role } });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null }),
    }),
    { name: 'kontiva-auth' }
  )
);

export const can = (user: User | null, permission: string) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const map: Record<Role, string[]> = {
    admin: ['*'],
    supervisor: ['dashboard', 'sales', 'registers', 'products', 'employees', 'reports', 'analytics', 'settings.view'],
    cashier: ['dashboard', 'sales.own', 'registers.view'],
  };
  return map[user.role].includes('*') || map[user.role].includes(permission);
};


