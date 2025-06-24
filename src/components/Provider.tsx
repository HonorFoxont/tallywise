import React from 'react';

import { AuthProvider } from '@/contexts/AuthContext';

// import more providers here as you add them

interface ProvidersProps {
  children: React.ReactNode;
}

export function Provider({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
