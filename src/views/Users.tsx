import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

export const Users: React.FC<{}> = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user && user.role != 'superadmin') {
      navigate('dashboard');
    }
  }, []);
  return <div>This is users page.</div>;
};
