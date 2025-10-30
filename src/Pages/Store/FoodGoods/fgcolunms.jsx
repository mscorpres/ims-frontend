export const getFgColumns = () => [
  {
    accessorKey: "mfg_transaction.ID",
    header: "Req.ID",
    size: 150,
    Cell: ({ row }) => (
      <span>
        {row?.original?.mfg_transaction} / {row?.original?.mfg_ref_id}
      </span>
    ),
  },
  {
    accessorKey: "typeOfPPR",
    header: "Type",
    size: 100,
  },
  {
    accessorKey: "mfg_full_date",
    header: "Date/Time",
    size: 150,
  },

  {
    accessorKey: "mfg_sku",
    header: "SKU",
    size: 150,
  },

  {
    accessorKey: "p_name",
    header: "Product",
    size: 150,
  },
  {
    accessorKey: "mfg_prod_planing_qty",
    header: "MFG/STIN Qty",
    size: 150,
    Cell: ({ row }) => (
      <span>
        {row?.original?.mfg_prod_planing_qty +
          "/" +
          row?.original?.completedQTY}
      </span>
    ),
  },
];

export const getFgCompletedColumns = () => [
  {
    header: "Serial No.",
    size: 150,
    Cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "mfg_transaction",
    header: "Req.ID",
    size: 150,
    Cell: ({ row }) => (
      <span>
        {row?.original?.mfg_transaction} / {row?.original?.ppr_transaction}
      </span>
    ),
  },
  {
    accessorKey: "ppr_type",
    header: "Type",
    size: 100,
  },
  {
    accessorKey: "mfg_date",
    header: "Date/Time",
    size: 150,
  },

  {
    accessorKey: "ppr_sku",
    header: "SKU",
    size: 150,
  },

  {
    accessorKey: "sku_name",
    header: "Product",
    size: 150,
  },
  {
    accessorKey: "completed_qty",
    header: "MFG/STIN Qty",
    size: 150,
  },
];
