import React, { useContext } from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { DashboardLayout } from "../dashboard/DashboardLayout";
import { AuthContext } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const DashboardRoute = () => {
  const location = useLocation();
  const { user, loading } = useContext(AuthContext);

  // 1. Show a loading state while AuthContext checks local storage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  // 2. Security Check: If not logged in, or NOT an Admin, kick them to login
  if (!user || user.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  // 3. Render the Layout, passing Outlet as the children
  return (
    <DashboardLayout activePath={location.pathname}>
      {/* Outlet acts as a placeholder that automatically renders the matched nested route 
          (e.g., DashboardOrders, DashboardDelivery) from App.jsx */}
      <Outlet />
    </DashboardLayout>
  );
};