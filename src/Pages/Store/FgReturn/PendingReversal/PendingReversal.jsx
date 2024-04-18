import React, { useState } from "react";
import MyDataTable from "../../../../Components/MyDataTable";
import { Col, Input, Row } from "antd";
import MyDatePicker from "../../../../Components/MyDatePicker";
import MyButton from "../../../../Components/MyButton";
import { imsAxios } from "../../../../axiosInterceptor";
import MySelect from "../../../../Components/MySelect";

function PendingReversal() {
  const [dateRange, setDateRange] = useState("");
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
  };
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
        <MyDataTable columns={columns} data={[]} />
      </div>
    </div>
  );
}

export default PendingReversal;
const columns = [
  {
    headerName: "#",
    field: "index",
    width: 30,
  },
  {
    headerName: "Created by date",
    field: "ladgerName",
    renderCell: ({ row }) => <ToolTipEllipses text={row.ladgerName} />,
    width: 200,
  },
  {
    headerName: "SKU",
    field: "ladgerName",
    renderCell: ({ row }) => <ToolTipEllipses text={row.ladgerName} />,
    width: 200,
  },
  {
    headerName: "Qty",
    field: "ladgerName",
    renderCell: ({ row }) => <ToolTipEllipses text={row.ladgerName} />,
    width: 200,
  },
  {
    headerName: "BOM",
    field: "ladgerName",
    renderCell: ({ row }) => <ToolTipEllipses text={row.ladgerName} />,
    width: 200,
  },
];
