import { create } from "zustand";
import type {
  AuthSessionSchemaType,
  AuthUserSchemaType,
} from "@/features/auth/schemas/auth.schema";

/**
 * Holds the access token and current user in memory only.
 * The token is never written to localStorage, so an XSS payload cannot read a long-lived token.
 * After a page reload the session is restored via the httpOnly refresh-token cookie.
 */
type AuthStateType = {
  accessToken: string | null;
  user: AuthUserSchemaType | null;
  setSession: (session: AuthSessionSchemaType) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthStateType>()((set) => ({
  accessToken: null,
  user: null,
  setSession: ({ accessToken, ...user }) => {
    set({ accessToken, user });
  },
  clearSession: () => {
    set({ accessToken: null, user: null });
  },
}));

/* Selectors: components subscribe to the smallest slice they need, so unrelated changes
 * (e.g. a token refresh) do not re-render them. */
export const selectUser = (state: AuthStateType): AuthUserSchemaType | null => state.user;
export const selectIsAuthenticated = (state: AuthStateType): boolean => state.user !== null;
export const selectIsAdmin = (state: AuthStateType): boolean => state.user?.role === "admin";
