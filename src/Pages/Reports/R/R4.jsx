import React, { useState, useEffect } from "react";
import "./r.css";
import { toast } from "react-toastify";

import { MdOutlineDownloadForOffline } from "react-icons/md";
import { Button, Col, DatePicker, Row } from "antd";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import MyDatePicker from "../../../Components/MyDatePicker";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";

const R4 = () => {
  const [responseData, setResponseData] = useState([]);
  const [selectDate, setSelectDate] = useState("");
  const [loading, setLoading] = useState(false);

  const columns = [
    { field: "type", headerName: "Type", width: 60 },
    { field: "transaction1", headerName: "Ppr No.", width: 80 },
    { field: "transaction2", headerName: "MFG No.", width: 100 },
    { field: "transaction3", headerName: "Transaction ID", width: 140 },
    { field: "mfginsertdate", headerName: "MFG Date", width: 100 },
    { field: "approveqty", headerName: "Stock In", width: 100 },
    { field: "approvedate", headerName: "Stock In Date", width: 100 },
    { field: "product_sku", headerName: "SKU", width: 100 },
    { field: "product_name", headerName: "Product", width: 300 },
    { field: "location", headerName: "FG Locaiton", width: 100 },
    { field: "pprcustomer", headerName: "Customer", width: 100 },
    { field: "pprcreatedby", headerName: "Ppr By", width: 150 },
    { field: "mfgapprovedby", headerName: "MFG By", width: 120 },
    { field: "approveby", headerName: "Stock Inward By", width: 140 },
  ];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = responseData;
    csvData = arr.map((row) => {
      return {
        Type: row.type,
        "PPR No": row.transaction1,
        "MFG No": row.transaction2,
        "TXN ID": row.transaction3,
        "MFG Date": row.mfginsertdate,
        "ST In": row.approveqty,
        "ST In Date": row.approvedate,
        SKU: row.product_sku,
        Product: row.product_name,
        "FG Loc": row.location,
        Customer: row.pprcustomer,
        "PPR By": row.pprcreatedby,
        "MFG By": row.mfgapprovedby,
        "ST In By": row.approveby,
      };
    });
    downloadCSVCustomColumns(csvData, "Finish Goods");
  };

  const fetch = async () => {
    setResponseData([]);
    // console.log(selectDatep)
    if (!selectDate) {
      toast.error("Please Select Date First Then Proceed Next Step");
    } else {
      setResponseData([]);
      setLoading(true);
      const { data } = await imsAxios.post("/report4", {
        date: selectDate,
        action: "search_r4",
      });

      // console.log(data);
      if (data.code == 200) {
        let arr = data.response.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setResponseData(arr);
        setLoading(false);
      } else if (data.code == 500) {
        setLoading(true);
        toast.error(data.message.msg);
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ height: "95%" }}>
      <Row gutter={10} style={{ margin: "5px" }}>
        <Col span={4}>
          <MyDatePicker setDateRange={setSelectDate} size="default" />
          {/* <SingleDatePicker setDate={setSelectDate} /> */}
        </Col>
        <Col span={1}>
          <MyButton variant="search" onClick={fetch} type="primary">
            Fetch
          </MyButton>
        </Col>
        {responseData.length > 1 && (
          <Col span={1} offset={18}>
            <Button onClick={handleDownloadingCSV}>
              <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
            </Button>
          </Col>
        )}
      </Row>

      <div className="hide-select" style={{ height: "90%", margin: "10px" }}>
        <MyDataTable
          checkboxSelection={true}
          loading={loading}
          data={responseData}
          columns={columns}
        />
      </div>
    </div>
  );
};

export default R4;
