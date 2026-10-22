import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { applyServerErrors } from "@/lib/forms/apply-server-errors";
import { useRegisterMutation } from "../api/auth.mutations";
import { getSafeRedirectPath, REDIRECT_PARAM } from "../lib/safe-redirect";
import {
  RegisterUserSchema,
  type RegisterUserInputType,
  type RegisterUserSchemaType,
} from "../schemas/auth.schema";
import { FormAlert } from "./form-alert";
import { PasswordInput } from "./password-input";
import { PasswordRequirements } from "./password-requirements";

const REGISTER_FIELDS = ["name", "email", "password", "confirmPassword"] as const;

export function RegisterForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get(REDIRECT_PARAM));
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<RegisterUserInputType, unknown, RegisterUserSchemaType>({
    resolver: zodResolver(RegisterUserSchema),
    // Validate on blur first, then live on every change once a field has been touched.
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const password = useWatch({ control, name: "password" });

  const onSubmit = (values: RegisterUserSchemaType) => {
    registerMutation.mutate(values, {
      onSuccess: ({ user }) => {
        toast.success(`Account created. Welcome, ${user.name}!`);
        void navigate(redirectTo, { replace: true });
      },
      onError: (error) => {
        applyServerErrors(error, setError, {
          fields: REGISTER_FIELDS,
          codeToField: { EMAIL_ALREADY_EXISTS: "email" },
        });
      },
    });
  };

  const isPending = registerMutation.isPending;

  return (
    <form onSubmit={(event) => void handleSubmit(onSubmit)(event)} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Jane Doe"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          <FieldError message={errors.name?.message} />
        </Field>

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
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <PasswordRequirements password={password} />
          <FieldError message={errors.password?.message} />
        </Field>

        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </Field>

        <FormAlert message={errors.root?.server?.message} />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {isPending ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to={{ pathname: "/login", search: searchParams.toString() }}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
