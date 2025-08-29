import { addDoc, collection, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { type User, UserRole } from '@/types/users';
import { Button } from '~/src/components/ui/button';
import { Input } from '~/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/src/components/ui/select';
import { Switch } from '~/src/components/ui/switch';
import { type Organization } from '~/src/types/index';

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AddUserData = Omit<User, 'id'>;

const AddUserDialog = ({ open, onOpenChange }: AddUserDialogProps) => {
  const [newUser, setNewUser] = useState<AddUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [Organization, setOrganization] = useState<Organization[]>([]);

  const { user } = useAuth();

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

  function handleChange(key: keyof AddUserData, val: unknown) {
    setNewUser((prevUser) => ({ ...prevUser, [key]: val }) as AddUserData);
  }

  const handleAdd = async () => {
    if (!newUser?.name || !newUser?.email || !newUser?.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    const addUser: AddUserData = {
      email: newUser?.email!,
      name: newUser?.name!,
      photoURL: '',
      role: newUser?.role!,
      organizationId:
        user?.role === UserRole.Superadmin
          ? (newUser?.organizationId ?? '')
          : (user?.organizationId ?? ''),
      isActive: newUser?.isActive ?? false,
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString(),
    };

    setLoading(true);
    try {
      await addDoc(collection(db, `organizations/${addUser.organizationId}/users`), addUser);
      toast.success('User created successfully');
      setNewUser(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create the user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>Add new user to your organization.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="name">Name:</Label>
          <Input value={newUser?.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Email:</Label>
          <Input
            value={newUser?.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="mb-0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role:</Label>
          <Select value={newUser?.role} onValueChange={(e) => handleChange('role', e)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              {user?.role === UserRole.Superadmin ? (
                <SelectItem value="admin">Admin</SelectItem>
              ) : (
                ''
              )}
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {user?.role === UserRole.Superadmin ? (
          <div className="space-y-2">
            <Label htmlFor="organization">Organization:</Label>
            <Select
              value={newUser?.organizationId}
              onValueChange={(e) => handleChange('organizationId', e)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Organization" />
              </SelectTrigger>
              <SelectContent>
                {Organization.map((org) => (
                  <SelectItem value={org.id} key={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          ''
        )}
        <div className="align-center flex space-y-2">
          <Label htmlFor="isActive">IsActive:</Label>
          <Switch
            className="mt-2 ml-1"
            checked={newUser?.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)} variant="outline" className="cursor-pointer">
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={loading}
            className="btn btn-primary ml-2 cursor-pointer"
          >
            {loading ? 'Adding...' : 'Add User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
