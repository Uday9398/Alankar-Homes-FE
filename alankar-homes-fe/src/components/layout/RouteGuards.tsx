import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { ROUTES } from '../../utils/constants';

// Sends signed-out visitors to login, then back here afterwards
export const RequireAuth: React.FC = () => {
  const { user, token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!user || !token) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
};

// Only hides the admin screens; the backend enforces the real admin check
export const RequireAdmin: React.FC = () => {
  const { user, token } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!user || !token) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }
  if (user.role !== 'admin') {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return <Outlet />;
};
