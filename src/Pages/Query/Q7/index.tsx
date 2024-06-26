import { getCategoryTypeOptions } from "@/api/master/component";
import useApi from "@/hooks/useApi";
import CategoryForm from "@/Pages/Master/Components/material/list/CategoryForm";
import { SelectOptionType } from "@/types/general";
import MySelect from "@/Components/MySelect.jsx";

import { Card, Col, Collapse, Flex, Form, Input, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { q5, q7 } from "@/api/reports/inventoryReport";
import { RowType } from "@/Pages/Query/Q7/type";
import dayjs from "dayjs";
import Loading from "@/Components/Loading.jsx";

type Props = {};

const Q7 = (props: Props) => {
  const [categoryTypeOptions, setCategoryTypeOptions] = useState<
    SelectOptionType[]
  >([]);
  const [allAttributeOptions, setAllAttributeOptions] = useState([]);
  const [rows, setRows] = useState<RowType[]>([]);
  const [active, setActive] = useState<string[]>([]);

  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const category = Form.useWatch("category", form);
  const values = Form.useWatch([], form);

  const handleFetchCategoryTypeOptions = async () => {
    const response = await executeFun(() => getCategoryTypeOptions(), "fetch");
    setCategoryTypeOptions(response.data);
  };

  const handleFetchReport = async (values) => {
    setRows([]);
    let isValid = false;
    for (let key in values) {
      if (key !== "category" && values[key]) {
        isValid = true;
      }
    }

    if (!isValid) {
      return;
    }
    if (values && values?.category && allAttributeOptions) {
      const response = await executeFun(
        () => q7(values, allAttributeOptions),
        "fetch"
      );

      setRows(response.data ?? []);
    }
  };

  const handleFetchStock = async (key: string) => {
    const response = await executeFun(
      () => q5(key, dayjs().format("DD-MM-YYYY"), "RM"),
      `fetchStock-${key}`
    );

    if (response.success) {
      setRows((curr) =>
        curr.map((row) => {
          if (row.key === key) {
            return {
              ...row,
              stock: response.data,
            };
          } else {
            return row;
          }
        })
      );
    }
  };

  const handleOpen = (values: string[]) => {
    const lastKey = values[values.length - 1];
    const isOpen = values.length > active.length;

    if (isOpen) {
      handleFetchStock(lastKey);
    }
    setActive(values);
  };
  useEffect(() => {
    handleFetchCategoryTypeOptions();
  }, []);
  useEffect(() => {
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
      <Col
        span={20}
        style={{ position: "relative", height: "100%", overflowY: "auto" }}
      >
        <div style={{ marginBottom: 5, marginLeft: 5 }}>
          <Typography.Text strong>
            {rows.length} Components Found
          </Typography.Text>
        </div>
        {loading("fetch") && <Loading />}
        <Collapse
          items={rows.map((row) => ({
            key: row.key,
            extra: row.stock?.total?.closing && (
              <Typography.Text strong>
                Total: {row.stock?.total?.closing}
              </Typography.Text>
            ),
            label: row.partCode,
            children: (
              <Flex vertical gap={5} style={{ position: "relative" }}>
                {loading(`fetchStock-${row.key}`) && <Loading />}
                <Typography.Text strong>
                  Total Closing: {row.stock?.total?.closing}
                </Typography.Text>

                <Flex wrap="wrap" gap={5}>
                  {row.stock?.stock?.map((stockRow) => (
                    <Card size="small">
                      <Flex vertical align="center">
                        <Typography.Text strong>
                          {stockRow.name}
                        </Typography.Text>
                        <Typography.Text strong>
                          {stockRow.closing}
                        </Typography.Text>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              </Flex>
            ),
          }))}
          onChange={handleOpen}
        />
      </Col>
    </Row>
  );
};

export default Q7;
