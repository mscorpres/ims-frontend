import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Input, Select, Upload, Button } from "antd";
import MyDatePicker from "../../Components/MyDatePicker";
import MyDataTable from "../../Components/MyDataTable";
import axios from "axios";
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const api = "http://localhost:8070";

const Depreciation = () => {
  const [searchDateRange, setSearchDateRange] = useState("");
  const [depreciationdata, setdepreciationdata] = useState([]);

  const getDepreciationData = async () => {
    try {
      const response = await axios.post(`${api}/getAsset`, {
        searchDateRange,
      });
      toast.success('Data fetch successfully!')

      setdepreciationdata(response.data);
    } catch (error) {
        toast.error('error in fetching data!')
      console.log(error);
    }
  };

  const columns = [
    {
      headerName: "Asset Name",
      field: "assetname",
      width: 180,
      headerClassName: "header-background",
    },
    
      {
        headerName: "Type Of Asset",
        field: "TypeOfAsset",
        width: 180,
        headerClassName: "header-background"
      },
      {
        headerName: "Invoice Date",
        field: "invoiceDate",
        width: 180,
        headerClassName: "header-background",
      },
      {
        headerName: "Use Date",
        field: "useDate",
        width: 180,
        headerClassName: "header-background",
      },
   
      {
        headerName: "Original Cost",
        field: "originalcost",
        width: 140,
        headerClassName: "header-background",
      },
   
    {
      headerName: "Accumulated Depriciation",
      field: "accumulatedDepriciation",
      width: 250,
      headerClassName: "header-background",
    },
    {
      headerName: "WDV",
      field: "wdv",
      width: 160,
      headerClassName: "header-background",
    },
    {
        headerName : "Salvage Value",
        field : "SalvageValue",
        width: 160,
        headerClassName: "header-background"
    },
    {
        headerName: "Life Used Till",
        field: "lifeUsedTill",
        width: 250,
        headerClassName: "header-background",
      },
      {
        headerName: "Depreciation Amount WholeLife",
        field: "depreciationAmountWholeLife",
        width: 250,
        headerClassName: "header-background",
      },
    {
      headerName: "Usefull Life",
      field: "usefulLife",
      width: 160,
      headerClassName: "header-background",
    },
    {
      headerName: "Used Days",
      field: "currentdays",
      width: 160,
      headerClassName: "header-background",
    },
    {
      headerName: "remaining UseFullLife",
      field: "remainingUsefulLife",
      width: 160,
      headerClassName: "header-background",
    },
    {
      headerName: "Depreciation Rate",
      field: "depreciationRate",
      width: 160,
      headerClassName: "header-background",
    },
    {
      headerName: "Depreciation Value",
      field: "depreciation",
      width: 160,
      headerClassName: "header-background",
    },
  ];

  return (
    <>
      <Row>
        <Col style={{ padding: "1rem" }}>
          <div style={{ width: 300 }}>
            <Card title="Select Date" size="small">
              <MyDatePicker
                size="default"
                setDateRange={setSearchDateRange}
                dateRange={searchDateRange}
                value={searchDateRange}
              />
              <Button
                onClick={getDepreciationData}
                style={{ marginTop: "1rem" }}
              >
                Search
              </Button>
            </Card>
          </div>
        </Col>
        <Col
          style={{
            height: "42rem",
            width: "82rem",
            paddingLeft: "2rem",
            paddingRight: "2rem",
            marginTop: "1rem",
          }}
        >
         <MyDataTable columns={columns} data={depreciationdata} />
         
        </Col>
      </Row>
    </>
  );
};

export default Depreciation;
