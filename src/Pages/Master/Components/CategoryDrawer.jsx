import { Card, Col, Drawer, Form, Input, Row, Typography } from "antd";
import React from "react";
import MyButton from "../../../Components/MyButton";
import { useLocation, useParams } from "react-router";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import MySelect from "../../../Components/MySelect";

export default function CategoryDrawer({ show, hide }) {
  const location = useLocation();
  const params = useParams();
  const [fields, setFields] = useState([]);
  const [uniqueId, setUniqueId] = useState("");
  const [fieldSelectOptions, setFieldSelectOptions] = useState([]);
  const [form] = Form.useForm();

  const getCategoryFields = async () => {
    try {
      const response = await imsAxios.get("/mfgcategory/getAttributes");
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.message.map((row) => ({
            label: row.text,
            name: row.id,
            type: row.inp_type,
          }));
          console.log("here are the fields", arr);
          setFields(arr);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {}
  };

  const getieldSelectOptions = async (fields) => {
    try {
      let optionsArr = [];
      const arr = await fields.map(async (row) => {
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
                value: row.attr_value,
              })),
            },
          ]);
        }
      });
    } catch (error) {}
  };

  const getFieldValues = async () => {
    try {
      const response = await imsAxios.post("/mfgcategory/getRmCategoryData", {
        component: params.componentKey,
      });
      const { data } = response;

      if (data) {
        if (data.code === 200) {
          let finalObj = {};
          setUniqueId(data.inputs.rm_cat_code);
          for (var key in data.inputs) {
            if (data.inputs[key].id) {
              finalObj[data.inputs[key].id] = data.inputs[key].name;
            }
          }

          form.setFieldsValue(finalObj);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {}
  };
  useEffect(() => {
    if (fields) {
      getieldSelectOptions(fields);
    }
  }, [fields]);
  useEffect(() => {
    if (show) {
      console.log("this is params", params);
      getCategoryFields();
      getFieldValues();
    }
  }, [show]);
  return (
    <Drawer
      title="Category Details"
      placement="right"
      onClose={hide}
      width={400}
      open={show}
      extra={
        <Link to={`${location.pathname}/category`} target="_blank">
          <MyButton variant="edit" />
        </Link>
      }
    >
      <Form form={form} layout="vertical">
        <Row gutter={[6, 6]}>
          <Col span={24}>
            <Typography.Text strong>Unique Id : </Typography.Text>
            <Typography.Text>{uniqueId}</Typography.Text>
          </Col>
          {fields.map((row) => (
            <Col span={12}>
              {row.type === "select" && (
                <Form.Item name={row.name} label={row.label}>
                  <MySelect
                    options={
                      fieldSelectOptions.filter(
                        (field) => field.name === row.name
                      )[0]?.options ?? []
                    }
                  />
                </Form.Item>
              )}
              {row.type === "text" && (
                <Form.Item name={row.name} label={row.label}>
                  <Input />
                </Form.Item>
              )}
            </Col>
          ))}
          {/* <Col span={24}>
          <Typography.Text strong>Category: </Typography.Text>
          <Typography.Text>{show?.name} </Typography.Text>
        </Col>
        <Col span={24}>
          <Typography.Text strong>Category Code: </Typography.Text>
          <Typography.Text>{show?.code} </Typography.Text>
        </Col>
        <Col span={24}>
          <Card size="small">
            <Row>
              {show?.fields?.map((row) => (
                <Col span={12}>
                  <Typography.Text strong>{row.label}</Typography.Text>
                  <br />
                  <Typography.Text>{row.value}</Typography.Text>
                </Col>
              ))}
            </Row>
          </Card>
        </Col> */}
        </Row>
      </Form>
    </Drawer>
  );
}
