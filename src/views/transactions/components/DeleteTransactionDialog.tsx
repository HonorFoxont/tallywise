import { deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'react-toastify';

import { Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '~/src/components/ui/button';
import { DialogContent, DialogDescription } from '~/src/components/ui/dialog';
import { db } from '~/src/lib/firebase';

const DeleteTransactionsDialog = ({ open, onOpenChange, transaction }) => {
  const { user } = useAuth();
  const handleDelete = async () => {
    if (!transaction || !user?.organizationId) {
      toast.error('Invalid input or user');
      return;
    }
    try {
      await deleteDoc(
        doc(db, `organizations/${user.organizationId}/transactions/${transaction.id}`)
      );
      toast.success('Transaction deleted successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting Transaction:', error);
      toast.error('Failed to delete Transaction');
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete SubCategory</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the {transaction?.type} transaction? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={!transaction}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteTransactionsDialog;
