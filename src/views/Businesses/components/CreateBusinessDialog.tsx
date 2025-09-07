import { Label } from '@radix-ui/react-dropdown-menu';
import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { createOrganization } from '~/src/apis/organization';
import { createUser } from '~/src/apis/users';
import { Button } from '~/src/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/src/components/ui/dialog';
import { Input } from '~/src/components/ui/input';
import { Switch } from '~/src/components/ui/switch';
import { UserRole } from '~/src/types';

const CreateBusinessDialog = ({ open, onOpenChange }) => {
  const [step, setStep] = useState('step1');
  const [newOrganization, setNewOrganization] = useState({
    name: '',
    isActive: true,
  });
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: UserRole.Admin,
    organizationId: '',
    isActive: true,
  });
  const handleCreate = async () => {
    try {
      // Step 1: Create organization
      const createdOrganization = await createOrganization(newOrganization);

      // Step 2: Create admin user linked to that organization
      await createUser({
        ...newAdmin,
        organizationId: createdOrganization.id,
      });

      onOpenChange(false);
      toast.success('Organization and Admin created successfully!');
    } catch (e) {
      toast.error('Failed to create Organization or User');
      console.error(e);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Business</DialogTitle>
        </DialogHeader>
        <Tabs value={step} onValueChange={setStep}>
          <TabsContent value="step1">
            <div className="grid gap-3">
              <Label>Organization Name</Label>
              <Input
                value={newOrganization.name}
                onChange={(e) => {
                  setNewOrganization({
                    ...newOrganization,
                    name: e.target.value,
                  });
                }}
              />
            </div>
            <div className="grid gap-3">
              <Label>Active Status</Label>
              <Switch
                className="mt-2 ml-1"
                checked={newOrganization?.isActive}
                onCheckedChange={(checked) => {
                  setNewOrganization({ ...newOrganization, isActive: checked });
                }}
                defaultChecked={newOrganization?.isActive}
              />
            </div>
            <div className="mt-2 flex justify-end">
              <Button onClick={() => setStep('step2')} disabled={!newOrganization.name}>
                Next Step
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="step2">
            <div className="grid gap-3">
              <Label>Admin Username</Label>
              <Input
                type="text"
                value={newAdmin.name}
                onChange={(e) => {
                  setNewAdmin({
                    ...newAdmin,
                    name: e.target.value,
                  });
                }}
              />
            </div>
            <div className="grid gap-3">
              <Label>Admin email</Label>
              <Input
                type="email"
                value={newAdmin.email}
                onChange={(e) => {
                  setNewAdmin({
                    ...newAdmin,
                    email: e.target.value,
                  });
                }}
              />
            </div>
            <div className="grid gap-3">
              <Label>Admin active status</Label>
              <Switch
                className="mt-2 ml-1"
                checked={newAdmin?.isActive}
                onCheckedChange={(checked) => {
                  setNewAdmin({
                    ...newAdmin,
                    isActive: checked,
                  });
                }}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button onClick={() => setStep('step1')}>Go Back</Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button className="btn-primary" onClick={handleCreate}>
                Create
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBusinessDialog;
