import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, MoreHorizontal, Trash, Clock, Lock, Package } from 'lucide-react';

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
import { useUpdateItemStatusMutation } from '@/slices/itemSlice';
import { useGetUsersQuery } from '@/slices/userApiSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function CellAction({ data, onUpdate, onDelete }) {
  const { data: usersRes, isLoading: isFetchingUsers, error: errorInFetchingUsers } = useGetUsersQuery();
  const users = usersRes?.users || [];
  const [updateItemStatus, { isLoading: isUpdating }] = useUpdateItemStatusMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(data.returnedTo || '');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (errorInFetchingUsers) {
      toast({
        title: "Failed to Load Users",
        description: errorInFetchingUsers?.data?.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [errorInFetchingUsers, toast]);

  const onStatusChange = async () => {
    try {
      if (!selectedUser) {
        toast({
          title: "Selection Required",
          description: "Please select a user first.",
          variant: "destructive",
        });
        return;
      }
      const response = await updateItemStatus({
        _id: data._id,
        returnedTo: selectedUser
      }).unwrap();

      if (response.success) {
        toast({
          title: "Status Updated",
          description: "Item status has been updated successfully.",
        });
        onUpdate?.();
        setStatusOpen(false);
      } else {
        toast({
          title: "Failed to Update Item Status",
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
      console.log(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the item. Please try again.",
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Item Status</DialogTitle>
            <DialogDescription>
              Change the status of this item. Note that once the item status is updated, it cannot be changed later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Package className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold text-lg">{data?.name}</h3>
                    <p className="text-sm text-muted-foreground">Item #{data?._id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{data?.category?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Status</p>
                    <p className="font-medium">{data?.status}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reported By</p>
                    <p className="font-medium">{data?.reportedBy?.firstName+ ' ' +data?.reportedBy?.lastName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Report Date</p>
                    <p className="font-medium">{new Date(data?.dateReported).toDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            <div className="space-y-4">
              <label className="text-sm font-medium">Select Return Recipient</label>
              <Select
                value={selectedUser}
                onValueChange={setSelectedUser}
                disabled={isFetchingUsers || isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Receipient" />
                </SelectTrigger>
                <SelectContent>
                  {users.length>0 && users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      <div className="flex items-center">
                        {`${user.firstName} ${user.lastName}`}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              disabled={isUpdating || !selectedUser}
            >
              {isUpdating ? "Updating..." : "Update Status"}
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
              Update Return Status
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled>
              <Lock className="mr-2 h-4 w-4 text-gray-400" />
              Item has Been Returned
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => navigate(`/item/${data._id}`)}
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