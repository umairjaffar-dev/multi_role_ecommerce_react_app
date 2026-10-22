import { z } from "zod";
import { createApiSuccessSchema } from "@/lib/api/api-response";

/* ---------------------------------------------------------------------------
 * Request schemas: mirror backend `auth.validation.ts` so users see the same
 * rules instantly in the form, before a round trip to the server.
 * ------------------------------------------------------------------------- */

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { id: "lowercase", label: "One lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { id: "uppercase", label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { id: "number", label: "One number", test: (value: string) => /[0-9]/.test(value) },
] as const;

export const RegisterUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be at most 100 characters"),
    email: z.string().trim().toLowerCase().pipe(z.email("Invalid email address").max(255)),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      // bcrypt only uses the first 72 bytes of the input
      .max(72, "Password must be at most 72 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** Form values before Zod transforms (what the inputs hold). */
export type RegisterUserInputType = z.input<typeof RegisterUserSchema>;
/** Payload after trimming/lowercasing (what is sent to the API). */
export type RegisterUserSchemaType = z.output<typeof RegisterUserSchema>;

// Login only checks presence: password rules may change after a user registered.
export const LoginUserSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Invalid email address")),
  password: z.string().min(1, "Password is required"),
});

export type LoginUserInputType = z.input<typeof LoginUserSchema>;
export type LoginUserSchemaType = z.output<typeof LoginUserSchema>;

/* ---------------------------------------------------------------------------
 * Response schemas: mirror backend `PublicUserType` and the auth controllers.
 * ------------------------------------------------------------------------- */

export const UserRoleSchema = z.enum(["user", "admin"]);
export type UserRoleSchemaType = z.infer<typeof UserRoleSchema>;

export const AuthUserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  role: UserRoleSchema,
  createdAt: z.string(),
});

export type AuthUserSchemaType = z.infer<typeof AuthUserSchema>;

/** POST /auth/register -> 201 { success, data: user } (does not log the user in). */
export const RegisterResponseSchema = createApiSuccessSchema(AuthUserSchema);

/** POST /auth/login and POST /auth/refresh -> { success, data: { ...user, accessToken } } */
export const AuthSessionResponseSchema = createApiSuccessSchema(
  AuthUserSchema.extend({ accessToken: z.string().min(1) }),
);

export type AuthSessionSchemaType = z.infer<typeof AuthSessionResponseSchema>["data"];
