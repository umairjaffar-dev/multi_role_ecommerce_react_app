import { AuthCard } from "@/features/auth/components/auth-card";
import { RegisterForm } from "@/features/auth/components/register-form";

export function RegisterPage() {
  return (
    <AuthCard title="Create an account" description="Sign up to save favourites and track orders">
      <RegisterForm />
    </AuthCard>
  );
}
