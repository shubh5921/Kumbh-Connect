import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, MoreHorizontal, Trash, CheckCircle, XCircle, Clock, Lock, Package, User, MapPin } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useUpdateClaimMutation } from '@/slices/claimItemSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export const CellAction = ({ data, onUpdate }) => {
  const [updateClaim, {isLoading}] = useUpdateClaimMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(data.status);
  const navigate = useNavigate();
  const { toast } = useToast();

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock },
    { value: 'accepted', label: 'Accept', icon: CheckCircle },
    { value: 'rejected', label: 'Reject', icon: XCircle },
  ];

  const onStatusChange = async () => {
    try {      
      const response = await updateClaim({claimId: data._id, status: selectedStatus}).unwrap();

      if (response.success) {
        toast({
          title: "Status Updated",
          description: "Claim status has been updated successfully.",
        });
        onUpdate?.();
        setStatusOpen(false);
      }
      else {
        toast({
            title: "Failed to Update Claim Status",
            description: res.message,
            variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Something went wrong.",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const canUpdateStatus = data.status === 'pending';

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {}}
        loading={isLoading}
      />
      
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Claim Status</DialogTitle>
            <DialogDescription>
              Change the status of this claim. Note that accepting this claim will automatically reject all other claims for the same item.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4 mb-4">
                  <User className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold text-lg">{data?.claimBy.firstName + ' ' + data?.claimBy.lastName}</h3>
                    <p className="text-sm text-muted-foreground">User #{data?.claimBy._id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Email</p>
                    <p className="font-medium">{data?.claimBy?.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone Number</p>
                    <p className="font-medium">{data?.claimBy?.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Registration Date</p>
                    <p className="font-medium">{new Date(data?.claimBy.registeredAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

            <Separator />
          
            <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">Address Information</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm pl-6">
                    <div>
                      <p className="text-muted-foreground">Street Address</p>
                      <p className="font-medium">{data?.claimBy?.address?.street || 'NA'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">City</p>
                      <p className="font-medium">{data?.claimBy?.address?.city || 'NA'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">State/Province</p>
                      <p className="font-medium">{data?.claimBy?.address?.state || 'NA'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Postal Code</p>
                      <p className="font-medium">{data?.claimBy?.address?.postalCode || 'NA'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Country</p>
                      <p className="font-medium">{data?.claimBy?.address?.country || 'NA'}</p>
                    </div>
                  </div>
                </div>


          <div className="space-y-4 py-4">
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(({ value, label, icon: Icon }) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center">
                      <Icon className={`mr-2 h-4 w-4 ${getStatusColor(value)}`} />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={onStatusChange}
              disabled={isLoading || selectedStatus === data.status}
            >
              {isLoading ? "Updating..." : "Update Status"}
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
              Status Cannot Be Updated
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => navigate(`/dashboard/claims/${data._id}`)}
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
};