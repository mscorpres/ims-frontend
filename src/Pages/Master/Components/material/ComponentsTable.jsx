import { useMemo } from "react";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import { Box, LinearProgress } from "@mui/material";
import { Edit, Visibility, Upload } from "@mui/icons-material";

export default function ComponentsTable({
  actionColumn,
  getRows,
  components,
  setComponents,
  loading,
  setLoading,
  setUploadingImage,
  setShowImages,
}) {
  const columns = useMemo(() => materialColumn(), []);

  const table = useMaterialReactTable({
    columns: columns,
    data: components || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 190px)" : "calc(100vh - 250px)",
      },
    },
    renderTopToolbar: () =>
      loading==="fetch" ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
    renderRowActionMenuItems: ({ row, table, closeMenu }) => [
      <MRT_ActionMenuItem
        icon={<Edit />}
        key="edit"
        label="Update"
        onClick={() => {
          window.open(
            `/master/component/${row?.original?.key}`,
            "_blank",
            "noreferrer"
          );
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<Visibility />}
        key="view"
        label="View Images"
        onClick={() => {
          setShowImages({
            partNumber: row?.original.key,
            partCode: row?.original?.partCode,
          });
          closeMenu();
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<Upload />}
        key="upload"
        label="Upload Images"
        onClick={() => {
          setUploadingImage({
            key: row?.original?.key,
            label: row?.original?.componentName,
          });
          closeMenu();
        }}
        table={table}
      />,
    ],
  });
  return (
   
      <MaterialReactTable table={table} />
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
    headerName: "UoM",
    field: "unit",
    width: 150,
  },
];

const materialColumn = () => [
  {
    accessorKey: "componentName",
    header: "Name",
    size: 300,
  },
  {
    accessorKey: "partCode",
    header: "Part Code",
    size: 150,
  },
  {
    accessorKey: "unit",
    header: "UoM",
    size: 150,
  },
];
