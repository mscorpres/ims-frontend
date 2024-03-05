import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import MyDataTable from "../../Components/MyDataTable";
import { v4 } from "uuid";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../Components/exportToCSV";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import { Row } from "antd";
import { imsAxios } from "../../axiosInterceptor";

export default function SKUCosting() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const getRows = async () => {
    setLoading(true);
    const { data } = await imsAxios.post("/SKUCosting/fetchSKU_costing");
    setLoading(false);
    if (data.code == 200) {
      const arr = data.response.data.map((row, index) => {
        return { ...row, id: v4(), index: index + 1 };
      });
      setRows(arr);
    } else {
      toast.error(data.message);
    }
  };
  const columns = [
    { headerName: "Serial No.", field: "index", width: 100 },
    { headerName: "SKU", field: "product_sku", flex: 1 },
    {
      headerName: "Product",
      field: "product_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.product_name} />,
      width: 200,
    },
    { headerName: "BOM Cost", field: "bom_mfg_cost", flex: 1 },
    { headerName: "PRI Pkg Cost", field: "pri_mfg_cost", flex: 1 },
    { headerName: "Consump. Cost", field: "other_mfg_cost", flex: 1 },
    { headerName: "JW Cost", field: "jobwork_cost", flex: 1 },
    { headerName: "Labour Cost", field: "labour_cost", flex: 1 },
    { headerName: "SEC PKG Cost", field: "packing_cost", flex: 1 },
    { headerName: "Other Cost", field: "other_cost", flex: 1 },
    { headerName: "Total Cost", field: "total_cost", flex: 1 },
  ];

  useEffect(() => {
    getRows();
  }, []);
  return (
    <div style={{ position: "relative", height: "100%" }}>
      <Row justify="end" style={{ padding: "0px 10px", paddingBottom: 5 }}>
        <CommonIcons
          onClick={() => downloadCSV(rows, columns, "SKU Costing")}
          action="downloadButton"
        />
      </Row>
      <div
        style={{
          height: "85%",
          padding: "0px 10px",
        }}
      >
        <MyDataTable loading={loading} data={rows} columns={columns} />
      </div>
    </div>
  );
}
