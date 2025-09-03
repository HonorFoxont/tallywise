import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/contexts/AuthContext';

import { LoadingArea } from '../components/LoadingArea';
import Dashboard from './dashboard/Dashboard';
import Login from './Login';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Check if user is active and has organization
      if (!user.isActive) {
        // User needs admin approval
        return;
      }
      if (!user.organizationId) {
        // User needs to be assigned to an organization
        return;
      }
      
      // User is active and has organization, redirect to dashboard
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    <LoadingArea />;
  }
  if (!user) {
    return <Login />;
  }

  if (!user.isActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Account Pending Approval</h1>
          <p className="mb-4 text-gray-600">
            Your account has been created but needs to be approved by an administrator before you
            can access the system.
          </p>
          <p className="text-sm text-gray-500">Please contact your administrator for access.</p>
        </div>
      </div>
    );
  }
  
  if (!user.organizationId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Organization Assignment Needed</h1>
          <p className="mb-4 text-gray-600">
            Your account is active but you haven't been assigned to an organization yet.
          </p>
          <p className="text-sm text-gray-500">
            Please contact your administrator to assign you to an organization.
          </p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
};

export default Index;
