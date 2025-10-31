import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { Button, Col, Input, Row, Select } from "antd";
import { v4 as uuidv4 } from "uuid";
import MyDatePicker from "../../../Components/MyDatePicker";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import EditDC from "./EditDC/EditDC";
import { imsAxios } from "../../../axiosInterceptor";
import validateResponse from "../../../Components/validateResponse";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
import { Create, Download, Edit, Print, Search } from "@mui/icons-material";
import CustomButton from "../../../new/components/reuseable/CustomButton";

const SELECT_OPTIONS = [
  { label: "Date Wise", value: "datewise" },
  { label: "GP ID Wise", value: "gpwise" },
];

function ManageDC() {
  const columns = [
    {
      accessorKey: "transaction_id",
      header: "Journal ID",
      size: 200,
    },
    { accessorKey: "vendor_name", header: "To (Name)", size: 500 },
    { accessorKey: "insert_date", header: "Created Date/Time", size: 200 },
    { accessorKey: "component_name", header: "Component Name", size: 200 },
    { accessorKey: "part_no", header: "Part No.", size: 200 },
    { accessorKey: "quantity", header: "Quantity", size: 200 },
    { accessorKey: "rate", header: "Rate", size: 200 },
    { accessorKey: "hsn", header: "HSN", size: 200 },
    { accessorKey: "total", header: "Amount", size: 200 },
    { accessorKey: "ewaybill_status", header: "E WayBill Status", size: 200 },
    { accessorKey: "ewaybill_no", header: "E WayBill No.", size: 200 },
  ];
  const [state, setState] = useState({
    selType: "",
    gpInput: "",
  });
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("");
  const [updatedDCId, setUpdateDCId] = useState(null);

  const fetchData = useCallback(async () => {
    if (!state.selType) {
      toast.error("Please select a type");
      return;
    }

    if (state.selType === "datewise" && !dateRange) {
      toast.error("Please select a date range");
      return;
    }

    if (state.selType === "gpwise" && !state.gpInput.trim()) {
      toast.error("Please enter a valid GP ID");
      return;
    }

    setLoading(true);
    try {
      const { data } = await imsAxios.post("/gatepass/fetchAllGatepass", {
        data: state.selType === "datewise" ? dateRange : state.gpInput,
        wise: state.selType,
      });

      if (data.code === 200) {
        const formattedData = data.response.data.map((row) => ({
          ...row,
          id: uuidv4(),
        }));
        setTableData(formattedData);
        toast.success("Data fetched successfully");
      } else {
        toast.error(data.message || "Failed to fetch data");
      }
    } catch (error) {
      toast.error("An error occurred while fetching data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [state.selType, state.gpInput, dateRange]);

  const handleDownloadCSV = useCallback(() => {
    const csvData = tableData.map((row) => ({
      "Journal ID": row.transaction_id,
      "To (Name)": row.vendor_name,
      "Component Name": row.component_name,
      "Part No": row.part_no,
      HSN: row.hsn,
      Quantity: row.quantity,
      Rate: row.rate,
      Amount: row.total,
      "Created Date/Time": row.insert_date,
      "EWay Bill Status": row.ewaybill_status,
      "Eway Bill No": row.ewaybill_no,
    }));

    downloadCSVCustomColumns(csvData, "Manage DC Report");
  }, [tableData]);

  const printFun = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await imsAxios.post("/gatepass/printGatePass", {
        transaction: id,
      });
      const validatedData = validateResponse(data);
      printFunction(validatedData.data.buffer.data);
    } catch (error) {
      toast.error("Failed to print document");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadFun = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await imsAxios.post("/gatepass/printGatePass", {
        transaction: id,
      });
      const validatedData = validateResponse(data);
      downloadFunction(validatedData.data.buffer.data, id);
    } catch (error) {
      toast.error("Failed to download document");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const table = useMaterialReactTable({
    columns: columns,
    data: tableData || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
    renderRowActionMenuItems: ({ row, table, closeMenu }) => [
      <MRT_ActionMenuItem
        icon={<Edit />}
        key="edit"
        label="Edit"
        onClick={() => {
          closeMenu?.();
          setUpdateDCId(row?.original?.transaction_id);
        }}
        table={table}
      />,

      <MRT_ActionMenuItem
        icon={<Download />}
        key="download"
        label="Download"
        onClick={() => {
          closeMenu?.();
          downloadFun(row?.original?.po_transaction);
        }}
        table={table}
        disabled={row.original.approval_status === "P"}
      />,
      <MRT_ActionMenuItem
        icon={<Print />}
        key="print"
        label="Print"
        onClick={() => {
          closeMenu?.();
          printFun(row?.original?.po_transaction);
        }}
        table={table}
        disabled={row.original.approval_status === "P"}
      />,
      <MRT_ActionMenuItem
        icon={<Create />}
        key="ewaybill"
        label="Create E-Way Bill"
        onClick={() => {
          closeMenu?.();
          const url = `/warehouse/e-way/dc/${row.transaction_id.replaceAll(
            "/",
            "_"
          )}`;
          window.open(url, "_blank");
        }}
        table={table}
      />,
    ],
  });

  return (
    <div style={{ height: "90%", padding: "10px" }}>
      {updatedDCId && (
        <EditDC updatedDCId={updatedDCId} setUpdateDCId={setUpdateDCId} />
      )}
      <Row gutter={16} style={{ paddingBottom: 5 }}>
        <Col span={4}>
          <Select
            style={{ width: "100%" }}
            options={SELECT_OPTIONS}
            placeholder="Select Option"
            value={state.selType}
            onChange={(value) =>
              setState((prev) => ({ ...prev, selType: value, gpInput: "" }))
            }
            disabled={loading}
            aria-label="Select search type"
          />
        </Col>
        {state.selType === "datewise" && (
          <>
            <Col span={5}>
              <MyDatePicker
                setDateRange={setDateRange}
                size="default"
                disabled={loading}
              />
            </Col>
            <Col span={2}>
              <CustomButton
                size="small"
                title={"Search"}
                starticon={<Search fontSize="small" />}
                loading={loading}
                disabled={loading || !dateRange}
                onclick={fetchData}
              />
            </Col>
          </>
        )}
        {state.selType === "gpwise" && (
          <>
            <Col span={5}>
              <Input
                style={{ width: "100%" }}
                placeholder="Enter GP ID"
                value={state.gpInput}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, gpInput: e.target.value }))
                }
                disabled={loading}
                aria-label="Gate Pass ID"
              />
            </Col>
            <Col span={3}>
              <CustomButton
                size="small"
                title={"Search"}
                starticon={<Search fontSize="small" />}
                loading={loading}
                disabled={loading || !state.gpInput.trim()}
                onclick={fetchData}
              />
            </Col>
          </>
        )}
        {tableData.length > 0 && (
          <Col span={1} offset={state.selType ? 12 : 13}>
            <Button onClick={handleDownloadCSV} disabled={loading}>
              <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
            </Button>
          </Col>
        )}
      </Row>
      <div style={{ height: "95%", margin: "10px" }}>
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}

export default ManageDC;
