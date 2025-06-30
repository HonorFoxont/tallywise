export type UserRole = 'superadmin' | 'admin' | 'manager' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
