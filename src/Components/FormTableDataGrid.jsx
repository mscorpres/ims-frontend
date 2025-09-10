import { DataGrid } from "@mui/x-data-grid";
import { Card } from "antd";

export default function FormTable({ columns, data, loading }) {
  return (
    <Card
      size="small"
      style={{ width: "100%", height: "100%" }}
      bodyStyle={{
        padding: 0,
        height: "100%",
        width: "100%",
        overflow: "auto",
      }}
    >
      <DataGrid
        columns={columns}
        rows={data}
        loading={loading}
        autoHeight={false}
        // disableColumnMenu
        sx={{
          border: "none",
          "& .MuiDataGrid-cell": {
            padding: "4px 8px",
          },
        }}
        getRowId={(row) => row.id} // or use your own unique ID field
      />
    </Card>
  );
}
