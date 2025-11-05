import { Button, Col, Input, Row, Space } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
// import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../Components/exportToCSV";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import MyDataTable from "../../Components/MyDataTable";
import MyDatePicker from "../../Components/MyDatePicker";
import MySelect from "../../Components/MySelect";
import printFunction, {
  downloadFunction,
} from "../../Components/printFunction";
import TableActions, {
  CommonIcons,
} from "../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import { imsAxios } from "../../axiosInterceptor";
import JWRMChallanEditAll from "./JWRMChallan/JWRMChallanEditAll";
import JWRMChallanEditMaterials from "./JWRMChallan/JWRMChallanEditMaterials";
import JWRMChallanCancel from "./JWRMChallan/JWRMChallanCancel";
import MyButton from "../../Components/MyButton";
import { Box, IconButton, LinearProgress, Tooltip } from "@mui/material";
import { Download, Print, Search } from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback";
import CustomButton from "../../new/components/reuseable/CustomButton";

function JwPendingRequest() {
  const [wise, setWise] = useState("issuedtwise");
  const [searchInput, setSearchInput] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [editingJWMaterials, setEditingJWMaterials] = useState(false);
  const [editiJWAll, setEditJWAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const wiseOptions = [
    { text: "Issue Request Date Wise", value: "issuedtwise" },
  ];
  const getAsyncOptions = async (search, type) => {
    let link =
      type === "sku"
        ? "/backend/getProductByNameAndNo"
        : type === "vendor" && "/backend/vendorList";
    setLoading("select");
    const { data } = await imsAxios.post(link, {
      search: search,
    });
    setLoading(false);
    if (data[0]) {
      let arr = data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const getRows = async () => {
    setLoading("fetch");
    const { data } = await imsAxios.post("/jobwork/getJobworkChallan", {
      data: searchInput,
      wise: wise,
    });
    setLoading(false);
    if (data.code === 200) {
      let arr = data.data.map((row, index) => ({
        id: index + 1,
        ...row,
      }));
      setRows(arr);
    } else {
      setRows([]);
      toast.error(data.message.msg);
    }
  };
  const handlePrint = async (challan_id, refId, btn_status, invoice_id) => {
    setLoading("print");
    let link =
      btn_status === "create"
        ? "/jobwork/print_jw_rm_issue"
        : "/jobwork/printJobworkChallan";
    const { data } = await imsAxios.post(link, {
      invoice_id: invoice_id,
      transaction: refId,
      ref_id: refId,
      challan: challan_id,
    });
    setLoading(false);
    if (data.code === 200) {
      printFunction(data.data.buffer.data);
    } else {
      toast.error(data.message.msg);
    }
  };
  const handleDownload = async (challan_id, refId, btn_status, invoice_id) => {
    setLoading("print");
    let link =
      btn_status === "create"
        ? "/jobwork/print_jw_rm_issue"
        : "/jobwork/printJobworkChallan";
    const { data } = await imsAxios.post(link, {
      invoice_id: invoice_id,
      transaction: refId,
      ref_id: refId,
      challan: challan_id,
    });
    setLoading(false);
    if (data.code === 200) {
      downloadFunction(data.data.buffer.data, data.data.filename);
    } else {
      toast.error(data.message.msg);
    }
  };
  const columns = [
    { header: "Sr. No", size: 80, accessorKey: "id" },
    {
      header: "Req. Date",
      accessorKey: "issue_challan_rm_dt",
      size: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.issue_challan_rm_dt} />
      ),
    },
    {
      header: "Vendor",
      flex: 1,
      accessorKey: "vendor",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendor} />,
    },
    {
      header: "Issue Ref ID",
      size: 100,
      accessorKey: "issue_transaction_id",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.issue_transaction_id} />
      ),
    },
    {
      header: "Jobwork Id",
      size: 200,
      accessorKey: "jw_transaction_id",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.jw_transaction_id} copy={true} />
      ),
    },
    {
      header: "Challan ID",
      size: 150,
      accessorKey: "challan_id",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.challan_id} copy={true} />
      ),
    },
    {
      header: "Status",
      size: 120,
      accessorKey: "status",
      renderCell: ({ row }) => (
        <span>{row.status === "cancel" ? "Cancelled" : "--"}</span>
      ),
    },
    {
      header: "SKU ID",
      size: 100,
      accessorKey: "sku_code",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.sku_code} copy={true} />
      ),
    },
    {
      header: "Product",
      flex: 1,
      accessorKey: "jw_sku_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.jw_sku_name} />,
    },
    // {
    //   header: "Actions",
    //   size: 150,
    //   type: "actions",
    //   getActions: ({ row }) => [
    //     // Download icon
    //     <TableActions
    //       action="download"
    //       onClick={() =>
    //         handleDownload(
    //           row.challan_id,
    //           row.issue_transaction_id,
    //           row.status,
    //           row.jw_transaction_id
    //         )
    //       }
    //     />,
    //     // Print Icon
    //     <TableActions
    //       action="print"
    //       onClick={() =>
    //         handlePrint(
    //           row.challan_id,
    //           row.issue_transaction_id,
    //           row.status,
    //           row.jw_transaction_id
    //         )
    //       }
    //     />,
    //     // edit Icon
    //     <TableActions
    //       action={row.status === "create" ? "add" : "edit"}
    //       disabled={row.status === "cancel"}
    //       onClick={() =>
    //         row.status === "create"
    //           ? setEditJWAll({
    //               sku: row.sku_code,
    //               fetchTransactionId: row.issue_transaction_id,
    //               saveTransactionId: row.jw_transaction_id,
    //             })
    //           : row.status === "edit" && setEditingJWMaterials(row.challan_id)
    //       }
    //     />,
    //     // cancel Icon
    //     <TableActions
    //       action="cancel"
    //       diabled={row.status === "create" ? false : true}
    //       onClick={() =>
    //         setShowCancel({
    //           poId: row.jw_transaction_id,
    //           challanId: row.challan_id,
    //           ref_id: row.issue_transaction_id,
    //         })
    //       }
    //     />,
    //   ],
    // },
  ];
  useEffect(() => {
    setSearchInput("");
  }, [wise]);

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
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
  });
  return (
    <div style={{ height: "90%", padding: "12px 10px" }}>
      <JWRMChallanEditMaterials
        editingJWMaterials={editingJWMaterials}
        setEditingJWMaterials={setEditingJWMaterials}
        getRows={getRows}
      />
      <JWRMChallanEditAll
        getRows={getRows}
        editiJWAll={editiJWAll}
        setEditJWAll={setEditJWAll}
      />
      <JWRMChallanCancel
        showCancel={showCancel}
        setShowCancel={setShowCancel}
        getRows={getRows}
      />
      <Row
        justify="space-between"
        style={{ margin: "0px 10px", marginBottom: 6 }}
      >
        <Col>
          <Space>
            <div style={{ width: 300 }}>
              {wise === "issuedtwise" && (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchInput}
                  dateRange={searchInput}
                  value={searchInput}
                />
              )}
            </div>
            <CustomButton
              size="small"
              title={"Search"}
              starticon={<Search fontSize="small" />}
              loading={loading === "fetch"}
              onclick={getRows}
              disabled={wise === "" || searchInput === ""}
            />
          </Space>
        </Col>
        <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(rows, columns, "JW RM Challan Report")}
              disabled={rows.length == 0}
            />
          </Space>
        </Col>
      </Row>
      <div style={{ height: "95%", margin: "0px 10px" }}>
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}

export default JwPendingRequest;
