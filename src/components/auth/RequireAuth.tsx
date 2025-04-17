
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface RequireAuthProps {
  children: ReactNode;
  roles?: string[];
}

export default function RequireAuth({ children, roles }: RequireAuthProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to sign in if not authenticated
  if (!user) {
    console.log("User not authenticated, redirecting to sign in");
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check for required roles
  if (roles && Array.isArray(user.role) && user.role.length > 0) {
    const hasRequiredRole = roles.some(role => user.role.includes(role as any));
    if (!hasRequiredRole) {
      console.log("User doesn't have required role, redirecting to unauthorized");
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
