import React, { useState } from "react";
import {
  Button,
  Drawer,
  Input,
  Space,
  Spin,
  Table,
  Typography,
  Upload,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";

const SAMPLE_URL =
  " https://oakter.prod.mscorpres.com/uploads/samples/Sample-GodownTransfer.csv";

function mapUploadItem(item, index) {
  const label =
    item.name && item.partCode
      ? `[${item.partCode}] ${item.name}`
      : item.name || item.partCode || item.key || "";
  return {
    id: index + 1,
    componentKey: item.key || "",
    componentLabel: label,
    partCode: item.partCode || "",
    name: item.name || "",
    qty: item.transferQty ?? item.qty ?? "",
    comment: item.remark ?? item.comment ?? "",
    project: item.project ?? "",
    available_qty: item.available_qty ?? 0,
    avr_rate: item.avr_rate ?? "0",
    unit: item.unit ?? "",
  };
}

function BulkSfToRejTransferDrawer({
  open,
  onClose,
  pickLocation,
  dropLocation,
  projectId,
  pprId,
  onTransferSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const reset = () => setRows([]);

  const handleClose = () => {
    reset();
    onClose?.();
  };

  const updateRow = (index, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeRow = (index) => {
    setRows((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((r, i) => ({ ...r, id: i + 1 }))
    );
  };

  const handleDownloadSample = (e) => {
    e.preventDefault();
    const link = document.createElement("a");
    link.href = SAMPLE_URL;
    link.download = "Sample-GodownTransfer.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const beforeUpload = async (file) => {
    if (!pickLocation) {
      toast.error("Select a Pick Location on the main screen first");
      return Upload.LIST_IGNORE;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading("upload");
    try {
      const response = await imsAxios.post(
        `/godown/validate/csv?type=sf-sf&pickLocation=${pickLocation}`,
        formData
      );

      if (!(response?.success || response?.status === "success")) {
        toast.error(
          response?.message ||
            response?.data?.message ||
            "Upload failed"
        );
        return Upload.LIST_IGNORE;
      }

      const data = response?.data;
      if (!Array.isArray(data) || !data.length) {
        toast.error("No rows returned from upload. Check file format.");
        return Upload.LIST_IGNORE;
      }

      setRows(data.map(mapUploadItem));
      toast.success(response.message || "File uploaded — review and transfer.");
    } catch {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
    return Upload.LIST_IGNORE;
  };

  const submitTransfer = async () => {
    if (!pickLocation) {
      toast.error("Select a Pick Location first");
      return;
    }
    if (!dropLocation) {
      toast.error("Select a Drop Location first");
      return;
    }
    if (!rows.length) {
      toast.error("Nothing to transfer");
      return;
    }

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.componentKey) {
        toast.error(`Row ${i + 1}: Missing component`);
        return;
      }
      if (!String(r.qty ?? "").trim()) {
        toast.error(`Row ${i + 1}: Enter transfer quantity`);
        return;
      }
      if (dropLocation === pickLocation) {
        toast.error(`Row ${i + 1}: Pick and drop location cannot be the same`);
        return;
      }
    }

    const payload = {
      pickLocation,
      component: rows.map((r) => r.componentKey),
      remark: rows.map((r) => r.comment || ""),
      qty: rows.map((r) => r.qty),
      type: "SF2REJ",
      dropLocation,
      project_id: projectId || null,
      ppr_id: pprId || null,
      projectsIds: rows.map((r) => r.project || ""),
    };

    setLoading("save");
    try {
      const response = await imsAxios.post("/godown/transferSF2REJ", payload);
      if (response?.success) {
        toast.success(response.message || "Transfer successful");
        onTransferSuccess?.();
        handleClose();
      } else {
        toast.error(response?.message || "Transfer failed");
      }
    } catch {
      toast.error("Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Component / Part",
      dataIndex: "componentLabel",
      key: "component",
      width: 220,
      ellipsis: true,
    },
    {
      title: "Project",
      dataIndex: "project",
      key: "project",
      width: 100,
      render: (v) => v || "-",
    },
    {
      title: "In Stock",
      key: "stock",
      width: 110,
      render: (_, r) =>
        r.available_qty
          ? `${r.available_qty} ${r.unit || ""}`.trim()
          : "0",
    },
    {
      title: "Transfer Qty",
      dataIndex: "qty",
      key: "qty",
      width: 120,
      render: (v, _r, index) => (
        <Input
          type="number"
          value={v}
          onChange={(e) => updateRow(index, "qty", e.target.value)}
        />
      ),
    },
    {
      title: "Avg Rate",
      dataIndex: "avr_rate",
      key: "rate",
      width: 90,
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      width: 180,
      render: (v, _r, index) => (
        <Input.TextArea
          rows={1}
          value={v}
          onChange={(e) => updateRow(index, "comment", e.target.value)}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 70,
      render: (_, _r, index) => (
        <Button
          danger
          size="small"
          disabled={rows.length <= 1}
          onClick={() => removeRow(index)}
        >
          Remove
        </Button>
      ),
    },
  ];

  const missingLocations = !pickLocation || !dropLocation;

  return (
    <Drawer
      title="Bulk transfer (SF to REJ)"
      width={Math.min(
        1100,
        typeof window !== "undefined" ? window.innerWidth - 40 : 1100
      )}
      open={open}
      onClose={handleClose}
      destroyOnClose
      extra={
        <Space>
          <Button type="link" onClick={handleDownloadSample}>
            Sample File
          </Button>
          {rows.length > 0 && (
            <Button onClick={reset} disabled={!!loading}>
              Upload another file
            </Button>
          )}
          <Button onClick={handleClose}>Close</Button>
          {rows.length > 0 && (
            <Button
              type="primary"
              loading={loading === "save"}
              onClick={submitTransfer}
            >
              Transfer
            </Button>
          )}
        </Space>
      }
    >
      {missingLocations && (
        <Typography.Paragraph type="warning" style={{ marginBottom: 12 }}>
          Select Pick Location and Drop Location on the main screen before
          uploading or transferring.
        </Typography.Paragraph>
      )}

      {rows.length === 0 ? (
        <>
          <Typography.Paragraph type="secondary">
            Upload the bulk template (Excel/CSV) for SF to REJ transfer. After
            upload, review quantities and comments, fix any issues, then click
            Transfer.
          </Typography.Paragraph>
          <Spin spinning={loading === "upload"}>
            <Upload.Dragger
              name="file"
              multiple={false}
              maxCount={1}
              showUploadList={false}
              beforeUpload={beforeUpload}
              accept=".xlsx,.xls,.csv"
              disabled={!pickLocation}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file here</p>
              <p className="ant-upload-hint">
                {pickLocation
                  ? "Single file — preview opens after upload."
                  : "Pick Location required before upload."}
              </p>
            </Upload.Dragger>
          </Spin>
          <div style={{ marginTop: 12, textAlign: "right" }}>
            <Button type="link" onClick={handleDownloadSample}>
              Download sample file
            </Button>
          </div>
        </>
      ) : (
        <Table
          size="small"
          rowKey="id"
          loading={loading === "save"}
          columns={columns}
          dataSource={rows}
          scroll={{ x: 1000, y: 480 }}
          pagination={false}
        />
      )}
    </Drawer>
  );
}

export default BulkSfToRejTransferDrawer;
