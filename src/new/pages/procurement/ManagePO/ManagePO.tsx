import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
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

import dayjs from "dayjs";
import DateRangeField from "@/new/components/shared/DateRangeField";
import {
  ManagePOColumns,
  ManagePOTableType,
} from "@/new/pages/procurement/POType";
import { fetchManagePO } from "@/new/features/procurement/POSlice";
import { useCommonData } from "@/new/hooks/useCommonData";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import ReusableAsyncSelect from "@/Components/ReusableAsyncSelect";
// import { imsAxios } from "../../../../axiosInterceptor.js";

type SearchType = "po_wise" | "vendor_wise" | "single_date_wise";

const ManagePO: React.FC = () => {
  const [rows, setRows] = useState<ManagePOTableType[]>([]);
  const [loading, setLoading] = useState(false);
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

  const dispatch = useDispatch();
  const { managePOList, managePOLoading } = useSelector(
    (state: any) => state.createPo
  );

  const columns = useMemo<MRT_ColumnDef<ManagePOTableType>[]>(
    () => ManagePOColumns,
    []
  );

  const table = useMaterialReactTable({
    columns: columns,
    data: managePOList || [],
    enableDensityToggle: false,
    initialState: { density: "compact" },
    enableStickyHeader: true,
    enablePagination: false,
    muiTableContainerProps: { sx: { maxHeight: "70vh" } },
    state: { isLoading: managePOLoading },
    renderTopToolbar: () =>
      managePOLoading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      ) : null,
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

  const shortcutsItems = [
    {
      label: "This Week",
      getValue: () => {
        const today = dayjs();
        return [today.startOf("week"), today.endOf("week")];
      },
    },
    {
      label: "Last Week",
      getValue: () => {
        const today = dayjs();
        const prevWeek = today.subtract(7, "day");
        return [prevWeek.startOf("week"), prevWeek.endOf("week")];
      },
    },
    {
      label: "Last 7 Days",
      getValue: () => {
        const today = dayjs();
        return [today.subtract(7, "day"), today];
      },
    },
    {
      label: "Current Month",
      getValue: () => {
        const today = dayjs();
        return [today.startOf("month"), today.endOf("month")];
      },
    },
    // Next Month removed to avoid future dates
    { label: "Reset", getValue: () => [null, null] },
  ];

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
        </Stack>
      </div>
      <div className="h-[70vh]">
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
};

export default ManagePO;
