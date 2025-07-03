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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddCategoriesDialog: React.FC<AddCategoryDialogProps> = ({ open, onOpenChange }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('');
  const { user } = useAuth();

  const handleSave = async () => {
    if (!user?.organizationId) {
      toast.error('Invalid category or user');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, `organizations/${user.organizationId}/categories`), {
        name: name,
        type: type,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      toast.success('Category created successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Categories</DialogTitle>
        </DialogHeader>
        <DialogDescription>Add new categories to your collection.</DialogDescription>
        <div>
          <Label htmlFor="categoryName">Category Name</Label>
          <Input
            id="categoryName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter category name"
            disabled={loading}
          />
        </div>
        <Select
          value={type}
          onValueChange={(value) => {
            setType(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="savings">Savings</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name || loading || !type}
            className="cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddCategoriesDialog;
