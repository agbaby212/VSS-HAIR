import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

// A convenience, not the lock. The server checks the token on every admin request (BE-T6)
export function RequireAdmin() {
  const { isSignedIn } = useAdminAuth();
  const location = useLocation();

  if (!isSignedIn) {
    return <Navigate to="/admin/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return <Outlet />;
}