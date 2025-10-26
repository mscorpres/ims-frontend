import { MRT_ColumnDef } from "material-react-table";
import CopyableChip from "@/new/components/shared/CopyableChip";
import StatusChip from "@/new/components/shared/StatusChip";

export type ManagePOTableType = {
  id: string;
  po_transaction: string;
  vendor_name: string;
  cost_center?: string;
  project_name?: string;
  approval_status?: string;
  po_reg_date?: string;
  vendor_id?: string;
  project_id?: string;
  requested_by?: string;
  approved_by?: string;
  po_reg_by?: string;
  advPayment?: string;
  po_comment?: string;
};

// Note: POModals component has been replaced with individual modal components
// in the new structure. See ManagePO.tsx for the new implementation.

export const getManagePOColumns = (): MRT_ColumnDef<ManagePOTableType>[] => [
  {
    accessorKey: "po_transaction",
    header: "PO ID",
    size: 150,
    Cell: ({ cell }) => (
      <CopyableChip
        value={cell.getValue<string>()}
        size="small"
        variant="outlined"
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
      <CopyableChip
        value={cell.getValue<string>()}
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    accessorKey: "project_id",
    header: "Project ID",
    size: 150,
    Cell: ({ cell }) => (
      <CopyableChip
        value={cell.getValue<string>()}
        size="small"
        variant="outlined"
      />
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
      <StatusChip
        value={cell.getValue<string>()}
        size="small"
        type="approval"
      />
    ),
  },
  {
    accessorKey: "advPayment",
    header: "Advance Payment",
    size: 150,
    Cell: ({ cell }) => (
      <StatusChip value={cell.getValue<string>()} size="small" type="payment" />
    ),
  },
  {
    accessorKey: "po_comment",
    header: "Comment",
    size: 150,
  },
];

export const getCompletedPOColumns = (): MRT_ColumnDef<ManagePOTableType>[] => [

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
      <CopyableChip
        value={cell.getValue<string>()}
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    accessorKey: "po_reg_date",
    header: "Po Reg. Date",
    size: 150,
    Cell: ({ cell }) => (
      <CopyableChip
        value={cell.getValue<string>()}
        size="small"
        variant="outlined"
      />
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
];


export const getVendorPricingUploadColumns = (): MRT_ColumnDef<ManagePOTableType>[] => [


  {
    accessorKey: "vendor_id",
    header: "Vendor Code",
    size: 100,
    Cell: ({ cell }) => (
      <CopyableChip
        value={cell.getValue<string>()}
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    accessorKey: "part_code",
    header: "Part Code",
    size: 150,
    Cell: ({ cell }) => (
      <CopyableChip
        value={cell.getValue<string>()}
        size="small"
        variant="outlined"
      />
    ),
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


export const getApprovedPOColumns = (): MRT_ColumnDef<ManagePOTableType>[] => [
   {
    accessorKey: "po_transaction_code",
    header: "PO ID",
    size: 150,
    Cell: ({ cell }) => (
      <CopyableChip
        value={cell.getValue<string>()}
        size="small"
        variant="outlined"
      />
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
    accessorKey: "cost_center",
    header: "Cost Center",
    size: 150,
  },
    {
    accessorKey: "project_id",
    header: "Project Id",
    size: 200,
  },
   {
    accessorKey: "project_name",
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
      <CopyableChip
        value={cell.getValue<string>()}
        size="small"
        variant="outlined"
      />
    ),
  },

  {
    accessorKey: "po_reg_by",
    header: "Created By",
    size: 150,
  },

  {
    accessorKey: "deviation_comment",
    header: "Deviation Comment",
    size: 150,
  },
   
];