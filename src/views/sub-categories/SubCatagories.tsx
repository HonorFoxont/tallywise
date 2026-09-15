import { SquarePen, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

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
import { type SubCategory, TransactionType } from '@/types';
import AddSubCategoryDialog from '@/views/sub-categories/components/dialogs/addSubCategoryDialog';
import DeleteSubCategoryDialog from '@/views/sub-categories/components/dialogs/DeleteSubCategoryDialog';
import EditSubCategoryDialog from '@/views/sub-categories/components/dialogs/EditSubCategoryDialog';

import useCategories from '../categories/hooks/useCategories';
import useSubcategory from './hooks/useSubcategory';

type selectedType = {
  categoryId: string;
  subCategory: SubCategory | null;
};

const SubCategories: React.FC = () => {
  const [selected, setSelected] = useState<selectedType>({
    categoryId: '',
    subCategory: null,
  });
  const [transaction, setTransaction] = useState<TransactionType>(TransactionType.Income);
  const { categories, authLoading, loading: categoriesLoading } = useCategories(transaction);
  const { subCategories, loading } = useSubcategory(selected.categoryId);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setSelected({
      ...selected,
      categoryId: categories[0]?.id || '',
    });
  }, [categories]);

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
          defaultValue={TransactionType.Income}
          onValueChange={(value) => setTransaction(value as TransactionType)}
        >
          <ToggleGroupItem value={TransactionType.Income} aria-label="Toggle Income">
            Income
          </ToggleGroupItem>
          <ToggleGroupItem value={TransactionType.Savings} aria-label="Toggle Savings">
            Savings
          </ToggleGroupItem>
          <ToggleGroupItem value={TransactionType.Expense} aria-label="Toggle Expense">
            Expense
          </ToggleGroupItem>
        </ToggleGroup>
      </Card>

      <Card>
        <div className="mx-auto flex w-[95%] items-center justify-between py-4">
          <h1 className="text-bold text-2xl">SubCategory:</h1>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer" disabled={!selected.categoryId}>
                + Add SubCategory
              </Button>
            </DialogTrigger>
            <AddSubCategoryDialog
              open={addDialogOpen}
              onOpenChange={setAddDialogOpen}
              categoryId={selected.categoryId}
            />
          </Dialog>
        </div>
        <div className="mx-auto w-[95%] py-4">
          <Select
            value={selected.categoryId}
            onValueChange={(value) => setSelected({ ...selected, categoryId: value })}
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
            {loading || authLoading || categoriesLoading ? (
              <TableRow>
                <TableCell colSpan={4}>Loading...</TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>No categories found for {transaction}.</TableCell>
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
                        setSelected({ ...selected, subCategory });
                        setEditDialogOpen(true);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Trash2
                      className="cursor-pointer"
                      onClick={() => {
                        setSelected({ ...selected, subCategory });
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
        subCategory={selected.subCategory}
        categoryId={selected.categoryId}
      />
      <DeleteSubCategoryDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        subCategory={selected.subCategory}
        categoryId={selected.categoryId}
      />
    </div>
  );
};

export default SubCategories;
