import { addDoc, collection } from 'firebase/firestore';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';

interface AddSubCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string | undefined;
}

const AddSubCategoryDialog: React.FC<AddSubCategoryDialogProps> = ({
  open,
  onOpenChange,
  categoryId,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user?.organizationId || !categoryId || !name) {
      toast.error('Invalid input or user');
      return;
    }
    setLoading(true);
    try {
      await addDoc(
        collection(
          db,
          `organizations/${user.organizationId}/categories/${categoryId}/subCategories`
        ),
        {
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
      toast.success('Subcategory added successfully');
      setName('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast.error('Failed to add subcategory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New SubCategory</DialogTitle>
          <DialogDescription>Create a new subcategory for the selected category.</DialogDescription>
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
            <Button onClick={handleSave} disabled={!name || !categoryId || loading}>
              {loading ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubCategoryDialog;
