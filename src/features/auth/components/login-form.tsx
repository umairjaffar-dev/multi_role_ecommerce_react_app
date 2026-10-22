import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";
import { useLoginMutation } from "../api/auth.mutations";
import { getSafeRedirectPath, REDIRECT_PARAM } from "../lib/safe-redirect";
import {
  LoginUserSchema,
  type LoginUserInputType,
  type LoginUserSchemaType,
} from "../schemas/auth.schema";
import { FormAlert } from "./form-alert";
import { PasswordInput } from "./password-input";

const LOGIN_FIELDS = ["email", "password"] as const;

export function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get(REDIRECT_PARAM));
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginUserInputType, unknown, LoginUserSchemaType>({
    resolver: zodResolver(LoginUserSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (values: LoginUserSchemaType) => {
    loginMutation.mutate(values, {
      onSuccess: (session) => {
        toast.success(`Welcome back, ${session.name}!`);
        void navigate(redirectTo, { replace: true });
      },
      onError: (error) => {
        applyServerErrors(error, setError, { fields: LOGIN_FIELDS });
      },
    });
  };

  const isPending = loginMutation.isPending;

  return (
    <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </Field>

        <FormAlert message={errors.root?.server?.message} />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {isPending ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            to={{ pathname: "/register", search: searchParams.toString() }}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create one
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
