import { AuthProvider } from '@/contexts/AuthContext';

import { SidebarProvider } from './ui/sidebar';
// import more providers here as you add them

interface ProvidersProps {
  children: React.ReactNode;
}

export function Provider({ children }: ProvidersProps) {
  return (
    <SidebarProvider>
      <AuthProvider>{children}</AuthProvider>
    </SidebarProvider>
  );
}
