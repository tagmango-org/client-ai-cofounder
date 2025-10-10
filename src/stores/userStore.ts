import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '../types/dataService';

interface UserState {
  currentAppUser: User | null;
  appUserLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

interface UserActions {
  setCurrentAppUser: (user: User | null) => void;
  setAppUserLoading: (loading: boolean) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  initializeAuth: () => void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // State
      currentAppUser: null,
      appUserLoading: true,
      isAuthenticated: false,
      token: null,

      // Actions
      setCurrentAppUser: (user: User | null) => {
        set({
          currentAppUser: user,
          isAuthenticated: !!user && user._id !== 'anonymous',
        });
        
        // Also store in localStorage for compatibility
        if (user) {
          localStorage.setItem('tagmango_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('tagmango_user');
        }
      },

      setAppUserLoading: (loading: boolean) => {
        set({ appUserLoading: loading });
      },

      setToken: (token: string | null) => {
        set({ token });
        if (token) {
          localStorage.setItem('tagmango_token', token);
        } else {
          localStorage.removeItem('tagmango_token');
        }
      },

      logout: () => {
        set({
          currentAppUser: null,
          token: null,
          isAuthenticated: false,
          appUserLoading: false,
        });
        localStorage.removeItem('tagmango_token');
        localStorage.removeItem('tagmango_user');
      },

      initializeAuth: () => {
        const storedToken = localStorage.getItem('tagmango_token');
        const storedUser = localStorage.getItem('tagmango_user');
        
        if (storedToken && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            set({
              currentAppUser: user,
              token: storedToken,
              isAuthenticated: user._id !== 'anonymous',
              appUserLoading: false,
            });
          } catch (error) {
            console.error('Failed to parse stored user data:', error);
            // Clear invalid data
            localStorage.removeItem('tagmango_token');
            localStorage.removeItem('tagmango_user');
            set({ appUserLoading: false });
          }
        } else {
          set({ appUserLoading: false });
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentAppUser: state.currentAppUser,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Convenience hooks
export const useCurrentUser = () => useUserStore((state) => state.currentAppUser);
export const useIsAuthenticated = () => useUserStore((state) => state.isAuthenticated);
export const useAppUserLoading = () => useUserStore((state) => state.appUserLoading);
export const useAuthToken = () => useUserStore((state) => state.token);
