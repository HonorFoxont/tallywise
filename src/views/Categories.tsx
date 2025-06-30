import { collection, getDocs, query, where } from 'firebase/firestore';
import { SquarePen, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

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
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'saving';
  createdAt: Date;
  updatedAt: Date;
}

const Categories = () => {
  const { user, loading: authLoading } = useAuth();
  const [transaction, setTransaction] = useState<'income' | 'expense' | 'saving'>('income');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.organizationId || authLoading) {
        if (!authLoading && !user?.organizationId) {
          toast.error('No organization assigned to user');
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const categoriesRef = collection(db, `organizations/${user.organizationId}/categories`);
        const q = query(categoriesRef, where('type', '==', transaction));
        const querySnapshot = await getDocs(q);
        const fetchedCategories = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Category[];
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user?.organizationId, transaction, authLoading]);

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
          defaultValue="income"
          onValueChange={(value) => setTransaction(value as 'income' | 'expense' | 'saving')}
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
        <div className="mx-auto w-[95%] py-4">
          <h1 className="text-bold text-2xl">Category:</h1>
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
                    <SquarePen className="cursor-pointer" />
                  </TableCell>
                  <TableCell>
                    <Trash2 className="cursor-pointer" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Categories;
