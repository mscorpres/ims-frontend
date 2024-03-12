import axios from "axios";
import React, { useEffect, useState } from "react";
import "./r.css";
import {
  downloadCSV,
  downloadCSVCustomColumns,
} from "../../../Components/exportToCSV";
import { FaDownload } from "react-icons/fa";
import InternalNav from "../../../Components/InternalNav";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { Button, Col, Row, Typography } from "antd";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";

const R11 = () => {
  const [allData, setAllData] = useState([]);
  const [filter, setfilter] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  const columns = [
    // { field: "dt", headerName: "S.No.", width: 150 },
    { field: "serial_no", headerName: "S.No.", width: 50 },
    { field: "part", headerName: "Part", width: 100 },
    { field: "part_new", headerName: "Cat Part Code", width: 150 },
    {
      field: "name",
      headerName: "Component",
      width: 380,
    },
    { field: "exchange_rate", headerName: "Exchange Rate", width: 150 },
    { field: "currency", headerName: "Currency", width: 100 },
    { field: "uom", headerName: "UoM", width: 100 },
    { field: "last_in_rate", headerName: "Last Rate", width: 150 },
    { field: "op", headerName: "Opening Qty", width: 200 },
    { field: "in", headerName: "Today In Qty", width: 150 },
    {
      field: "out",
      headerName: "Today Out Qty",
      width: 150,
    },
    { field: "cl", headerName: "Closing Qty", width: 120 },
  ];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = allData;
    csvData = arr.map((row) => {
      // console.log(row);
      return {
        "#": row.serial_no,
        Part: row.part,
        Component: row.name,
        Exchange: row.exchange,
        Currency: row.currency,
        UOM: row.uom,
        "Last Rate": row.last_in_rate == "--" ? "0" : row.last_in_rate,
        "Opening Qty": row.op == "0" ? "0" : row.op,
        "Inward Qty": row.in == "0" ? "0" : row.in,
        "Outward Qty": row.op == "0" ? "0" : row.op,
        "Closing Qty": row.cl == "0" ? "0" : row.cl,
      };
    });
    downloadCSVCustomColumns(csvData, "Component CL Stock Report");
  };

  const getFecth = async () => {
    setLoading(true);
    const { data } = await imsAxios.post("/report11", {
      type: "fetchStock",
    });
    let arr = data.response.data.map((row) => {
      return { ...row, id: v4() };
    });
    setLoading(false);
    if (data.code == 200) {
      setAllData(arr);
      setPendingCount(data.response.totalError);
    } else {
      toast.error(data.message.msg);
    }
  };

  useEffect(() => {
    const res = allData.filter((a) => {
      return a.name.toLowerCase().match(search.toLowerCase());
    });
    // console.log(res)
    setfilter(res);
  }, [search]);

  useEffect(() => {
    getFecth();
  }, []);
  return (
    <div style={{ height: "95%" }}>
      <Row style={{ margin: "10px" }} justify="space-between">
        <Typography.Title level={5} style={{ color: "red" }}>
          {pendingCount > 0 && `${pendingCount} Components pending to update`}
        </Typography.Title>
        <Button disable={pendingCount > 0} onClick={handleDownloadingCSV}>
          <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
        </Button>
      </Row>

      <div className="hide-select" style={{ height: "87%", margin: "10px" }}>
        <MyDataTable
          checkboxSelection={true}
          data={allData}
          columns={columns}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default R11;
