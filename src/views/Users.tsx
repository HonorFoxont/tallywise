import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

import { LoadingArea } from '../components/LoadingArea';

export const Users: React.FC<{}> = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user && user.role != 'superadmin') {
      navigate('dashboard');
    }
  }, []);
  return (
    <div>
      <LoadingArea />
    </div>
  );
};
