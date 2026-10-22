import { create } from "zustand";

/**
 * Holds the access token in memory only.
 * It is never written to localStorage, so an XSS payload cannot read a long-lived token.
 * After a page reload the session is restored via the httpOnly refresh-token cookie.
 */
type AuthStateType = {
  accessToken: string | null;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthStateType>()((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => {
    set({ accessToken });
  },
  clearSession: () => {
    set({ accessToken: null });
  },
}));
