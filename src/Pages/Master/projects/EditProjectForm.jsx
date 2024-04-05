import {
  Button,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Row,
  Skeleton,
  Space,
} from "antd";
import { useState } from "react";
import CreateSubmitConfirmModal from "./CreateSubmitConfirmModal";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import { useEffect } from "react";

export default function EditProjectForm({
  editProject,
  setEditProject,
  getAllDetailFun,
}) {
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editProjectForm] = Form.useForm();

  const getDetails = async () => {
    setLoading("fetch");
    const response = await imsAxios.post("/ppr/fetchProjectInfo", {
      project: editProject,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        editProjectForm.setFieldsValue({
          project_id: editProject,
          project_name: data.detail,
        });
      } else {
        toast.error(data.message.msg);
        setEditProject(false);
      }
    }
  };
  const validateData = (values) => {
    let obj = {
      project: values.project_id,
      detail: values.project_name,
    };
    setSubmitConfirm(obj);
  };
  const submitHandler = async () => {
    setLoading("submit");
    const response = await imsAxios.post("/ppr/updatePPRDetail", submitConfirm);
    setLoading(false);
    setSubmitConfirm(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        toast.success(data.message);
        setEditProject(false);
        getAllDetailFun();
      } else {
        toast.error(data.message.msg);
      }
    }
  };

  useEffect(() => {
    if (editProject) {
      getDetails();
    }
  }, [editProject]);
  return (
    <Form
      name="edit-project"
      layout="vertical"
      form={editProjectForm}
      onFinish={validateData}
    >
      <CreateSubmitConfirmModal
        showSubmitConfirm={submitConfirm}
        setShowSubmitConfirm={setSubmitConfirm}
        submitHandler={submitHandler}
        loading={loading === "submit"}
        action="Update"
      />
      <Row gutter={10}>
        <Col span={22}>
          <Row gutter={8}>
            {/* <Col span={24}>
              <Descriptions
                size="small"
                title="CPM ID"
                style={{ fontSize: "1px" }}
              >
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Provide CPM Project ID
                </Descriptions.Item>
              </Descriptions>
            </Col> */}
            <Col span={24}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Please enter a Project ID!",
                  },
                ]}
                label="Project Id"
                name="project_id"
              >
                {loading === "fetch" && (
                  <Skeleton.Input block size="small" active />
                )}
                {loading !== "fetch" && <Input />}
                {/* <MyAsyncSelect
                selectLoading={selectLoading}
                onBlur={() => setAsyncOptions([])}
                loadOptions={getProject}
                optionsState={asyncOptions}
                size="default"
              /> */}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Please Enter a Project Description!",
                  },
                ]}
                name="project_name"
                label="Updated Description"
              >
                {loading === "fetch" && (
                  <Skeleton.Input block size="small" active />
                )}
                {loading !== "fetch" && <Input />}
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col span={22}>
          <Row justify="end">
            <Space>
              <Button onClick={() => setEditProject(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Space>
          </Row>
        </Col>
      </Row>
    </Form>
  );
}
