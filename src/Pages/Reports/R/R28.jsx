import React, { useState } from "react";
import { Button, Col, Row, Space } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import axios from "axios";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import { DownloadOutlined } from "@ant-design/icons";
import {
  downloadCSV,
  downloadCSVCustomColumns,
} from "../../../Components/exportToCSV";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import MyButton from "../../../Components/MyButton";
//weekky report
function R28() {
  const [datee, setDatee] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateData, setDateData] = useState([]);

  const columns = [
    {
      headerName: "#",
      width: 30,
      field: "id",
    },
    {
      headerName: "Part Code",
      flex: 1,
      field: "part_code",
    },
    {
      headerName: "RM QTY",
      flex: 1,
      field: "rm_qty",
    },
    {
      headerName: "SF QTY",
      flex: 1,
      field: "sf_qty",
    },
  ];

  const getRows = async () => {
    setDateData([]);
    setLoading(true);
    const { data } = await imsAxios.post("/report28", {
      date: datee,
    });
    console.log("data", data);
    if (data.code == 200) {
      setLoading(false);
      toast.success(data.message);
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: index + 1,
        };
      });
      setDateData(arr);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const handleDownloadingCSV = () => {
    downloadCSV(dateData, columns, `RM Issue Register Report ${datee}`);
  };

  return (
    <div style={{ height: "90%" }}>
      <Row style={{ padding: 5, paddingTop: 0 }}>
        <Col span={3}>
          {/* <MyDatePicker size="default" setDateRange={setDatee} /> */}
          <SingleDatePicker
            setDate={setDatee}
            placeholder="Select Effective Date.."
            selectedDate={datee}
            value={datee}
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
        <MyDataTable loading={loading} columns={columns} data={dateData} />
      </div>
    </div>
  );
}

export default R28;
