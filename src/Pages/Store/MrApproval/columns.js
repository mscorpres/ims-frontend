export const getMrPendingColumns = () => [
  {
    accessorKey: "id",
    header: "Sr. No.",
    size: 80,
    enableSorting: false,
    enableColumnFilter: false,
    // Cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "requestedFrom",
    header: "Requested From",
    size: 150,
  },
  {
    accessorKey: "requestId",
    header: "Request Id",
    size: 150,
  },
  {
    accessorKey: "requestDate",
    header: "Request Date",
    size: 200,
  },
];
export const getMrRequestColumns = () => [
  {
    accessorKey: "id",
    header: "Sr. No.",
    size: 80,
    enableSorting: false,
    enableColumnFilter: false,
    // Cell: ({ row }) => row.index + 1,
  },

  {
    accessorKey: "requestId",
    header: "Request Id",
    size: 150,
  },
  {
    accessorKey: "requestDate",
    header: "Request Date",
    size: 200,
  },
  {
    accessorKey: "rmQty",
    header: "RM qty",
    size: 200,
  },
  {
    accessorKey: "pickLocation",
    header: "Pick Location",
    size: 200,
  },
];
