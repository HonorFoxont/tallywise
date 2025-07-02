import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DeleteCategoriesDialog = ({ dialogOpen, category, onOpenChange }) => {
  return (
    <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          <DialogHeader>Delete Category</DialogHeader>
        </DialogTitle>
        <DialogDescription>Are you sure you want to delete the category.</DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCategoriesDialog;
