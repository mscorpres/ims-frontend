import {
  getPendingApprovalList,
  updateApprovalStatus,
} from "@/api/master/component";
import useApi from "@/hooks/useApi";
import ApprovalList from "@/Pages/Master/Components/material/approval/list";
import { ModalType } from "@/types/general";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Col, Form, Input, Modal, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";

type Props = {};

const ComponentApproval = ({ getRows }: Props) => {
  const [rows, setRows] = useState([{ id: "1" }]);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [showApproveModal, setShowApproveModal] = useState<
    false | "approve" | "reject"
  >(false);
  const { executeFun, loading } = useApi();

  const handleFetchList = async () => {
    const response = await executeFun(() => getPendingApprovalList(), "fetch");
    setRows(response.data);
  };

  const handleSubmit = async (remarks: string) => {
    console.log("selected component", selectedComponent);
    const key = selectedComponent.key;
    const type = showApproveModal;

    if (type && key && remarks) {
      const response = await executeFun(
        () => updateApprovalStatus(key, type, remarks),
        "submit"
      );
      if (response.success) {
        setSelectedComponent(null);
        setShowApproveModal(false);
        handleFetchList();
      }
    }
  };
  useEffect(() => {
    handleFetchList();
  }, []);
  return (
    <Row style={{ height: "95%", padding: 10 }} justify="center">
      <ApproveModal
        show={showApproveModal === "approve" || showApproveModal === "reject"}
        hide={() => {
          setSelectedComponent(null);
          setShowApproveModal(false);
        }}
        type={showApproveModal !== false ? showApproveModal : undefined}
        loading={loading("submit")}
        submitHandler={handleSubmit}
      />
      <Col span={20}>
        <ApprovalList
          setSelectedComponent={setSelectedComponent}
          setShowApproveModal={setShowApproveModal}
          rows={rows}
          loading={loading("fetch")}
        />
      </Col>
    </Row>
  );
};

export default ComponentApproval;

interface ApproveModalType extends ModalType {
  type?: "approve" | "reject";
}

const ApproveModal = ({
  hide,
  show,
  loading,
  submitHandler,
  type,
}: ApproveModalType) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const values = await form.validateFields();
    console.log("values are", values);
    if (values) {
      submitHandler(values.remarks);
    }
  };

  useEffect(() => {
    if (!show) {
      form.setFieldValue("remarks", undefined);
    }
  }, [show]);
  return (
    <Modal
      open={show}
      onCancel={hide}
      okText={type === "reject" ? "Reject" : "Approve"}
      okButtonProps={{
        danger: type === "reject",
      }}
      confirmLoading={loading}
      onOk={handleSubmit}
    >
      <Typography.Text strong>
        Are you sure you want to {type} this component?
      </Typography.Text>
      <Form form={form} layout="vertical" style={{ marginTop: 15 }}>
        <Form.Item
          name="remarks"
          label="Remarks"
          rules={[{ required: true, message: "Remarks are required!!" }]}
        >
          <Input.TextArea rows={3} placeholder="Enter Remarks..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
