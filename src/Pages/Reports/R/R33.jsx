import { Col, Row } from "antd";
import React, { useState } from "react";
import MyButton from "../../../Components/MyButton";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import MyDataTable from "../../../Components/MyDataTable";

function R33() {
  const [effectiveDate, setEffectiveDate] = useState();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const getRows = async () => {
    setLoading(true);
    const response = await imsAxios.post("/report33/", { date: effectiveDate });
    console.log("res", response);
    let { data } = response;
    if (response.success == true) {
      let a = data.map((r, id) => {
        return {
          ...r,
          id: id + 1,
        };
      });
      console.log(a);
      setRows(a);
      setLoading(false);
    }
    // setRows(a);
    setLoading(false);
  };
  return (
    <div style={{ height: "90%" }}>
      <Row style={{ padding: 5, paddingTop: 0 }}>
        <Col span={3} style={{ marginLeft: "1rem" }}>
          {/* <MyDatePicker size="default" setDateRange={setDatee} /> */}
          <SingleDatePicker
            setDate={setEffectiveDate}
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
        <MyDataTable loading={loading} columns={columns} data={rows} />
      </div>
    </div>
  );
}

export default R33;
const columns = [
  {
    headerName: "#",
    field: "id",
  },
  {
    headerName: " Date",
    field: "Date",
  },
  {
    headerName: "Department",
    field: "department",
    width: 200,
  },
  {
    headerName: "SKU CODE",
    field: "sku",
  },
  {
    headerName: "Product Name",
    field: "name",
    width: 200,
  },
  {
    headerName: "UoM",
    field: "unit",
  },
  {
    headerName: " Manpower",
    field: "manPower",
  },

  {
    headerName: "No Of Lines",
    field: "noOfLines",
  },
  {
    headerName: "Output",
    field: "output",
  },
  {
    headerName: " Shift Start",
    field: "shiftStart",
  },
  {
    headerName: "Shift End",
    field: "shiftEnd",
  },
  {
    headerName: "Over Time",
    field: "overTm",
  },
  {
    headerName: " Working Hrs.",
    field: "workHrs",
  },
  {
    headerName: "Remarks.",
    field: "remark",
  },
];
