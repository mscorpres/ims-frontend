import React, { useState } from "react";
import { Drawer, Card, Button, CircularProgress } from "@mui/material";
import { Row, Col, Space, Timeline } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ColumnDef,
} from "material-react-table";
import { Print, Download } from "@mui/icons-material";
import { toast } from "react-toastify";
// @ts-ignore
import { imsAxios } from "../../../../axiosInterceptor";
import printFunction from "../../../utils/printFunction";
import { downloadFunction } from "../../../utils/printFunction";

interface ViewPOModalProps {
  showViewSidebar: boolean;
  setShowViewSidebar: (value: boolean) => void;
  componentData: any;
  poLogs: any[];
  onRefreshLogs: (poId: string) => void;
}

export const ViewPOModal: React.FC<ViewPOModalProps> = ({
  showViewSidebar,
  setShowViewSidebar,
  componentData,
  poLogs,
  onRefreshLogs,
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const printFun = async () => {
    if (!componentData?.poid) return;

    setLoading("print");
    try {
      const { data } = await imsAxios.post("/poPrint", {
        poid: componentData.poid,
      });
      printFunction(data.data.buffer.data);
    } catch (error) {
      toast.error("Error printing PO");
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = async () => {
    if (!componentData?.poid) return;

    setLoading("download");
    try {
      const { data } = await imsAxios.post("/poPrint", {
        poid: componentData.poid,
      });
      const filename = `PO ${componentData.poid}`;
      downloadFunction(data.data.buffer.data, filename);
    } catch (error) {
      toast.error("Error downloading PO");
    } finally {
      setLoading(null);
    }
  };

  const columns: MRT_ColumnDef<any>[] = [
    {
      accessorKey: "index",
      header: "SR. No",
      size: 80,
      Cell: ({ row }) => {
        const index = componentData?.components?.indexOf(row.original) + 1;
        return index || "";
      },
    },
    {
      accessorKey: "componentPartId",
      header: "Component Name / Part No.",
      size: 200,
      Cell: ({ row }) => {
        return `${row.original.po_components} / ${row.original.componentPartID}`;
      },
    },
    {
      accessorKey: "ordered_qty",
      header: "Ordered Qty",
      size: 120,
    },
    {
      accessorKey: "pending_qty",
      header: "Pending QTY",
      size: 120,
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data: componentData?.components || [],
    enableDensityToggle: false,
    initialState: { density: "compact" },
    enableStickyHeader: true,
    enablePagination: false,
    muiTableContainerProps: { sx: { maxHeight: "70vh" } },
  });

  return (
    <Drawer
      anchor="right"
      open={showViewSidebar}
      onClose={() => setShowViewSidebar(false)}
      sx={{ width: "100vw" }}
      PaperProps={{ sx: { width: "100vw" } }}
    >
      <div style={{ padding: 16, height: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: componentData?.status === "C" ? "red" : "inherit",
              }}
            >
              {componentData?.poid} / {componentData?.components?.length} Item
              {componentData?.components?.length > 1 ? "s" : ""}
            </h2>
          </div>
          <Space>
            <Button
              variant="outlined"
              startIcon={
                loading === "print" ? <CircularProgress size={16} /> : <Print />
              }
              onClick={printFun}
              disabled={loading === "print"}
            >
              Print
            </Button>
            <Button
              variant="outlined"
              startIcon={
                loading === "download" ? (
                  <CircularProgress size={16} />
                ) : (
                  <Download />
                )
              }
              onClick={handleDownload}
              disabled={loading === "download"}
            >
              Download
            </Button>
          </Space>
        </div>

        <Row gutter={20} style={{ height: "95%" }}>
          <Col span={16}>
            <div style={{ height: "100%" }}>
              <MaterialReactTable table={table} />
            </div>
          </Col>
          <Col span={8}>
            <Card title="PO logs" sx={{ maxHeight: "100%", height: "100%" }}>
              <Timeline
                items={poLogs.map((row) => ({
                  children: (
                    <div>
                      <div style={{ fontWeight: "bold" }}>
                        {row.po_log_status}
                      </div>
                      <div style={{ fontSize: "10px" }}>
                        By {row.user_name} on {row.date} {row.time}
                      </div>
                      <div style={{ fontSize: "13px" }}>
                        Remark:{" "}
                        {row.po_log_remark.length === 0
                          ? "--"
                          : row.po_log_remark}
                      </div>
                    </div>
                  ),
                }))}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Drawer>
  );
};

export default ViewPOModal;
