import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Users: React.FC<{}> = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
if(user && user.role != "superadmin") {
      navigate("dashboard");
    }
  },[])
  return (
    <div>
      This is users page.
    </div>
  )
}