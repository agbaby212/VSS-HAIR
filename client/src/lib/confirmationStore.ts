export type ConfirmationInfo = { whatsappUrl: string; manageToken: string };

const keyFor = (ref: string) => `vss_booking_${ref}`;

// Router state and stored text are both "unknown" to TypeScript. We check them instead of trusting them
export function readConfirmationState(value: unknown): ConfirmationInfo | null {
  if (typeof value !== "object" || value === null) return null;
  const { whatsappUrl, manageToken } = value as Record<string, unknown>;
  return typeof whatsappUrl === "string" && typeof manageToken === "string" ? { whatsappUrl, manageToken } : null;
}

export function saveConfirmation(ref: string, info: ConfirmationInfo): void {
  try {
    sessionStorage.setItem(keyFor(ref), JSON.stringify(info));
  } catch {
    // Storage can be blocked. The page works without it, it just cannot survive a refresh
  }
}

export function loadConfirmation(ref: string): ConfirmationInfo | null {
  try {
    const raw = sessionStorage.getItem(keyFor(ref));
    return raw ? readConfirmationState(JSON.parse(raw)) : null;
  } catch {
    return null; // blocked storage or damaged text
  }
}