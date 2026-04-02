import React, { useEffect, useMemo, useState } from "react";
import { Button, Col, Input, Modal, Row, Space } from "antd";
import { toast } from "react-toastify";
import MyDataTable from "../../../Components/MyDataTable";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";

const statusOptions = [
  { text: "All", value: "" },
  { text: "PENDING", value: "PENDING" },
  { text: "APPROVED", value: "APPROVED" },
  { text: "REJECTED", value: "REJECTED" },
  { text: "APPLIED", value: "APPLIED" },
];

export default function PprQtyLogsModal({
  open,
  onClose,
  initialFilters,
}) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const [filters, setFilters] = useState({
    ppr_no: initialFilters?.ppr_no ?? "",
    project_id: initialFilters?.project_id ?? "",
    status: initialFilters?.status ?? "",
    dateRange: initialFilters?.dateRange ?? "",
  });

  useEffect(() => {
    if (!open) return;
    setFilters((prev) => ({
      ...prev,
      ppr_no: initialFilters?.ppr_no ?? prev.ppr_no ?? "",
      project_id: initialFilters?.project_id ?? prev.project_id ?? "",
      status: initialFilters?.status ?? prev.status ?? "",
      dateRange: initialFilters?.dateRange ?? prev.dateRange ?? "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const columns = useMemo(
    () => [
      { headerName: "#", field: "id", width: 60 },
      {
        headerName: "Log ID",
        field: "log_id",
        width: 90,
        renderCell: ({ row }) => (
          <ToolTipEllipses text={row.log_id} copy={true} />
        ),
      },
      { headerName: "Action", field: "action_type", width: 180 },
      { headerName: "Status", field: "status", width: 120 },
      {
        headerName: "PPR No",
        field: "ppr_no",
        width: 150,
        renderCell: ({ row }) => (
          <ToolTipEllipses text={row.ppr_no} copy={true} />
        ),
      },
      {
        headerName: "Project ID",
        field: "project_id",
        width: 160,
        renderCell: ({ row }) => <ToolTipEllipses text={row.project_id} />,
      },
      { headerName: "Old Qty", field: "old_planned_qty", width: 100 },
      { headerName: "Add Qty", field: "requested_add_qty", width: 100 },
      { headerName: "Final Qty", field: "final_planned_qty", width: 110 },
      { headerName: "Requested By", field: "requested_by", width: 150 },
      { headerName: "Requested At", field: "requested_at", width: 160 },
      { headerName: "Decided By", field: "decided_by", width: 150 },
      { headerName: "Decided At", field: "decided_at", width: 160 },
      {
        headerName: "Remark",
        field: "remark",
        flex: 1,
        minWidth: 220,
        renderCell: ({ row }) => (
          <ToolTipEllipses
            text={
              row.request_remark ??
              row.remark ??
              row.decision_remark ??
              row.decided_remark ??
              "--"
            }
          />
        ),
      },
    ],
    [],
  );

  const fetchLogs = async () => {
    setLoading(true);
    setRows([]);
    try {
      const payload = {};
      if (filters.ppr_no) payload.ppr_no = filters.ppr_no;
      if (filters.project_id) payload.project_id = filters.project_id;
      if (filters.status) payload.status = filters.status;

      if (filters.dateRange && typeof filters.dateRange === "string") {
        // DD-MM-YYYY-DD-MM-YYYY
        payload.from_date = filters.dateRange.substring(0, 10);
        payload.to_date = filters.dateRange.substring(11, 21);
      }

      const { data } = await imsAxios.post("/ppr/fetchPprQtyLogs", payload);
      if (data?.code === 200) {
        const arr = (data?.data || data?.response?.data || []).map((r, idx) => ({
          id: idx + 1,
          log_id:
            r?.id ??
            r?.log_id ??
            r?.logId ??
            r?.id_pk ??
            r?.request_id ??
            r?.qty_log_id ??
            null,
          ...r,
        }));
        setRows(arr);
        if (!arr.length) toast.info("No logs found");
      } else {
        toast.error(data?.message?.msg || data?.message || "Failed to fetch logs");
      }
    } catch (e) {
      toast.error("Error fetching logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal
      title="PPR Qty Change Logs"
      open={open}
      onCancel={onClose}
      footer={null}
      width="90vw"
    >
      <Row gutter={8} style={{ marginBottom: 8 }}>
        <Col span={5}>
          <Input
            placeholder="PPR No (optional)"
            value={filters.ppr_no}
            onChange={(e) =>
              setFilters((p) => ({ ...p, ppr_no: e.target.value }))
            }
          />
        </Col>
        <Col span={5}>
          <Input
            placeholder="Project ID (optional)"
            value={filters.project_id}
            onChange={(e) =>
              setFilters((p) => ({ ...p, project_id: e.target.value }))
            }
          />
        </Col>
        <Col span={4}>
          <MySelect
            options={statusOptions}
            value={filters.status}
            onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
          />
        </Col>
        <Col span={6}>
          <MyDatePicker value={filters.dateRange} setDateRange={(v) => setFilters((p) => ({ ...p, dateRange: v }))} />
        </Col>
        <Col span={4}>
          <Space>
            <Button type="primary" loading={loading} onClick={fetchLogs}>
              Fetch
            </Button>
            <Button
              onClick={() => {
                setFilters({
                  ppr_no: initialFilters?.ppr_no ?? "",
                  project_id: initialFilters?.project_id ?? "",
                  status: "",
                  dateRange: "",
                });
              }}
            >
              Reset
            </Button>
          </Space>
        </Col>
      </Row>
      <div style={{ height: "65vh" }}>
        <MyDataTable columns={columns} data={rows} loading={loading} />
      </div>
    </Modal>
  );
}

