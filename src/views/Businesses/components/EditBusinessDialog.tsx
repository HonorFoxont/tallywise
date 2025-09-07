import { Label } from '@radix-ui/react-label';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { editOrganization } from '~/src/apis/organization';
import { Button } from '~/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/src/components/ui/dialog';
import { Input } from '~/src/components/ui/input';
import { Switch } from '~/src/components/ui/switch';
import { type Organization } from '~/src/types';

type ChangedOrganizationProps = {
  name: string;
  isActive: boolean;
};

type EditBusinessDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: Organization;
};

const EditBusinessDialog = ({ open, onOpenChange, organization }: EditBusinessDialogProps) => {
  const [changedOrg, setChangedOrg] = useState<ChangedOrganizationProps | null>(
    organization ? { name: organization.name, isActive: organization.isActive } : null
  );

  // Sync local state when org changes
  useEffect(() => {
    if (organization) {
      setChangedOrg({ name: organization.name, isActive: organization.isActive });
    }
  }, [organization]);

  if (!organization || !changedOrg) return null; // protect against undefined org

  const handleSave = async () => {
    try {
      editOrganization({ ...changedOrg, organizationId: organization.id });

      toast.success('Organization Edited Sucessfully');
    } catch (e) {
      toast.error('Failed to edit Organization');
      console.error(e.message);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Business</DialogTitle>
          <DialogDescription>Edit the business details.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <Label htmlFor="org-name">Organization Name:</Label>
          <Input
            id="org-name"
            value={changedOrg.name}
            onChange={(e) => setChangedOrg({ ...changedOrg, name: e.target.value })}
          />
        </div>

        <div className="grid gap-3">
          <Label htmlFor="org-active">Active Status:</Label>
          <Switch
            id="org-active"
            checked={changedOrg.isActive}
            onCheckedChange={(checked) => setChangedOrg({ ...changedOrg, isActive: checked })}
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="btn-primary"
            onClick={handleSave}
            disabled={
              organization.name === changedOrg.name && organization.isActive === changedOrg.isActive
            }
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBusinessDialog;
