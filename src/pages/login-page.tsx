import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";

export function LoginPage() {
  return (
    <AuthCard title="Welcome back" description="Sign in to your account to continue">
      <LoginForm />
    </AuthCard>
  );
}
