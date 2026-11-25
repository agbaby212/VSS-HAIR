import type { FieldErrors, Resolver } from "react-hook-form";
import type { z } from "zod";
import { adminLoginSchema } from "../../shared";

export type LoginForm = { email: string; password: string };
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
type LoginErrors = Partial<Record<keyof LoginForm, string>>;

export type LoginResult = { ok: true; payload: AdminLoginInput } | { ok: false; errors: LoginErrors };

export const STORAGE_BLOCKED_MESSAGE =
  "Your browser is blocking storage, so we cannot keep you logged in. Allow site data for this website, or try another browser.";

export function validateLogin(values: LoginForm): LoginResult {
  const errors: LoginErrors = {};
  const email = values.email.trim();
  if (email === "") errors.email = "Enter your email.";
  if (values.password === "") errors.password = "Enter your password.";

  // The shared schema is the judge (and it cleans the email). Our words replace its technical message
  const parsed = adminLoginSchema.safeParse({ email, password: values.password });
  if (!parsed.success && !errors.email && parsed.error.issues.some((issue) => issue.path[0] === "email")) {
    errors.email = "Enter your email like name@example.com.";
  }

  if (parsed.success && Object.keys(errors).length === 0) return { ok: true, payload: parsed.data };
  return { ok: false, errors };
}

// React Hook Form asks this function to check the form
export const loginResolver: Resolver<LoginForm> = (values) => {
  const result = validateLogin(values);
  if (result.ok) return { values, errors: {} };
  const errors: FieldErrors<LoginForm> = {};
  if (result.errors.email) errors.email = { type: "validate", message: result.errors.email };
  if (result.errors.password) errors.password = { type: "validate", message: result.errors.password };
  return { values: {}, errors };
};

// Same words for a wrong email and a wrong password, so the page never tells a stranger which one was right.
// We look at the error's code, not its class, so this file needs nothing from api.ts
export function describeLoginFailure(error: unknown): string {
  const code = typeof error === "object" && error !== null ? (error as { code?: unknown }).code : undefined;
  if (code === "UNAUTHORIZED") return "That email or password is not right. Check them and try again.";
  if (code === "RATE_LIMITED") return "Too many tries. Wait a few minutes, then try again.";
  if (code === "VALIDATION_ERROR") return "Check your email and password, then try again.";
  return "We could not log you in. Check your internet connection and try again.";
}

// Where to go after login. Only addresses inside /admin are allowed, so a crafted link cannot send the owner to another website.
// /admin/login is refused too, or she would bounce back to the login page
export function safeAdminPath(value: unknown): string {
  if (typeof value !== "string") return "/admin";
  if (!/^\/admin(\/|\?|#|$)/.test(value)) return "/admin"; // also rejects "/administrator" and "https://..."
  if (/^\/admin\/login(\/|\?|#|$)/.test(value)) return "/admin";
  return value;
}