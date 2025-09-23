import React, { useState, useEffect } from "react";
import { Table, Row, Col, Button } from "antd";
// import api from "../config";
import { DownloadOutlined } from "@ant-design/icons";

// import { CSVLink} from "react-csv";
import axios from "axios";
import "./summary.css";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../../Components/exportToCSV";
import MyButton from "../../../Components/MyButton";
// import Spinner from "../Spin/Spinner";

const columns = [
  {
    title: "Month",
    dataIndex: "month",
    key: "month",
    width: 14,
    fixed: "left",
    align: "center",
  },
  {
    title: "GST",
    children: [
      {
        title: "IGST",
        dataIndex: "g_igstSum",
        key: "g_igstSum",
        width: 15,
        align: "center",
      },
      {
        title: "CGST",
        dataIndex: "g_cgstSum",
        key: "g_cgstSum",
        width: 14,

        align: "center",
      },
      {
        title: "SGST",
        dataIndex: "g_sgstSum",
        key: "g_sgstSum",
        width: 14,

        align: "center",
      },
    ],
  },
  {
    title: "Book",
    children: [
      {
        title: "IGST",
        dataIndex: "b_igstSum",
        key: "b_igstSum",
        width: 14,
        align: "center",
      },
      {
        title: "CGST",
        dataIndex: "b_cgstSum",
        key: "b_cgstSum",
        width: 14,
        align: "center",
      },
      {
        title: "SGST",
        dataIndex: "b_sgstSum",
        key: "b_sgstSum",
        width: 14,
        align: "center",
      },
    ],
  },
];

const Summary = () => {
  const [summaryData, setGstData] = useState([]);
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await imsAxios.get(`/summary/getsummary`);
      if (response.status === 200) {
        setGstData(response.data);
      } else {
        toast.error("error in getting data!");
      }
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <>
      <MyButton
        style={{
          marginTop: "1rem",
          marginLeft: "2rem",
          marginBottom: "1rem",
        }}
        onClick={() => downloadCSV(summaryData, columns, "Summary")}
        variant="download"
      >
        Download
      </MyButton>
      <div className="summary-container">
        <>
          <div style={{ height: "100%", marginLeft: "4rem" }}>
            <Table
              dataSource={summaryData}
              columns={columns}
              bordered={true}
              // itemSizeSM={}
              size="small"
              pagination={false}
            />
          </div>
        </>
      </div>
    </>
  );
};

export default Summary;
