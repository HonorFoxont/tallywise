import { collection, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { getUserCount } from '~/src/apis/users';
import { useAuth } from '~/src/contexts/AuthContext';
import { db } from '~/src/lib/firebase';
import { type Organization, UserRole } from '~/src/types';

import businessFilter from './helpers/businessFilter';

type OrgWithCount = Organization & {
  userCount?: number;
};

export default function useBusiness() {
  const { user } = useAuth();

  const [organizations, setOrganizations] = useState<OrgWithCount[]>([]);
  const [filteredOrg, setFilteredOrg] = useState<OrgWithCount[]>([]);

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: '',
  });

  useEffect(() => {
    if (user?.role !== UserRole.Superadmin) return;

    const q = query(collection(db, 'organizations'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedOrgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Organization[];

      const organizationsWithCount = await Promise.all(
        fetchedOrgs.map(async (org) => {
          const count = await getUserCount(org.id);

          return {
            ...org,
            userCount: count,
          };
        })
      );

      setOrganizations(organizationsWithCount);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const filtered = businessFilter(organizations, filters.searchTerm, filters.status);

    setFilteredOrg(filtered);
  }, [organizations, filters]);

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: '',
    });
  };

  return {
    filteredOrg,
    filters,
    setFilters,
    clearFilters,
  };
}
