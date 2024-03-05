import { Button, Col, DatePicker, Row } from "antd";
import React, { useState } from "react";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { getClosingStockForQuery6 } from "../../../api/general";
import useApi from "../../../hooks/useApi";
import MyDatePicker from "../../../Components/MyDatePicker";
import MyDataTable from "../../gstreco/myDataTable";

function Index() {
  const [searchInput, setSearchInput] = useState("");
  const [rows, setRows] = useState([]);
  const { executeFun, loading } = useApi();

  const getRows = async () => {
    const response = await executeFun(
      () => getClosingStockForQuery6(searchInput),
      "select"
    );
    console.log("response", response);
    const { data } = response;
    if (response.success) {
      let arr = data.map((r, id) => {
        return {
          id: id + 1,
          partName: r.part_name,
          partCode: r.part_code,
          totalClosing: r.total_closing,
          totalIn: r.total_in,
          totalOpening: r.total_opening,
          totalOut: r.total_out,
          otherIn: r.other_in,
          vbt: r.vbt,
        };
      });
      setRows(arr);
    }
  };
  return (
    <div
      style={{
        margin: "10px 8px",
      }}
    >
      <Row gutter={10}>
        <Col span={6}>
          <MyDatePicker
            setDateRange={setSearchInput}

            // placeholder="Select a Component"
            // onBlur={() => setAsyncOptions([])}
            // value={searchInput}
            // optionsState={asyncOptions}
            // selectLoading={loading1("select")}
            // onChange={(value) => setSearchInput(value)}
            // loadOptions={(value) => getAsyncOptions(value)}
          />
        </Col>
        <Col>
          <Button type="primary" onClick={getRows} loading={loading("select")}>
            Search
          </Button>
        </Col>
      </Row>

      <Row style={{ marginTop: 15, height: "75vh" }}>
        <MyDataTable columns={columns} data={rows} />
      </Row>
    </div>
  );
}

export default Index;
const columns = [
  {
    headerName: "S.No",
    field: "id",
    renderCell: ({ row }) => row.id,
    width: 30,
  },
  {
    headerName: "Part Code",
    field: "partCode",
    renderCell: ({ row }) => row.partCode,
    width: 100,
  },
  {
    headerName: "Part Name",
    field: "partName",
    renderCell: ({ row }) => row.partName,
    width: 250,
    flex: 1,
    // width: 250,
  },
  {
    headerName: "Total Opening",
    field: "totalOpening",
    renderCell: ({ row }) => row.totalOpening,
    width: 130,
    // flex: 1,
  },
  {
    headerName: "Total In",
    field: "totalIn",
    renderCell: ({ row }) => row.totalIn,
    width: 130,
    // flex: 1,
  },
  {
    headerName: "Other In",
    field: "otherIn",
    renderCell: ({ row }) => row.otherIn,
    // flex: 1,
    width: 130,
  },
  {
    headerName: "Total Out",
    field: "totalOut",
    renderCell: ({ row }) => row.totalOut,
    // flex: 1,
    width: 130,
  },
  {
    headerName: "Total Closing",
    field: "totalClosing",
    renderCell: ({ row }) => row.totalClosing,
    // flex: 1,
    width: 130,
  },
  {
    headerName: "VBT",
    field: "vbt",
    renderCell: ({ row }) => row.vbt,
    // flex: 1,
    width: 100,
  },
];
