import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { imsAxios } from "../../../../axiosInterceptor";
import { useEffect } from "react";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { Switch } from "antd";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ViewModal from "./ViewModal";
import { downloadExcel } from "../../../../Components/printFunction";
import EditModal from "./Edit";
import { downloadCSVnested2 } from "../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
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

const ManageBOM = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewBom, setViewBom] = useState(false);
  const [editBom, setEditBom] = useState(false);
  const { pathname } = useLocation();
  const bomType = pathname.includes("sfg") ? "sfg" : "fg";

  const getRows = async () => {
    let url = "";
    if (bomType === "sfg") {
      url = "bom/semiFgBom";
    } else {
      url = "bom/fgBom";
    }
    setLoading("fetch");
    const response = await imsAxios.get(url);
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        const arr = data.data.map((row, index) => ({
          id: index + 1,
          product: row.subject_name,
          sku: row.bom_product_sku,
          createdDate: row.insert_date,
          level: row.bom_level,
          bomId: row.subject_id,
          status: row.bom_status,
        }));

        setRows(arr);
      }
    }
  };
  const toggleStatus = async (id, status) => {
    const statusText = status ? "ENABLE" : "DISABLE";
    setLoading(id);
    const response = await imsAxios.post("/bom/updateBOMStatus", {
      subject_id: id,
      status: statusText,
    });
    const { data } = response;
    if (data) {
      if (data.status === "success") {
        setRows((curr) =>
          curr.map((row) => {
            if (row.bomId === id) {
              return {
                ...row,
                status: row.status === "ENABLE" ? "DISABLED" : "ENABLE",
              };
            } else {
              return row;
            }
          })
        );
      }
    }
    setLoading(false);
  };
  const handleBOMDownload = async (id, name) => {
    setLoading("fetch");
    const response = await imsAxios.post("/bom/bomExcelDownload", {
      subject_id: id,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        downloadExcel(data.data.buffer.data, `BOM ${name}`);
      }
    }
  };
  const actionColumns = [
    {
      headerName: "",
      width: 30,
      type: "actions",
      field: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label="View"
          onClick={() => setViewBom({ name: row.product, id: row.bomId })}
        />,
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label="Edit"
          onClick={() => setEditBom({ name: row.product, id: row.bomId })}
        />,
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label="Download"
          onClick={() => handleBOMDownload(row.bomId, row.product)}
        />,
      ],
    },
    {
      headerName: "Status",
      width: 100,
      field: "status",
      type: "actions",
      renderCell: ({ row }) => (
        <Switch
          size="small"
          checked={row.status === "ENABLE"}
          loading={loading === row.bomId}
          onChange={(value) => {
            toggleStatus(row.bomId, value);
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    getRows();
  }, []);

  const handleDownload = () => {
    downloadCSVnested2(rows, columns, "FG BOM", actionColumns);
  };

  const columns = useMemo(
    () => [
      {
        header: "#",
        accessorKey: "id",
        width: 30,
      },
      {
        header: "Status",
        accessorKey: "status",
        width: 100,
        Cell: ({ row }) => (
          <Switch
            size="small"
            checked={row.original.status === "ENABLE"}
            loading={loading === row.original.bomId}
            onChange={(value) => {
              toggleStatus(row.original.bomId, value);
            }}
          />
        ),
      },
      {
        header: "Product",
        accessorKey: "product",
        minWidth: 200,
        flex: 1,
        Cell: ({ row }) => <ToolTipEllipses text={row.original.product} />,
      },
      {
        header: "SKU",
        accessorKey: "sku",
        minWidth: 150,
        Cell: ({ row }) => (
          <ToolTipEllipses text={row.original.sku} copy={true} />
        ),
      },
      {
        header: "Project",
        accessorKey: "bom_project",
        minWidth: 150,
      },
      // {
      //   header: "Level",
      //   accessorKey: "level",
      //   minWidth: 50,
      // },
      {
        header: "Created Date",
        accessorKey: "createdDate",
        minWidth: 150,
        Cell: ({ row }) => <ToolTipEllipses text={row.original.createdDate} />,
      },
    ],
    [loading]
  );
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
        icon={renderIcon("VisibilityIcon")}
        key="view"
        label="View"
        onClick={() => {
          setViewBom({
            name: row?.original?.product,
            id: row?.original?.bomId,
          });
          closeMenu();
          console.log(row);
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={renderIcon("EditIcon")}
        key="edit"
        label="Edit"
        onClick={() => {
          setEditBom({
            name: row?.original?.product,
            id: row?.original?.bomId,
          });
          closeMenu();
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={renderIcon("DownloadIcon")}
        key="download"
        label="Download"
        onClick={() => {
          handleBOMDownload(row?.original?.bomId, row?.original?.product);
          closeMenu();
        }}
        table={table}
        // disabled={productType === "sfg"}
      />,
    ],
  });

  return (
    <div style={{ height: "90%", padding: 10, paddingTop: 0 }}>
      <MaterialReactTable table={table} />

      <ViewModal show={viewBom} close={() => setViewBom(false)} />
      <EditModal
        bomType={bomType}
        show={editBom}
        close={() => setEditBom(false)}
      />
    </div>
  );
};

export default ManageBOM;
