import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { apiFetch } from "../../lib/api";
import type { AdminLoginInput } from "./LoginForm";

// POST /admin/login answers { data: { token } } (Section 6)
const loginResponseSchema = z.object({ token: z.string().min(1) });

export function useAdminLogin() {
  return useMutation({
    // No cache to update. We only need the token. The provider keeps it
    mutationFn: (body: AdminLoginInput) => apiFetch("/admin/login", loginResponseSchema, { method: "POST", body }),
  });
}