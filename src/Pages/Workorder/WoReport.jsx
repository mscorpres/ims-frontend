import { useState, useEffect } from "react";
import { Col,Row, Space,Table } from "antd";
import MyDatePicker from "../../Components/MyDatePicker";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { getClientOptions } from "./components/api";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";
import printFunction, {
  downloadFunction,
} from "../../Components/printFunction";
import * as XLSX from "xlsx";
import { Search } from "@mui/icons-material";
import CustomButton from "../../new/components/reuseable/CustomButton";
const WoReport = () => {

  const [wise, setWise] = useState(wiseOptions[0].value);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [accData, setAccData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [disstate, setdisstate] = useState(false);
  const [woreportdata, setworeportdata] = useState([]);
  const handleClientOptions = async (search) => {
    try {
      setLoading("select");
      const arr = await getClientOptions(search);
      setAsyncOptions(arr);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const printwocompleted = async (row) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post(
        "/createwo/print_wo_completed_list",
        {
          transaction: row.transactionId,
        }
      );
      const { data } = response;
      printFunction(response.data.data.buffer.data);
      toast.success(data.message);
    } catch (error) {
      console.log("some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "serialno", key: "serialno" },
    { title: "Part Code", dataIndex: "partCode", key: "partCode" },
    { title: "Part Name", dataIndex: "partName", key: "partName" },
    { title: "Min Id", dataIndex: "minId", key: "minId" },
    { title: "Min Date", dataIndex: "minDate", key: "minDate" },
    { title: "Min Eway", dataIndex: "minEway", key: "minEway" },
    { title: "Min Qty", dataIndex: "minQty", key: "minQty" },
    { title: "Pending qty", dataIndex: "pending_qty", key: "pending_qty" },
    { title: "Min Rate", dataIndex: "minRate", key: "minRate" },
    { title: "Min Value", dataIndex: "minValue", key: "minValue" },
  ];
  const expandedRowRender = (record) => {
    const childColumns = [
      { title: "Serial No", dataIndex: "serial_no", key: "serial_no" },
      { title: "Challan Date", dataIndex: "challan_date", key: "challan_date" },
      { title: "Challan Eway", dataIndex: "challan_eway", key: "challan_eway" },
      { title: "Challan No", dataIndex: "challan_no", key: "challan_no" },
      { title: "Challan Qty", dataIndex: "challan_qty", key: "challan_qty" },
      { title: "Challan Rate", dataIndex: "challan_rate", key: "challan_rate" },
      {
        title: "Challan Value",
        dataIndex: "challan_value",
        key: "challan_value",
      },
    ];
    return (
      <Table
        columns={childColumns}
        dataSource={record.challan}
        pagination={false}
        size="large"
      />
    );
  };
  const handleExpand = (expanded, record) => {
    if (expanded) {
      setExpandedRowKeys([...expandedRowKeys, record.id]);
    } else {
      setExpandedRowKeys(expandedRowKeys.filter((key) => key !== record.id));
    }
  };

  const getRows = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/wo_challan/fetch_DC_report", {
        wise: "date",
        data: searchInput,
      });
      const { data } = response;
      if (data.code === 200) {
        let newArr = data.data.map((r, index) => ({
          serialno: r.serial_no,
          partCode: r.part_code,
          minDate: r.min_date,
          partName: r.part_name,
          minEway: r.min_eway,
          minId: r.min_id,
          minQty: r.min_qty,
          pending_qty: r.pending_qty,
          minRate: r.min_rate,
          minValue: r.min_value,
          challan: r?.challan,
        }));
        setRows(newArr);
        setworeportdata(data.data);
        setdisstate(true);
      } else {
        toast.error(data.data.data);
      }
    } catch (error) {
      console.log("some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
    console.log("rows", rows);
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(woreportdata);

    // Adding headers starting from B2
    ws["A1"] = { t: "s", v: "serial Number" };
    ws["B1"] = { t: "s", v: "Date" };
    ws["C1"] = { t: "s", v: "Part Code" };
    ws["D1"] = { t: "s", v: "Product" };
    ws["E1"] = { t: "s", v: "MIN ID" };
    ws["F1"] = { t: "s", v: "Quantity" };
    ws["G1"] = { t: "s", v: "Price" };
    ws["H1"] = { t: "s", v: "Value" };
    ws["I1"] = { t: "s", v: "EWB" };
    ws["J1"] = { t: "s", v: "Challan Number" };
    ws["K1"] = { t: "s", v: "Challan Date" };
    ws["L1"] = { t: "s", v: "Quantity" };
    ws["M1"] = { t: "s", v: "Price" };
    ws["N1"] = { t: "s", v: "Value" };
    ws["O1"] = { t: "s", v: "EWB Bill" };
    ws["P1"] = { t: "s", v: "Pending Qty" };

    let currentRow = 2;
    let serialnumber = 1;

    // Adding data starting from B3
    woreportdata.forEach((item, index) => {
      ws[`A${currentRow}`] = { t: "n", v: item.serial_no };
      ws[`B${currentRow}`] = { t: "s", v: item.min_date };
      ws[`C${currentRow}`] = { t: "s", v: item.part_code };
      ws[`D${currentRow}`] = { t: "s", v: item.part_name };
      ws[`E${currentRow}`] = { t: "s", v: item.min_id };
      ws[`F${currentRow}`] = { t: "s", v: item.min_qty };
      ws[`G${currentRow}`] = { t: "s", v: item.min_rate };
      ws[`H${currentRow}`] = { t: "s", v: item.min_value };
      ws[`I${currentRow}`] = { t: "s", v: item.min_eway };
      ws[`K${currentRow}`] = { t: "s", v: "" };
      ws[`P${currentRow}`] = { t: "s", v: item.pending_qty };
      //wo report
      item.challan?.forEach((elem, subindex) => {
        currentRow = currentRow + 1;
        serialnumber = serialnumber + 1;
        ws[`A${currentRow}`] = { t: "n", v: elem.serial_no };
        ws[`B${currentRow}`] = { t: "s", v: item.min_date };
        ws[`C${currentRow}`] = { t: "s", v: item.part_code };
        ws[`D${currentRow}`] = { t: "s", v: item.part_name };
        ws[`E${currentRow}`] = { t: "s", v: item.min_id };
        ws[`F${currentRow}`] = { t: "s", v: "" };
        ws[`G${currentRow}`] = { t: "s", v: "" };
        ws[`H${currentRow}`] = { t: "s", v: "" };
        ws[`I${currentRow}`] = { t: "s", v: "" };
        // ws[`G${currentRow}`] = { t: "s", v: item.min_rate };
        // ws[`H${currentRow}`] = { t: "s", v: item.min_value };
        // ws[`I${currentRow}`] = { t: "s", v: item.min_eway };
        ws[`J${currentRow}`] = { t: "s", v: elem.challan_no };
        ws[`K${currentRow}`] = { t: "s", v: elem.challan_date };
        ws[`L${currentRow}`] = { t: "s", v: elem.challan_qty };
        ws[`M${currentRow}`] = { t: "s", v: elem.challan_rate };
        ws[`N${currentRow}`] = { t: "s", v: elem.challan_value };
        ws[`O${currentRow}`] = { t: "s", v: elem.challan_eway };
      });
      ws[`A${currentRow + 1}`] = { t: "n", v: "" };
      ws[`B${currentRow + 1}`] = { t: "s", v: "" };
      ws[`C${currentRow + 1}`] = { t: "s", v: "" };
      ws[`D${currentRow + 1}`] = { t: "s", v: "" };
      ws[`E${currentRow + 1}`] = { t: "s", v: "" };
      ws[`F${currentRow + 1}`] = { t: "s", v: "" };
      ws[`G${currentRow + 1}`] = { t: "s", v: "" };
      ws[`H${currentRow + 1}`] = { t: "s", v: "" };
      ws[`I${currentRow + 1}`] = { t: "s", v: "" };
      ws[`J${currentRow + 1}`] = { t: "s", v: "" };
      ws[`K${currentRow + 1}`] = { t: "s", v: "" };
      ws[`L${currentRow + 1}`] = { t: "s", v: "" };
      ws[`M${currentRow + 1}`] = { t: "s", v: "" };
      ws[`N${currentRow + 1}`] = { t: "s", v: "" };
      ws[`O${currentRow + 1}`] = { t: "s", v: "" };
      currentRow += 2;
      serialnumber++;
    });

    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const range = XLSX.utils.encode_range({
      s: { c: 0, r: 0 }, // start from A1
      e: { c: 16, r: currentRow + 100 }, // end at the last cell (considering headers and child rows)
    });

    ws["!ref"] = range;

    XLSX.writeFile(wb, "exported_data.xlsx");
  };

  useEffect(() => {
    if (wise !== wiseOptions[1].value) {
      setSearchInput("");
    }
  }, [wise]);

  return (
    <div style={{ height: "90%", margin: "10px" }}>
      <Row style={{ paddingTop: 0 }} justify="space-between">
        <Col>
          <Space>
            <div style={{ paddingBottom: "10px" }}>
              <Space>
                {/* <div style={{ width: 200 }}> */}

                <MyDatePicker setDateRange={setSearchInput} />

                <CustomButton
                  size="small"
                  title={"Search"}
                  starticon={<Search fontSize="small" />}
                  loading={loading === "fetch"}
                  onclick={getRows}
                />
              </Space>
            </div>
          </Space>
        </Col>
        <CommonIcons
          action="downloadButton"
          type="primary"
          disabled={disstate ? "" : "disabled"}
          onClick={exportToExcel}
        />
      </Row>
      <div style={{ height: "calc(100% - 50px)", overflow: "auto" }}>
        <Table
          columns={columns}
          expandedRowRender={expandedRowRender}
          expandable={{
            onExpand: handleExpand,
            rowExpandable: (record) =>
              record.challan && record.challan.length > 0,
          }}
          dataSource={rows}
          scroll={{ x: 500, y: 1000 }}
          bordered
        />
      </div>
    </div>
  );
};

const wiseOptions = [
  {
    text: "Client Wise",
    value: "clientwise",
  },
  {
    text: "Date Wise",
    value: "datewise",
  },
  {
    text: "Work Order Wise",
    value: "wo_sfg_wise",
  },
];

export default WoReport;
