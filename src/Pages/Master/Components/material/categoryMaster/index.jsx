import { useState, useEffect } from "react";
import { imsAxios } from "../../../../../axiosInterceptor";
import { toast } from "react-toastify";
import {
  Col,
  Collapse,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Row,
  Skeleton,
  Typography,
} from "antd";
import MyButton from "../../../../../Components/MyButton";
import Loading from "../../../../../Components/Loading";

const CategoryMaster = () => {
  const [loading, setLoading] = useState("fetch");
  const [fields, setFields] = useState([]);
  const [fields1, setFields1] = useState([]);
  const [fieldSelectOptions, setFieldSelectOptions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const getCategoryFields = async () => {
    try {
      setLoading("fetch");
      setFields1([]);
      const response = await imsAxios.get("/mfgcategory/getAttributes");
      setLoading(false);
      const { data } = response;

      if (data) {
        if (data.code === 200) {
          const arr = data.message
            .filter((row) => row.inp_type === "select")
            .map((row) => ({
              label: row.text,
              name: row.id,
              type: row.inp_type,
              isAddable: row.isAddable === "true",
              regex: row.regex,
              componentType: row.componentType,
            }));
          setFields(arr);
          console.log("fields arr", arr);

          const set = new Set();
          arr.map((row) => {
            set.add(row.componentType);
          });

          console.log("set is", set);
          set.forEach((row) => {
            const foundArr = arr.filter(
              (fieldRow) => fieldRow.componentType === row
            );
            console.log("found arr", foundArr);
            setFields1((curr) => [
              ...curr,
              {
                label: row,
                key: row,
                fields: foundArr,
              },
            ]);
          });
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  console.log("field select options", fieldSelectOptions);
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
      setLoading("fetch");
      setFieldSelectOptions([]);
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
    <Row style={{ height: "95%", padding: 10, paddingBottom: 50 }}>
      {loading === "fetch" && <Loading />}
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
      <Col span={24} style={{ height: "100%", marginBottom: 100 }}>
        {/* <Row gutter={[6, 10]}>
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
                      {field.isAddable && (
                        <MyButton
                          onClick={() => setShowAddModal(field)}
                          variant="add"
                          type="link"
                        />
                      )}
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          ))}
        </Row> */}
        <Collapse
          items={fields1.map((row) => {
            return {
              ...row,
              children: (
                <Row gutter={[6, 10]}>
                  {row.fields.map((field, index) => (
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
                            {fieldSelectOptions
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

                            <Col>
                              {field.isAddable && (
                                <MyButton
                                  onClick={() => setShowAddModal(field)}
                                  variant="add"
                                  type="link"
                                />
                              )}
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Col>
                  ))}
                </Row>
              ),
            };
          })}
          style={{ maxHeight: "90%", overflow: "auto" }}
        />
      </Col>
      <AddOptionModal
        fields1={fields1}
        getSingleFieldSelectOptions={getSingleFieldSelectOptions}
        show={showAddModal}
        hide={() => setShowAddModal(false)}
        fieldSelectOptions={fieldSelectOptions}
        getCategoryFields={getCategoryFields}
      />
    </Row>
  );
};

export default CategoryMaster;

const AddOptionModal = ({
  show,
  hide,
  getSingleFieldSelectOptions,
  fields1,
  fieldSelectOptions,
  getCategoryFields,
}) => {
  const [loading, setLoading] = useState(false);

  const validateHander = async () => {
    const values = await form.validateFields();

    let newValue;

    if (
      show.name === "89768575" ||
      show.name === "7876567" ||
      show.name === "453940492"
    ) {
      const found = fieldSelectOptions.find((row) => row.name === show.name);
      console.log("found", found);
      const lastValue = found.options[found.options.length - 1];

      newValue = +lastValue.value + 1;
      if (show.name === "7876567") {
        newValue = newValue.toString().padStart(2, "0");
      }

      console.log("new value", newValue);
    } else if (show.name === "434092") {
      newValue = values.input1 + "*" + values.input2;
    }

    const payload = {
      attribute: show.name,
      value: values.label,
      code: newValue,
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
          getCategoryFields();
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
  console.log("this is show", show);
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
        {show.name === "434092" && (
          <Flex align="center" justify="center" gap={10}>
            <Form.Item name="input1" label="Length">
              <InputNumber />
            </Form.Item>
            *
            <Form.Item name="input2" label="Width">
              <InputNumber />
            </Form.Item>
          </Flex>
        )}
        {show.name !== "434092" && (
          <>
            {" "}
            <Form.Item
              name="label"
              label="Label"
              rules={
                show.regex && [
                  {
                    required: true,
                    // type: "regexp",
                    pattern:
                      /^([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[Ee]([+-]?\d+))?\*([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[Ee]([+-]?\d+))?$/,
                    // pattern: new RegExp("/\\d+(\\.\\d+)?\\*\\d+(\\.\\d+)?/g"),
                    message: "Wrong format!",
                  },
                ]
              }
            >
              <Input />
            </Form.Item>
          </>
        )}

        {/* <Form.Item name="code" label="Code">
          <Input />
        </Form.Item> */}
      </Form>
    </Modal>
  );
};

const initialValues = {
  code: "",
  label: "",
};
