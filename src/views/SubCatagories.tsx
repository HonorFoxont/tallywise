import { SquarePen, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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

const SubCategories = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sub-Catagories</h1>
        <p className="text-gray-600">Extend your your customized catagory.</p>
      </div>
      {/* {Subcatagory table} */}
      <Card>
        <CardHeader>
          <div className="mx-auto flex w-full items-center justify-between">
            <div className="flex gap-2">
              <h1 className="text-bold text-2xl">Catagory:</h1>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Enter the Catagory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Sub-Catogories</SelectLabel>
                    <SelectItem value="studio">Studio</SelectItem>
                    <SelectItem value="glasshouse">Glasshouse</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button className="cursor-pointer">+ Add Sub-Catagory</Button>
          </div>
        </CardHeader>
        <Table className="mx-auto w-[95%]">
          <TableCaption>List of your sub-categories.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Sub-Catagory</TableHead>
              <TableHead>Created at</TableHead>
              <TableHead>Edit</TableHead>
              <TableHead>Delete</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Passphoto</TableCell>
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

export default SubCategories;
