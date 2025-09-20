import React from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ColumnDef,
} from "material-react-table";

type MRTTableProps<T extends Record<string, any>> = {
  columns: MRT_ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  maxHeight?: string | number;
  density?: "comfortable" | "compact" | "spacious";
  enablePagination?: boolean;
};

export function MRTTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  maxHeight = "70vh",
  density = "compact",
  enablePagination = false,
}: MRTTableProps<T>) {
  const table = useMaterialReactTable<T>({
    columns,
    data,
    state: { isLoading: loading },
    initialState: { density },
    enableStickyHeader: true,
    enablePagination,
    muiTableContainerProps: { sx: { maxHeight } },
  });

  return <MaterialReactTable table={table} />;
}

export default MRTTable;
