import { Pen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { getOrganizations } from '../apis/organization';
import { Table, TableCell, TableRow } from '../components/ui/table';
import { useAuth } from '../contexts/AuthContext';
import { type Organization } from '../types/index';

const Profile = () => {
  const { user } = useAuth();
  const [userOrganization, setUserOrganization] = useState<Organization>();

  if (!user) return null;
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const organizations = await getOrganizations();

        const foundOrg = organizations.find(
          (org) => org.id === user?.organizationId // ✅ match correctly
        );
        
        setUserOrganization(foundOrg);
      } catch (e) {
        toast.error('Failed to fetch organization details');
        console.error(e.message || e);
      }
    };

    if (user?.organizationId) {
      fetchOrganization();
    }
  }, []);

  return (
    <>
      <div>
        <h1>Profile</h1>
        <p>This is where your profile information is dispayed.</p>
      </div>
      <div className="flex items-start justify-center gap-2">
        <Card>
          <CardContent>
            <div className="border-b-2 text-xl">
              <div className="relative">
                <Avatar className="w-16" />
                <Pen className="absolute right-2 bottom-2" />
              </div>
              {user.name}
            </div>
            <div>
              <div className="text-lg">{userOrganization?.name}</div>
              <div className="text-sm">{user.role}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableRow>
                <TableCell>User id:</TableCell>
                <TableCell>{user.id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>User email:</TableCell>
                <TableCell>{user.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Created at:</TableCell>
                <TableCell>{user.createdAt}</TableCell>
              </TableRow>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Profile;
