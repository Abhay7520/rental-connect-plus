import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("tenant" | "owner" | "admin")[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // ✅ Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ If no user, redirect to login
  if (!user) {
    console.log("⚠️ [ProtectedRoute] No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // ✅ If user doesn't have required role, redirect to their dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log(`⚠️ [ProtectedRoute] User role '${user.role}' not in allowed roles:`, allowedRoles);
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  // ✅ User is authenticated and has proper role
  console.log(`✅ [ProtectedRoute] User '${user.role}' has access`);
  return <>{children}</>;
};

export default ProtectedRoute;