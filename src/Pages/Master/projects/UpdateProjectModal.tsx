import { useState, useEffect } from "react";
import { Modal, Input, Button, Form, message } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { getBomOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "@/utils/general";
import useApi from "@/hooks/useApi";

const UpdateProjectModal = ({ data, setIsModalVisible, isModalVisible, onUpdate }) => {
  const [form] = Form.useForm();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const { executeFun } = useApi();
  const getBom = async (search) => {
    const response = await executeFun(() => getBomOptions(search), "select");
    let arr = [];
    if (response.success) arr = convertSelectOptions(response.data);
    setAsyncOptions(arr);
  };
  useEffect(() => {
    console.log(data);
    if (data) {
      form.setFieldsValue({
        project: data.project,
        description: data.description,
        qty: data.qty,
        bom: data.bom,
      });
    }
  }, [data]);

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        // Pass updated values to the parent component (CPMMaster)
        onUpdate(values);
      })
      .catch((info) => {
        message.error("Please fill in all required fields.");
      });
  };

  return (
    <Modal
      title="Update Project"
      visible={isModalVisible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Update
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="project" label="Project Id" rules={[{ required: true }]}>
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="description"
          label="Project Description"
          rules={[{ required: true, message: "Please enter the project description" }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="bom" label="BOM">
          <MyAsyncSelect
            onBlur={() => setAsyncOptions([])}
            optionsState={asyncOptions}
            loadOptions={getBom}
          />
        </Form.Item>

        <Form.Item
          name="qty"
          label="Quantity"
          rules={[{ required: true, message: "Please enter the quantity" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateProjectModal;
