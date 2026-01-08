import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => {
        // Sync with localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      
      logout: () => {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      
      updateUser: (userData) =>
        set((state) => ({
          user: { ...state.user, ...userData },
        })),
      
      // Initialize from localStorage on mount
      initAuth: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            set({
              user,
              token,
              isAuthenticated: true,
            });
          } catch (error) {
            console.error('Failed to parse user from localStorage:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useAuthStore;
