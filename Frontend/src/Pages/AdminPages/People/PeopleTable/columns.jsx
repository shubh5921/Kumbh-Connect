import CellAction  from "./cell-actions";

import { Badge } from "@/components/ui/badge";

export const columns = [
    {
      accessorKey: 'images[0]?.url',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <img
            src={row.original?.images[0]?.url}
            alt={row.original?.images[0]?.url}
            className="h-12 w-12 rounded-md object-cover"
          />
        </div>
      )
    },
    {
      accessorKey: 'name',
      header: 'Person'
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="">
          {row.original.status && (
            <Badge
              variant={row.original.status === "lost" ? "error" : "success"}
            >
              {row.original.status}
            </Badge>
          )}
        </div>
      )
    },
    {
      accessorKey: 'reportedBy.firstName',
      header: 'Reported By',
      cell: ({ row }) => (
        <div className="flex flex-col ">
          <p className="font-bold">{row.original.reportedBy.firstName}</p>
          <p>{row.original.reportedBy.email}</p>
        </div>
      )
    },
    {
      accessorKey: 'age',
      header: 'Age',
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
      cell: ({ row }) => <CellAction data={row.original} onUpdate={row.original.refreshData} onDelete={row.original.deletePerson} />
    }
  ];
  