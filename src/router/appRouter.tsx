import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '@/components/layouts/AppLayout';
import ProtectedRoutes from '@/components/ProtectedRoutes';
import AuditLogs from '@/views/AuditLogs';
import Businesses from '@/views/Businesses';
import Categories from '@/views/categories/Categories';
import Index from '@/views/Index';
import Login from '@/views/Login';
import NotFound from '@/views/NotFound';
import SubCategories from '@/views/sub-categories/SubCatagories';
import Transactions from '@/views/transactions/Transactions';
import { Users } from '~/src/views/users/Users';
import Dashboard from '~/src/views/dashboard/Dashboard';

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
      { path: '/metadata/subcategories', element: <SubCategories /> },
      { path: 'businesses', element: <Businesses /> },
      { path: 'audit-logs', element: <AuditLogs /> },
    ],
  },

  { path: '*', element: <NotFound /> },
]);

export default router;
