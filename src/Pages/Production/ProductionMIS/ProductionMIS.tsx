import { useState } from "react";
import { Card, Col, Form, Row, Space, Typography } from "antd";
//components
import SingleProduct from "@/Pages/Production/ProductionMIS/SingleProduct";
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import MyButton from "@/Components/MyButton/index.jsx";
//hooks
import useApi from "@/hooks/useApi.js";
// apis
import { getProductsOptions } from "@/api/general.js";
import { getDepartmentOptions } from "@/api/master/department.js";
import { createEntry } from "@/api/production/mis";
import AddDepartmentModal from "@/Pages/Production/ProductionMIS/AddDepartment";

function ProductionMIS() {
  const [misForm] = Form.useForm();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showAddDepartment, setShowAddDepartment] = useState(false);

  const { executeFun, loading } = useApi();

  const handleFetchDepartmentOptions = async (search: string) => {
    const response = await executeFun(
      () => getDepartmentOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };

  const handleFetchProductOptions = async (searchInput) => {
    const response = await executeFun(
      () => getProductsOptions(searchInput),
      "select"
    );
    setAsyncOptions(response.data ?? []);
  };

  const handleCreateEntry = async () => {
    const values = await misForm.validateFields();
    const response = await executeFun(() => createEntry(values), "submit");
    if (response.success) {
      resetHandler();
    }
  };
  const resetHandler = async () => {
    misForm.resetFields();
  };

  return (
    <Form
      form={misForm}
      layout="vertical"
      style={{ padding: 10, height: "95%", overflowY: "hidden" }}
      initialValues={initialValues}
    >
      <AddDepartmentModal
        show={showAddDepartment}
        hide={() => setShowAddDepartment(false)}
      />
      <Row
        justify="center"
        gutter={4}
        style={{ height: "100%", overflowY: "hidden" }}
      >
        <Col span={4}>
          <Card
            size="small"
            title="Add MIS"
            extra={
              <MyButton
                variant="add"
                type="link"
                onClick={() => setShowAddDepartment(true)}
              />
            }
          >
            <Form.Item
              name="department"
              label="Department"
              rules={rules.department}
            >
              <MyAsyncSelect
                optionsState={asyncOptions}
                selectLoading={loading("select")}
                loadOptions={handleFetchDepartmentOptions}
                onBlur={() => setAsyncOptions([])}
              />
            </Form.Item>
            <Row justify="center">
              <Space>
                <MyButton onClick={resetHandler} variant="reset" />
                <MyButton
                  loading={loading("submit")}
                  onClick={handleCreateEntry}
                  variant="submit"
                  text="Save"
                />
              </Space>
            </Row>
          </Card>
        </Col>
        <Col
          span={16}
          style={{ paddingBottom: 20, height: "100%", overflow: "auto" }}
        >
          <Form.List name="shifts">
            {(fields, { add, remove }) => (
              <Col span={24}>
                {fields.map((field, index) => (
                  <Form.Item noStyle>
                    <SingleProduct
                      field={field}
                      index={index}
                      add={add}
                      form={misForm}
                      loading={loading}
                      remove={remove}
                      handleFetchProductOptions={handleFetchProductOptions}
                      setAsyncOptions={setAsyncOptions}
                      asyncOptions={asyncOptions}
                      rules={rules}
                    />
                  </Form.Item>
                ))}
                <Row justify="center">
                  <Typography.Text type="secondary">
                    ----End of the List----
                  </Typography.Text>
                </Row>
              </Col>
            )}
          </Form.List>
        </Col>
      </Row>
    </Form>
  );
}

export default ProductionMIS;

const initialValues = {
  department: undefined,
  shifts: [{}],
};

const rules = {
  department: [
    {
      required: true,
      message: "Department is required",
    },
  ],
  product: [
    {
      required: true,
      message: "Product is required",
    },
  ],
  manPower: [
    {
      required: true,
      message: "ManPower is required",
    },
  ],
  lineCount: [
    {
      required: true,
      message: "Line Count is required",
    },
  ],
  output: [
    {
      required: true,
      message: "Output is required",
    },
  ],
  date: [
    {
      required: true,
      message: "Date is required",
    },
  ],
  shiftStart: [
    {
      required: true,
      message: "Shift Start is required",
    },
  ],
  shiftEnd: [
    {
      required: true,
      message: "Shift End is required",
    },
  ],
  workingHours: [
    {
      required: true,
      message: "Working Hours is required",
    },
  ],
};
