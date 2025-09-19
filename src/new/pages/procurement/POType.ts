import { MRT_ColumnDef } from "material-react-table";

export type ManagePOTableType = {
  id: string;
  po_transaction: string;
  vendor_name: string;
  cost_center?: string;
  project_name?: string;
  approval_status?: string;
  po_reg_date?: string;
};

export const ManagePOColumns: MRT_ColumnDef<ManagePOTableType>[] = [
  // { accessorKey: "id", header: "#", size: 160 },
  { accessorKey: "po_transaction", header: "PO ID", size: 160 },
  { accessorKey: "cost_center", header: "Cost Center",size:200 },
  { accessorKey: "vendor_name", header: "Vendor", size: 220 },
  { accessorKey: "vendor_id", header: "Vendor Code", size: 100 },
  { accessorKey: "project_id", header: "Project ID", size: 150 },
  { accessorKey: "project_name", header: "Project Name", size: 200 },
  { accessorKey: "requested_by", header: "Requested By", size: 150 },
  { accessorKey: "approved_by", header: "Approved By/Rejected By", size: 200 },
  { accessorKey: "po_reg_date", header: "PO Reg Date", size: 150 },
  { accessorKey: "po_reg_by", header: "PO Created By", size: 200 },
  { accessorKey: "approval_status", header: "Status", size: 120 },
  { accessorKey: "advPayment", header: "Advance Payment", size: 120 },
  { accessorKey: "po_comment", header: "Comment", size: 160 },
  { accessorKey: "actions", header: "Actions", size: 160 },
];
