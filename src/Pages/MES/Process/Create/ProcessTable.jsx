import React, { useState } from "react";
import MyDataTable from "../../../../Components/MyDataTable";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";

const ProcessTable = ({ rows, loading }) => {
  return (
    <div style={{ height: "100%" }}>
      <MyDataTable loading={loading} columns={columns} data={rows} />
    </div>
  );
};

export default ProcessTable;
const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Code",
    field: "code",
    width: 100,
    renderCell: ({ row }) => <ToolTipEllipses text={row.code} copy={true} />,
  },
  {
    headerName: "Name",
    field: "name",
    minWidth: 150,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
  },
  {
    headerName: "Description",
    field: "description",
    minWidth: 150,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.description} />,
  },
];
