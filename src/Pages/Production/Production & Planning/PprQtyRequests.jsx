import React, { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Input, Modal, Row, Space } from "antd";
import { toast } from "react-toastify";
import MyDataTable from "../../../Components/MyDataTable";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../axiosInterceptor";

const decisionOptions = [
  { text: "APPROVE", value: "APPROVE" },
  { text: "REJECT", value: "REJECT" },
];

export default function PprQtyRequests() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    ppr_no: "",
    project_id: "",
    status: "PENDING",
    dateRange: "",
  });

  const [decideModal, setDecideModal] = useState(null); // { log_id, decision, remark }

  const getLogId = (row) =>
    row?.id ??
    row?.log_id ??
    row?.logId ??
    row?.id_pk ??
    row?.request_id ??
    row?.qty_log_id ??
    null;

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
      {
        headerName: "PPR No",
        field: "ppr_no",
        width: 150,
        renderCell: ({ row }) => (
          <ToolTipEllipses text={row.ppr_no} copy={true} />
        ),
      },
      { headerName: "Project", field: "project_id", width: 170 },
      { headerName: "Old Qty", field: "old_planned_qty", width: 100 },
      { headerName: "Add Qty", field: "requested_add_qty", width: 100 },
      { headerName: "Preview/Final Qty", field: "final_planned_qty", width: 130 },
      { headerName: "Requested By", field: "requested_by", width: 150 },
      { headerName: "Requested At", field: "requested_at", width: 160 },
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
      {
        headerName: "Actions",
        field: "actions",
        width: 120,
        sortable: false,
        renderCell: ({ row }) => (
          <Space>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                const logId = getLogId(row);
                if (!logId) {
                  toast.error("Log id missing in this row");
                  return;
                }
                setDecideModal({
                  log_id: logId,
                  decision: "APPROVE",
                  remark: "",
                });
              }}
            >
              Approve
            </Button>
            <Button
              size="small"
              danger
              onClick={() => {
                const logId = getLogId(row);
                if (!logId) {
                  toast.error("Log id missing in this row");
                  return;
                }
                setDecideModal({
                  log_id: logId,
                  decision: "REJECT",
                  remark: "",
                });
              }}
            >
              Reject
            </Button>
          </Space>
        ),
      },
    ],
    [],
  );

  const fetchRows = async () => {
    setLoading(true);
    setRows([]);
    try {
      const payload = {};
      if (filters.ppr_no) payload.ppr_no = filters.ppr_no;
      if (filters.project_id) payload.project_id = filters.project_id;
      if (filters.status) payload.status = filters.status;
      if (filters.dateRange && typeof filters.dateRange === "string") {
        payload.from_date = filters.dateRange.substring(0, 10);
        payload.to_date = filters.dateRange.substring(11, 21);
      }
      const { data } = await imsAxios.post("/ppr/fetchPprQtyLogs", payload);
      if (data?.code === 200) {
        const arr = (data?.data || data?.response?.data || []).map((r, idx) => ({
          id: idx + 1, // grid serial
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
      } else {
        toast.error(data?.message?.msg || data?.message || "Failed to fetch");
      }
    } catch {
      toast.error("Error fetching requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decide = async () => {
    if (!decideModal?.log_id) return;
    setLoading(true);
    try {
      const { data } = await imsAxios.post("/ppr/decidePprQtyRequest", {
        log_id: decideModal.log_id,
        decision: decideModal.decision,
        remark: decideModal.remark || "",
      });
      if (data?.code === 200) {
        toast.success(data?.message || "Decision saved");
        setDecideModal(null);
        await fetchRows();
      } else {
        toast.error(data?.message?.msg || data?.message || "Failed to decide");
      }
    } catch {
      toast.error("Error updating decision");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "90%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "0 10px", paddingBottom: 8 }}>
        <Card size="small" bodyStyle={{ padding: 10 }}>
          <Row gutter={[8, 8]} align="middle">
            <Col xs={24} sm={12} md={6} lg={4}>
              <MySelect
                options={[
                  { text: "PENDING", value: "PENDING" },
                  { text: "APPROVED", value: "APPROVED" },
                  { text: "REJECTED", value: "REJECTED" },
                  { text: "APPLIED", value: "APPLIED" },
                  { text: "All", value: "" },
                ]}
                value={filters.status}
                onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Input
                placeholder="PPR No"
                value={filters.ppr_no}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, ppr_no: e.target.value }))
                }
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={5}>
              <Input
                placeholder="Project ID"
                value={filters.project_id}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, project_id: e.target.value }))
                }
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={7}>
              <MyDatePicker
                value={filters.dateRange}
                setDateRange={(v) =>
                  setFilters((p) => ({ ...p, dateRange: v }))
                }
              />
            </Col>
            <Col xs={24} md={6} lg={4} style={{ display: "flex", gap: 8 }}>
              <Button type="primary" onClick={fetchRows} loading={loading} block>
                Fetch
              </Button>
            </Col>
          </Row>
        </Card>
      </div>
      <div style={{ flex: 1, padding: "0 10px" }}>
        <MyDataTable columns={columns} data={rows} loading={loading} />
      </div>

      <Modal
        title={`Decide Request - Log ${decideModal?.log_id ?? ""}`}
        open={!!decideModal}
        onCancel={() => setDecideModal(null)}
        onOk={decide}
        okButtonProps={{ loading }}
        okText="Submit"
      >
        <Row gutter={8}>
          <Col span={24} style={{ marginBottom: 8 }}>
            <MySelect
              options={decisionOptions}
              value={decideModal?.decision}
              onChange={(v) =>
                setDecideModal((p) => ({ ...(p || {}), decision: v }))
              }
            />
          </Col>
          <Col span={24}>
            <Input.TextArea
              rows={3}
              placeholder="Remark (optional)"
              value={decideModal?.remark}
              onChange={(e) =>
                setDecideModal((p) => ({ ...(p || {}), remark: e.target.value }))
              }
            />
          </Col>
        </Row>
      </Modal>
    </div>
  );
}

