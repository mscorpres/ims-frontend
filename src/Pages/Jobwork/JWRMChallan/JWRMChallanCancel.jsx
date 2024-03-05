import { Button, Col, Drawer, Form, Input, Modal, Row, Space } from "antd";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import useLoading from "../../../hooks/useLoading";

function JWRMChallanCancel({ showCancel, setShowCancel, getRows }) {
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [loading, setLoading] = useLoading();
  const [jwChallanCancelForm] = Form.useForm();
  const validateHandler = async (values) => {
    const obj = {
      po_id: showCancel.poId,
      challan_id: showCancel.challanId,
      remark: values.reason,
      ref_id: showCancel.ref_id,
    };
    setShowSubmitConfirm(obj);
  };
  const submitHandler = async () => {
    if (showSubmitConfirm) {
      setLoading("fetch", true);
      const response = await imsAxios.post(
        "/jobwork/jwChallanCancel",
        showSubmitConfirm
      );
      setLoading("fetch", false);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          setShowSubmitConfirm(false);
          setShowCancel(false);
          getRows();
        } else {
          toast.error(data.message.msg);
        }
      }
    }
  };
  useEffect(() => {
    if (showCancel) {
      jwChallanCancelForm.setFieldsValue({ reason: "" });
    }
  }, [showCancel]);

  return (
    <Drawer
      title={`Cancelling Jobwork Id: ${showCancel?.poId} | Challan Id: ${showCancel?.challanId}`}
      width="50vw"
      onClose={() => setShowCancel(null)}
      open={showCancel}
    >
      <Modal
        title="Cancel Confirm"
        open={showSubmitConfirm}
        onOk={submitHandler}
        okText="Yes"
        cancelText="No"
        confirmLoading={loading("fetch")}
        onCancel={() => setShowSubmitConfirm(false)}
      >
        <p>Are you sure you want to cancel this Jobwork challan?</p>
      </Modal>
      <Form
        style={{ height: "100%" }}
        onFinish={validateHandler}
        form={jwChallanCancelForm}
        layout="vertical"
      >
        <Row align="stretch" style={{ height: "95%" }}>
          <Col span={24}>
            <Form.Item
              name="reason"
              label="Cancellation Reason"
              rules={[
                { required: true, message: "Please enter Cancelation Reason" },
              ]}
            >
              <Input.TextArea
                rows={6}
                style={{ resize: "none" }}
                placeholder="Please enter Cancelation Reason"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end">
          <Col>
            <Space>
              <Button onClick={() => setShowCancel(false)} htmlType="button">
                Back
              </Button>
              <Button htmlType="submit" type="primary">
                Cancel Challan
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}

export default JWRMChallanCancel;
