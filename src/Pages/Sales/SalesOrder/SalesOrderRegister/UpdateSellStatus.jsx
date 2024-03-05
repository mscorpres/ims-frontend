import { Form, Input, Modal } from "antd/es";
import { useForm } from "rc-field-form";
import React, { useState } from "react";
import MySelect from "../../../../Components/MySelect";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";

function UpdateSellStatus({ open, setOpen, setModalVals, modalVals }) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  console.log("here in modal");
  const statusOptions = [
    { value: "A", text: "Approve" },
    { value: "R", text: "Reject" },
  ];
  const resetForm = () => {
    form.resetField();
  };
  // log
  const setStatus = async (modalVals) => {
    const values = await form.validateFields();

    const payload = {
      sell_req_id: modalVals.sell_req_id,
      status: values.status,
      comment: values.comment,
    };

    const response = await imsAxios.post("/sellRequest/updateStatus", payload);
    setLoading(true);
    console.log("respoomse", response);
    const { data } = response;
    if (data.code === 200) {
      toast.success(data.message);

      setLoading(false);
      setOpen(false);
    } else {
      toast.error(data.message.msg);

      setLoading(false);
    }
    resetForm();
  };
  return (
    <div>
      <Modal
        title="Update Status"
        open={open}
        onOk={() => setStatus(modalVals)}
        onCancel={() => setOpen(false)}
        okText="Set Status"
        cancelText="Back"
        loading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="status" label="Status">
            <MySelect options={statusOptions} placeholder="Select Status" />
          </Form.Item>
          <Form.Item name="comment" label="Comment">
            <Input.TextArea rows={3} placeholder="Type here" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
// 
export default UpdateSellStatus;
