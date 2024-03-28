import React, { useState, useEffect } from "react";
import "./r.css";

import axios from "axios";
import { toast } from "react-toastify";
import {
  downloadCSV,
  downloadCSVCustomColumns,
} from "../../../Components/exportToCSV";

import moment from "moment";
import { Col, DatePicker, Row, Select, Button, Space } from "antd";
import InternalNav from "../../../Components/InternalNav";
import { DownloadOutlined, PlusCircleOutlined } from "@ant-design/icons";
import MyDataTable from "../../../Components/MyDataTable";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { v4 } from "uuid";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";

const { RangePicker } = DatePicker;

const R13 = () => {
  const [datee, setDatee] = useState("");
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState({
    selType: "",
  });
  const [responseData, setResponseData] = useState([]);

  const options = [{ label: "Inward", value: "M" }];

  const columns = [
    { field: "DATE", headerName: "Date", width: 150 },
    {
      field: "COMPONENT",
      headerName: "Component",
      width: 380,
    },
    { field: "PART", headerName: "Part No", width: 100 },
    { field: "PART_NEW", headerName: "Cat Part Code", width: 150 },
    { field: "TYPE", headerName: "V Type", width: 100 },
    {
      field: "LOCATION",
      headerName: "Location",
      width: 100,
    },
    { field: "RATE", headerName: "Rate", width: 100 },
    { field: "INQTY", headerName: "In Qty", width: 120 },
    { field: "UNIT", headerName: "UoM", width: 100 },
    {
      field: "VENDOR",
      headerName: "Vendor Name",
      width: 220,
    },
    { field: "PONUMBER", headerName: "Po No", width: 140 },
    {
      field: "INVOIVENUMBER",
      headerName: "Inv Doc",
      width: 150,
    },
    {
      field: "TRANSACTION",
      headerName: "Transaction Code",
      width: 150,
    },
    {
      field: "ISSUEBY",
      headerName: "Added By",
      width: 140,
    },
    { field: "COMMENT", headerName: "Comment", width: 150 },
    { field: "PROJECT", headerName: "Project", width: 150 },
  ];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = responseData;
    csvData = arr.map((row) => {
      return {
        Date: row.DATE,
        Component: row.COMPONENT,
        "Part No": row.PART,
        "Vendor Type": row.TYPE,
        Location: row.LOCATION,
        Rate: row.RATE,
        "In Qty": row.INQTY,
        Uom: row.UNIT,
        "Vendor Name": row.VENDOR,
        "Po No": row.PONUMBER,
        "Inv Doc": row.INVOIVENUMBER,
        "Transaction Code": row.TRANSACTION,
        "Added By": row.ISSUEBY,
        Comment: row.COMMENT,
        Project: row.PROJECT,
      };
    });
    downloadCSVCustomColumns(csvData, "Custome MIN Report");
  };

  const fetch = async () => {
    if (!allData.selType) {
      toast.error("Please Select Type");
    } else if (!datee[0]) {
      toast.error("Please Select Date First");
    } else {
      setLoading(true);
      setResponseData([]);
      const { data } = await imsAxios.post("/transaction/transactionIn", {
        data: datee,
        min_types: allData?.selType,
      });

      if (data.code == 200) {
        let arr = data.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setResponseData(arr);
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ height: "90%" }}>
      <Row gutter={16} style={{ margin: "5px" }}>
        <Col span={2} className="gutter-row">
          <Select
            placeholder="Please Select Option "
            options={options}
            style={{
              width: "100%",
            }}
            // value={allData?.selType}
            onChange={(e) =>
              setAllData((allData) => {
                return { ...allData, selType: e };
              })
            }
          />
        </Col>
        <Col span={4}>
          <MyDatePicker setDateRange={setDatee} size="default" />
        </Col>
        <Col span={1} className="gutter-row">
          <MyButton variant="search" type="primary" onClick={fetch}>
            Fetch
          </MyButton>
        </Col>
        {responseData.length > 1 && (
          <Col span={1} offset={16}>
            <Button onClick={handleDownloadingCSV}>
              <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
            </Button>
          </Col>
        )}
      </Row>

      <div className="hide-select" style={{ height: "95%", margin: "10px" }}>
        <MyDataTable
          loading={loading}
          data={responseData}
          columns={columns}
          checkboxSelection={true}
        />
      </div>
    </div>
  );
};

export default R13;
