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

export const getViewFgColumns = () => [
  {
    header: "Date",
    accessorKey: "approvedate",
    size: 150,
  },
  { accessorKey: "sku", header: "SKU", size: 150 },
  { accessorKey: "name", header: "Product", size: 380 },
  { accessorKey: "approveqty", header: "Out Qty", size: 100 },
  { accessorKey: "approveby", header: "Out By", size: 320 },
  { accessorKey: "fg_type", header: "FG TYPE", size: 100 },
];

export const getPendingFGReversal = () => [
  {
    header: "#",
    accessorKey: "id",
    size: 30,
  },

  {
    header: "SKU",
    accessorKey: "sku",
    renderCell: ({ row }) => <ToolTipEllipses text={row.sku} />,
    size: 100,
  },
  {
    header: "Product",
    accessorKey: "name",
    renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
    size: 200,
    flex: 1,
  },

  {
    header: "Inserted By",
    accessorKey: "insertedBy",
    renderCell: ({ row }) => <ToolTipEllipses text={row.insertedBy} />,
    size: 100,
  },
  {
    header: "Insert Date",
    accessorKey: "insertedDate",
    renderCell: ({ row }) => <ToolTipEllipses text={row.insertedDate} />,
    size: 150,
  },
  {
    header: "Location In",
    accessorKey: "inLocation",
    renderCell: ({ row }) => <ToolTipEllipses text={row.inLocation} />,
    size: 100,
  },

  {
    header: "UoM",
    accessorKey: "uom",
    renderCell: ({ row }) => <ToolTipEllipses text={row.uom} />,
    size: 100,
  },
  {
    header: "Return Qty",
    accessorKey: "returnQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.returnQty} />,
    size: 80,
  },
  {
    header: "Exec. Qty",
    accessorKey: "executedQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.executedQty} />,
    size: 80,
  },
  {
    header: "Rem. Qty",
    accessorKey: "remainingQty",
    renderCell: ({ row }) => <ToolTipEllipses text={row.remainingQty} />,
    size: 80,
  },

  {
    header: "Status",
    accessorKey: "status",
    renderCell: ({ row }) => <ToolTipEllipses text={row.status} />,
    size: 100,
  },
  {
    header: "Remark",
    accessorKey: "remarks",
    renderCell: ({ row }) => <ToolTipEllipses text={row.remarks} />,
    size: 200,
    flex: 1,
  },
];
