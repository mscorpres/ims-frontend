import React, { useEffect, useState } from "react";
import { Form, InputNumber, Modal, Input } from "antd";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";

const { TextArea } = Input;

export default function RaisePprQtyRequestModal({
  open,
  onClose,
  pprNo,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({ add_qty: null, remark: "" });
  }, [open, form]);

  const submit = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const { data } = await imsAxios.post("/ppr/raisePprQtyRequest", {
        ppr_no: pprNo,
        add_qty: values.add_qty,
        remark: values.remark || "",
      });
      if (data?.code === 200) {
        toast.success(data?.message || "Request raised");
        onClose?.();
        onSuccess?.();
      } else {
        toast.error(data?.message?.msg || data?.message || "Failed to raise request");
      }
    } catch {
      toast.error("Error raising request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Raise Qty Increase Request${pprNo ? ` - ${pprNo}` : ""}`}
      open={open}
      onCancel={onClose}
      onOk={submit}
      okButtonProps={{ loading }}
      okText="Raise Request"
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          label="Add Qty"
          name="add_qty"
          rules={[{ required: true, message: "Enter add qty" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Remark" name="remark">
          <TextArea rows={3} placeholder="Optional remark" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

