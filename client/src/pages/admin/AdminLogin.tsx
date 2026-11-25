import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { TextField } from "../../components/ui/FormFields";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  describeLoginFailure, loginResolver, safeAdminPath, STORAGE_BLOCKED_MESSAGE, validateLogin, type LoginForm,
} from "../../features/admin/LoginForm";
import { useAdminLogin } from "../../features/admin/queries";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import { useNoIndex } from "../../lib/useNoIndex";

export default function AdminLogin() {
  useDocumentTitle("Owner login");
  useNoIndex();

  const { isSignedIn, sessionEnded, signIn } = useAdminAuth();
  const location = useLocation();
  const login = useAdminLogin();
  const [problem, setProblem] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginForm>({ resolver: loginResolver, defaultValues: { email: "", password: "" } });
  const { errors } = form.formState;

  // The guard saved the address she asked for. safeAdminPath makes sure it stays inside /admin
  const from = safeAdminPath((location.state as { from?: unknown } | null)?.from);

  // Already logged in, or just logged in: move on. (All hooks are above, so this early return is safe)
  if (isSignedIn) return <Navigate to={from} replace />;

  async function onSubmit(values: LoginForm) {
    const checked = validateLogin(values);
    if (!checked.ok) return; // the form already blocked this. It is here for TypeScript
    setProblem(null);
    try {
      const { token } = await login.mutateAsync(checked.payload);
      if (!signIn(token)) setProblem(STORAGE_BLOCKED_MESSAGE); // on success the page redirects by itself
    } catch (error) {
      setProblem(describeLoginFailure(error));
      form.setValue("password", ""); // keep the email, clear the password
      form.setFocus("password");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="text-4xl">Owner login</h1>
        <p className="mt-2 text-lg">Log in to see orders and bookings.</p>

        {/* role="status": read aloud when the page opens after a refused or expired token */}
        <div role="status">
          {sessionEnded && <p className="mt-4 border-l-4 border-gold-deep pl-3 font-medium">Your session ended. Log in again.</p>}
        </div>

        <form noValidate onSubmit={(event) => void form.handleSubmit(onSubmit)(event)} className="mt-6 space-y-4 bg-sand p-6">
          <TextField
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="username"
            error={errors.email?.message}
            {...form.register("email")}
          />
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            error={errors.password?.message}
            {...form.register("password")}
          />
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-5 w-5 accent-cocoa" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
            <span>Show password</span>
          </label>

          {problem && (
            <p role="alert" className="border-l-4 border-gold-deep pl-3 font-medium">
              {problem}
            </p>
          )}

          <Button type="submit" size="lg" disabled={login.isPending}>
            {login.isPending ? "Logging in..." : "Log in"}
          </Button>
        </form>

        {/* Shown only while the mock API is on. Section 3: VITE_USE_MOCKS must be "false" in production */}
        {import.meta.env.VITE_USE_MOCKS === "true" && (
          <p className="mt-4 text-sm">Mock mode: log in with admin@vsshair.test and Password123!</p>
        )}

        <p className="mt-6">
          <Link to="/" className="text-gold-deep underline underline-offset-4">
            Back to the website
          </Link>
        </p>
      </div>
    </div>
  );
}