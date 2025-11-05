import {  Col, Input, Row, Space } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDataTable from "../../../Components/MyDataTable";
import MyDatePicker from "../../../Components/MyDatePicker";
import MySelect from "../../../Components/MySelect";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import JWRMChallanCancel from "./JWRMChallanCancel";
import JWRMChallanEditAll from "./JWRMChallanEditAll";
import JWRMChallanEditMaterials from "./JWRMChallanEditMaterials";
import { Link } from "react-router-dom";
import CancelEwayBillModal from "./CancelEwayBillModal";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import { Box, LinearProgress, Tooltip } from "@mui/material";
import { Cancel, Download, Print, Search, Upload } from "@mui/icons-material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import CustomButton from "../../../new/components/reuseable/CustomButton";

function JwRwChallan() {
  const [wise, setWise] = useState("datewise");
  const [searchInput, setSearchInput] = useState("");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [editingJWMaterials, setEditingJWMaterials] = useState(false);
  const [editiJWAll, setEditJWAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showEwayBillModal, setShowEwayBillModal] = useState(null);
  const [showEwayBillCancelModal, setShowEwayBillCancelModal] = useState(null);

  const wiseOptions = [
    { text: "Date Wise", value: "datewise" },
    { text: "JW Number Wise", value: "jw_transaction_wise" },
    { text: "Challan Wise", value: "challan_wise" },
    { text: "SKU Wise", value: "jw_sfg_wise" },
    { text: "Vendor Wise", value: "vendorwise" },
    // { text: "Issue Request Date Wise", value: "issuedtwise" },
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
      btn_status === "false"
        ? "/jobwork/print_jw_rm_issue"
        : "/jobwork/printJobworkChallan";
    const { data } = await imsAxios.post(link, {
      invoice_id: invoice_id,
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
      btn_status === "false"
        ? "/jobwork/print_jw_rm_issue"
        : "/jobwork/printJobworkChallan";
    const { data } = await imsAxios.post(link, {
      invoice_id: invoice_id,
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

  const handleEwayBillPrint = async () => {
    try {
      setLoading("print");
      const response = await imsAxios.post("");
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "#", size: 30, accessorKey: "id" },

    {
      header: "Req. Date",
      accessorKey: "issue_challan_rm_dt",
      size: 150,
      render: ({ row }) => <ToolTipEllipses text={row.issue_challan_rm_dt} />,
    },
    {
      header: "Vendor",
      accessorKey: "vendor",
      render: ({ row }) => <ToolTipEllipses text={row.vendor} />,
    },
    {
      header: "Issue Ref ID",
      size: 100,
      accessorKey: "issue_transaction_id",
      render: ({ row }) => <ToolTipEllipses text={row.issue_transaction_id} />,
    },
    {
      header: "Jobwork Id",
      size: 200,
      accessorKey: "jw_transaction_id",
      render: ({ row }) => (
        <ToolTipEllipses text={row.jw_transaction_id} copy={true} />
      ),
    },
    {
      header: "Challan ID",
      size: 150,
      accessorKey: "challan_id",
      render: ({ row }) => (
        <ToolTipEllipses text={row.challan_id} copy={true} />
      ),
    },
    {
      header: "Status",
      size: 120,
      accessorKey: "status",
      render: ({ row }) => (
        <span>{row.status === "cancel" ? "Cancelled" : "--"}</span>
      ),
    },
    {
      header: "Eway Bill Status",
      size: 120,
      accessorKey: "jw_ewaybill_status",
    },
    {
      header: "Eway Bill",
      size: 150,
      accessorKey: "jw_ewaybill",
      render: ({ row }) => (
        <ToolTipEllipses
          text={row.jw_ewaybill}
          copy={row.jw_ewaybill !== "--" ? true : false}
        />
      ),
    },
    {
      header: "SKU ID",
      size: 100,
      accessorKey: "sku_code",
      render: ({ row }) => <ToolTipEllipses text={row.sku_code} copy={true} />,
    },
    {
      header: "Product",
      flex: 1,
      accessorKey: "jw_sku_name",
      render: ({ row }) => <ToolTipEllipses text={row.jw_sku_name} />,
    },
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
    renderRowActionMenuItems: ({ row, table, closeMenu }) => [
      <MRT_ActionMenuItem
        key="download"
        icon={<Download />}
        label="Download"
        onClick={() => {
          handleDownload(
            row.original.challan_id,
            row.original.issue_transaction_id,
            row.original.status,
            row.original.jw_transaction_id
          );
          closeMenu();
        }}
        table={table}
      />,

      <MRT_ActionMenuItem
        key="print"
        icon={<Print />}
        label="Print"
        onClick={() => {
          handlePrint(
            row.original.challan_id,
            row.original.issue_transaction_id,
            row.original.status,
            row.original.jw_transaction_id
          );
          closeMenu();
        }}
        table={table}
      />,

      // Create / Edit
      <MRT_ActionMenuItem
        key="edit"
        icon={<Edit />}
        label={row.original.status === "create" ? "Create" : "Edit"}
        onClick={() => {
          if (row.original.status === "create") {
            setEditJWAll({
              sku: row.original.sku_code,
              fetchTransactionId: row.original.issue_transaction_id,
              saveTransactionId: row.original.jw_transaction_id,
            });
          } else if (row.original.status === "edit") {
            setEditingJWMaterials(row.original.challan_id);
          }
          closeMenu();
        }}
        table={table}
        disabled={row.original.status === "cancel"}
      />,

      // Cancel
      <MRT_ActionMenuItem
        key="cancel"
        icon={<Cancel />}
        label="Cancel"
        onClick={() => {
          setShowCancel({
            poId: row.original.jw_transaction_id,
            challanId: row.original.challan_id,
          });
          closeMenu();
        }}
        table={table}
        disabled={row.original.status !== "create"}
      />,

      // E-Way Bill (Create or Cancel)
      row.original.jw_ewaybill_status === "--" ||
      row.original.jw_ewaybill_status === "CANCELLED" ? (
        <MRT_ActionMenuItem
          key="create-eway"
          icon={<Upload />}
          label={
            <Link
              style={{ textDecoration: "none", color: "inherit" }}
              to={`/warehouse/e-way/jw/${row.original.challan_id.replaceAll(
                "/",
                "_"
              )}`}
              target="_blank"
              onClick={closeMenu}
            >
              Create E-Way Bill
            </Link>
          }
          table={table}
        />
      ) : (
        <MRT_ActionMenuItem
          key="cancel-eway"
          icon={<Cancel />}
          label="Cancel E-Way Bill"
          onClick={() => {
            setShowEwayBillCancelModal({
              jwId: row.original.challan_id,
              eWayBill: row.original.jw_ewaybill,
            });
            closeMenu();
          }}
          table={table}
        />
      ),
    ],
  });

  return (
    <div style={{ height: "90%", padding: "12px 0px" }}>
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
      />
      <CancelEwayBillModal
        show={showEwayBillCancelModal}
        hide={() => setShowEwayBillCancelModal(null)}
      />
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        {/* <EWayBillModal
          show={showEwayBillModal}
          hide={() => setShowEwayBillModal(null)}
        /> */}
        <Col>
          <Space>
            <div style={{ width: 150 }}>
              <MySelect
                options={wiseOptions}
                onChange={setWise}
                value={wise}
                setSearchString={setSearchInput}
              />
            </div>
            <div style={{ width: 300 }}>
              {wise === "datewise" && (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchInput}
                  dateRange={searchInput}
                  value={searchInput}
                  spacedFormat={true}
                />
              )}
              {wise === "jw_transaction_wise" && (
                <Input
                  size="default"
                  onChange={(e) => setSearchInput(e.target.value)}
                  value={searchInput}
                />
              )}
              {wise === "challan_wise" && (
                <Input
                  size="default"
                  onChange={(e) => setSearchInput(e.target.value)}
                  value={searchInput}
                />
              )}
              {wise === "jw_sfg_wise" && (
                <MyAsyncSelect
                  onBlur={() => setAsyncOptions([])}
                  value={searchInput}
                  optionsState={asyncOptions}
                  selectLoading={loading === "select"}
                  onChange={(value) => setSearchInput(value)}
                  loadOptions={(value) => getAsyncOptions(value, "sku")}
                />
              )}
              {wise === "vendorwise" && (
                <MyAsyncSelect
                  onBlur={() => setAsyncOptions([])}
                  value={searchInput}
                  optionsState={asyncOptions}
                  selectLoading={loading === "select"}
                  onChange={(value) => setSearchInput(value)}
                  loadOptions={(value) => getAsyncOptions(value, "vendor")}
                />
              )}
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
              disabled={wise === "" || searchInput === ""}
              loading={loading === "fetch"}
              onclick={getRows}
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
      <div style={{ height: "95%", padding: "6px 10px" }}>
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}

export default JwRwChallan;
