import { collection, onSnapshot, query } from 'firebase/firestore';
import { EllipsisVertical, Plus, Search } from 'lucide-react';
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
import { type UserRole } from '@/types/users';
import { db } from '~/src/lib/firebase';

import AddUserDialog from './components/AddUserDialog';
import DeleteUserDialog from './components/DeleteUserDialog';
import EditUserDialog from './components/EditUserDialog';

interface User {
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

export const Users: React.FC<{}> = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [Organization, setOrganization] = useState<Organization[]>([]);

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
          <CardHeader className="flex justify-evenly border-b-2 border-gray-400 pb-4">
            <div className="relative w-1/4">
              <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search User..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-1/4">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-1/4">
                <SelectValue placeholder="isActive" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
            {user?.role === 'superadmin' || user?.role === 'admin' ? (
              <Select>
                <SelectTrigger className="w-1/4">
                  <SelectValue placeholder="Organization" />
                </SelectTrigger>
                <SelectContent>
                  {Organization.map((org) => (
                    <SelectItem value="manager">{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              ''
            )}
          </CardHeader>
          <CardContent>
            <Table className="mx-auto w-[95%]">
              <TableCaption>A list of all the user in the organization.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>User name</TableHead>
                  <TableHead>IsActive</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date added</TableHead>
                  <TableHead>Last modified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="align-center flex">
                    <div className="mt-1 mr-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-col">
                      <div>Dipin Bhattarai</div>
                      <div className="text-sm text-gray-400">bhattaraidipin@gmail.com</div>
                    </div>
                  </TableCell>
                  <TableCell>true</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>March 4, 2024</TableCell>
                  <TableCell>July 16, 2025</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="cursor-pointer">
                        <EllipsisVertical className="w-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditDialogOpen(true);
                          }}
                        >
                          edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDeleteDialogOpen(true);
                          }}
                        >
                          delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
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
