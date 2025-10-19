import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, MoreHorizontal, Trash, Clock, Lock, User } from 'lucide-react';

import { AlertModal } from '@/components/alert-modal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useUpdatePersonStatusMutation } from '@/slices/personSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const GuardianForm = ({ guardian, setGuardian }) => (
  <div className="space-y-4">
    <h4 className="font-medium">Guardian Details</h4>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Guardian Name</label>
        <Input
          placeholder="Enter guardian name"
          value={guardian.name}
          onChange={(e) => setGuardian(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Relationship</label>
        <Input
          placeholder="eg. Parent, Sibling, Friend"
          value={guardian.relation}
          onChange={(e) => setGuardian(prev => ({ ...prev, relation: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Contact Number</label>
        <Input
          placeholder="6725648585"
          value={guardian.phoneNumber}
          onChange={(e) => setGuardian(prev => ({ ...prev, phoneNumber: e.target.value }))}
        />
      </div>
      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium">Address</label>
        <div className="grid grid-cols-2 gap-4">
          {['street', 'city', 'state', 'postalCode'].map((field) => (
            <Input
              key={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={guardian.address?.[field] || ''}
              onChange={(e) => setGuardian(prev => ({
                ...prev,
                address: { ...prev.address, [field]: e.target.value }
              }))}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const PersonInfo = ({ data }) => (
  <Card className="border-dashed">
    <CardContent className="pt-6">
      <div className="flex items-center space-x-4 mb-4">
        <User className="h-8 w-8 text-muted-foreground" />
        <div>
          <h3 className="font-semibold text-lg">{data?.name}</h3>
          <p className="text-sm text-muted-foreground">Person #{data?._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {[
          { label: 'Age', value: data?.age },
          { label: 'Current Status', value: data?.status },
          { label: 'Reported By', value: `${data?.reportedBy?.firstName} ${data?.reportedBy?.lastName}` },
          { label: 'Report Date', value: new Date(data?.dateReported).toDateString() }
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium">{value || 'N/A'}</p>
          </div>
        ))}
      </div>

      {data.status === 'lost' && data.guardian && (
        <GuardianDetails guardian={data.guardian} />
      )}
    </CardContent>
  </Card>
);

const GuardianDetails = ({ guardian }) => (
  <>
    <Separator className="my-4" />
    <div className="space-y-4">
      <h4 className="font-medium">Guardian Details</h4>
      <div className="grid grid-cols-2 gap-4 text-sm">
        {[
          { label: 'Guardian Name', value: guardian.name },
          { label: 'Relationship', value: guardian.relation },
          { label: 'Contact Number', value: guardian.phoneNumber }
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium">{value || 'N/A'}</p>
          </div>
        ))}
        <div className="col-span-2">
          <p className="text-muted-foreground mb-1">Address</p>
          <div className="grid grid-cols-2 gap-2 pl-2 text-sm">
            {['street', 'city', 'state', 'postalCode'].map(field => (
              <div key={field}>
                <p className="text-muted-foreground">{field.charAt(0).toUpperCase() + field.slice(1)}</p>
                <p className="font-medium">{guardian.address?.[field] || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </>
);

export default function CellAction({ data, onUpdate, onDelete }) {
  const [updatePersonStatus, { isLoading: isUpdating }] = useUpdatePersonStatusMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [guardian, setGuardian] = useState({
    name: '',
    relation: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: ''
    }
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const onStatusChange = async () => {
    try {
      console.log(data, guardian)
      if (data.status === 'found' && (!guardian.name || !guardian.phoneNumber || !guardian.relation || !guardian.address.city || !guardian.address.street || !guardian.address.state || !guardian.address.postalCode)) {
        toast({
          title: "Guardian Details Required",
          description: "Please fill in the guardian details.",
          variant: "destructive",
        });
        return;
      }
      const dd = {
        _id: data._id,
        status: 'returned',
        ...(data.status === 'found' && { guardian })
      }
      const response = await updatePersonStatus(dd).unwrap();

      if (response.success) {
        toast({
          title: "Status Updated",
          description: "Person status has been updated successfully.",
        });
        onUpdate?.();
        setStatusOpen(false);
      } else {
        toast({
          title: "Failed to Update Person Status",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.data?.message || "Something went wrong.",
      });
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(data._id);
      setDeleteOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the record. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const canUpdateStatus = data.status !== 'returned';

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={isDeleting}
      />
      
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Person Status</DialogTitle>
            <DialogDescription>
              Change the status of this person. Note that once marked as returned, it cannot be changed later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <PersonInfo data={data} />
            <Separator />
            {data.status === 'found' && (
              <GuardianForm guardian={guardian} setGuardian={setGuardian} />
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={onStatusChange}
              disabled={isUpdating || (data.status === 'found' && !guardian.name)}
            >
              {isUpdating ? "Updating..." : "Mark as Returned"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          {canUpdateStatus ? (
            <DropdownMenuItem onClick={() => setStatusOpen(true)}>
              <Clock className="mr-2 h-4 w-4" />
              Update Status
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled>
              <Lock className="mr-2 h-4 w-4 text-gray-400" />
              Person has been returned
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => navigate(`/person/${data._id}`)}
          >
            <Edit className="mr-2 h-4 w-4" /> View Details
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => setDeleteOpen(true)}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}