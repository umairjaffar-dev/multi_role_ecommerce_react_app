import { apiClient } from "@/lib/api/api-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  AuthSessionResponseSchema,
  RegisterResponseSchema,
  type AuthSessionSchemaType,
  type AuthUserSchemaType,
  type LoginUserSchemaType,
  type RegisterUserSchemaType,
} from "../schemas/auth.schema";

/*
 * Plain request functions (no React). Hooks in auth.mutations.ts wrap them,
 * and they can be called from loaders or tests directly.
 */

export async function loginUserRequest(
  payload: LoginUserSchemaType,
): Promise<AuthSessionSchemaType> {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, payload);
  return AuthSessionResponseSchema.parse(response.data).data;
}

export async function registerUserRequest(
  payload: RegisterUserSchemaType,
): Promise<AuthUserSchemaType> {
  const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, payload);
  return RegisterResponseSchema.parse(response.data).data;
}

/** Idempotent on the backend: succeeds even if the cookie is missing or already revoked. */
export async function logoutUserRequest(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
}
