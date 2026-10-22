import { useMutation, useQueryClient } from "@tanstack/react-query";
import { endSession, startSession } from "../lib/session";
import type { RegisterUserSchemaType } from "../schemas/auth.schema";
import { loginUserRequest, logoutUserRequest, registerUserRequest } from "./auth.api";

export function useLoginMutation() {
  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: loginUserRequest,
    onSuccess: (session) => {
      startSession(session);
    },
  });
}

/**
 * The backend register endpoint only creates the account, so the user is logged in
 * right after with the same credentials. One submit, no second form for the user.
 */
export function useRegisterMutation() {
  return useMutation({
    mutationKey: ["auth", "register"],
    mutationFn: async (payload: RegisterUserSchemaType) => {
      const user = await registerUserRequest(payload);
      const session = await loginUserRequest({ email: payload.email, password: payload.password });
      return { user, session };
    },
    onSuccess: ({ session }) => {
      startSession(session);
    },
  });
}

/**
 * Local session is cleared even if the request fails (e.g. offline):
 * the user asked to log out, so this browser must not stay logged in.
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: logoutUserRequest,
    onSettled: () => {
      endSession();
      // Drop cached user-specific data (orders, favorites, cart) so the next user never sees it.
      queryClient.clear();
    },
  });
}
