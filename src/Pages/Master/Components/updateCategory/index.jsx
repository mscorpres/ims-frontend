import React from "react";
import { useParams } from "react-router-dom";
import { imsAxios } from "../../../../axiosInterceptor";
import { useState } from "react";
import { useCallback } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import {
  Card,
  Col,
  Divider,
  Form,
  Radio,
  Row,
  Space,
  Steps,
  Typography,
} from "antd";
import MyButton from "../../../../Components/MyButton";
import FormField from "./FormField";
import { motion } from "framer-motion";
import { v4 } from "uuid";
import Loading from "../../../../Components/Loading";

const UpdateCategory = () => {
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [categories, setCategories] = useState([]);
  const [existingValues, setExistingValues] = useState(null);
  const [component, setComponent] = useState({
    partCode: null,
    componentName: null,
  });
  const [selectedCategory, setselectedCategory] = useState(null);
  const { componentKey } = useParams();

  const getAllCategories = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.get("/mfgcategory/listCategories");
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row) => ({
            id: row.id,
            category: row.text,
          }));
          setCategories(arr);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getComponentCategory = async (key) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/mfgcategory/editRmCategoryData", {
        component: key,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          setselectedCategory(data.header.category_id);
          setExistingValues(data.inputs);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getComponentDetails = async (component) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/component/getCompNameAndPartNo", {
        component,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          setComponent({
            partCode: data.data.c_part_no,
            componentName: data.data.c_name,
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
  const items = [
    {
      title: "Select Category",
      content: (
        <SelectCategory
          categories={categories}
          selectedCategory={selectedCategory}
          setselectedCategory={setselectedCategory}
          setStage={setStage}
          stage={stage}
        />
      ),
    },
    {
      title: "Enter Details",
      content: (
        <Fields
          selectedCategory={selectedCategory}
          setStage={setStage}
          existingValues={existingValues}
          componentKey={componentKey}
        />
      ),
    },
  ];
  useEffect(() => {
    if (componentKey) {
      getAllCategories();
      getComponentCategory(componentKey);
      getComponentDetails(componentKey);
    }
  }, []);
  useEffect(() => {
    if (stage === 0) {
      setselectedCategory(null);
    }
  }, [stage]);
  useEffect(() => {
    if (selectedCategory) {
      setStage(1);
    }
  }, [selectedCategory]);
  return (
    <Row
      justify="center"
      style={{ height: "90%", position: "relative", marginTop: 150 }}
    >
      {loading && <Loading />}
      <Col span={20}>
        <Steps items={items} current={stage} />
        <Row justify="center" gutter={6} style={{ paddingTop: 10 }}>
          <Col layout span={8}>
            {items[0].content}
          </Col>
          {stage === 1 && (
            <Col layout span={16}>
              {items[1].content}
            </Col>
          )}
        </Row>
        {/* <div style={{ marginTop: 15 }}>{items[stage].content}</div> */}
        {/* </Card> */}
      </Col>
    </Row>
  );
};

export default UpdateCategory;

const SelectCategory = ({
  categories,
  selectedCategory,
  setselectedCategory,
  setStage,
  stage,
}) => {
  return (
    <Row justify={"center"} style={{ maxHeight: "100%" }}>
      <Col span={24}>
        <Card
          title="Select Category"
          size="small"
          style={{ height: 500 }}
          bodyStyle={{ height: "100%" }}
        >
          <Row justify="center" style={{ height: "83%" }}>
            <Col span={10}>
              <Row>
                <Radio.Group
                  disabled={stage === 1}
                  value={selectedCategory}
                  onChange={(e) => {
                    setselectedCategory(e.target.value);
                  }}
                >
                  <Space direction="vertical">
                    {categories.map((cat, index) => (
                      <Radio value={cat.id}>{cat.category}</Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </Row>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

const Fields = ({
  selectedCategory,
  setStage,
  componentKey,
  existingValues,
}) => {
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState([]);

  const [categoryForm] = Form.useForm();
  const getFields = async (category) => {
    try {
      if (!existingValues) {
        setLoading("fetch");
        const response = await imsAxios.post("/mfgcategory/getCategoryData", {
          category: category,
        });
        const { data } = response;
        if (data) {
          if (data.code === 200) {
            const arr = data.data.map((row) => ({
              type: row.inp_type,
              key: row.attr_key,
              label: row.attr_name,
            }));
            setFields(arr);
          } else {
            toast.error(data.message.msg);
          }
        }
      } else {
        let finalObj = {};
        existingValues.map((row) => {
          finalObj[row.attribute] = row.value;
        });
        const arr = existingValues.map((row) => ({
          type: row.type,
          key: row.attribute,
          label: row.attribute_name,
          value: row.value,
        }));

        setFields(arr);

        categoryForm.setFieldsValue(finalObj);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = async () => {
    try {
      const values = await categoryForm.validateFields();
      const keys = [];
      const keyValues = [];
      let url = "";
      if (existingValues) {
        url = "/mfgcategory/updateRmCategoryData";
      } else {
        url = "/mfgcategory/createRmCategory";
      }
      for (const item in values) {
        keys.push(item);
        keyValues.push(values[item]);
      }
      const payload = {
        header: {
          component: componentKey,
          category: selectedCategory,
          category_code: v4(),
        },
        inputs: {
          attr: keys,
          value: keyValues,
        },
      };
      setLoading("submit");
      const response = await imsAxios.post(url, payload);

      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          if (!existingValues) {
            setStage(0);
          }
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory) {
      getFields(selectedCategory);
    }
  }, [selectedCategory]);
  return (
    <Row justify="center">
      <Col span={24}>
        <Card
          title="Enter Details"
          size="small"
          style={{ height: 500 }}
          bodyStyle={{ height: "100%" }}
          extra={
            <Space>
              <MyButton
                disabled={!selectedCategory}
                variant="back"
                onClick={() => setStage(0)}
              />
              <MyButton
                disabled={!selectedCategory}
                variant="submit"
                loading={loading === "submit"}
                onClick={submitHandler}
              />
            </Space>
          }
        >
          <Row justify="center" style={{ height: "83%" }}>
            {loading === "fetch" && <Loading />}
            <Col span={24}>
              <Form layout="vertical" form={categoryForm}>
                <Row gutter={6}>
                  {fields.map((field) => (
                    <Col span={8}>
                      <FormField field={field} />
                    </Col>
                  ))}
                </Row>
              </Form>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};
