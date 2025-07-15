import React, { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '~/src/components/ui/button';
import { Input } from '~/src/components/ui/input';
import { type UserRole } from '~/src/types/users';

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

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userInfo: User | null;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ open, onOpenChange, userInfo }) => {
  const [confirm, setConfirm] = useState('');
  const handleDelete = () => {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the user? This is irreversible process. If you want to
            continue type 'CONFIRM' and click delete.
          </DialogDescription>
        </DialogHeader>
        <Input placeholder="CONFIRM" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={!userInfo}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
