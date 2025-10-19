import { Badge } from "lucide-react";
import { CellAction } from "./cell-actions";

export const columns = [
    {
      accessorKey: 'item.images[0].url',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <img
            src={row.original.item.images[0].url}
            alt={row.original.item.images[0].url}
            className="h-12 w-12 rounded-md object-cover"
          />
        </div>
      )
    },
    {
      accessorKey: 'item.name',
      header: 'Item'
    },
    {
      accessorKey: 'claimBy.firstName',
      header: 'Claim By'
    },
    {
      accessorKey: 'claimBy.email',
      header: 'Contact'
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
    {
      accessorKey: 'dateReported',
      header: 'Date Reported',
      cell: ({ row }) => (
        <div>{new Date(row.original.dateReported).toDateString()}</div>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => <CellAction data={row.original} onUpdate={row.original.refreshData} />
    }
  ];
  