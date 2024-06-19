import ToolTipEllipses from "@/Components/ToolTipEllipses";
import MyDataTable from "@/Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";

export default function List({ actionColumn, components, loading }) {
  return (
    <MyDataTable
      loading={loading}
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
    headerName: "Part Code",
    field: "partCode",
    width: 120,
  },
  {
    headerName: "Name",
    field: "name",
    minWidth: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
    flex: 1,
  },
  {
    headerName: "Is Approved?",
    field: "isApproved",
    width: 100,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.isApproved ? "Yes" : "No"} />
    ),
  },
  {
    headerName: "Is Enabled?",
    field: "isEnabled",
    width: 100,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.isEnabled ? "Yes" : "No"} />
    ),
  },

  {
    headerName: "UoM",
    field: "unit",
    width: 120,
  },
];
