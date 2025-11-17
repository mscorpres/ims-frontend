import { useState } from "react";
import { useLocation } from "react-router-dom";
import { imsAxios } from "../../../../axiosInterceptor";
import { useEffect } from "react";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { Switch } from "antd";
import MyDataTable from "../../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ViewModal from "./ViewModal";
import { downloadExcel } from "../../../../Components/printFunction";
import EditModal from "./Edit";
import { downloadCSVnested2 } from "../../../../Components/exportToCSV";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { Row } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import { Download, Edit, Visibility } from "@mui/icons-material";
import EmptyRowsFallback from "../../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";

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
      header: "Status",
      width: 100,
      accessorKey: "status",

      Cell: ({ row }) => (
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

  const table = useMaterialReactTable({
    columns: [...actionColumns, ...columns],
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
        height:
          loading === "fetch" ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback message="No Purchase Orders Found" />
    ),

    renderTopToolbar: () =>
      loading === "fetch" ? (
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
        icon={<Edit fontSize="small" />}
        key="edit"
        label="Edit"
        onClick={() => {
          closeMenu?.();
          setEditBom({
            name: row?.original?.product,
            id: row?.original?.bomId,
          });
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<Visibility fontSize="small" />}
        key="view"
        label="View"
        onClick={() => {
          closeMenu?.();
          setViewBom({
            name: row?.original?.product,
            id: row?.original?.bomId,
          });
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<Download fontSize="small" />}
        key="download"
        label="Download"
        onClick={() => {
          closeMenu?.();
          handleBOMDownload(row?.original?.bomId, row?.original?.product);
        }}
        table={table}
      />,
    ],
  });
  return (
    <div style={{ height: "90%", margin: 12 }}>
      <Row justify="end" style={{ marginBottom: 12 }}>
        <CommonIcons
          disabled={rows.length === 0}
          onClick={handleDownload}
          action="downloadButton"
        />
      </Row>

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

const columns = [
  {
    header: "#",
    accessorKey: "id",
    width: 30,
  },
  {
    header: "Product",
    accessorKey: "product",
    minWidth: 200,
    flex: 1,
    render: ({ row }) => <ToolTipEllipses text={row.product} />,
  },
  {
    header: "SKU",
    accessorKey: "sku",
    minWidth: 150,
    render: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
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
    render: ({ row }) => <ToolTipEllipses text={row.createdDate} />,
  },
];
