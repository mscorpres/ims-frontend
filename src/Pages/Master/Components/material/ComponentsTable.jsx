import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import MyDataTable from "../../../../Components/MyDataTable";
import { Tag } from "antd";

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
    width: 70,
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
    headerName: "Alt Part Code",
    field: "newPartCode",
    width: 150,
  },
  {
    headerName: "Sub Group",
    field: "subGroup",
    width: 150,
  },
  {
    headerName: "UoM",
    field: "unit",
    width: 150,
  },
  {
    headerName: "Status",
    field: "status",
    width: 150,
    renderCell: ({ row }) =>
      row.status === "Active" ? (
        <Tag color="green">Active</Tag>
      ) : (
        <Tag color="red">Inactive</Tag>
      ),
  },
];
