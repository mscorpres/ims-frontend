import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  MRT_ActionMenuItem,
} from "material-react-table";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  LinearProgress,
  Stack,
} from "@mui/material";
import {
  Download,
  Edit,
  Visibility,
  Print,
  Cancel,
  Upload,
} from "@mui/icons-material";
import DateRangeField from "@/new/components/shared/DateRangeField";
import {
  ManagePOTableType,
  getManagePOColumns,
  POModals,
} from "@/new/pages/procurement/POType";
import {
  fetchManagePO,
  printPO,
  downloadPO,
  checkPOStatus,
  fetchComponentData,
  fetchPOLogs,
  fetchPODetails,
  setShowUploadDoc,
} from "@/new/features/procurement/POSlice";
import { useDispatch, useSelector } from "react-redux";
import printFunction from "@/new/utils/printFunction";
import { downloadFunction } from "@/new/utils/printFunction";
// @ts-ignore
import { Store } from "../../../../Features/Store";
import { toast } from "react-toastify";
import ReusableAsyncSelect from "@/Components/ReusableAsyncSelect";
// @ts-ignore
import { downloadCSV } from "../../../../Components/exportToCSV";

type SearchType = "po_wise" | "vendor_wise" | "single_date_wise";

const ManagePO: React.FC = () => {
  const [rows, setRows] = useState<ManagePOTableType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [wise, setWise] = useState<SearchType>("po_wise");
  const [searchDateRange, setSearchDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<{
    label: string;
    value: string;
  } | null>(null);

  // Additional state for modals and functionality
  const [materialInward, setMaterialInward] = useState<any>(null);

  const dispatch = useDispatch<typeof Store.dispatch>();
  const {
    managePOList,
    managePOLoading,
    showCancelPO,
    showViewSidebar,
    componentData,
    poLogs,
    showEditPO,
    showUploadDoc,
    printLoading,
    downloadLoading,
    componentLoading,
    poLogsLoading,
    poDetailsLoading,
  } = useSelector((state: any) => state.createPo);

  // Use optimized row actions

  const columns = useMemo<MRT_ColumnDef<ManagePOTableType>[]>(
    () => getManagePOColumns(),
    []
  );
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

  const table = useMaterialReactTable({
    columns: columns,
    data: managePOList || [],
    enableDensityToggle: false,
    initialState: { density: "compact" },
    enableStickyHeader: true,
    enablePagination: false,
    enableRowActions: true,
    muiTableContainerProps: { sx: { maxHeight: "70vh" } },
    state: {
      isLoading:
        managePOLoading ||
        searchLoading ||
        componentLoading ||
        poLogsLoading ||
        poDetailsLoading,
    },
    renderTopToolbar: () =>
      managePOLoading ||
      searchLoading ||
      componentLoading ||
      poLogsLoading ||
      poDetailsLoading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : null,
    renderRowActionMenuItems: ({ row, table }) => [
      <MRT_ActionMenuItem
        icon={<Edit />}
        key="edit"
        label="Edit"
        onClick={() => handleEdit(row?.original?.po_transaction)}
        table={table}
        disabled={row.original.approval_status === "C"}
      />,
      <MRT_ActionMenuItem
        icon={<Visibility />}
        key="view"
        label="View"
        onClick={() => handleView(row.original?.po_transaction, row?.original?.approval_status ?? "")}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<Download />}
        key="download"
        label="Download"
        onClick={() => handleDownload(row?.original?.po_transaction)}
        table={table}
        disabled={row.original.approval_status === "P"}
      />,
      <MRT_ActionMenuItem
        icon={<Print />}
        key="print"
        label="Print"
        onClick={() => handlePrint(row?.original?.po_transaction)}
        table={table}
        disabled={row.original.approval_status === "P"}
      />,
      <MRT_ActionMenuItem
        icon={<Cancel />}
        key="cancel"
        label="Cancel"
        onClick={() => handleCancelPO(row?.original?.po_transaction)}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<Upload />}
        key="upload"
        label="Upload File"
        onClick={() => handleUpload(row?.original?.po_transaction)}
        table={table}
      />,
    ],
  });

  // Format yyyy-mm-dd to dd-mm-yyyy
  const formatDateForApi = (dateStr?: string) => {
    if (!dateStr) return "";
    const [yyyy, mm, dd] = dateStr.split("-");
    if (!yyyy || !mm || !dd) return dateStr;
    return `${dd}-${mm}-${yyyy}`;
  };

  const getSearchResults = async () => {
    setRows([]);
    let search;
    if (wise === "single_date_wise") {
      search = searchDateRange;
    } else {
      search = null;
    }

    if (searchInput || search || selectedVendor) {
      setLoading(true);

      let searchData: any;
      if (wise === "vendor_wise") {
        searchData = selectedVendor?.value || searchInput;
      } else if (wise === "po_wise") {
        searchData = searchInput.trim();
      } else if (wise === "single_date_wise" && searchDateRange) {
        const start = formatDateForApi(searchDateRange.startDate);
        const end = formatDateForApi(searchDateRange.endDate);
        // Backend expects "dd-mm-yyyy-dd-mm-yyyy"
        searchData = `${start}-${end}`;
      }

      try {
        const res = await dispatch(
          fetchManagePO({
            data: searchData,
            wise: wise,
          }) as any
        );

        setLoading(false);
        if (res.payload) {
          const mapped = (res.payload || []).map((r: any, index: number) => ({
            id: r.po_transaction ?? String(index),
            ...r,
          }));
          setRows(mapped);
        } else {
          setRows([]);
        }
      } catch (error) {
        setLoading(false);
        toast.error("Error fetching data");
        setRows([]);
      }
    } else {
      if (wise === "single_date_wise" && searchDateRange === null) {
        toast.error("Please select start and end dates for the results");
      } else if (wise === "po_wise") {
        toast.error("Please enter a PO id");
      } else if (wise === "vendor_wise") {
        toast.error("Please select a vendor");
      }
    }
  };

  // Transform function for vendor data
  const transformVendorData = (data: any[]) => {
    return data.map((vendor) => ({
      label: vendor.text,
      value: vendor.id,
    }));
  };

  // Clear vendor options when switching away from vendor_wise
  useEffect(() => {
    if (wise !== "vendor_wise") {
      setSelectedVendor(null);
      setSearchInput("");
    }
  }, [wise]);

  return (
    <div style={{ padding: 12 }}>
      <div className="flex flex-col gap-3" style={{ paddingBottom: 16 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="managepo-search-type-label">
                Search Type
              </InputLabel>
              <Select
                labelId="managepo-search-type-label"
                id="managepo-search-type"
                value={wise}
                label="Search Type"
                onChange={(e) => setWise(e.target.value as SearchType)}
              >
                <MenuItem value="po_wise">PO Wise</MenuItem>
                <MenuItem value="vendor_wise">Vendor Wise</MenuItem>
                <MenuItem value="single_date_wise">Date Range</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {wise === "po_wise" && (
            <TextField
              size="small"
              label="Enter PO ID"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && getSearchResults()}
              sx={{ width: 300 }}
            />
          )}

          {wise === "vendor_wise" && (
            <div className="flex gap-2 items-center">
              <ReusableAsyncSelect
                placeholder="Search Vendor"
                endpoint="/backend/vendorList"
                transform={transformVendorData}
                fetchOptionWith="payload"
                value={selectedVendor}
                onChange={(e: any) =>
                  setSelectedVendor(
                    e
                      ? ({ label: e.label, value: e.value } as {
                          label: string;
                          value: string;
                        })
                      : null
                  )
                }
                label="Select Vendor"
                size="small"
                sx={{ minWidth: 300 }}
              />
            </div>
          )}

          {wise === "single_date_wise" && (
            <DateRangeField
              value={searchDateRange}
              onChange={(next) => setSearchDateRange(next)}
              size="small"
              minInputWidth={150}
              disableFuture
            />
          )}

          <Button
            variant="contained"
            size="small"
            onClick={getSearchResults}
            disabled={
              loading ||
              (wise === "po_wise" && !searchInput) ||
              (wise === "vendor_wise" && !selectedVendor) ||
              (wise === "single_date_wise" &&
                (!searchDateRange?.startDate || !searchDateRange?.endDate))
            }
          >
            {loading ? "Searching..." : "Search"}
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={() =>
              downloadCSV(managePOList || [], columns, "Manage PO Report")
            }
            disabled={!managePOList || managePOList.length === 0}
            startIcon={<Download />}
          >
            Download CSV
          </Button>
        </Stack>
      </div>

      <div className="h-[70vh]">
        <MaterialReactTable table={table} />
      </div>

      {/* Modals and Sidebars */}
      <POModals
        materialInward={materialInward}
        setMaterialInward={setMaterialInward}
      />
    </div>
  );
};

export default ManagePO;
