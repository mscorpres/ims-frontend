import { useState, useEffect } from "react";
import { imsAxios } from "../../../../../axiosInterceptor";
import { toast } from "react-toastify";
import {
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Popover,
  Row,
  Skeleton,
  Typography,
} from "antd";
import MyButton from "../../../../../Components/MyButton";

const CategoryMaster = () => {
  const [loading, setLoading] = useState("fetch");
  const [fields, setFields] = useState([]);
  const [fieldSelectOptions, setFieldSelectOptions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const getCategoryFields = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.get("/mfgcategory/getAttributes");
      const { data } = response;

      if (data) {
        if (data.code === 200) {
          const arr = data.message
            .filter((row) => row.inp_type === "select")
            .map((row) => ({
              label: row.text,
              name: row.id,
              type: row.inp_type,
            }));
          setFields(arr);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getieldSelectOptions = async (fields) => {
    try {
      let optionsArr = [];
      await fields.map(async (row) => {
        const response = await imsAxios.post("/mfgcategory/getAttributeValue", {
          attribute: row.name,
        });
        const { data } = response;
        if (data.code === 200) {
          optionsArr.push({ data: data.message });
          setFieldSelectOptions((curr) => [
            ...curr,
            {
              name: row.name,
              options: data.message.map((row) => ({
                text: row.attr_value,
                value: row.code,
              })),
            },
          ]);
        }
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getSingleFieldSelectOptions = async (attributeId) => {
    try {
      let optionsArr = [];
      setLoading(attributeId);

      const response = await imsAxios.post("/mfgcategory/getAttributeValue", {
        attribute: attributeId,
      });
      const { data } = response;
      if (data.code === 200) {
        optionsArr.push({ data: data.message });
        setFieldSelectOptions((curr) => {
          return curr.map((row) => {
            if (row.name === attributeId) {
              const opt = data.message.map((newOpt) => ({
                text: newOpt.attr_value,
                value: newOpt.attr_value,
              }));
              return {
                name: row.name,
                options: opt,
              };
            } else {
              return row;
            }
          });
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategoryFields();
  }, []);

  useEffect(() => {
    if (fields.length > 0) {
      getieldSelectOptions(fields);
    }
  }, [fields]);
  useEffect(() => {
    console.log("fieldSelectOptions", fieldSelectOptions);
  }, [fieldSelectOptions]);
  return (
    <Row style={{ height: "90%", padding: 10 }}>
      <Col span={24}>
        <Row>
          <Col span={24}>
            <Typography.Title level={5}>
              Update Component Master{" "}
            </Typography.Title>
          </Col>
          <Col span={24}>
            <Typography.Text type="secondary" strong>
              Here you can add more options to the component attributes but you
              can not update the existing ones
            </Typography.Text>
          </Col>
        </Row>
      </Col>
      <Divider />
      <Col span={24} style={{ height: "95%" }}>
        <Row gutter={[6, 10]}>
          {fields.map((field, index) => (
            <Col span={24} key={index}>
              <Row gutter={[6, 6]}>
                <Col span={1}>
                  <Typography.Text strong type="secondary">
                    {index + 1}.
                  </Typography.Text>
                </Col>
                <Col span={4}>
                  <Typography.Text
                    strong
                    style={{ textTransform: "capitalize" }}
                  >
                    {field.label.replaceAll("_", " ")}:
                  </Typography.Text>
                </Col>
                <Col span={18}>
                  <Row gutter={16}>
                    {loading !== "fetch" &&
                      loading !== field.name &&
                      fieldSelectOptions
                        .filter((opt) => opt.name === field.name)[0]
                        ?.options.map((opt) => (
                          <Popover
                            content={
                              <Row>
                                <Col span={24}>
                                  <Typography.Text strong>
                                    {opt.value}
                                  </Typography.Text>
                                </Col>
                              </Row>
                            }
                          >
                            <Col
                              style={{
                                background: "#cccccc",
                                padding: "5px 8px",
                                borderRadius: 3,
                                margin: "2px 3px",
                              }}
                            >
                              {opt.text}
                            </Col>
                          </Popover>
                        ))}
                    {(loading === "fetch" || loading === field.name) &&
                      [1, 1, 1, 1].map(() => (
                        <Col>
                          <Skeleton.Button style={{ width: 30 }} active />
                        </Col>
                      ))}
                    <Col>
                      {/* <MyButton
                        onClick={() => setShowAddModal(field)}
                        variant="add"
                        type="link"
                      /> */}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          ))}
        </Row>
      </Col>
      <AddOptionModal
        getSingleFieldSelectOptions={getSingleFieldSelectOptions}
        show={showAddModal}
        hide={() => setShowAddModal(false)}
      />
    </Row>
  );
};

export default CategoryMaster;

const AddOptionModal = ({ show, hide, getSingleFieldSelectOptions }) => {
  const [loading, setLoading] = useState(false);

  const validateHander = async () => {
    const values = await form.validateFields();
    const payload = {
      attribute: show.name,
      value: values.label,
      code: values.code,
    };

    Modal.confirm({
      title: "Adding Attribute Option",
      content:
        "Please check the values you have entered, this action is irreversible",
      onOk: () => submitHandler(payload),
      okText: "Submit",
    });
  };

  const submitHandler = async (payload) => {
    try {
      setLoading("submit");
      const response = await imsAxios.post(
        "/mfgcategory/insertAttributesData",
        payload
      );
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          hide();
          getSingleFieldSelectOptions(payload.attribute);
          form.resetFields();
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const [form] = Form.useForm();

  useEffect(() => {
    if (!show) {
      form.resetFields();
    }
  }, [show]);
  return (
    <Modal
      title="Add Option"
      open={show}
      width={300}
      okText="Add"
      onOk={validateHander}
      //   confirmLoading={confirmLoading}
      onCancel={hide}
    >
      <Form initialValues={initialValues} layout="vertical" form={form}>
        <Row>
          <Typography.Text strong style={{ textTransform: "capitalize" }}>
            Attribute : {show?.label?.replaceAll("_", " ")}
          </Typography.Text>
        </Row>
        <Divider />
        <Form.Item name="label" label="Label">
          <Input />
        </Form.Item>
        <Form.Item name="code" label="Code">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const initialValues = {
  code: "",
  label: "",
};
