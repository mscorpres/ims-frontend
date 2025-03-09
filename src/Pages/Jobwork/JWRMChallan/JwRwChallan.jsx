import { Button, Col, Input, Row, Space } from "antd";
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
// import EWayBillModal from "./EWayBillModal";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import CancelEwayBillModal from "./CancelEwayBillModal";
import MyButton from "../../../Components/MyButton";

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
    {
      headerName: "",
      width: 30,
      // flex: 1,
      type: "actions",
      getActions: ({ row }) => [
        // Download icon
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label={"Download"}
          onClick={() =>
            handleDownload(
              row.challan_id,
              row.issue_transaction_id,
              row.status,
              row.jw_transaction_id
            )
          }
        />,
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label="Print"
          onClick={() =>
            handlePrint(
              row.challan_id,
              row.issue_transaction_id,
              row.status,
              row.jw_transaction_id
            )
          }
        />,
        <GridActionsCellItem
          showInMenu
          disabled={row.status === "cancel"}
          label={row.status === "create" ? "Create" : "Edit"}
          onClick={() => {
            row.status === "create"
              ? setEditJWAll({
                  sku: row.sku_code,
                  fetchTransactionId: row.issue_transaction_id,
                  saveTransactionId: row.jw_transaction_id,
                })
              : row.status === "edit" && setEditingJWMaterials(row.challan_id);
          }}
        />,
        <GridActionsCellItem
          showInMenu
          disabled={row.status === "create" ? false : true}
          label="Cancel"
          onClick={() =>
            setShowCancel({
              poId: row.jw_transaction_id,
              challanId: row.challan_id,
            })
          }
        />,
        row.jw_ewaybill_status === "--" ||
        row.jw_ewaybill_status === "CANCELLED" ? (
          <GridActionsCellItem
            showInMenu
            label={
              <Link
                style={{ textDecoration: "none", color: "black" }}
                to={`/warehouse/e-way/jw/${row.challan_id.replaceAll(
                  "/",
                  "_"
                )}`}
                target="_blank"
              >
                Create E-Way Bill
              </Link>
            }
          />
        ) : (
          <GridActionsCellItem
            showInMenu
            label="Cancel E-Way Bill"
            onClick={() =>
              setShowEwayBillCancelModal({
                jwId: row.challan_id,
                eWayBill: row.jw_ewaybill,
              })
            }
          />
        ),
      ],
    },
    { headerName: "#", width: 30, field: "id" },

    {
      headerName: "Req. Date",
      field: "issue_challan_rm_dt",
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.issue_challan_rm_dt} />
      ),
    },
    {
      headerName: "Vendor",
      flex: 1,
      field: "vendor",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendor} />,
    },
    {
      headerName: "Issue Ref ID",
      width: 100,
      field: "issue_transaction_id",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.issue_transaction_id} />
      ),
    },
    {
      headerName: "Jobwork Id",
      width: 200,
      field: "jw_transaction_id",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.jw_transaction_id} copy={true} />
      ),
    },
    {
      headerName: "Challan ID",
      width: 150,
      field: "challan_id",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.challan_id} copy={true} />
      ),
    },
    {
      headerName: "Status",
      width: 120,
      field: "status",
      renderCell: ({ row }) => (
        <span>{row.status === "cancel" ? "Cancelled" : "--"}</span>
      ),
    },
      {
        headerName: "Job Work Eway Bill",
        width: 150,
        field: "jw_ewaybill",
        renderCell: ({ row }) => (
          <ToolTipEllipses text={row.jw_ewaybill} copy={row.jw_ewaybill!=="--"?true:false} />
        ),
      },
    {
      headerName: "SKU ID",
      width: 100,
      field: "sku_code",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.sku_code} copy={true} />
      ),
    },
    {
      headerName: "Product",
      flex: 1,
      field: "jw_sku_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.jw_sku_name} />,
    },
  ];
  useEffect(() => {
    setSearchInput("");
  }, [wise]);
  return (
    <div style={{ height: "90%" }}>
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
            <MyButton
              variant="search"
              type="primary"
              disabled={wise === "" || searchInput === ""}
              loading={loading === "fetch"}
              onClick={getRows}
              id="submit"
            >
              Search
            </MyButton>
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
      <div style={{ height: "95%", padding: "0px 10px" }}>
        <MyDataTable
          loading={loading === "fetch" || loading === "print"}
          columns={columns}
          rows={rows}
        />
      </div>
    </div>
  );
}

export default JwRwChallan;
