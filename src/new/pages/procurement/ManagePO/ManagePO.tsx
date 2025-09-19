import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro";
import {
  ManagePOColumns,
  ManagePOTableType,
} from "@/new/pages/procurement/POType";
import { fetchManagePO } from "@/new/features/procurement/POSlice";
import { useCommonData } from "@/new/hooks/useCommonData";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import AsyncAutocomplete from "@/new/components/reuseable/AsyncAutocomplete";
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
  const { vendorOptions, vendorLoading, fetchVendors } = useCommonData();

  const columns = useMemo<MRT_ColumnDef<ManagePOTableType>[]>(
    () => ManagePOColumns,
    []
  );

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: { density: "compact" },
    enableStickyHeader: true,
    enablePagination: false,
    muiTableContainerProps: { sx: { maxHeight: "70vh", height: "70vh" } },
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

    if (searchInput || search) {
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

  const handleVendorSearch = (query: string) => {
    if (query.length > 2) {
      fetchVendors(query);
    }
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
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex gap-2 items-center flex-wrap">
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
              <AsyncAutocomplete
                placeholder="Search Vendor"
                qtkMethod={fetchVendors}
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
                label="okk"
              />
            </div>
          )}

          {wise === "single_date_wise" && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateRangePicker
                value={[
                  searchDateRange?.startDate
                    ? dayjs(searchDateRange.startDate)
                    : null,
                  searchDateRange?.endDate
                    ? dayjs(searchDateRange.endDate)
                    : null,
                ]}
                onChange={(
                  newValue: [dayjs.Dayjs | null, dayjs.Dayjs | null]
                ) => {
                  const [start, end] = newValue || [];
                  setSearchDateRange({
                    startDate: start ? dayjs(start).format("YYYY-MM-DD") : "",
                    endDate: end ? dayjs(end).format("YYYY-MM-DD") : "",
                  });
                }}
                renderInput={(startProps: any, endProps: any) => (
                  <div className="flex gap-2 items-center">
                    <TextField
                      size="small"
                      label="Start Date"
                      {...startProps}
                    />
                    <span>to</span>
                    <TextField size="small" label="End Date" {...endProps} />
                  </div>
                )}
              />
            </LocalizationProvider>
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
        </div>
      </div>
      <div className="h-[70vh]">
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
};

export default ManagePO;
