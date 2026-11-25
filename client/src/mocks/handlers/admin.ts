import { http, HttpResponse } from "msw";
import { adminLoginSchema } from "../../shared";

const MOCK_EMAIL = "admin@vsshair.test"; // Section 3, dev only
const MOCK_PASSWORD = "Password123!";
// How long a mock login lasts. Change to 40 * 1000 to test the automatic logout
const TOKEN_LIFETIME_MS = 8 * 60 * 60 * 1000;

// Build the address the same way your other handlers do
const apiUrl = (path: string) => `${import.meta.env.VITE_API_URL}${path}`;

function base64url(value: object): string {
  return btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Looks like a real JWT (header.payload.signature) so the client can read its expiry.
// It is NOT signed and means nothing. It exists only in the mock
function fakeJwt(): string {
  const exp = Math.floor((Date.now() + TOKEN_LIFETIME_MS) / 1000);
  return `${base64url({ alg: "none", typ: "JWT" })}.${base64url({ sub: "mock-admin", exp })}.mock`;
}

export const adminHandlers = [
  http.post(apiUrl("/admin/login"), async ({ request }) => {
    const parsed = adminLoginSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return HttpResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request body",
            details: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
          },
        },
        { status: 400 },
      );
    }
    if (parsed.data.email !== MOCK_EMAIL || parsed.data.password !== MOCK_PASSWORD) {
      // Same message for a wrong email and a wrong password, like the real server must do
      return HttpResponse.json({ error: { code: "UNAUTHORIZED", message: "Wrong email or password" } }, { status: 401 });
    }
    return HttpResponse.json({ data: { token: fakeJwt() } });
  }),
];