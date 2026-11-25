import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ADMIN_TOKEN_KEY,
  ADMIN_UNAUTHORIZED_EVENT,
  clearAdminToken,
  getAdminToken,
  setAdminToken,
  tokenExpiry,
} from "../lib/adminToken";

type AdminAuth = {
  isSignedIn: boolean;
  sessionEnded: boolean; // true after the server refused the token, or it ran out. The login page says so
  signIn: (token: string) => boolean; // false when the browser would not save the token
  signOut: () => void;
};

const AdminAuthContext = createContext<AdminAuth | null>(null);

// setTimeout cannot wait longer than about 24 days. For a longer wait we skip the timer and let the server decide
const LONGEST_TIMER_MS = 2_000_000_000;

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getAdminToken());
  const [sessionEnded, setSessionEnded] = useState(false);

  const endSession = useCallback(() => {
    clearAdminToken();
    setToken(null);
    setSessionEnded(true);
  }, []);

  const signIn = useCallback((newToken: string) => {
    if (!setAdminToken(newToken)) return false;
    setToken(newToken);
    setSessionEnded(false);
    return true;
  }, []);

  const signOut = useCallback(() => {
    clearAdminToken();
    setToken(null);
    setSessionEnded(false);
  }, []);

  // 1. api.ts says the server refused our token
  useEffect(() => {
    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, endSession);
    return () => window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, endSession);
  }, [endSession]);

  // 2. Another tab logged in or out. The "storage" event only fires in the OTHER tabs
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === ADMIN_TOKEN_KEY || event.key === null) setToken(getAdminToken());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 3. The token runs out while the page is open
  useEffect(() => {
    if (!token) return;
    const expiry = tokenExpiry(token);
    if (expiry === null) return;
    const wait = Math.max(expiry - Date.now(), 0);
    if (wait > LONGEST_TIMER_MS) return;
    const timer = window.setTimeout(endSession, wait);
    return () => window.clearTimeout(timer);
  }, [token, endSession]);

  const value = useMemo(
    () => ({ isSignedIn: token !== null, sessionEnded, signIn, signOut }),
    [token, sessionEnded, signIn, signOut],
  );
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth(): AdminAuth {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return value;
}