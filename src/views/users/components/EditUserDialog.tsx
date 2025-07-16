import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '~/src/components/ui/button';
import { Input } from '~/src/components/ui/input';
import { Label } from '~/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/src/components/ui/select';
import { Switch } from '~/src/components/ui/switch';
import { useAuth } from '~/src/contexts/AuthContext';
import { db } from '~/src/lib/firebase';
import { type User, UserRole } from '~/src/types/users';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userInfo: User | null;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ open, onOpenChange, userInfo }) => {
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(userInfo);
  const { user } = useAuth();

  const handleEdit = () => {
    if (!editUser?.name || !editUser?.email || !editUser?.role) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      updateDoc(doc(db, `organizations/${userInfo?.organizationId}/users/${userInfo?.id}`), {
        ...userInfo,
        name: editUser.name,
        role: editUser.role,
        isActive: editUser?.isActive,
      });
      toast.success('User updated sucessfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error editing transaction:', error);
      toast.error('Failed to edit transaction');
    } finally {
      setLoading(false);
    }
  };
  function handleChange(key: string, val: unknown) {
    setEditUser((prevUser) => ({ ...prevUser, [key]: val }) as User);
  }
  useEffect(() => {
    setEditUser(userInfo);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Edit the user previlages.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="name">Name:</Label>
          <Input
            value={editUser?.name}
            onChange={(e) => handleChange('name', e.target.value)}
            defaultValue={userInfo?.name}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role:</Label>
          <Select
            value={editUser?.role}
            onValueChange={(e) => handleChange('role', e)}
            defaultValue={userInfo?.role}
          >
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
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="align-center flex space-y-2">
          <Label htmlFor="isActive">IsActive:</Label>
          <Switch
            className="mt-2 ml-1"
            checked={editUser?.isActive}
            onCheckedChange={(checked) => handleChange('isActive', checked)}
            defaultChecked={userInfo?.isActive}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)} variant="outline" className="cursor-pointer">
            Cancel
          </Button>
          <Button
            onClick={handleEdit}
            disabled={loading || !editUser?.name}
            className="btn btn-primary ml-2 cursor-pointer"
          >
            {loading ? 'Updating...' : 'Update User'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
