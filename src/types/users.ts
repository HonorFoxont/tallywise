export enum UserRole {
  Superadmin = 'superadmin',
  Admin = 'admin',
  Manager = 'manager',
  Staff = 'staff',
}

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
