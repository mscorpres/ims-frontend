import { useEffect, useState } from "react";
import useApi from "../../../hooks/useApi.ts";
import { Col, Divider, Flex, Form, Input, Modal, Row, Typography } from "antd";
import {
  getPhysicalStockWithStatus,
  updateAudit,
} from "../../../api/store/physical-stock";
import { Box } from "@mui/system";
import { Edit } from "@mui/icons-material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { IconButton, LinearProgress, Tooltip } from "@mui/material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback.jsx";
import CustomButton from "../../../new/components/reuseable/CustomButton.jsx";

const RejectedPhysicalStock = () => {
  const [rows, setRows] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedAutit, setSelectedAudit] = useState(null);
  const { executeFun, loading } = useApi();

  const handleGetRows = async () => {
    const response = await executeFun(
      () => getPhysicalStockWithStatus("reject"),
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

  const hideUpdateModal = () => {
    setSelectedAudit(null);
    setShowUpdateModal(null);
  };

  const handleUpdateAudit = async (componentKey, auditKey, qty) => {
    const response = await executeFun(
      () => updateAudit(componentKey, auditKey, qty),
      "submit"
    );

    if (response.success) {
      hideUpdateModal();
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
            onClick={() => {
              setSelectedAudit(row?.original);
              setShowUpdateModal(true);
            }}
            color="inherit"
            size="small"
          >
            <Edit fontSize="small" />
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
    <div style={{ padding: 10 }}>
      <UpdateModal
        open={showUpdateModal}
        hide={hideUpdateModal}
        selectedAudit={selectedAutit}
        updateHandler={handleUpdateAudit}
        loading={loading("submit")}
      />

      <MaterialReactTable table={table} />
    </div>
  );
};

export default RejectedPhysicalStock;
const columns = [
  {
    header: "#",
    size: 30,
    accessorKey: "id",
  },
  {
    header: "Component",

    size: 120,
    flex: 1,
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
    flex: 1,
    accessorKey: "remark",
  },
];

const UpdateModal = ({ open, hide, selectedAudit, updateHandler, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (selectedAudit) {
      form.setFieldValue("qty", selectedAudit.auditQty);
    }
  }, [selectedAudit]);
  return (
    <Modal
      size="small"
      title="Update Audit Qty"
      open={open}
      onCancel={hide}
      footer={
        <div>
          <CustomButton
            title={"cancel"}
            size="small"
            variant="text"
            onclick={hide}
            disabled={loading}
          />
          <CustomButton
            title={"submit"}
            size="small"
            loading={loading}
            onclick={() =>
              updateHandler(
                selectedAudit?.componentKey,
                selectedAudit?.auditKey,
                form.getFieldValue("qty")
              )
            }
          />
        </div>
      }
    >
      <Row>
        <Col span={12}>
          <Flex vertical>
            <Typography.Text strong style={{ fontSize: 14 }}>
              Component:
            </Typography.Text>
            <Typography.Text style={{ fontSize: 14 }}>
              {selectedAudit?.component}
            </Typography.Text>
          </Flex>
        </Col>

        <Col span={12}>
          <Flex vertical>
            <Typography.Text strong style={{ fontSize: 14 }}>
              Part Code:
            </Typography.Text>
            <Typography.Text style={{ fontSize: 14 }}>
              {selectedAudit?.partCode}
            </Typography.Text>
          </Flex>
        </Col>
        <Divider />

        <Col span={12}>
          <Flex vertical>
            <Typography.Text strong style={{ fontSize: 14 }}>
              Last Audit Date:
            </Typography.Text>
            <Typography.Text style={{ fontSize: 14 }}>
              {selectedAudit?.auditDate}
            </Typography.Text>
          </Flex>
        </Col>

        <Col span={12}>
          <Flex vertical>
            <Typography.Text strong style={{ fontSize: 14 }}>
              Last Audit By:
            </Typography.Text>
            <Typography.Text style={{ fontSize: 14 }}>
              {selectedAudit?.auditBy}
            </Typography.Text>
          </Flex>
        </Col>
        <Divider />
        <Col span={12}>
          <Flex vertical>
            <Typography.Text strong style={{ fontSize: 14 }}>
              IMS Qty:
            </Typography.Text>
            <Typography.Text style={{ fontSize: 14 }}>
              {selectedAudit?.imsQty}
            </Typography.Text>
          </Flex>
        </Col>
        <Divider />
        <Col span={12}>
          <Flex vertical>
            <Typography.Text strong style={{ fontSize: 14 }}>
              Remarks:
            </Typography.Text>
            <Typography.Text style={{ fontSize: 14 }}>
              {selectedAudit?.remark}
            </Typography.Text>
          </Flex>
        </Col>
        <Divider />

        <Col span={24}>
          <Form form={form} layout="vertical">
            <Form.Item name="qty" label="Updated Qty">
              <Input />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
};
