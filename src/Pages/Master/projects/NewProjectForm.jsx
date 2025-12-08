import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Row,
} from "antd";
import { useState } from "react";
import CreateSubmitConfirmModal from "./CreateSubmitConfirmModal";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import MyButton from "../../../Components/MyButton";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { getBomOptions, getCostCentresOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import useApi from "../../../hooks/useApi.ts";

export default function NewProjectForm() {
  const [submitConfirm, setSubmitConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newProjectForm] = Form.useForm();
  const [asyncOptions, setAsyncOptions] = useState([]);

  const { executeFun } = useApi();

  const getCostCenteres = async (search) => {
    const response = await executeFun(
      () => getCostCentresOptions(search),
      "select"
    );
    let arr = [];
    if (response.success) arr = convertSelectOptions(response.data);
    setAsyncOptions(arr);
  };
  const getBom = async (search) => {
    const response = await executeFun(
      () => getBomOptions(search),
      "select"
    );
    let arr = [];
    if (response.success) arr = convertSelectOptions(response.data);
    setAsyncOptions(arr);
  };

  const validateData = (values) => {
    setSubmitConfirm(values);
  };
  const submitHandler = async () => {
    setLoading("submit");
    const response = await imsAxios.post("/backend/projectSave", submitConfirm);
    setLoading(false);
    setSubmitConfirm(false);

      if (response?.success) {
        toast.success(response.message);
        resetHandler();
      } else {
        toast.error(response.message);
      }

  };
  const resetHandler = () => {
    let obj = {
      project_id: "",
      project_name: "",
      project_description: "",
      costcenter: "",
      qty: "",
      bom: "",
    };
    newProjectForm.setFieldsValue(obj);
    setAsyncOptions([]);
  };
  return (
    <Form
      name="edit-project"
      layout="vertical"
      form={newProjectForm}
      onFinish={validateData}
    >
      <CreateSubmitConfirmModal
        showSubmitConfirm={submitConfirm}
        setShowSubmitConfirm={setSubmitConfirm}
        submitHandler={submitHandler}
        loading={loading === "submit"}
        action="Create"
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
                <Input />
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
                    message: "Please Enter a new Project Name!",
                  },
                ]}
                name="project_name"
                label="Project Name"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="costcenter"
                label="Cost Center"
                rules={[
                  {
                    required: true,
                    message: "Please Select a Cost Center!",
                  },
                ]}
              >
                <MyAsyncSelect
                  onBlur={() => setAsyncOptions([])}
                  optionsState={asyncOptions}
                  loadOptions={getCostCenteres}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="bom"
                label="BOM"
              >
                <MyAsyncSelect
                  onBlur={() => setAsyncOptions([])}
                  optionsState={asyncOptions}
                  loadOptions={getBom}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="qty"
                label="Quantity"
              >
                <Input />
              </Form.Item>
            </Col>
            {/* <Col span={24}>
              <Form.Item
                // rules={[
                //   {
                //     required: true,
                //     message: "Please Enter a new Project Name!",
                //   },
                // ]}
                name="project_description"
                label="Description"
              >
                <Input />
              </Form.Item>
            </Col> */}
          </Row>
        </Col>
      </Row>
      <Divider />
      <Row>
        <Col span={22}>
          <Row justify="end">
            <MyButton type="primary" htmlType="submit" variant="add">
              Submit
            </MyButton>
          </Row>
        </Col>
      </Row>
    </Form>
  );
}
