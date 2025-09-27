import { MRT_ColumnDef } from "material-react-table";
import { Chip } from "@mui/material";
import CopyableChip from "@/new/components/shared/CopyableChip";
import StatusChip from "@/new/components/shared/StatusChip";
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore
import { Store } from "../../../Features/Store";
import {
  fetchPOLogs,
  setShowUploadDoc,
  setShowCancelPO,
  setShowViewSidebar,
  setShowEditPO,
  setField,
} from "../../features/procurement/POSlice";
// @ts-ignore
import ViewComponentSideBar from "../../../Pages/PurchaseOrder/ManagePO/Sidebars/ViewComponentSideBar";
// @ts-ignore
import EditPO from "../../../Pages/PurchaseOrder/ManagePO/EditPO/EditPO";
// @ts-ignore
import MateirialInward from "../../../Pages/PurchaseOrder/ManagePO/MaterialIn/MateirialInward";
// @ts-ignore
import CancelPO from "../../../Pages/PurchaseOrder/ManagePO/Sidebars/CancelPO";
// @ts-ignore
import UploadDoc from "../../../Pages/PurchaseOrder/ManagePO/UploadDoc";

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

// Modals and Sidebars component
export const POModals = ({
  materialInward,
  setMaterialInward,
}: {
  materialInward: any;
  setMaterialInward: (value: any) => void;
}) => {
  const dispatch = useDispatch<typeof Store.dispatch>();
  const {
    showUploadDoc,
    showCancelPO,
    showEditPO,
    showViewSidebar,
    componentData,
    poLogs,
  } = useSelector((s: any) => s.createPo);
  const getSearchResults = () => {};
  const setRows = (_rows: any[]) => {};
  const rows: any[] = [];
  return (
    <>
      <UploadDoc
        setShowUploadDocModal2={(value: any) =>
          dispatch(setShowUploadDoc(value))
        }
        showUploadDocModal2={showUploadDoc}
      />

      <CancelPO
        getSearchResults={getSearchResults}
        setShowCancelPO={(value: any) => dispatch(setShowCancelPO(value))}
        showCancelPO={showCancelPO}
        setRows={setRows}
        rows={rows}
      />

      {showEditPO && (
        <EditPO
          updatePoId={showEditPO}
          setUpdatePoId={(value: any) => dispatch(setShowEditPO(value))}
        />
      )}

      <MateirialInward
        materialInward={materialInward}
        setMaterialInward={setMaterialInward}
        asyncOptions={[]}
        setAsyncOptions={() => {}}
      />

      <ViewComponentSideBar
        getPoLogs={(po_id: string) => dispatch(fetchPOLogs(po_id))}
        newPoLogs={poLogs}
        setnewPoLogs={(logs: any) =>
          dispatch(setField({ key: "poLogs", value: logs }))
        }
        setShowViewSideBar={(show: boolean) =>
          dispatch(setShowViewSidebar(show))
        }
        showViewSidebar={showViewSidebar}
        componentData={componentData}
      />
    </>
  );
};

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
