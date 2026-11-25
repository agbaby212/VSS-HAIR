export const ADMIN_TOKEN_KEY = "vss_admin_token";
// api.ts sends this event when a request that carried a token comes back 401
export const ADMIN_UNAUTHORIZED_EVENT = "vss:admin-unauthorized";

// Thrown by login when the browser will not keep the token
export class TokenStorageError extends Error {
  constructor() {
    super("The browser blocked saving the login");
    this.name = "TokenStorageError";
  }
}

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null; // storage can be blocked
  }
}

// Returns false when the token could not be saved
export function setAdminToken(token: string): boolean {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    return true;
  } catch {
    return false;
  }
}

export function clearAdminToken(): void {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // nothing to clear if storage is blocked
  }
}

// The middle part of a token is base64url text. We only look for a number called "exp" (seconds)
function readExp(token: string): number | null {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "=");
    const payload: unknown = JSON.parse(atob(base64));
    if (typeof payload === "object" && payload !== null) {
      const exp = (payload as { exp?: unknown }).exp;
      if (typeof exp === "number") return exp;
    }
    return null;
  } catch {
    return null;
  }
}

export function tokenExpiry(token: string): number | null {
  const exp = readExp(token);
  return exp === null ? null : exp * 1000;
}

// A courtesy so the owner sees the login page at once. It is NOT security: anyone can edit localStorage,
// and the server checks the token on every request. A token we cannot read counts as usable (the server decides).
// The 10 second margin stops a token from ending in the middle of a request.
export function isTokenExpired(token: string, nowMs: number = Date.now()): boolean {
  const expiry = tokenExpiry(token);
  return expiry !== null && expiry <= nowMs + 10_000;
}