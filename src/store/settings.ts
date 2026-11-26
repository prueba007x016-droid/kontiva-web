import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  autoRefreshMinutes: number;
  dataSource: 'demo' | 'api' | 'sheets';
  apiBaseUrl: string;
  refreshTick: number;
  toggleTheme: () => void;
  setTheme: (t: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setAutoRefresh: (m: number) => void;
  setDataSource: (d: 'demo' | 'api' | 'sheets') => void;
  setApiBaseUrl: (u: string) => void;
  bumpRefresh: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      sidebarCollapsed: false,
      autoRefreshMinutes: 0,
      dataSource: 'demo',
      apiBaseUrl: '',
      refreshTick: 0,
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (t) => set({ theme: t }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setAutoRefresh: (m) => set({ autoRefreshMinutes: m }),
      setDataSource: (d) => set({ dataSource: d }),
      setApiBaseUrl: (u) => set({ apiBaseUrl: u }),
      bumpRefresh: () => set((s) => ({ refreshTick: s.refreshTick + 1 })),
    }),
    { name: 'kontiva-settings' }
  )
);


