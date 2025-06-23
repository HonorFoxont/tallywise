import { createBrowserRouter } from 'react-router-dom';

import ProtectedRoutes from '@/components/ProtectedRoutes';
import Dashboard from '@/views/Dashboard';
import Index from '@/views/Index';
import Login from '@/views/Login';
import NotFound from '@/views/NotFound';
import Transactions from '@/views/Transactions';
import { Users } from '@/views/Users';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/', element: <Index /> },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoutes>
        <Dashboard />
      </ProtectedRoutes>
    ),
  },
  {
    path: '/transactions',
    element: (
      <ProtectedRoutes>
        <Transactions />
      </ProtectedRoutes>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoutes>
        <Users />
      </ProtectedRoutes>
    ),
  },
  { path: '*', element: <NotFound /> },
]);

export default router;
