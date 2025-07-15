import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '~/src/components/ui/button';
import { User } from '~/src/types/users';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userInfo: User | null;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ open, onOpenChange, userInfo }) => {
  const handleEdit = () => {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Edit the user previlages.</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleEdit} disabled={!userInfo}>
            Edit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
