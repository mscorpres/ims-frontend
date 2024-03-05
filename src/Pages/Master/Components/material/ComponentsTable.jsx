import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import MyDataTable from "../../../../Components/MyDataTable";
import { imsAxios } from "../../../../axiosInterceptor";

export default function ComponentsTable({
  actionColumn,
  getRows,
  components,
  setComponents,
  loading,
  setLoading,
}) {

  return (
    <MyDataTable
      loading={loading === "fetch"}
      data={components}
      columns={[actionColumn, ...columns]}
    />
  );
}

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Name",
    field: "componentName",
    minWidth: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.componentName} />,
    flex: 1,
  },
  {
    headerName: "Part Code",
    field: "partCode",
    width: 150,
  },
  {
    headerName: "UOM",
    field: "unit",
    width: 150,
  },
];
