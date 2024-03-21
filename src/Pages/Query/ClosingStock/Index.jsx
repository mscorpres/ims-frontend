import { Button, Col, DatePicker, Row, Space } from "antd";
import React, { useEffect, useState } from "react";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import useApi from "../../../hooks/useApi";
import MyDatePicker from "../../../Components/MyDatePicker";
import MyDataTable from "../../../Components/MyDataTable";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import { getClosingStockForQuery6 } from "../../../api/general";
import { toast } from "react-toastify";

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
          catPartCode: r.sec_part_code,
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
  useEffect(() => {
    toast.info("Under development");
  }, []);

  return (
    <div style={{ height: "90%" }}>
      <Row justify="space-between" style={{ padding: 5, paddingTop: 0 }}>
        <Col>
          <Space>
            <div>
              {/* <Col span={6}> */}
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
              {/* </Col>
            <Col> */}
            </div>
            <Button
              type="primary"
              onClick={getRows}
              loading={loading("select")}
            >
              Search
            </Button>
          </Space>
        </Col>
        {/* </Col> */}
        {/* <div> */}
        <CommonIcons
          action="downloadButton"
          type="primary"
          onClick={() => downloadCSV(rows, columns, "Q6 Report")}
        />
        {/* </div> */}
      </Row>

      <Row style={{ marginTop: 15, height: "75vh", overflowX: "hidden" }}>
        <MyDataTable
          columns={columns}
          pageSize={12}
          data={rows}
          loading={loading("select")}
        />
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
    headerName: "Cat Part Code",
    field: "catPartCode",
    renderCell: ({ row }) => row.catPartCode,
    width: 100,
  },
  // {
  //   headerName: "Cat Part Code",
  //   field: "partCode",
  //   renderCell: ({ row }) => row.partCode,
  //   width: 100,
  // },
  {
    headerName: "Part Name",
    field: "partName",
    renderCell: ({ row }) => row.partName,
    width: 250,
    // flex: 1,
    // width: 250,
  },
  {
    headerName: "Opening Stock",
    field: "totalOpening",
    renderCell: ({ row }) => row.totalOpening,
    width: 130,
    // flex: 1,
  },
  {
    headerName: "In",
    field: "totalIn",
    renderCell: ({ row }) => row.totalIn,
    width: 130,
    // flex: 1,
  },
  {
    headerName: "Other's In",
    field: "otherIn",
    renderCell: ({ row }) => row.otherIn,
    // flex: 1,
    width: 130,
  },
  {
    headerName: "Out",
    field: "totalOut",
    renderCell: ({ row }) => row.totalOut,
    // flex: 1,
    width: 130,
  },
  {
    headerName: "Closing Stock",
    field: "totalClosing",
    renderCell: ({ row }) => row.totalClosing,
    // flex: 1,
    width: 130,
  },
  {
    headerName: "Purchase Qty",
    field: "vbt",
    renderCell: ({ row }) => row.vbt,
    // flex: 1,
    width: 100,
  },
];
