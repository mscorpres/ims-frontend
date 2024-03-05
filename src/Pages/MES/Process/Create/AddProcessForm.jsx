import { Button, Card, Form, Input, Row, Space } from "antd";
import React from "react";
import { processApi } from "../../api";
import { toast } from "react-toastify";

const AddProcessForm = ({ loading, setLoading, getRows }) => {
  const [addProcessForm] = Form.useForm();

  const submitHandler = async () => {
    setLoading("submit");
    const values = await addProcessForm.validateFields();
    const { data, error, success, message } = processApi.createProcess(values);
    setLoading(false);
    if (success) {
      getRows();
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <Card size="small" title="Add Process">
      <Form layout="vertical" form={addProcessForm}>
        <Form.Item name="name" label="Name" rules={rules.name}>
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={rules.description}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
      <Row justify="end">
        <Space>
          <Button loading={loading === "submit"}>Reset</Button>
          <Button
            loading={loading === "submit"}
            type="primary"
            onClick={submitHandler}
          >
            Submit
          </Button>
        </Space>
      </Row>
    </Card>
  );
};

export default AddProcessForm;

const rules = {
  name: [
    {
      required: true,
      message: "Please enter a process name",
    },
  ],
  description: [
    {
      required: true,
      message: "Please enter a process description",
    },
  ],
};
