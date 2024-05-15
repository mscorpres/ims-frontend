import { createDepartment } from "@/api/production/mis";
import useApi from "@/hooks/useApi";
import { Form, Input, Modal } from "antd";

interface ModalProps {
  show: boolean;
  hide: () => void;
}

const AddDepartmentModal = ({ show, hide }: ModalProps) => {
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const handleCreateDepartment = async () => {
    const values = await form.validateFields();

    const response = await executeFun(
      () => createDepartment(values.name),
      "submit"
    );
    if (response.success) {
      hide();
    }
  };
  return (
    <Modal
      open={show}
      onCancel={hide}
      title="Add Department"
      width={400}
      okText="Add"
      onOk={handleCreateDepartment}
      confirmLoading={loading("submit")}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Department Name">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDepartmentModal;
