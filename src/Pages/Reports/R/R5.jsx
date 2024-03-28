import React, { useState, useEffect } from "react";
import "./r.css";
import { toast } from "react-toastify";
import { MdOutlineDownloadForOffline } from "react-icons/md";

import { Button, Col, DatePicker, Row } from "antd";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import InternalNav from "../../../Components/InternalNav";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";

const R5 = () => {
  const [responseData, setResponseData] = useState([]);
  const [selectDate, setSelectDate] = useState("");
  const [loading, setLoading] = useState(false);

  const columns = [
    { field: "fgtype", headerName: "Type", width: 80 },
    { field: "sku", headerName: "SKU", width: 100 },
    { field: "product", headerName: "Product", width: 300 },
    { field: "openBal", headerName: "Opening Qty", width: 120 },
    { field: "creditBal", headerName: "Inward Qty", width: 120 },
    { field: "debitBal", headerName: "Outward Qty", width: 120 },
    { field: "closingBal", headerName: "Closing Qty", width: 130 },
    { field: "minqty", headerName: "MIN. Stock", width: 100 },
    { field: "batchqty", headerName: "Batch Size", width: 100 },
    { field: "replenishment", headerName: "Replenishment", width: 150 },
    { field: "eqp", headerName: "EQP", width: 80 },
  ];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = responseData;
    csvData = arr.map((row) => {
      return {
        Type: row.fgtype,
        SKU: row.sku,
        Product: row.product,
        "OP Qty": row.openBal,
        "Inward Qty": row.creditBal,
        "Outward Qty": row.debitBal,
        "Closing Qty": row.closingBal,
        "Min Stock": row.closingBal,
        "Batch Size": row.batchqty,
        Replenishment: row.replenishment,
        Eqp: row.eqp,
      };
    });
    downloadCSVCustomColumns(csvData, "Finish Goods Stock");
  };

  const fetch = async () => {
    // console.log(selectDatep)
    if (!selectDate) {
      toast.error("Please Select Date First Then Proceed Next Step");
    } else {
      setResponseData([]);
      setLoading(true);
      const { data } = await imsAxios.post("/report5", {
        date: selectDate,
        action: "search_r5",
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
        toast.error(data.message);
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ height: "95%" }}>
      <Row gutter={10} style={{ margin: "5px" }}>
        <Col span={5}>
          {/* <SingleDatePicker setDate={setSelectDate} /> */}
          <MyDatePicker setDateRange={setSelectDate} size="default" />
        </Col>
        <Col span={1}>
          <MyButton variant="search" type="primary" onClick={fetch}>
            Fetch
          </MyButton>
        </Col>
        {responseData.length > 1 && (
          <Col span={1} offset={17}>
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

export default R5;
