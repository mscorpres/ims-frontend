import { useEffect, useState } from "react";
import useApi from "@/hooks/useApi.ts";
import {
  getPhysicalStockWithStatus,
  updateStatus,
} from "@/api/production/physical-stock";
import { GridActionsCellItem } from "@mui/x-data-grid";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import { Box, Button, LinearProgress } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
const PendingPhysicalProduction = () => {
  const [rows, setRows] = useState([]);
  const { executeFun, loading } = useApi();

  const handleGetRows = async () => {
    const response = await executeFun(
      () => getPhysicalStockWithStatus("pending"),
      "fetch"
    );
    let arr = [];
    if (response.success) {
      arr = response.data.map((row, index) => ({
        id: index + 1,
        component: row.part_name,
        partCode: row.part_code,
        auditQty: row.audit_qty,
        auditKey: row.audit_key,
        auditDate: row.audit_dt,
        remark: row.audit_remark,
        auditBy: row.by,
        componentKey: row.component_key,
        imsQty: row.ims_qty,
        status: row.status,
        locationKey: row.location.location_key,
        location: row.location.location_name,
      }));
    }
    setRows(arr);
  };

  const handleUpdateStatus = async (payload) => {
    const response = await executeFun(
      () => updateStatus(payload),
      "updateStatus"
    );
    if (response.success) {
      handleGetRows();
    }
  };

  const actionColumn = {
    headerName: "",
    type: "actions",
    width: 30,
    getActions: ({ row }) => [
      // reject icon
      <GridActionsCellItem
        showInMenu
        // disabled={disabled}
        label={"Reject"}
        onClick={() =>
          handleUpdateStatus({
            auditKey: row.auditKey,
            componentKey: row.componentKey,
            status: "reject",
          })
        }
      />,
      // approve icon
      <GridActionsCellItem
        showInMenu
        // disabled={disabled}
        label={"Approve"}
        onClick={() =>
          handleUpdateStatus({
            auditKey: row.auditKey,
            componentKey: row.componentKey,
            status: "approved",
          })
        }
      />,
    ],
  };
  useEffect(() => {
    handleGetRows();
  }, []);

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
    renderRowActions: ({ row }) => (
      <div>
        <Button
          size="small"
          variant="text"
          color="error"
          onClick={() =>
            handleUpdateStatus({
              auditKey: row.auditKey,
              componentKey: row.componentKey,
              status: "reject",
            })
          }
        >
          Reject
        </Button>
        <Button
          size="small"
          variant="text"
          color="success"
          onClick={() =>
            handleUpdateStatus({
              auditKey: row.auditKey,
              componentKey: row.componentKey,
              status: "approved",
            })
          }
        >
          Approve
        </Button>
      </div>
    ),
    muiTableContainerProps: {
      sx: {
        height:
          loading("fetch") || loading("updateStatus")
            ? "calc(100vh - 200px)"
            : "calc(100vh - 250px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading("fetch") || loading("updateStatus") ? (
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
  });

  return (
    <div style={{ height: "95%", margin: 12 }}>
      <MaterialReactTable table={table} />
    </div>
  );
};

export default PendingPhysicalProduction;

const columns = [
  {
    header: "#",
    size: 30,
    accessorKey: "id",
  },
  {
    header: "Component",
    size: 120,

    accessorKey: "component",
  },
  {
    header: "Part Code",
    size: 150,
    accessorKey: "partCode",
  },
  {
    header: "Location",
    size: 150,
    accessorKey: "location",
  },
  {
    header: "Audit Qty",
    size: 150,
    accessorKey: "auditQty",
  },
  {
    header: "IMS Qty",
    size: 150,
    accessorKey: "imsQty",
  },
  {
    header: "Audit Date",
    size: 150,
    accessorKey: "auditDate",
  },
  {
    header: "Audit By",
    size: 150,
    accessorKey: "auditBy",
  },
  {
    header: "Remark",
    size: 120,

    accessorKey: "remark",
  },
];
