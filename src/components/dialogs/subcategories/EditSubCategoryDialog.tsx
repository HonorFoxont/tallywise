import { doc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';

interface SubCategory {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EditSubCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subCategory: SubCategory | null;
  categoryId: string | undefined;
}

const EditSubCategoryDialog: React.FC<EditSubCategoryDialogProps> = ({
  open,
  onOpenChange,
  subCategory,
  categoryId,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(open && subCategory ? subCategory.name : '');
  }, [open, subCategory]);

  const handleSave = async () => {
    if (!subCategory || !categoryId || !user?.organizationId || !name) {
      toast.error('Invalid input or user');
      return;
    }
    setLoading(true);
    try {
      await updateDoc(
        doc(
          db,
          `organizations/${user.organizationId}/categories/${categoryId}/subCategories/${subCategory.id}`
        ),
        {
          name,
          updatedAt: new Date(),
        }
      );
      toast.success('Subcategory updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating subcategory:', error);
      toast.error('Failed to update subcategory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit SubCategory</DialogTitle>
          <DialogDescription>Update the name of the subcategory.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="subCategoryName">SubCategory Name</Label>
            <Input
              id="subCategoryName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter subcategory name"
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!name || loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubCategoryDialog;
