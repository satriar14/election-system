import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { DashboardSkeleton } from "./Skeleton";
import type { UserRole } from "../../types";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on role
    if (user.role === "SUPERADMIN") return <Navigate to="/superadmin" replace />;
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "PENGAWAS") return <Navigate to="/pengawas" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
