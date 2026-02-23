import { useLocation } from 'react-router-dom';
import { DashboardLayout } from "../dashboard/DashboardLayout";
import React, { useState, useEffect } from 'react';

export const DashboardRoute = ({ children }) => {
  const location = useLocation();

  return (
    <DashboardLayout activePath={location.pathname}>
      {children}
    </DashboardLayout>
  );
};