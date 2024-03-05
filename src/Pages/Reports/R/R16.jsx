import React, { useState } from "react";
import { Button, Col, Row } from "antd";
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

function R16() {
  const [datee, setDatee] = useState("");
  const [loading, setLoading] = useState(false);
  const [dateData, setDateData] = useState([]);

  const columns = [
    { field: "DATE", headerName: "Date & Time", width: 150 },
    { field: "TYPE", headerName: "Transfer Type", width: 120 },
    { field: "PART", headerName: "Part Type", width: 80 },
    { field: "PART_NEW", headerName: "Cat Part Code", width: 150 },
    {
      field: "COMPONENT",
      headerName: "Component",
      flex: 1,
    },
    { field: "FROMLOCATION", headerName: "Out Location", width: 120 },
    { field: "TOLOCATION", headerName: "In Location", width: 120 },
    { field: "OUTQTY", headerName: "Qty", width: 90 },
    { field: "UNIT", headerName: "UOM", width: 90 },
    { field: "VENDORCODE", headerName: "Vendor", width: 90 },
    { field: "REQUESTEDBY", headerName: "Requested By", width: 120 },
    { field: "ISSUEBY", headerName: "Approved By", width: 130 },
  ];

  const fetch = async () => {
    setDateData([]);
    setLoading(true);
    const { data } = await imsAxios.post("/transaction/transactionOut", {
      data: datee,
    });

    if (data.code == 200) {
      // setLoading(true);
      toast.success(data.message);
      let arr = data.data.map((row) => {
        return {
          ...row,
          id: v4(),
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
      <Row gutter={16} style={{ margin: "5px" }}>
        <Col span={4}>
          <MyDatePicker size="default" setDateRange={setDatee} />
        </Col>

        <Col span={1}>
          <Button onClick={fetch} loading={loading} type="primary">
            Fetch
          </Button>
        </Col>
        {dateData.length > 0 && (
          <Col span={1} offset={18}>
            <Button onClick={handleDownloadingCSV}>
              <DownloadOutlined style={{ fontSize: "20px" }} />
            </Button>
          </Col>
        )}
      </Row>

      <div className="hide-select" style={{ height: "95%", margin: "10px" }}>
        <MyDataTable
          checkboxSelection={true}
          loading={loading}
          data={dateData}
          columns={columns}
        />
      </div>
    </div>
  );
}

export default R16;
