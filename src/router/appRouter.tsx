import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/components/layouts/AppLayout';
import ProtectedRoutes from '@/components/ProtectedRoutes';
import AuditLogs from '@/views/AuditLogs';
import Businesses from '@/views/Businesses';
import Categories from '@/views/Categories';
import Dashboard from '@/views/Dashboard';
import Index from '@/views/Index';
import Login from '@/views/Login';
import NotFound from '@/views/NotFound';
import SubCategories from '@/views/SubCatagories';
import Transactions from '@/views/Transactions';
import { Users } from '@/views/Users';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/', element: <Index /> },

  {
    path: '/',
    element: (
      <ProtectedRoutes>
        <AppLayout />
      </ProtectedRoutes>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'transactions', element: <Transactions /> },
      { path: 'users', element: <Users /> },
      { path: '/metadata/categories', element: <Categories /> },
      { path: '/metadata/sub-categories', element: <SubCategories /> },
      { path: 'businesses', element: <Businesses /> },
      { path: 'audit-logs', element: <AuditLogs /> },
    ],
  },

  { path: '*', element: <NotFound /> },
]);

export default router;
