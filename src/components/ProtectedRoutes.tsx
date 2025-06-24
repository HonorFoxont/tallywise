import React from 'react';
import { Navigate } from 'react-router-dom';

import { LoadingArea } from '@/components/LoadingArea';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingArea />;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
