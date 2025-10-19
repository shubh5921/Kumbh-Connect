export const columns = [
  {
    accessorKey: 'firstName',
    header: 'NAME'
  },
  {
    accessorKey: 'role',
    header: 'ROLE'
  },
  {
    accessorKey: 'email',
    header: 'EMAIL'
  },
  {
    accessorKey: 'phoneNumber',
    header: 'PHONE'
  },
  {
    accessorKey: 'registeredAt',
    header: 'Date Registered',
    cell: ({ row }) => (
      <div>{new Date(row.original.registeredAt).toDateString()}</div>
    )
  },
];