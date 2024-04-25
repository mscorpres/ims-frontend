import { Card, Col, Collapse, Row } from "antd";
import React, { useState } from "react";
import MyButton from "../../../Components/MyButton";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import MyDataTable from "../../../Components/MyDataTable";
import MyDatePicker from "../../../Components/MyDatePicker";
import { TableCell, TableRow } from "@mui/material";

function R34() {
  const [effectiveDate, setEffectiveDate] = useState();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const getRows = async () => {
    setLoading(true);
    const response = await imsAxios.post("/report34", { date: effectiveDate });
    console.log("res", response);
    let { data } = response;
    if (response.success == true) {
      let arr = [];
      for (let key in data) {
        let dataArr = data[key];
        let obj = {
          department: key,
          arr: dataArr,
        };
        arr = [...arr, obj];
      }
      setRows(arr);
      setLoading(false);
    }
    // setRows(a);
    setLoading(false);
  };
  return (
    <div style={{ height: "90%" }}>
      <Row style={{ padding: 5, paddingTop: 0 }}>
        <Col span={4} style={{ marginLeft: "1rem" }}>
          {/* <MyDatePicker size="default" setDateRange={setDatee} /> */}
          <MyDatePicker
            setDateRange={setEffectiveDate}
            placeholder="Select Effective Date.."
            selectedDate={effectiveDate}
            value={effectiveDate}
          />
        </Col>
        <MyButton
          variant="search"
          style={{ marginLeft: 4 }}
          loading={loading}
          onClick={getRows}
          type="primary"
        >
          Fetch
        </MyButton>
      </Row>
      <div style={{ height: "95%", paddingRight: 5, paddingLeft: 5 }}>
        <Card style={{ height: "97%", overflowY: "scroll" }}>
          {" "}
          <TableRow>
            <TableCell sx={{ width: "20rem" }}>Department</TableCell>
          </TableRow>
          <Collapse style={{ background: "#f8f6f3" }}>
            {rows.map((row, index) => (
              <Collapse.Panel header={row.department} key={index}>
                {" "}
                <div
                  style={{
                    maxHeight: 400,
                    overflowY: "auto",
                    height: 200,
                  }}
                >
                  <MyDataTable
                    loading={loading}
                    columns={columnss}
                    data={row.arr.map((r, id) => ({ ...r, id: id + 1 }))}
                  />
                </div>
              </Collapse.Panel>
            ))}
          </Collapse>
        </Card>
      </div>
    </div>
  );
}

export default R34;
const columnss = [
  {
    headerName: "#",
    field: "id",
    width: 40,
  },
  {
    headerName: " Date",
    field: "date",
    width: 100,
  },

  {
    headerName: "SKU",
    field: "sku",
    width: 100,
  },
  {
    headerName: "UoM",
    field: "unit",
    width: 70,
  },
  {
    headerName: " Manpower",
    field: "manPower",
    width: 110,
  },

  // {
  //   headerName: "No Of Lines",
  //   field: "noOfLines",
  //   width: 110,
  // },
  {
    headerName: "Output",
    field: "output",
    width: 110,
  },
  {
    headerName: " Shift Start",
    field: "shiftStart",
    width: 140,
  },
  {
    headerName: "Shift End",
    field: "shiftEnd",
    width: 140,
  },
  {
    headerName: "Working Day",
    field: "workDay",
    width: 140,
  },
  {
    headerName: "Working Hours",
    field: "workHrs",
    width: 140,
  },
  {
    headerName: "Over Time",
    field: "overTm",
    width: 140,
  },

  // {
  //   headerName: "Remarks.",
  //   field: "remark",
  //   width: 220,
  // },
];
