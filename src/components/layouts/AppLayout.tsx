import clsx from 'clsx';
import { Bolt, FileText, Home, LogOut, Receipt, Settings, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar as Side,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '~/src/hooks/use-mobile';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['superadmin', 'admin', 'manager', 'staff'],
  },
  {
    name: 'Transactions',
    href: '/transactions',
    icon: Receipt,
    roles: ['superadmin', 'admin', 'manager', 'staff'],
  },
  { name: 'Users', href: '/users', icon: Users, roles: ['superadmin', 'admin', 'manager'] },
  {
    name: 'Categories',
    href: '/metadata/categories',
    icon: Settings,
    roles: ['superadmin', 'admin', 'manager'],
  },
  {
    name: 'Sub-Catagories',
    href: '/metadata/subcategories',
    icon: Bolt,
    roles: ['superadmin', 'admin', 'manager'],
  },
  { name: 'Businesses', href: '/businesses', icon: FileText, roles: ['superadmin'] },
];

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();

  const isMobile = useIsMobile();

  const filteredNavigation = navigationItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      <div className="min-h-screen w-full bg-gray-50">
        <Side>
          <SidebarHeader className="bg-blue-500 text-center text-xl font-bold text-white">
            Tallywise
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                {filteredNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="border-t p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-2">
                    <Avatar className="mr-3 h-8 w-8">
                      <AvatarImage src={user?.photoURL} />
                      <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{user?.name}</span>
                      <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Side>

        {/* Main content */}
        <div className={clsx(sidebarOpen ? 'lg:ml-64' : '', 'transition-all duration-300')}>
          <SidebarTrigger className="absolute z-2" />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
