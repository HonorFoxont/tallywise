import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { type Organization } from '@/types';
import { type User, UserRole } from '@/types/users';

import userFilter from '../helpers/userFilter';

export type FilterProps = {
  organizationfilter: string;
  roleFilter: string;
  isActive: boolean | null;
};

export default function useUsers() {
  const { user } = useAuth();

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const [searchTerm, setSearchTerm] = useState('');

  const [filter, setFilter] = useState<FilterProps>({
    organizationfilter: user?.organizationId ?? '',
    roleFilter: '',
    isActive: null,
  });

  // Fetch organizations
  useEffect(() => {
    const q = query(collection(db, 'organizations'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const organizations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Organization[];

      setOrganizations(organizations);
    });

    return unsubscribe;
  }, []);

  // Fetch users
  useEffect(() => {
    if (!filter.organizationfilter) return;

    const q = query(
      collection(db, 'users'),
      where('organizationId', '==', filter.organizationfilter)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user: any) => user.role !== UserRole.Superadmin) as User[];

      setUsers(users);
    });

    return unsubscribe;
  }, [filter.organizationfilter]);

  // Apply filters
  useEffect(() => {
    const filtered = userFilter(users, searchTerm, filter);

    setFilteredUsers(filtered);
  }, [users, searchTerm, filter]);

  const clearFilters = () => {
    setSearchTerm('');

    setFilter({
      organizationfilter: user?.organizationId ?? '',
      roleFilter: '',
      isActive: null,
    });
  };

  return {
    users,
    organizations,
    filteredUsers,

    searchTerm,
    setSearchTerm,

    filter,
    setFilter,

    clearFilters,
  };
}
