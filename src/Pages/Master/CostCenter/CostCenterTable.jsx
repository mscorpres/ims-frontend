import React from "react";
import MyDataTable from "../../../Components/MyDataTable";

const CostCenterTable = ({ loading, rows }) => {
  return <MyDataTable rows={rows} columns={columns} loading={loading} />;
};

const columns = [
  {
    headerName: "Index",
    field: "index",
    width: 80,
  },
  {
    headerName: "Cost Center Id",
    field: "code",
    flex: 1,
  },
  {
    headerName: "Cost Center Name",
    field: "name",
    flex: 1,
  },
];

export default CostCenterTable;
