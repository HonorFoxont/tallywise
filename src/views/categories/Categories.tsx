import { SquarePen, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { type Category, TransactionType } from '@/types';
import AddCategoriesDialog from '@/views/categories/components/dialogs/AddCategoriesDialog';
import DeleteCategoriesDialog from '@/views/categories/components/dialogs/DeleteCategoriesDialog';
import EditCategoriesDialog from '@/views/categories/components/dialogs/EditCategoriesDialog';

import useCategories from './hooks/useCategories';

const Categories = () => {
  const [transaction, setTransaction] = useState<TransactionType>(TransactionType.Income);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { categories, loading, authLoading } = useCategories(transaction);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Category</h1>
        <p className="text-gray-600">View your categories.</p>
      </div>
      <Card className="flex h-max items-center justify-center p-0">
        <ToggleGroup
          type="single"
          className="w-full"
          defaultValue={TransactionType.Income}
          onValueChange={(value) => setTransaction(value as TransactionType)}
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
        <div className="mx-auto flex w-[95%] justify-between py-4">
          <h1 className="text-bold text-2xl">Category:</h1>
          <Button
            onClick={() => {
              setAddDialogOpen(true);
            }}
            className="cursor-pointer"
          >
            Add Category
          </Button>
        </div>
        <Table className="mx-auto w-[95%]">
          <TableCaption>A list of your categories.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
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
                <TableCell colSpan={4}>No categories found.</TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.createdAt.toDateString()}</TableCell>
                  <TableCell>
                    <SquarePen
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedCategory(category);
                        setEditDialogOpen(true);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Trash2
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedCategory(category);
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
      <EditCategoriesDialog
        open={editDialogOpen}
        category={selectedCategory}
        onOpenChange={setEditDialogOpen}
      />
      <DeleteCategoriesDialog
        category={selectedCategory}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
      <AddCategoriesDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
};

export default Categories;
