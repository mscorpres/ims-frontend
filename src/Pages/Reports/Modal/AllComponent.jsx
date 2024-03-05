import axios from "axios";
import React, { useEffect, useState } from "react";
import { Space, Drawer, Row, Col, Button } from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import { MdOutlineDownloadForOffline } from "react-icons/md";
import { v4 } from "uuid";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";

export default function AllComponent({
  component,
  setComponentData,
  setOpen,
  open,
}) {
  console.log(open);
  const [storeData, setStoreData] = useState([]);

  const columns = [
    { field: "fgtype", headerName: "FG Type", width: 100 },
    { field: "partcode", headerName: "Part Code", width: 150 },
    { field: "component", headerName: "Component", width: 420 },
    { field: "unit", headerName: "UOM", width: 190 },
    { field: "cons_qty", headerName: "Part Consumed", width: 230 },
    { field: "cons_loc", headerName: "Consume Location", width: 240 },
  ];

  const handleDownloadingCSV = () => {
    let arr = [];
    let csvData = [];
    arr = storeData;
    csvData = arr.map((row) => {
      return {
        "Fg Type": row.fgtype,
        "Part Code": row.partcode,
        Component: row.component,
        UOM: row.unit,
        "Part Consumed": row.cons_qty,
        "Consume Location": row.cons_loc,
      };
    });
    downloadCSVCustomColumns(csvData, "Details Report Production");
  };

  useEffect(() => {
    if (open?.mfg_id) {
      let aaa = component.filter((a) => a.mfg_id == open.mfg_id);
      // console.log(aaa);
      let arr = aaa.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setStoreData(arr);
      // console.log(arr);
    }
  }, [open?.mfg_id]);

  return (
    <>
      <Row>
        <Col span={24}>
          <div style={{ textAlign: "end", marginBottom: "10px" }}>
            <Button onClick={handleDownloadingCSV}>
              <MdOutlineDownloadForOffline style={{ fontSize: "20px" }} />
            </Button>
          </div>
        </Col>
      </Row>
      <div style={{ height: "80%" }}>
        <MyDataTable
          checkboxSelection={true}
          data={storeData}
          columns={columns}
        />
      </div>
    </>
  );
}
