import { deleteDoc, doc } from 'firebase/firestore';
import React, { useState } from 'react';
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
import { db } from '~/src/lib/firebase';
import { type User } from '~/src/types/users';

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userInfo: User | null;
}

const DeleteUserDialog: React.FC<DeleteUserDialogProps> = ({ open, onOpenChange, userInfo }) => {
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    if (!userInfo?.id || !userInfo?.organizationId) {
      toast.error('User information is missing.');
      return;
    }

    const document = doc(db, `users/${userInfo.id}`);

    setLoading(true);
    try {
      await deleteDoc(document);
      toast.success('The user was deleted successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error(`Failed to delete the user: ${error.message}`);
      console.error('Failed to delete the user', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {userInfo?.name} from your userbase? This is an
            irreversible process. If you still want to continue type 'CONFIRM' and click delete.
          </DialogDescription>
        </DialogHeader>
        <Input placeholder="CONFIRM" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!userInfo || confirm != 'CONFIRM' || loading}
          >
            {loading ? '...Loading' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
