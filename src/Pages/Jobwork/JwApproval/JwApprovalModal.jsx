import React from "react";
import { Button, Col, Form, Input, Modal, Row } from "antd";

export default function JwApprovalModel({
  open,
  close,
  submitHandler,
  loading,
}) {
  const [poApprovalForm] = Form.useForm();
  const handleSubmit = async () => {
    const values = await poApprovalForm.validateFields();
    submitHandler(open, values.remarks);
  };
  return (
    <Modal
      title="Basic Modal"
      open={open}
      onOk={handleSubmit}
      onCancel={close}
      okText="Submit"
      confirmLoading={loading}
    >
      <Row>
        <Col span={24}>
          <Form form={poApprovalForm} layout="vertical">
            <Form.Item
              label="JW Approve Remarks"
              name="remarks"
              rules={rules.remarks}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
}

// rules
const rules = {
  remarks: [
    {
      required: true,
      message: "Please enter remarks",
    },
  ],
};
