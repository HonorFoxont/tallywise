import { collection, onSnapshot, query } from 'firebase/firestore';
import { Dot, Filter, PenBox, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { type Organization, UserRole } from '@/types/index';
import { getUserCount } from '~/src/apis/users'; // <- make sure this path matches your project
import { Button } from '~/src/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/src/components/ui/card';
import { Input } from '~/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/src/components/ui/select';
import { useAuth } from '~/src/contexts/AuthContext';
import { db } from '~/src/lib/firebase';

import CreateBusinessDialog from './components/CreateBusinessDialog';
import EditBusinessDialog from './components/EditBusinessDialog';

type OrgWithCount = Organization & { userCount?: number };

const Businesses = () => {
  const [organization, setOrganization] = useState<OrgWithCount[]>([]);
  const [filteredOrg, setFilteredOrg] = useState<OrgWithCount[]>([]);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: '', // "Active" | "Inactive" | ""
  });
  const [selectedOrganization, setSelectedOrganization] = useState<Organization>();
  const [createBusinessDialog, setCreateBusinessDialog] = useState(false);
  const [editBusinessDialog, setEditBusinessDialog] = useState(false);
  const { user } = useAuth();

  // Fetch organizations
  useEffect(() => {
    if (user?.role !== UserRole.Superadmin) return;
    const q = query(collection(db, `organizations`));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedOrgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Organization[];

      // fetch user count for each org in parallel
      const orgsWithCount = await Promise.all(
        fetchedOrgs.map(async (org) => {
          const count = await getUserCount(org.id);
          return { ...org, userCount: count };
        })
      );

      setOrganization(orgsWithCount);
      setFilteredOrg(orgsWithCount);
    });
    return () => unsubscribe();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = organization;

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter((org) =>
        org.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== '') {
      const isActive = filters.status === 'Active';
      filtered = filtered.filter((org) => org.isActive === isActive);
    }

    setFilteredOrg(filtered);
  }, [filters, organization]);

  // Reset filters
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: '',
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Businesses</h1>
          <p className="text-gray-600">Manage your businesses within the organization</p>
        </div>
        <Card>
          <CardHeader className="flex justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardHeader>
          <CardContent className="flex-col">
            <div className="flex justify-evenly gap-2">
              <div className="relative w-1/2">
                <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search Businesses..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.status}
                onValueChange={(val) => setFilters({ ...filters, status: val })}
              >
                <SelectTrigger className="w-1/2">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>All Businesses</CardTitle>
            <Button className="cursor-pointer" onClick={() => setCreateBusinessDialog(true)}>
              Create Business
            </Button>
          </CardHeader>
          <CardContent>
            {filteredOrg.map((org) => (
              <div
                key={org.id}
                className="my-4 flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
              >
                <div>
                  <div className="flex items-center text-xl">
                    {org.name} <Dot size={52} color={org.isActive ? '#24be3a' : 'brown'} />
                  </div>
                  <div className="text-sm text-gray-600">Users Count: {org.userCount ?? '...'}</div>
                </div>
                <PenBox
                  className="cursor-pointer"
                  onClick={() => {
                    setEditBusinessDialog(true);
                    setSelectedOrganization(org);
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <CreateBusinessDialog open={createBusinessDialog} onOpenChange={setCreateBusinessDialog} />
      <EditBusinessDialog
        open={editBusinessDialog}
        onOpenChange={setEditBusinessDialog}
        organization={selectedOrganization}
      />
    </>
  );
};

export default Businesses;
