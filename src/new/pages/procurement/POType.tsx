import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ColumnDef,
} from "material-react-table";
import {
  IconButton,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  LinearProgress,
} from "@mui/material";
import {
  MoreVert,
  Edit,
  Visibility,
  Download,
  Print,
  Cancel,
  Upload,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore
import { Store } from "../../../Features/Store";
import { toast } from "react-toastify";
import {
  printPO,
  downloadPO,
  checkPOStatus,
  fetchComponentData,
  fetchPOLogs,
  fetchPODetails,
  setShowUploadDoc,
  setShowCancelPO,
  setShowViewSidebar,
  setShowEditPO,
  setField,
} from "../../features/procurement/POSlice";
// @ts-ignore
import printFunction from "../../../Components/printFunction";
// @ts-ignore
import { downloadFunction } from "../../../Components/printFunction";

// Import modals and sidebars
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

// Action handlers with menu state management
export const usePOActions = () => {
  const dispatch = useDispatch<typeof Store.dispatch>();

  const handlePrint = async (poid: string) => {
    try {
      const result = await dispatch(printPO(poid));
      if (printPO.fulfilled.match(result)) {
        printFunction(result.payload);
      } else {
        toast.error("Error printing PO");
      }
    } catch (error) {
      toast.error("Error printing PO");
    }
  };

  const handleDownload = async (poid: string) => {
    try {
      const result = await dispatch(downloadPO(poid));
      if (downloadPO.fulfilled.match(result)) {
        const filename = `PO ${poid}`;
        downloadFunction(result.payload, filename);
      } else {
        toast.error("Error downloading PO");
      }
    } catch (error) {
      toast.error("Error downloading PO");
    }
  };

  const handleCancelPO = async (poid: string) => {
    try {
      await dispatch(checkPOStatus(poid));
    } catch (error) {
      toast.error("PO is already cancelled");
    }
  };

  const handleView = async (poid: string, status: string) => {
    try {
      await dispatch(fetchComponentData({ poid, status }));
      await dispatch(fetchPOLogs(poid));
    } catch (error) {
      toast.error("Error fetching component data");
    }
  };

  const handleEdit = async (poid: string) => {
    try {
      await dispatch(fetchPODetails(poid));
    } catch (error) {
      toast.error("Error fetching PO details");
    }
  };

  const handleUpload = (poid: string) => {
    dispatch(setShowUploadDoc(poid));
  };

  return {
    handlePrint,
    handleDownload,
    handleCancelPO,
    handleView,
    handleEdit,
    handleUpload,
  };
};

// Menu component
export const POMenu = ({
  anchorEl,
  selectedRow,
  onClose,
  onAction,
}: {
  anchorEl: HTMLElement | null;
  selectedRow: ManagePOTableType | null;
  onClose: () => void;
  onAction: (action: string) => void;
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <MenuItem
        onClick={() => onAction("edit")}
        disabled={selectedRow?.approval_status === "C"}
      >
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => onAction("view")}>
        <ListItemIcon>
          <Visibility fontSize="small" />
        </ListItemIcon>
        <ListItemText>View</ListItemText>
      </MenuItem>
      <MenuItem
        onClick={() => onAction("download")}
        disabled={selectedRow?.approval_status === "P"}
      >
        <ListItemIcon>
          <Download fontSize="small" />
        </ListItemIcon>
        <ListItemText>Download</ListItemText>
      </MenuItem>
      <MenuItem
        onClick={() => onAction("print")}
        disabled={selectedRow?.approval_status === "P"}
      >
        <ListItemIcon>
          <Print fontSize="small" />
        </ListItemIcon>
        <ListItemText>Print</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => onAction("cancel")}>
        <ListItemIcon>
          <Cancel fontSize="small" />
        </ListItemIcon>
        <ListItemText>Cancel</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => onAction("upload")}>
        <ListItemIcon>
          <Upload fontSize="small" />
        </ListItemIcon>
        <ListItemText>Upload File</ListItemText>
      </MenuItem>
    </Menu>
  );
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

export const getManagePOColumns = (
  handleMenuClick: (
    e: React.MouseEvent<HTMLElement>,
    row: ManagePOTableType
  ) => void
): MRT_ColumnDef<ManagePOTableType>[] => [
  {
    accessorKey: "actions",
    header: "Actions",
    size: 80,
    Cell: ({ row }) => (
      <IconButton
        size="small"
        onClick={(e) => handleMenuClick(e, row.original)}
      >
        <MoreVert />
      </IconButton>
    ),
  },
  {
    accessorKey: "po_transaction",
    header: "PO ID",
    size: 150,
    Cell: ({ cell }) => (
      <Tooltip title={cell.getValue<string>()}>
        <Chip
          label={cell.getValue<string>()}
          size="small"
          variant="outlined"
          onClick={() => navigator.clipboard.writeText(cell.getValue<string>())}
          sx={{ cursor: "pointer" }}
        />
      </Tooltip>
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
      <Tooltip title={cell.getValue<string>()}>
        <Chip
          label={cell.getValue<string>()}
          size="small"
          variant="outlined"
          onClick={() => navigator.clipboard.writeText(cell.getValue<string>())}
          sx={{ cursor: "pointer" }}
        />
      </Tooltip>
    ),
  },
  {
    accessorKey: "project_id",
    header: "Project ID",
    size: 150,
    Cell: ({ cell }) => (
      <Tooltip title={cell.getValue<string>()}>
        <Chip
          label={cell.getValue<string>()}
          size="small"
          variant="outlined"
          onClick={() => navigator.clipboard.writeText(cell.getValue<string>())}
          sx={{ cursor: "pointer" }}
        />
      </Tooltip>
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
      <Chip
        label={cell.getValue<string>()}
        size="small"
        color={
          cell.getValue<string>() === "APPROVED"
            ? "success"
            : cell.getValue<string>() === "PENDING"
            ? "warning"
            : "error"
        }
      />
    ),
  },
  {
    accessorKey: "advPayment",
    header: "Advance Payment",
    size: 150,
    Cell: ({ cell }) => (
      <Chip
        label={cell.getValue<string>() === "0" ? "NO" : "YES"}
        size="small"
        color={cell.getValue<string>() === "0" ? "default" : "primary"}
      />
    ),
  },
  {
    accessorKey: "po_comment",
    header: "Comment",
    size: 150,
  },
];

// Full table component encapsulating actions, menu, and modals
export const ManagePOTable: React.FC = () => {
  const dispatch = useDispatch<typeof Store.dispatch>();
  const { managePOList, managePOLoading } = useSelector((s: any) => s.createPo);

  // Local UI state
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] =
    React.useState<ManagePOTableType | null>(null);
  const [materialInward, setMaterialInward] = React.useState<any>(null);

  const {
    handlePrint,
    handleDownload,
    handleCancelPO,
    handleView,
    handleEdit,
    handleUpload,
  } = usePOActions();

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    row: ManagePOTableType
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleAction = (action: string) => {
    if (!selectedRow) return;
    switch (action) {
      case "edit":
        handleEdit(selectedRow.po_transaction);
        break;
      case "view":
        handleView(selectedRow.po_transaction, (selectedRow as any).po_status);
        break;
      case "download":
        handleDownload(selectedRow.po_transaction);
        break;
      case "print":
        handlePrint(selectedRow.po_transaction);
        break;
      case "cancel":
        handleCancelPO(selectedRow.po_transaction);
        break;
      case "upload":
        handleUpload(selectedRow.po_transaction);
        break;
    }
    handleMenuClose();
  };

  const columns = React.useMemo<MRT_ColumnDef<ManagePOTableType>[]>(
    () => getManagePOColumns(handleMenuClick),
    [handleMenuClick]
  );

  const table = useMaterialReactTable({
    columns,
    data: managePOList || [],
    enableDensityToggle: false,
    initialState: { density: "compact" },
    enableStickyHeader: true,
    enablePagination: false,
    muiTableContainerProps: { sx: { maxHeight: "70vh" } },
    state: { isLoading: !!managePOLoading },
    renderTopToolbar: () =>
      managePOLoading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : null,
  });

  return (
    <>
      <POMenu
        anchorEl={anchorEl}
        selectedRow={selectedRow}
        onClose={handleMenuClose}
        onAction={handleAction}
      />
      <div className="h-[70vh]">
        <MaterialReactTable table={table} />
      </div>
      <POModals
        showUploadDoc={showUploadDoc}
        showCancelPO={showCancelPO}
        showEditPO={showEditPO}
        showViewSidebar={showViewSidebar}
        componentData={componentData}
        poLogs={poLogs}
        materialInward={materialInward}
        setMaterialInward={setMaterialInward}
        getSearchResults={() => {}}
        setRows={() => {}}
        rows={[]}
        dispatch={dispatch}
      />
    </>
  );
};
