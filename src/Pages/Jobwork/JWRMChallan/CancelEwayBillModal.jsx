import { Col, Form, Input, Modal, Row } from "antd";
import React from "react";
import MySelect from "../../../Components/MySelect";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import { useState } from "react";

const CancelEwayBillModal = ({ show, hide }) => {
  //   const [loading, , setLoading] = useState(false);
  const [form] = Form.useForm();

  const validateHandler = async () => {
    const values = await form.validateFields();
    const payload = {
      challan_ID: show?.jwId,
      eway_billno: show?.eWayBill,
      cancelRsnCode: values.type,
      cancelRemark: values.remarks,
    };

    Modal.confirm({
      title: "Confirmation",
      content: "Are you sure you want to cancel this E-Way bill?",
      okText: "Cancel E-Way Bill",
      cancelText: "Back",
      onOk: () => submitHandler(payload),
    });
  };

  const submitHandler = async (payload) => {
    try {
      //   setLoading("submit");
      const response = await imsAxios.post("/jwEwaybill/cancel", payload);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          hide();
          form.resetFields();
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      //   setLoading(false);
    }
  };
  return (
    <Modal
      title="Cancel E-Way Bill"
      open={show}
      onOk={validateHandler}
      okText="Continue"
      // confirmLoading={confirmLoading}
      onCancel={hide}
    >
      <Row gutter={[0, 6]}>
        <Col span={24}>
          Are you sure you want to cancel E-way bill of challan:{" "}
          <strong>{show?.jwId}</strong>
        </Col>
        <Col span={24}>
          <Form layout="vertical" form={form} initialValues={inititalValies}>
            <Form.Item name="type" label="Cancel Reason" rules={rules.type}>
              <MySelect options={reasonOptions} />
            </Form.Item>

            <Form.Item
              name="remarks"
              label="Cancel Remarks"
              rules={rules.remarks}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
};

export default CancelEwayBillModal;

const inititalValies = {
  type: undefined,
  remarks: undefined,
};

const reasonOptions = [
  {
    text: "Duplicate",
    value: "1",
  },
  {
    text: "Order Cancelled",
    value: "2",
  },
  {
    text: "By Mistake",
    value: "3",
  },
  {
    text: "Others",
    value: "4",
  },
];
const rules = {
  type: [
    {
      required: true,
      message: "Please select a reason",
    },
  ],
  remarks: [
    {
      required: true,
      message: "Please provide cancel remarks",
    },
  ],
};
