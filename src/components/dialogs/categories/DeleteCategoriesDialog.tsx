import { deleteDoc, doc } from 'firebase/firestore';
import React, { useState } from 'react';
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

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'saving';
}

interface DeleteCategoryDialogProps {
  open: boolean; // Renamed for consistency with previous code
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

const DeleteCategoriesDialog: React.FC<DeleteCategoryDialogProps> = ({
  open,
  category,
  onOpenChange,
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleDelete = async () => {
    if (!category || !user?.organizationId) {
      toast.error('invalid cartegory or user');
      return;
    }

    setLoading(true);
    try {
      await deleteDoc(doc(db, `organizations/${user.organizationId}/categories/${category.id}`));
      toast.success('The category was deleted sucessfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Error deleting category');
      console.error('Error deleting category', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          <DialogHeader>Delete Category</DialogHeader>
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to delete the {category?.name} category.
        </DialogDescription>
        <Button
          onClick={handleDelete}
          disabled={loading}
          className="cursor-pointer bg-red-500 hover:bg-red-600"
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCategoriesDialog;
