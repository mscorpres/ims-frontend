import React, { useEffect, useState } from "react";
import useApi from "../../../hooks/useApi.ts";
import {
  getPhysicalStockWithStatus,
  updateStatus,
} from "../../../api/store/physical-stock";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback.jsx";
import { Box, IconButton, LinearProgress, Tooltip } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

const PendingPhysicalStock = () => {
  const [rows, setRows] = useState([]);
  const { executeFun, loading } = useApi();

  const handleGetRows = async () => {
    const response = await executeFun(
      () => getPhysicalStockWithStatus("pending"),
      "fetch"
    );
    let arr = [];
    if (response.success) {
      arr = response.data.data.map((row, index) => ({
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
      <Box sx={{ display: "flex", gap: "0.5rem" }}>
        <Tooltip title="Reject">
          <IconButton
            onClick={() =>
              handleUpdateStatus({
                auditKey: row?.original?.auditKey,
                componentKey: row?.original?.componentKey,
                status: "reject",
              })
            }
            color="error"
            size="small"
          >
            <ThumbDownIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Approve">
          <IconButton
            onClick={() =>
              handleUpdateStatus({
                auditKey: row?.original?.auditKey,
                componentKey: row?.original?.componentKey,
                status: "approved",
              })
            }
            size="small"
            color="success"
          >
            <ThumbUpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),

    muiTableContainerProps: {
      sx: {
        height: loading("fetch")
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
    <div style={{ padding: 10, my: 2 }}>
      <MaterialReactTable table={table} />
    </div>
  );
};

export default PendingPhysicalStock;

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
    header: "Part COde",
    size: 150,
    accessorKey: "partCode",
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
