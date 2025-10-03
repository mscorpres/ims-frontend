import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableInstance,
} from "material-react-table";

interface Material {
  id: string;
  component: { label: string; value: string };
  qty: number;
  rate: number;
  duedate: string;
  hsncode: string;
  gsttype: string;
  gstrate: number;
  cgst: number;
  sgst: number;
  igst: number;
  remark: string;
  inrValue: number;
  foreginValue: number;
  unit: string;
  updateRow?: string;
  project_rate: number;
  localPrice: number;
  tol_price: number;
  project_qty: number;
  po_ord_qty: number;
  currency: string;
  exchange_rate: number;
}

interface EditComponentsModalProps {
  materials: Material[];
  onSave: (materials: Material[]) => void;
  onCancel: () => void;
  loading?: boolean;
}

const EditComponentsModal: React.FC<EditComponentsModalProps> = ({
  materials,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [components, setComponents] = useState<Material[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize components from props
  useEffect(() => {
    if (materials && materials.length > 0) {
      const formattedMaterials = materials.map((material) => ({
        ...material,
        id: material.id || uuidv4(),
      }));
      setComponents(formattedMaterials);
    }
  }, [materials]);

  // Calculate derived values
  const calculateDerivedValues = useCallback((component: Material) => {
    const qty = Number(component.qty) || 0;
    const rate = Number(component.rate) || 0;
    const exchangeRate = Number(component.exchange_rate) || 1;

    const inrValue = qty * rate;
    const foreginValue = inrValue * exchangeRate;
    const localPrice = rate * exchangeRate;

    return {
      inrValue,
      foreginValue,
      localPrice,
    };
  }, []);

  // Update derived values when qty, rate, or exchange rate changes
  useEffect(() => {
    setComponents((prev) =>
      prev.map((comp) => {
        const derived = calculateDerivedValues(comp);
        return {
          ...comp,
          ...derived,
        };
      })
    );
  }, [calculateDerivedValues]);

  // Handle save
  const handleSave = useCallback(() => {
    // Validate required fields
    const hasEmptyRequiredFields = components.some(
      (comp) => !comp.component.label || !comp.qty || !comp.rate
    );

    if (hasEmptyRequiredFields) {
      toast.error("Please fill in all required fields (Component, Qty, Rate)");
      return;
    }

    onSave(components);
    setIsDirty(false);
  }, [components, onSave]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmed) return;
    }
    onCancel();
  }, [isDirty, onCancel]);

  // Add new component row
  const handleAddRow = useCallback(() => {
    const newComponent: Material = {
      id: uuidv4(),
      component: { label: "", value: "" },
      qty: 0,
      rate: 0,
      duedate: "",
      hsncode: "",
      gsttype: "",
      gstrate: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      remark: "",
      inrValue: 0,
      foreginValue: 0,
      unit: "",
      project_rate: 0,
      localPrice: 0,
      tol_price: 0,
      project_qty: 0,
      po_ord_qty: 0,
      currency: "INR",
      exchange_rate: 1,
    };
    setComponents((prev) => [...prev, newComponent]);
    setIsDirty(true);
  }, []);

  // Define columns for MRT
  const columns = useMemo<MRT_ColumnDef<Material>[]>(
    () => [
      {
        accessorKey: "component.label",
        header: "Component",
        size: 200,
        enableEditing: true,
        Cell: ({ cell }) => cell.getValue<string>(),
        Edit: ({ cell, column, row, table }) => (
          <TextField
            value={cell.getValue<string>() || ""}
            onChange={(e) => {
              const newValue = e.target.value;
              row.original.component = {
                ...row.original.component,
                label: newValue,
              };
              setIsDirty(true);
            }}
            placeholder="Component name"
            size="small"
            fullWidth
          />
        ),
      },
      {
        accessorKey: "qty",
        header: "Qty",
        size: 120,
        enableEditing: true,
        Cell: ({ cell }) => cell.getValue<number>(),
        Edit: ({ cell, row }) => (
          <TextField
            type="number"
            value={cell.getValue<number>() || 0}
            onChange={(e) => {
              const newValue = Number(e.target.value) || 0;
              row.original.qty = newValue;
              setIsDirty(true);
            }}
            placeholder="0"
            size="small"
            fullWidth
          />
        ),
      },
      {
        accessorKey: "rate",
        header: "Rate",
        size: 100,
        enableEditing: true,
        Cell: ({ cell }) => cell.getValue<number>(),
        Edit: ({ cell, row }) => (
          <TextField
            type="number"
            value={cell.getValue<number>() || 0}
            onChange={(e) => {
              const newValue = Number(e.target.value) || 0;
              row.original.rate = newValue;
              setIsDirty(true);
            }}
            placeholder="0.00"
            size="small"
            fullWidth
          />
        ),
      },
      {
        accessorKey: "duedate",
        header: "Due Date",
        size: 120,
        enableEditing: true,
        Cell: ({ cell }) => cell.getValue<string>(),
        Edit: ({ cell, row }) => (
          <TextField
            type="date"
            value={cell.getValue<string>() || ""}
            onChange={(e) => {
              row.original.duedate = e.target.value;
              setIsDirty(true);
            }}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        ),
      },
      {
        accessorKey: "hsncode",
        header: "HSN Code",
        size: 100,
        enableEditing: true,
        Cell: ({ cell }) => cell.getValue<string>(),
        Edit: ({ cell, row }) => (
          <TextField
            value={cell.getValue<string>() || ""}
            onChange={(e) => {
              row.original.hsncode = e.target.value;
              setIsDirty(true);
            }}
            placeholder="HSN Code"
            size="small"
            fullWidth
          />
        ),
      },
      {
        accessorKey: "gstrate",
        header: "GST Rate",
        size: 80,
        enableEditing: true,
        Cell: ({ cell }) => cell.getValue<number>(),
        Edit: ({ cell, row }) => (
          <TextField
            type="number"
            value={cell.getValue<number>() || 0}
            onChange={(e) => {
              const newValue = Number(e.target.value) || 0;
              row.original.gstrate = newValue;
              setIsDirty(true);
            }}
            placeholder="0"
            size="small"
            fullWidth
          />
        ),
      },
      {
        accessorKey: "cgst",
        header: "CGST",
        size: 80,
        enableEditing: true,
        Cell: ({ cell }) => cell.getValue<number>(),
        Edit: ({ cell, row }) => (
          <TextField
            type="number"
            value={cell.getValue<number>() || 0}
            onChange={(e) => {
              const newValue = Number(e.target.value) || 0;
              row.original.cgst = newValue;
              setIsDirty(true);
            }}
            placeholder="0"
            size="small"
            fullWidth
          />
        ),
      },
      {
        accessorKey: "sgst",
        header: "SGST",
        size: 80,
        enableEditing: true,
        Cell: ({ cell }) => cell.getValue<number>(),
        Edit: ({ cell, row }) => (
          <TextField
            type="number"
            value={cell.getValue<number>() || 0}
            onChange={(e) => {
              const newValue = Number(e.target.value) || 0;
              row.original.sgst = newValue;
              setIsDirty(true);
            }}
            placeholder="0"
            size="small"
            fullWidth
          />
        ),
      },
      {
        accessorKey: "igst",
        header: "IGST",
        size: 80,
        enableEditing: true,
        Cell: ({ cell }) => cell.getValue<number>(),
        Edit: ({ cell, row }) => (
          <TextField
            type="number"
            value={cell.getValue<number>() || 0}
            onChange={(e) => {
              const newValue = Number(e.target.value) || 0;
              row.original.igst = newValue;
              setIsDirty(true);
            }}
            placeholder="0"
            size="small"
            fullWidth
          />
        ),
      },
      {
        accessorKey: "inrValue",
        header: "INR Value",
        size: 100,
        enableEditing: false,
        Cell: ({ cell }) => cell.getValue<number>(),
      },
      {
        accessorKey: "foreginValue",
        header: "Foreign Value",
        size: 120,
        enableEditing: false,
        Cell: ({ cell }) => cell.getValue<number>(),
      },
      {
        accessorKey: "remark",
        header: "Remark",
        size: 150,
        enableEditing: true,
        Cell: ({ cell }) => cell.getValue<string>(),
        Edit: ({ cell, row }) => (
          <TextField
            value={cell.getValue<string>() || ""}
            onChange={(e) => {
              row.original.remark = e.target.value;
              setIsDirty(true);
            }}
            placeholder="Remark"
            size="small"
            fullWidth
          />
        ),
      },
    ],
    []
  );

  // Configure MRT table
  const table = useMaterialReactTable({
    columns,
    data: components,
    enableEditing: true,
    enableRowActions: true,
    enableRowSelection: false,
    enableColumnFilters: true,
    enableSorting: true,
    enablePagination: true,
    enableBottomToolbar: true,
    enableTopToolbar: true,
    enableGlobalFilter: true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableHiding: true,
    initialState: {
      pagination: { pageSize: 10, pageIndex: 0 },
      density: "compact",
    },
    muiTableProps: {
      sx: {
        tableLayout: "fixed",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: 600,
        backgroundColor: "#f8fafc",
        borderBottom: "2px solid #e5e7eb",
        fontSize: "0.875rem",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        fontSize: "0.875rem",
      },
    },
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          size="small"
          color="error"
          variant="outlined"
          onClick={() => {
            setComponents((prev) =>
              prev.filter((comp) => comp.id !== row.original.id)
            );
            setIsDirty(true);
          }}
        >
          Delete
        </Button>
      </Box>
    ),
    renderTopToolbarCustomActions: () => (
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddRow}
        sx={{
          bgcolor: "#0d9488",
          "&:hover": { bgcolor: "#0f766e" },
        }}
      >
        Add Component
      </Button>
    ),
    renderEmptyRowsFallback: () => (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Alert severity="info">
          No components found. Click "Add Component" to get started.
        </Alert>
      </Box>
    ),
  });

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827" }}>
          Edit Components Details
        </Typography>
      </Box>

      {/* MRT Table */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <MaterialReactTable table={table} />
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "flex-end",
          mt: 3,
          pt: 2,
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <Button variant="outlined" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading || components.length === 0}
          sx={{
            bgcolor: "#0d9488",
            "&:hover": { bgcolor: "#0f766e" },
          }}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {loading ? "Saving..." : "Save Components"}
        </Button>
      </Box>
    </Box>
  );
};

export default EditComponentsModal;
