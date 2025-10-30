import { ProductType } from "@/types/master";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSVnested2 } from "../../../Components/exportToCSV";
import { Row } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
  MRT_ToggleGlobalFilterButton,
  MRT_ToggleFiltersButton,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton,
} from "material-react-table";
import { Box, LinearProgress } from "@mui/material";
import { renderIcon } from "@/new/components/layout/Sidebar/iconMapper";
import { useMemo } from "react";

interface PropTypes {
  rows: ProductType[];
  loading: boolean;
  setEditingProduct: React.Dispatch<React.SetStateAction<string | boolean>>;
  setUpdatingImage: React.Dispatch<React.SetStateAction<false | ProductType>>;
  productType: ProductType["type"];
  setShowImages: React.Dispatch<React.SetStateAction<false | ProductType>>;
}
function View({
  rows,
  loading,
  setEditingProduct,
  setUpdatingImage,
  productType,
  setShowImages,
}: PropTypes) {
  const columns = useMemo(() => productColumn(), []);
  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderToolbarInternalActions: ({ table }) => (
      <>
        <MRT_ToggleGlobalFilterButton table={table} />
        <MRT_ToggleFiltersButton table={table} />
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
        <CommonIcons
          disabled={rows.length === 0}
          onClick={handleDownload}
          action="downloadButton"
        />
      </>
    ),
    renderTopToolbar: () =>
      loading ? (
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
        icon={renderIcon("EditIcon")}
        key="edit"
        label="Update"
        onClick={() => {
          row?.original?.productKey &&
            setEditingProduct(row?.original?.productKey);
          closeMenu();
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={renderIcon("VisibilityIcon")}
        key="view"
        label="View Images"
        onClick={() => {
          setShowImages(row?.original);
          closeMenu();
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={renderIcon("UploadIcon")}
        key="upload"
        label="Upload Images"
        onClick={() => {
          setUpdatingImage(row?.original);
          closeMenu();
        }}
        table={table}
        disabled={productType === "sfg"}
      />,
    ],
  });

  const handleDownload = () => {
    downloadCSVnested2(rows, columns, "Products");
  };
  return (
    <div style={{ height: "100%" }}>
      <MaterialReactTable table={table} />
    </div>
  );
}

export default View;
const productColumn = () => [
  { header: "#", accessorKey: "id", width: 30 },
  {
    header: "Product Name",
    accessorKey: "name",
    flex: 1,
    // Cell: ({ row }) => <ToolTipEllipses text={row.name} />,
  },
  {
    header: "SKU",
    accessorKey: "sku",
    width: 100,
    // renderCell: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    header: "Unit",
    accessorKey: "uom",
    width: 80,
  },
  {
    header: "Category",
    accessorKey: "category",
    width: 100,
    Cell: ({ row }) => (
      <>
        {row?.original?.category == ""
          ? "--"
          : row?.original?.category == "services"
          ? "Services"
          : "Goods"}
      </>
    ),
  },
];
