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
  CircularProgress,
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
import { getApprovedPOColumns } from "@/new/pages/procurement/POType";
import {
  CancelPOModal,
  ViewPOModal,
  EditPOModal,
  UploadDocModal,
} from "@/new/components/shared/modals";
import {
  fetchCompletedPO,
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
import CustomButton from "@/new/components/reuseable/CustomButton";

type SearchType = "po_wise" | "vendor_wise" | "single_date_wise";

const ApporvalPo: React.FC = () => {
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

  const dispatch = useDispatch<typeof Store.dispatch>();
  const {
    showCancelPO,
    showViewSidebar,
    componentData,
    poLogs,
    componentLoading,
    poLogsLoading,
    completedPOList,
    completedPOLoading,
  } = useSelector((state: any) => state.createPo);

  // Use optimized row actions

  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => getApprovedPOColumns(),
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

  const handleView = async (poid: string, status: string) => {
    try {
      await dispatch(fetchComponentData({ poid, status }));
      await dispatch(fetchPOLogs(poid));
    } catch (error) {
      toast.error("Error fetching component data");
    }
  };

  // Refresh data after successful operations
  const handleRefreshData = () => {
    if (searchInput || searchDateRange || selectedVendor) {
      getSearchResults();
    }
  };

  const table = useMaterialReactTable({
    columns: columns,
    data: completedPOList || [],
      enableRowSelection: true,      // ✅ enables row checkboxes
  enableMultiRowSelection: true, // ✅ allows "Select All"
  enableSelectAll: true, 
    enableDensityToggle: false,
    initialState: { density: "compact" },
    enableStickyHeader: true,
    enablePagination: false,
    enableRowActions: true,
    muiTableContainerProps: {
      sx: {
        maxHeight: "calc(100vh - 260px)",
        minHeight: "calc(100vh - 260px)",
      },
    },
    renderEmptyRowsFallback: () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 360px)",
          color: "text.secondary",
          fontSize: "0.9rem",
        }}
      >
        No Purchase Orders Found
      </Box>
    ),

    renderTopToolbar: () =>
      completedPOLoading || componentLoading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : null,
    renderRowActionMenuItems: ({ row, table }) => [
      <MRT_ActionMenuItem
        icon={
          componentLoading || poLogsLoading ? (
            <CircularProgress size={16} />
          ) : (
            <Visibility />
          )
        }
        key="view"
        label="View"
        onClick={() =>
          handleView(
            row.original?.po_transaction_code,
            row?.original?.approval_status ?? ""
          )
        }
        table={table}
        disabled={componentLoading || poLogsLoading}
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
    let search;
    if (wise === "single_date_wise") {
      search = searchDateRange;
    } else {
      search = null;
    }

    if (searchInput || search || selectedVendor) {
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
          fetchCompletedPO({
            data: searchData,
            wise: wise,
          }) as any
        );
      } catch (error) {
        toast.error("Error fetching data");
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
                <MenuItem value="projectwise">Project Wise</MenuItem>
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

          <CustomButton
            title="Search"
            onclick={getSearchResults}
            loading={completedPOLoading}
            disabled={
              completedPOLoading ||
              (wise === "po_wise" && !searchInput) ||
              (wise === "vendor_wise" && !selectedVendor) ||
              (wise === "single_date_wise" &&
                (!searchDateRange?.startDate || !searchDateRange?.endDate))
            }
            size="small"
          />

          <CustomButton
            title="Download CSV"
            size="small"
            onclick={() =>
              downloadCSV(completedPOList || [], columns, "Completed PO Report")
            }
            disabled={!completedPOList || completedPOList.length === 0}
            starticon={<Download />}
            variant="outlined"
          />
        </Stack>
      </div>

      <div className="h-[calc(100vh-300px)]">
        <MaterialReactTable table={table} />
      </div>

      {/* Modals and Sidebars */}
      <CancelPOModal
        showCancelPO={showCancelPO}
        setShowCancelPO={(value) => dispatch(setShowCancelPO(value))}
        onCancelSuccess={handleRefreshData}
      />

      <ViewPOModal
        showViewSidebar={showViewSidebar}
        setShowViewSidebar={(value) => dispatch(setShowViewSidebar(value))}
        componentData={componentData}
        poLogs={poLogs}
        onRefreshLogs={(poId) => dispatch(fetchPOLogs(poId))}
      />
    </div>
  );
};

export default ApporvalPo;
