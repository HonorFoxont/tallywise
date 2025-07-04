import { deleteDoc, doc } from 'firebase/firestore';
import React from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';

interface SubCategory {
  id: string;
  name: string;
}

interface DeleteSubCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subCategory: SubCategory | null;
  categoryId: string | undefined;
}

const DeleteSubCategoryDialog: React.FC<DeleteSubCategoryDialogProps> = ({
  open,
  onOpenChange,
  subCategory,
  categoryId,
}) => {
  const { user } = useAuth();

  const handleDelete = async () => {
    if (!subCategory || !categoryId || !user?.organizationId) {
      toast.error('Invalid input or user');
      return;
    }
    try {
      await deleteDoc(
        doc(
          db,
          `organizations/${user.organizationId}/categories/${categoryId}/subCategories/${subCategory.id}`
        )
      );
      toast.success('Subcategory deleted successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete SubCategory</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the subcategory "{subCategory?.name}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSubCategoryDialog;
