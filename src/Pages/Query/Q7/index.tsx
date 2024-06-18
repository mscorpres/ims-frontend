import { getCategoryTypeOptions } from "@/api/master/component";
import useApi from "@/hooks/useApi";
import CategoryForm from "@/Pages/Master/Components/material/CategoryForm";
import { SelectOptionType } from "@/types/general";
import MySelect from "@/Components/MySelect.jsx";

import { Card, Col, Flex, Form, Input, Row } from "antd";
import React, { useEffect, useState } from "react";

type Props = {};

const Q7 = (props: Props) => {
  const [categoryTypeOptions, setCategoryTypeOptions] = useState<
    SelectOptionType[]
  >([]);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const category = Form.useWatch("category", form);
  const values = Form.useWatch([], form);

  const handleFetchCategoryTypeOptions = async () => {
    const response = await executeFun(() => getCategoryTypeOptions(), "fetch");
    setCategoryTypeOptions(response.data);
  };
  useEffect(() => {
    handleFetchCategoryTypeOptions();
  }, []);
  useEffect(() => {
    console.log("these are the values", values);
  }, [values]);
  return (
    <Row style={{ height: "90%", padding: 10 }} gutter={6}>
      <Col span={4}>
        <Form layout="vertical" form={form}>
          <Flex vertical gap={10}>
            <Card size={"small"}>
              <Form.Item name="category" label="Category">
                <MySelect labelInValue options={categoryTypeOptions} />
              </Form.Item>
            </Card>
            {category && category?.value !== "348423984423" && (
              <CategoryForm category={category} form={form} hideExtra={true} />
            )}
          </Flex>
        </Form>
      </Col>
      <Col span={20}></Col>
    </Row>
  );
};

export default Q7;
