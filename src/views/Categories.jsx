import { Trash2, SquarePen } from 'lucide-react';
import { useState } from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const Categories = () => {
  const [transaction, setTransaction] = useState('income');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Catagory</h1>
        <p className="text-gray-600">Create your own customized catagory.</p>
      </div>
      <Card className="flex h-max items-center justify-center p-0">
        <ToggleGroup type="single" className="w-full" defaultValue="income">
          <ToggleGroupItem
            value="income"
            aria-label="Toggle Income"
            onClick={(e) => setTransaction(e.target.value)}
            default
          >
            Income
          </ToggleGroupItem>
          <ToggleGroupItem
            value="savings"
            aria-label="Toggle Savings"
            onClick={(e) => setTransaction(e.target.value)}
          >
            Savings
          </ToggleGroupItem>
          <ToggleGroupItem
            value="expense"
            aria-label="Toggle Expense"
            onClick={(e) => setTransaction(e.target.value)}
          >
            Expense
          </ToggleGroupItem>
        </ToggleGroup>
      </Card>

      {/* Catagory Table */}
      <Card>
        <div className="mx-auto flex w-[95%] items-center justify-between">
          <h1 className="text-bold text-2xl">Catagory:</h1>
          <Button className="cursor-pointer">+ Add Catagory</Button>
        </div>
        <Table className="mx-auto w-[95%]">
          <TableCaption>A list of your catagories.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Catagory</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>Edit</TableHead>
              <TableHead>Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Studio</TableCell>
              <TableCell>Fri Dec 27,2024</TableCell>
              <TableCell>
                <SquarePen className="cursor-pointer" />
              </TableCell>
              <TableCell>
                <Trash2 className="cursor-pointer" />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Categories;
