import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Collapse,
  Flex,
  Form,
  Row,
  Space,
  Typography,
} from "antd";
//components
import SingleProduct from "@/Pages/Production/ProductionMIS/SingleProduct";
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import MyButton from "@/Components/MyButton/index.jsx";
//hooks
import useApi from "@/hooks/useApi.js";
// apis
import {
  getComponenentAndProduct,
  getComponentOptions,
  getProductsOptions,
} from "@/api/general.js";
import { getDepartmentOptions } from "@/api/master/department.js";
import { createEntry, fetchShiftLabels } from "@/api/production/mis";
import AddDepartmentModal from "@/Pages/Production/ProductionMIS/AddDepartment";
import dayjs from "dayjs";
import { SelectOptionType } from "@/types/general";
import UpdateShiftLabel from "@/Pages/Production/ProductionMIS/UpdateShiftLabelt";
import { convertSelectOptions } from "@/utils/general";

const typeOptions = [
  {
    text: "FG",
    value: "FG",
  },
  {
    text: "RM",
    value: "RM",
  },
];

function ProductionMIS() {
  const [misForm] = Form.useForm();
  const [asyncOptions, setAsyncOptions] = useState([]);

  const [shiftLabelOptions, setShiftLabelOptions] = useState<
    SelectOptionType[]
  >([]);
  const [shiftLabelOptionsRaw, setShiftLabelOptionsRaw] = useState([]);

  const { executeFun, loading } = useApi();

  const handleFetchDepartmentOptions = async (search: string) => {
    const response = await executeFun(
      () => getDepartmentOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };

  const handleFetchProductOptions = async (searchInput, id: string) => {
    const response = await executeFun(
      () => getComponenentAndProduct(searchInput),
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

  const handleFetchLabelOptions = async () => {
    const response = await executeFun(() => fetchShiftLabels(), "fetch");
    if (response.success) {
      setShiftLabelOptions(response.data.data);
      setShiftLabelOptionsRaw(response.data.raw);
    }
  };

  const resetHandler = async () => {
    misForm.resetFields();
  };

  useEffect(() => {
    handleFetchLabelOptions();
  }, []);
  return (
    <Form
      form={misForm}
      layout="vertical"
      style={{ padding: 10, height: "95%", overflowY: "hidden" }}
      initialValues={initialValues}
    >
      <Row
        justify="center"
        gutter={4}
        style={{ height: "100%", overflowY: "hidden" }}
      >
        <Col span={4}>
          <Card size="small" title="Add MIS">
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
                preventFetchingOnFocus={true}
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
          span={12}
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
                      shiftLabelOptions={shiftLabelOptions}
                      shiftLabelOptionsRaw={shiftLabelOptionsRaw}
                      typeOptions={typeOptions}
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
        <Col span={4}>
          <Card size="small">
            <Collapse
              items={[
                {
                  key: "1",
                  label: "Add Department",
                  children: <AddDepartmentModal />,
                },
                {
                  key: "2",
                  label: "Update Shift Label",
                  children: (
                    <UpdateShiftLabel
                      fetchLabels={handleFetchLabelOptions}
                      options={shiftLabelOptionsRaw}
                    />
                  ),
                },
              ]}
            />{" "}
          </Card>
        </Col>
      </Row>
    </Form>
  );
}

export default ProductionMIS;

const initialValues = {
  department: undefined,
  shifts: [
    {
      // productType: "FG",
      // ShiftHours:[dayjs("09")]
    },
  ],
};

const rules = {
  department: [
    {
      required: false,
      message: "Department is required",
    },
  ],
  product: [
    {
      required: false,
      message: "Product is required",
    },
  ],
  manPower: [
    {
      required: false,
      message: "ManPower is required",
    },
  ],
  lineCount: [
    {
      required: false,
      message: "Line Count is required",
    },
  ],
  output: [
    {
      required: false,
      message: "Output is required",
    },
  ],
  date: [
    {
      required: false,
      message: "Date is required",
    },
  ],
  shiftStart: [
    {
      required: false,
      message: "Shift Start is required",
    },
  ],
  shiftEnd: [
    {
      required: false,
      message: "Shift End is required",
    },
  ],
  workingHours: [
    {
      required: false,
      message: "Working Hours is required",
    },
  ],
};
