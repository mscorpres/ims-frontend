import { useEffect, useState } from "react";
import { Col, Collapse, Flex, Form, Row, Space, Typography } from "antd";
//components
import SingleProduct from "@/Pages/Production/ProductionMIS/SingleProduct";
//@ts-ignore
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
//@ts-ignore
import MyButton from "@/Components/MyButton/index.jsx";
//hooks
import useApi from "@/hooks/useApi.js";
//@ts-ignore
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox.jsx";
//@ts-ignore
import CustomButton from "../../../new/components/reuseable/CustomButton.jsx";
// apis
import { getComponenentAndProduct } from "@/api/general.js";
import { getDepartmentOptions } from "@/api/master/department.js";
import { createEntry, fetchShiftLabels } from "@/api/production/mis";
import AddDepartmentModal from "@/Pages/Production/ProductionMIS/AddDepartment";

import { SelectOptionType } from "@/types/general";
import UpdateShiftLabel from "@/Pages/Production/ProductionMIS/UpdateShiftLabelt";

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

  const handleFetchProductOptions = async (searchInput: any, id: string) => {
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
      style={{ margin: 12, height: "95%", overflowY: "hidden" }}
      initialValues={initialValues}
    >
      <div
        className="grid grid-cols-[1fr_3fr_1fr] h-full"
        style={{ gap: 12, overflowY: "hidden" }}
      >
        <div>
          <CustomFieldBox title="Add MIS">
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
                <CustomButton
                  size="small"
                  title={"reset"}
                  onclick={resetHandler}
                  variant="outlined"
                />

                <CustomButton
                  size="small"
                  title={"save"}
                  onclick={handleCreateEntry}
                  loading={loading("submit")}
                />
              </Space>
            </Row>
          </CustomFieldBox>
        </div>

        <div
          className="overflow-y-auto"
          style={{
            height: "calc(100vh - 150px)", // adjust based on your header/footer height
            paddingRight: 8, // prevents scrollbar overlap
          }}
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
        </div>
        <div className="overflow-hidden">
          <CustomFieldBox>
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
          </CustomFieldBox>
        </div>
      </div>
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
