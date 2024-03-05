import { Button, Col, Row, Space } from "antd";
import React, { useState } from "react";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import MyDataTable from "../../Components/MyDataTable";
import MyDatePicker from "../../Components/MyDatePicker";
import socket from "../../Components/socket";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { CodeSandboxCircleFilled, DownloadOutlined } from "@ant-design/icons";
// import MoneyRain from "../../MoneyRain/MoneyRain";
import { v4 } from "uuid";

const TdsReport = () => {
  const [dateRange, setDateRange] = useState("");
  const { user, notifications } = useSelector((state) => state.login);
  const emitDownloadEvent = () => {
    let newId = v4();
    let arr = notifications;

    if (!user.company_branch) {
      toast.error("Please select a branch to download report");
      return;
    }
    const payload = {
      date: dateRange,
      notificationId: newId,
    };
    console.log("payload", payload);
    socket.emit("getTdsReport", payload);
  };
  return (
    <div style={{ height: "90%" }}>
      <Row gutter={16} style={{ margin: "5px" }}>
        <Col span={5}>
          <MyDatePicker setDateRange={setDateRange} />
        </Col>
        <Col span={1}>
          <Button
            // loading={loading}
            type="primary"
            onClick={emitDownloadEvent}
          >
            Fetch
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default TdsReport;
const columns = [
  {
    headerName: "Section",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "VBT No.",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "Vendor Name",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "Pan No.",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "Invoice No.",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "Invoice Date",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "GST Assesable Value",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "TDS Assessable Value",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "TDS Rate.",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "To Be Deducted TDS On GST AV",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "TDS Duducted.",
    field: "tcsCode",
    flex: 1,
  },
  {
    headerName: "Difference",
    field: "tcsCode",
    flex: 1,
  },
];
