import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const AdminProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  // Wait for AuthContext to finish checking local storage on first load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  // If no user is logged in, or the user is NOT an Admin, kick them back to login
  if (!user || user.role !== 'Admin') {
    return <Navigate to="/admin/login" replace />;
  }

  // If they pass the check, render the child routes (the dashboard)
  return <Outlet />;
};