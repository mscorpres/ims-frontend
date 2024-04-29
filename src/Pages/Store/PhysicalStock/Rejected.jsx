import { useEffect, useState } from "react";
import useApi from "../../../hooks/useApi.ts";
import { Col, Divider, Flex, Form, Input, Modal, Row, Typography } from "antd";
import {
  getPhysicalStockWithStatus,
  updateAudit,
} from "../../../api/store/physical-stock";
import MyDataTable from "../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";

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
  const actionColumn = {
    headerName: "",
    type: "actions",
    width: 30,
    getActions: ({ row }) => [
      // edit icon
      <GridActionsCellItem
        showInMenu
        // disabled={disabled}
        label={"Update"}
        onClick={() => {
          setSelectedAudit(row);
          setShowUpdateModal(true);
        }}
      />,
    ],
  };
  useEffect(() => {
    handleGetRows();
  }, []);
  return (
    <div style={{ height: "95%", padding: 10 }}>
      <UpdateModal
        open={showUpdateModal}
        hide={hideUpdateModal}
        selectedAudit={selectedAutit}
        updateHandler={handleUpdateAudit}
        loading={loading("submit")}
      />
      <Row style={{ height: "100%" }} justify="center">
        <Col span={20}>
          <MyDataTable
            loading={loading("fetch") || loading("updateStatus")}
            data={rows}
            columns={[actionColumn, ...columns]}
          />
        </Col>
      </Row>
    </div>
  );
};

export default RejectedPhysicalStock;
const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Component",
    minWidth: 120,
    flex: 1,
    field: "component",
  },
  {
    headerName: "Part COde",
    width: 150,
    field: "partCode",
  },
  {
    headerName: "Audit Qty",
    width: 150,
    field: "auditQty",
  },
  {
    headerName: "IMS Qty",
    width: 150,
    field: "imsQty",
  },
  {
    headerName: "Audit Date",
    width: 150,
    field: "auditDate",
  },
  {
    headerName: "Audit By",
    width: 150,
    field: "auditBy",
  },
  {
    headerName: "Remark",
    minWidth: 120,
    flex: 1,
    field: "remark",
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
      okText="Submit"
      confirmLoading={loading}
      onOk={() =>
        updateHandler(
          selectedAudit?.componentKey,
          selectedAudit?.auditKey,
          form.getFieldValue("qty")
        )
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
