import React, { useMemo, useState } from "react";
import MaterialReactTable, { type MRT_ColumnDef } from "material-react-table";
// import { imsAxios } from "../../../../axiosInterceptor.js";

type Row = {
  id: string;
  po_transaction: string;
  vendor_name: string;
  cost_center?: string;
  project_name?: string;
  approval_status?: string;
  po_reg_date?: string;
};

const ManagePO: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [poSearch, setPoSearch] = useState("");

  const columns = useMemo<MRT_ColumnDef<Row>[]>(
    () => [
      { accessorKey: "po_transaction", header: "PO ID", size: 160 },
      { accessorKey: "vendor_name", header: "Vendor", size: 220 },
      { accessorKey: "cost_center", header: "Cost Center" },
      { accessorKey: "project_name", header: "Project" },
      { accessorKey: "approval_status", header: "Status", size: 120 },
      { accessorKey: "po_reg_date", header: "PO Reg. Date", size: 160 },
    ],
    []
  );

  const fetchByPoId = async () => {
    if (!poSearch) return;
    setLoading(true);
    const { data } = await imsAxios.post("/purchaseOrder/fetchPendingData4PO", {
      data: poSearch.trim(),
      wise: "po_wise",
    });
    setLoading(false);
    if (data?.code === 200) {
      const mapped = (data.data || []).map((r: any, index: number) => ({
        id: r.po_transaction ?? String(index),
        ...r,
      }));
      setRows(mapped);
    } else {
      setRows([]);
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          style={{
            padding: 8,
            border: "1px solid #ddd",
            borderRadius: 6,
            width: 260,
          }}
          value={poSearch}
          placeholder="Search by PO ID"
          onChange={(e) => setPoSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchByPoId()}
        />
        <button onClick={fetchByPoId} disabled={!poSearch || loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      <MaterialReactTable
        columns={columns}
        data={rows}
        state={{ isLoading: loading }}
      />
    </div>
  );
};

export default ManagePO;

