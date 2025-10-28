import CopyableChip from "@/new/components/shared/CopyableChip";
import StatusChip from "@/new/components/shared/StatusChip";

export const getManagePOColumns = () => [
  {
    accessorKey: "po_transaction",
    header: "PO ID",
    size: 150,
    Cell: ({ cell }) => (
      <CopyableChip value={cell.getValue()} size="small" variant="outlined" />
    ),
  },
  {
    accessorKey: "cost_center",
    header: "Cost Center",
    size: 150,
  },
  {
    accessorKey: "vendor_name",
    header: "Vendor Name",
    size: 200,
  },
  {
    accessorKey: "vendor_id",
    header: "Vendor Code",
    size: 100,
    Cell: ({ cell }) => (
      <CopyableChip value={cell.getValue()} size="small" variant="outlined" />
    ),
  },
  {
    accessorKey: "project_id",
    header: "Project ID",
    size: 150,
    Cell: ({ cell }) => (
      <CopyableChip value={cell.getValue()} size="small" variant="outlined" />
    ),
  },
  {
    accessorKey: "project_name",
    header: "Project Name",
    size: 150,
  },
  {
    accessorKey: "requested_by",
    header: "Requested By",
    size: 150,
  },
  {
    accessorKey: "approved_by",
    header: "Approved By/Rejected By",
    size: 200,
  },
  {
    accessorKey: "po_reg_date",
    header: "Po Reg. Date",
    size: 150,
  },
  {
    accessorKey: "po_reg_by",
    header: "Created By",
    size: 150,
  },
  {
    accessorKey: "approval_status",
    header: "Approval Status",
    size: 150,
    Cell: ({ cell }) => (
      <StatusChip value={cell.getValue()} size="small" type="approval" />
    ),
  },
  {
    accessorKey: "advPayment",
    header: "Advance Payment",
    size: 150,
    Cell: ({ cell }) => (
      <StatusChip value={cell.getValue()} size="small" type="payment" />
    ),
  },
  {
    accessorKey: "po_comment",
    header: "Comment",
    size: 150,
  },
];

export const getCompletedPOColumns = () => [
  {
    accessorKey: "index",
    header: "Serial No.",
    size: 150,
  },
  {
    accessorKey: "po_transaction_style",
    header: "PO ID",
    size: 150,
    Cell: ({ cell }) => (
      <span
        dangerouslySetInnerHTML={{
          //@ts-ignore
          __html: cell.getValue() ?? "",
        }}
      />
    ),
  },
  {
    accessorKey: "cost_center",
    header: "Cost Center",
    size: 150,
  },
  {
    accessorKey: "vendor_name",
    header: "Vendor Name",
    size: 200,
  },
  {
    accessorKey: "vendor_id",
    header: "Vendor Code",
    size: 100,
    Cell: ({ cell }) => (
      <CopyableChip value={cell.getValue()} size="small" variant="outlined" />
    ),
  },
  {
    accessorKey: "po_reg_date",
    header: "Po Reg. Date",
    size: 150,
    Cell: ({ cell }) => (
      <CopyableChip value={cell.getValue()} size="small" variant="outlined" />
    ),
  },

  {
    accessorKey: "po_reg_by",
    header: "Created By",
    size: 150,
  },

  {
    accessorKey: "po_comment",
    header: "Comment",
    size: 150,
  },
];
export const getViewCompletePOColumns = () => [
  {
    header: "Serial No.",
    size: 150,
    Cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "po_components",
    header: "Component Name / Part No.",
    size: 250,
    Cell: ({ row }) => (
      <span>
        {row.original.po_components} / {row.original.componentPartID}
      </span>
    ),
  },
  {
    accessorKey: "ordered_qty",
    header: "Ordered Qty",
    size: 150,
  },
  {
    accessorKey: "pending_qty",
    header: "Pending QTY",
    size: 200,
  },
];
export const getViewManagePOColumns = () => [
  {
    header: "Serial No.",
    size: 150,
    Cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "po_components",
    header: "Component Name / Part No.",
    size: 250,
    Cell: ({ row }) => (
      <span>
        {row.original.po_components} / {row.original.componentPartID}
      </span>
    ),
  },
  {
    accessorKey: "ordered_qty",
    header: "Ordered Qty",
    size: 150,
  },
  {
    accessorKey: "pending_qty",
    header: "Pending QTY",
    size: 200,
  },
];

export const getVendorPricingUploadColumns = () => [
  {
    accessorKey: "vendor_id",
    header: "Vendor Code",
    size: 100,
    // Cell: ({ cell }) => (
    //   <CopyableChip value={cell.getValue()} size="small" variant="outlined" />
    // ),
  },
  {
    accessorKey: "part_code",
    header: "Part Code",
    size: 150,
  },

  {
    accessorKey: "part_name",
    header: "Part Name",
    size: 150,
  },

  {
    accessorKey: "rate",
    header: "Rate",
    size: 150,
  },
];

export const getApprovedPOColumns = () => [
  {
    accessorKey: "po_transaction",
    header: "PO ID",
    size: 150,
    Cell: ({ cell }) => (
      <CopyableChip value={cell.getValue()} size="small" variant="outlined" />
    ),
  },
  {
    accessorKey: "serialNo",
    header: "Sr No.",
    size: 80,
    enableSorting: false,
    enableColumnFilter: false,
    Cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "po_costcenter",
    header: "Cost Center",
    size: 150,
  },
  {
    accessorKey: "po_projectname",
    header: "Project Id",
    size: 200,
  },
  {
    accessorKey: "project_description",
    header: "Project Name",
    size: 150,
  },
  {
    accessorKey: "vendor_name",
    header: "Vendor",
    size: 200,
  },

  {
    accessorKey: "po_reg_date",
    header: "Po Reg. Date",
    size: 150,
    Cell: ({ cell }) => (
      <CopyableChip value={cell.getValue()} size="small" variant="outlined" />
    ),
  },

  {
    accessorKey: "po_reg_by",
    header: "Created By",
    size: 150,
  },

  {
    accessorKey: "deviation_remark",
    header: "Deviation Comment",
    size: 150,
  },
];

export const getViewApprovedPOColumns = () => [
  {
    accessorKey: "serialNo",
    header: "Sr. No.",
    size: 80,
    enableSorting: false,
    enableColumnFilter: false,
    Cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "po_components",
    header: "Component",
    size: 150,
  },
  {
    accessorKey: "po_part_status",
    header: "Comp. Status",
    size: 150,
  },
  {
    accessorKey: "ordered_qty",
    header: "Qty",
    size: 200,
  },
  {
    accessorKey: "uom",
    header: "UoM",
    size: 150,
  },
  {
    accessorKey: "approval_remark",
    header: "Approval Remark",
    size: 200,
  },
];
