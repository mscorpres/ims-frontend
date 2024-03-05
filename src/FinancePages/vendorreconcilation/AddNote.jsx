import { Form, Input, Modal, Row } from "antd";
import React from "react";

const AddNote = ({ form, open, hide, submitHandler, loading }) => {
  return (
    <Modal
      open={open}
      onCancel={hide}
      title="Add Note"
      onOk={submitHandler}
      width={350}
      okText="Add"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item label="Note" name="note">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddNote;

const initialValues = {
  note: "",
};
