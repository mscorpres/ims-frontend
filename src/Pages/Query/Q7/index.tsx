import { getCategoryTypeOptions } from "@/api/master/component";
import useApi from "@/hooks/useApi";
import CategoryForm from "@/Pages/Master/Components/material/list/CategoryForm";
import { SelectOptionType } from "@/types/general";
import MySelect from "@/Components/MySelect.jsx";

import { Card, Col, Flex, Form, Input, Row } from "antd";
import React, { useEffect, useState } from "react";
import { q7 } from "@/api/reports/inventoryReport";

type Props = {};

const Q7 = (props: Props) => {
  const [categoryTypeOptions, setCategoryTypeOptions] = useState<
    SelectOptionType[]
  >([]);
  const [allAttributeOptions, setAllAttributeOptions] = useState([]);

  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const category = Form.useWatch("category", form);
  const values = Form.useWatch([], form);

  const handleFetchCategoryTypeOptions = async () => {
    const response = await executeFun(() => getCategoryTypeOptions(), "fetch");
    setCategoryTypeOptions(response.data);
  };

  const handleFetchReport = async (values) => {
    const response = await executeFun(
      () => q7(values, allAttributeOptions),
      "fetch"
    );
  };

  console.log("all attributes", allAttributeOptions);
  useEffect(() => {
    handleFetchCategoryTypeOptions();
  }, []);
  useEffect(() => {
    console.log("these are the values", values);
    handleFetchReport(values);
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
              <CategoryForm
                valuesNotRequired={true}
                category={category}
                form={form}
                hideExtra={true}
                setAllAttributeOptions={setAllAttributeOptions}
              />
            )}
          </Flex>
        </Form>
      </Col>
      <Col span={20}></Col>
    </Row>
  );
};

export default Q7;
