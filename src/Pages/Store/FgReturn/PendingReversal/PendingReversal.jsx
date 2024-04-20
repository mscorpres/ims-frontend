import React, { useState } from "react";
import MyDataTable from "../../../../Components/MyDataTable";
import { Col, Input, Row } from "antd";
import MyDatePicker from "../../../../Components/MyDatePicker";
import MyButton from "../../../../Components/MyButton";
import { imsAxios } from "../../../../axiosInterceptor";
import MySelect from "../../../../Components/MySelect";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";

import { GridActionsCellItem } from "@mui/x-data-grid";
import { AiFillEdit } from "react-icons/ai";
import TableActions from "../../../../Components/TableActions.jsx/TableActions";
import ExecutePPR from "./ExecutePPR";
function PendingReversal() {
  const [dateRange, setDateRange] = useState("");
  const [rows, setRows] = useState("");
  const [executePPR, setExecutePPR] = useState([]);
  const [wise, setWise] = useState("datewise");
  const [searchInput, setSearchInput] = useState("datewise");
  const options = [
    { value: "datewise", text: "Date Wise" },
    { value: "skuwise", text: "SKU Wise" },
  ];
  const getRows = async () => {
    let response = await imsAxios.post("/fg_return/fetchFG_returnlist", {
      wise: wise,
      data: wise == "datewise" ? dateRange : searchInput,
    });
    if (response.success == true) {
      let { data } = response;
      let arr = data.map((e, id) => {
        return {
          ...e,
          id: id + 1,
        };
      });
      setRows(arr);
    }
  };
  const getExecuteDetails = async (row) => {
    // console.log("row", row);
    // // return;
    // const response = await imsAxios.post("/fg_return/fetchComponentDetails", {
    //   product_id: row.product_id,
    //   fg_return_txn: row.fg_return_txn_id,
    // });
    // console.log("response", response);
    // if (response.success) {
    //   let { data } = response;
    setExecutePPR(row);
    // }
  };
  const columns = [
    {
      headerName: "#",
      field: "id",
      width: 30,
    },
    {
      headerName: "Actions",
      button: true,
      field: "action",
      type: "actions",
      width: 100,
      // minWidth: "20%",
      getActions: ({ row }) => [
        <TableActions
          showInMenu={true}
          action="check"
          onClick={() => {
            getExecuteDetails(row);
          }}
          label="Execute PPR"
        />,
      ],
      // style: { backgroundColor: "transparent" },
    },
    {
      headerName: "SKU",
      field: "product_sku",
      renderCell: ({ row }) => <ToolTipEllipses text={row.product_sku} />,
      width: 100,
    },
    {
      headerName: "Product",
      field: "product_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.product_name} />,
      width: 250,
    },
    {
      headerName: "BOM",
      field: "bom_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.bom_name} />,
      width: 200,
    },
    {
      headerName: "Inserted By",
      field: "insert_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.insert_by} />,
      width: 100,
    },
    {
      headerName: "Insert Date",
      field: "insert_dt",
      renderCell: ({ row }) => <ToolTipEllipses text={row.insert_dt} />,
      width: 150,
    },
    {
      headerName: "Location In",
      field: "location_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.location_name} />,
      width: 100,
    },

    {
      headerName: "UoM",
      field: "product_uom",
      renderCell: ({ row }) => <ToolTipEllipses text={row.product_uom} />,
      width: 100,
    },
    {
      headerName: "Qty",
      field: "qty_return",
      renderCell: ({ row }) => <ToolTipEllipses text={row.qty_return} />,
      width: 100,
    },

    {
      headerName: "Status",
      field: "fg_status",
      renderCell: ({ row }) => <ToolTipEllipses text={row.fg_status} />,
      width: 100,
    },
    {
      headerName: "Remark",
      field: "remark",
      renderCell: ({ row }) => <ToolTipEllipses text={row.remark} />,
      width: 250,
    },
  ];
  return (
    <div style={{ height: "95%" }}>
      <Row span={24} style={{ padding: 5, paddingTop: 5 }} gutter={[10, 10]}>
        {" "}
        <Col span={4}>
          <MySelect options={options} onChange={setWise} value={wise} />
        </Col>
        {wise == "datewise" ? (
          <>
            <Col span={6}>
              <MyDatePicker setDateRange={setDateRange} />
            </Col>
          </>
        ) : (
          <>
            {" "}
            <Col span={6}>
              <Input
                onChange={(e) => {
                  setSearchInput(e.target.value);
                }}
              />
            </Col>
          </>
        )}
        <MyButton variant="search" onClick={getRows}></MyButton>
      </Row>
      <div style={{ height: "95%", paddingRight: 5, paddingLeft: 5 }}>
        <MyDataTable columns={columns} data={rows} />
      </div>
      <ExecutePPR
        getRows={getRows}
        editPPR={executePPR}
        setEditPPR={setExecutePPR}
      />
    </div>
  );
}

export default PendingReversal;
