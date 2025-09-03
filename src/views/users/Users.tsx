import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { BadgeAlert, EllipsisVertical, Plus, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { type Organization } from '@/types/index';
import { type User, UserRole } from '@/types/users';
import { Switch } from '~/src/components/ui/switch';
import { db } from '~/src/lib/firebase';

import AddUserDialog from './components/AddUserDialog';
import DeleteUserDialog from './components/DeleteUserDialog';
import EditUserDialog from './components/EditUserDialog';

type FilterProps = {
  organizationfilter: string;
  roleFilter: string;
  isActive: boolean | null;
};

export const Users: React.FC<{}> = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<FilterProps>({
    organizationfilter: `${user?.organizationId}`,
    roleFilter: '',
    isActive: null,
  });
  const [filteredUser, setFilteredUser] = useState<User[]>(users);

  //Fetching Organizations
  useEffect(() => {
    if (!user?.organizationId) return;
    const q = query(collection(db, `organizations`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCategories = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Organization[];
      setOrganization(fetchedCategories);
    });
    return () => unsubscribe();
  }, []);

  //Fetching Users
  useEffect(() => {
    if (!user?.organizationId) return;
    const q = query(
      collection(db, 'users'),
      where('organizationId', '==', filter.organizationfilter)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((user: any) => user.role !== UserRole.Superadmin) as User[];

      setUsers(fetchedUsers);
      return () => unsubscribe();
    });
  }, [filter]);

  //Applying Filter
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter((user) => {
        const userName = users.find((u) => u.id === user.id)?.name || '';
        const userEmail = users.find((u) => u.id === user.id)?.email || '';
        return (
          userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    if (filter.roleFilter != '') {
      filtered = filtered.filter((user) => user.role === filter.roleFilter);
    }
    if (filter.isActive != null) {
      filtered = filtered.filter((user) => user.isActive === filter.isActive);
    }
    setFilteredUser(filtered);
  }, [searchTerm, users, filter]);

  const clearFilters = () => {
    setFilter({
      organizationfilter: `${user?.organizationId}`,
      roleFilter: '',
      isActive: null,
    });
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
        <p className="text-gray-600">Manage your team members and their account permission here.</p>
      </div>
      <div>
        <div className="align-center mb-3 flex justify-between">
          <h1 className="text-md pt-2 font-bold text-gray-900">All Users: 3</h1>
          <Button onClick={() => setAddDialogOpen(true)} className="cursor-pointer">
            <Plus /> Add User
          </Button>
        </div>
        <Card>
          <CardHeader className="flex-col border-b-2 border-gray-400 pb-4">
            <div className="flex justify-evenly gap-2">
              <div className="relative w-1/4">
                <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search User..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filter.roleFilter}
                onValueChange={(value) => setFilter({ ...filter, roleFilter: value })}
              >
                <SelectTrigger className="w-1/4">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                {user?.role == UserRole.Superadmin ? (
                  <SelectContent>
                    <SelectItem value={UserRole.Admin}>Admin</SelectItem>
                    <SelectItem value={UserRole.Manager}>Manager</SelectItem>
                    <SelectItem value={UserRole.Staff}>Staff</SelectItem>
                  </SelectContent>
                ) : (
                  <SelectContent>
                    <SelectItem value={UserRole.Manager}>Manager</SelectItem>
                    <SelectItem value={UserRole.Staff}>Staff</SelectItem>
                  </SelectContent>
                )}
              </Select>
              <Select
                value={filter.isActive != null ? String(filter.isActive) : ''}
                onValueChange={(val) =>
                  val
                    ? setFilter({ ...filter, isActive: val === 'true' })
                    : setFilter({ ...filter, isActive: null })
                }
              >
                <SelectTrigger className="w-1/4">
                  <SelectValue placeholder="isActive" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">True</SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
              {user?.role === UserRole.Superadmin || user?.role === UserRole.Admin ? (
                <Select
                  value={filter.organizationfilter}
                  onValueChange={(value) => {
                    setFilter({ ...filter, organizationfilter: value });
                  }}
                >
                  <SelectTrigger className="w-1/4">
                    <SelectValue placeholder="Organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organization.map((org) => (
                      <SelectItem value={org.id}>{org.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                ''
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table className="mx-auto w-[95%]">
              <TableCaption>A list of all the user in the organization.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Active Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date added</TableHead>
                  <TableHead>Last modified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUser.map((user) => (
                  <TableRow>
                    <TableCell className="align-center flex">
                      <div className="mt-1 mr-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.photoURL} />
                          <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-col">
                        <div>{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch checked={user.isActive} className="ml-6" />
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{new Date(user.createdAt).toDateString()}</TableCell>
                    <TableCell>{new Date(user.createdAt).toDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="cursor-pointer">
                          <EllipsisVertical className="w-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditDialogOpen(true);
                              setSelectedUser(user);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => {
                              setDeleteDialogOpen(true);
                              setSelectedUser(user);
                            }}
                          >
                            Delete <BadgeAlert />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <EditUserDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        userInfo={selectedUser}
      />
      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        userInfo={selectedUser}
      />
      <AddUserDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
};
