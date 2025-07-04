import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { SquarePen, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import AddSubCategoryDialog from '@/views/sub-categories/components/dialogs/addSubCategoryDialog';
import DeleteSubCategoryDialog from '@/views/sub-categories/components/dialogs/DeleteSubCategoryDialog';
import EditSubCategoryDialog from '@/views/sub-categories/components/dialogs/EditSubCategoryDialog';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'savings';
}

interface SubCategory {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubCategories: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [type, setType] = useState<'income' | 'expense' | 'savings'>('income');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Initialize as empty string
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);

  // Fetch categories
  useEffect(() => {
    if (!user?.organizationId || authLoading) {
      if (!authLoading && !user?.organizationId) {
        toast.error('No organization assigned to user');
      }
      setLoading(false);
      setCategories([]);
      setSelectedCategory('');
      setSubCategories([]);
      return;
    }

    setLoading(true);
    const categoriesRef = collection(db, `organizations/${user.organizationId}/categories`);
    const q = query(categoriesRef, where('type', '==', type));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedCategories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(fetchedCategories);
        setSelectedCategory(fetchedCategories[0]?.id || ''); // Set to first ID or empty string
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.organizationId, type, authLoading]);

  // Fetch subcategories
  useEffect(() => {
    if (!user?.organizationId || !selectedCategory || authLoading) {
      setSubCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const subCategoriesRef = collection(
      db,
      `organizations/${user.organizationId}/categories/${selectedCategory}/subCategories`
    );
    const unsubscribe = onSnapshot(
      subCategoriesRef,
      (querySnapshot) => {
        const fetchedSubCategories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as SubCategory[];
        setSubCategories(fetchedSubCategories);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching subcategories:', error);
        toast.error('Failed to fetch subcategories');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.organizationId, selectedCategory, authLoading]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">SubCategory</h1>
        <p className="text-gray-600">View your subcategories.</p>
      </div>
      <Card className="flex h-max items-center justify-center p-0">
        <ToggleGroup
          type="single"
          className="w-full"
          defaultValue="income"
          onValueChange={(value) => value && setType(value as 'income' | 'expense' | 'savings')}
        >
          <ToggleGroupItem value="income" aria-label="Toggle Income">
            Income
          </ToggleGroupItem>
          <ToggleGroupItem value="savings" aria-label="Toggle Savings">
            Savings
          </ToggleGroupItem>
          <ToggleGroupItem value="expense" aria-label="Toggle Expense">
            Expense
          </ToggleGroupItem>
        </ToggleGroup>
      </Card>

      <Card>
        <div className="mx-auto flex w-[95%] items-center justify-between py-4">
          <h1 className="text-bold text-2xl">SubCategory:</h1>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer" disabled={!selectedCategory}>
                + Add SubCategory
              </Button>
            </DialogTrigger>
            <AddSubCategoryDialog
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
              categoryId={selectedCategory}
            />
          </Dialog>
        </div>
        <div className="mx-auto w-[95%] py-4">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            disabled={loading || authLoading || categories.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Table className="mx-auto w-[95%]">
          <TableCaption>A list of your subcategories.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>SubCategory</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>Edit</TableHead>
              <TableHead>Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading || authLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Loading...</TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No categories found for {type}.</TableCell>
              </TableRow>
            ) : subCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No subcategories found for selected category.</TableCell>
              </TableRow>
            ) : (
              subCategories.map((subCategory) => (
                <TableRow key={subCategory.id}>
                  <TableCell>{subCategory.name}</TableCell>
                  <TableCell>{subCategory.createdAt.toDateString()}</TableCell>
                  <TableCell>
                    <SquarePen
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedSubCategory(subCategory);
                        setEditDialogOpen(true);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Trash2
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedSubCategory(subCategory);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <EditSubCategoryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        subCategory={selectedSubCategory}
        categoryId={selectedCategory}
      />
      <DeleteSubCategoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        subCategory={selectedSubCategory}
        categoryId={selectedCategory}
      />
    </div>
  );
};

export default SubCategories;
