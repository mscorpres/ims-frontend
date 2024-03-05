import { Button, Col, Drawer, Form, Input, Modal, Row } from "antd";
import React, { useEffect } from "react";
import { useState } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";

export default function AddProjectModal({
  showAddProjectConfirm,
  setShowAddProjectConfirm,
}) {
  const [addProjectConfirm, setAddProjectConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addProjectForm] = Form.useForm();
  const validateHandler = (values) => {
    console.log("it is woerking");
    setAddProjectConfirm(values);
  };
  // log 
  const submitHandler = async () => {
    setLoading("submit");
    const response = await imsAxios.post("/backend/projectSave", {
      project_name: addProjectConfirm.projectId,
      project_description: addProjectConfirm.projectDescription,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        toast.success(data.message);
        setAddProjectConfirm(false);
        setShowAddProjectConfirm(false);
        resetHandler();
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const resetHandler = () => {
    let obj = {
      projectId: "",
      projectDescription: "",
    };
    addProjectForm.setFieldsValue(obj);
  };
  useEffect(() => {
    resetHandler();
  }, [showAddProjectConfirm]);
  return (
    <Drawer
      title="Add Project"
      placement="right"
      onClose={() => setShowAddProjectConfirm(false)}
      open={showAddProjectConfirm}
    >
      <Modal
        title="Confirm Add Project"
        open={addProjectConfirm}
        onOk={submitHandler}
        confirmLoading={loading === "submit"}
        onCancel={() => setAddProjectConfirm(false)}
      >
        <p>Are you sure you want to add this project?</p>
      </Modal>
      <Row style={{ height: "90%", width: "100%" }}>
        <Form
          style={{ width: "100%" }}
          layout="vertical"
          form={addProjectForm}
          onFinish={validateHandler}
        >
          <Col span={24}>
            <Form.Item
              label="Project Id"
              name="projectId"
              rules={[
                {
                  required: true,
                  message: "Please Enter new projec ID!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Project Description"
              name="projectDescription"
              rules={[
                {
                  required: true,
                  message: "Please Enter new project description!",
                },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Row>
              <Button htmlType="submit" type="primary">
                Submit
              </Button>
            </Row>
          </Col>
        </Form>
      </Row>
    </Drawer>
  );
}
