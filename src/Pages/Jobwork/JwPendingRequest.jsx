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
// import JWRMChallanEditAll from "./JWRMChallanEditAll";
// import JWRMChallanEditMaterials from "./JWRMChallanEditMaterials";

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
    { headerName: "Sr. No", width: 80, field: "id" },
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
    {
      headerName: "Actions",
      width: 150,
      type: "actions",
      getActions: ({ row }) => [
        // Download icon
        <TableActions
          action="download"
          onClick={() =>
            handleDownload(
              row.challan_id,
              row.issue_transaction_id,
              row.status,
              row.jw_transaction_id
            )
          }
        />,
        // Print Icon
        <TableActions
          action="print"
          onClick={() =>
            handlePrint(
              row.challan_id,
              row.issue_transaction_id,
              row.status,
              row.jw_transaction_id
            )
          }
        />,
        // edit Icon
        <TableActions
          action={row.status === "create" ? "add" : "edit"}
          disabled={row.status === "cancel"}
          onClick={() =>
            row.status === "create"
              ? setEditJWAll({
                  sku: row.sku_code,
                  fetchTransactionId: row.issue_transaction_id,
                  saveTransactionId: row.jw_transaction_id,
                })
              : row.status === "edit" && setEditingJWMaterials(row.challan_id)
          }
        />,
        // cancel Icon
        <TableActions
          action="cancel"
          diabled={row.status === "create" ? false : true}
          onClick={() =>
            setShowCancel({
              poId: row.jw_transaction_id,
              challanId: row.challan_id,
              ref_id: row.issue_transaction_id,
            })
          }
        />,
      ],
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
        getRows={getRows}
      />
      <Row
        justify="space-between"
        style={{ margin: "0px 10px", marginBottom: 6 }}
      >
        <Col>
          <Space>
            {/* <div style={{ width: 250 }}>
              <MySelect
                options={wiseOptions}
                onChange={setWise}
                placeholder="Select Option"
                //  value={wise}
                setSearchString={setSearchInput}
              />
            </div> */}
            <div style={{ width: 300 }}>
              {/* {wise === "datewise" && (
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
                  onChange={(value) => setAsyncOptions(value)}
                  loadOptions={(value) => getAsyncOptions(value, "sku")}
                />
              )}
              {wise === "vendorwise" && (
                <MyAsyncSelect
                  onBlur={() => setAsyncOptions([])}
                  value={searchInput}
                  optionsState={asyncOptions}
                  selectLoading={loading === "select"}
                  onChange={(value) => setAsyncOptions(value)}
                  loadOptions={(value) => getAsyncOptions(value, "vendor")}
                />
              )} */}
              {wise === "issuedtwise" && (
                <MyDatePicker
                  size="default"
                  setDateRange={setSearchInput}
                  dateRange={searchInput}
                  value={searchInput}
                />
              )}
            </div>
            <Button
              type="primary"
              disabled={wise === "" || searchInput === ""}
              loading={loading === "fetch"}
              onClick={getRows}
              id="submit"
            >
              Search
            </Button>
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
        <MyDataTable
          loading={loading === "fetch" || loading === "print"}
          columns={columns}
          rows={rows}
        />
      </div>
    </div>
  );
}

export default JwPendingRequest;
