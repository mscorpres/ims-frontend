import { Card, Col, Form, Row, Space, Typography } from "antd";
import React, { useState } from "react";
import SingleProduct from "./SingleProduct";
import { imsAxios } from "../../../axiosInterceptor";
import { getProductsOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../../Components/MyAsyncSelect.jsx";
import MyButton from "../../../Components/MyButton/index.jsx";
function ProductionMIS() {
  const [misForm] = Form.useForm();
  const [listDept, setListDept] = useState([]);
  const [skuList, setSkuList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  // const [date, setDate] = useState("");
  const components = Form.useWatch("components", {
    form: misForm,
    preserve: true,
  });
  const getdept = async (search) => {
    const response = await imsAxios.post("/backend/misDepartment", {
      search: search,
    });
    console.log("response", response);
    if (response.success == true) {
      let { data } = response;
      console.log("dddddddd", data);
      let a = convertSelectOptions(data);
      setAsyncOptions(a);
    }
  };
  const { executeFun, loading1 } = useApi();
  const getOption = async (searchInput) => {
    const response = await executeFun(
      () => getProductsOptions(searchInput),
      "select"
    );
    let { data } = response;

    setAsyncOptions(data);
  };

  const submitHandler = async () => {
    setLoading(true);
    const values = await misForm.validateFields();
    let a = misForm.getFieldValue();
    console.log("vale", values);
    let payload = {
      department: values.components.map((r) => r.department),
      sku: values.components.map((r) => r.sku),
      date: values.components.map((r) => r.date),
      manPower: values.components.map((r) => r.manpower),
      lineNo: values.components.map((r) => r.noOfLines),
      output: values.components.map((r) => r.output),
      remarks: values.components.map((r) => r.remarks),
      shiftIn: values.components.map((r) => r.start.format("HH:mm")),
      shiftEnd: values.components.map((r) => r.end.format("HH:mm")),
      overTime: values.components.map((r) => r.overTime.format("HH:mm")),
      workHours: values.components.map((r) => r.workHours.format("HH:mm")),
    };
    console.log("payload 33", payload);
    const response = await imsAxios.post("/production/mis/add", payload);
    console.log("respomse", response);
    if (response.success == true) {
      toast.success(response.message);
      setLoading(false);
      resetHandler();
    }
    setLoading(false);
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
      <Row
        span={24}
        justify="center"
        gutter={4}
        style={{ height: "100%", overflowY: "hidden" }}
      >
        <Col span={4}>
          <Card size="small" title="Add MIS">
            <Form.Item
              name="department"
              label="Department"
              rules={[
                {
                  required: true,
                  message: "Please provide the Department.",
                },
              ]}
            >
              <MyAsyncSelect
                optionsState={asyncOptions}
                loadOptions={getdept}
                onBlur={() => setAsyncOptions([])}
              />
            </Form.Item>
            <Row justify="center">
              <Space>
                <MyButton onClick={resetHandler} variant="reset" />
                <MyButton
                  onClick={submitHandler}
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
                      fields={fields}
                      field={field}
                      index={index}
                      add={add}
                      form={misForm}
                      remove={remove}
                      getdept={getdept}
                      setListDept={setListDept}
                      listDept={listDept}
                      getOption={getOption}
                      skuList={skuList}
                      setSkuList={setSkuList}
                      setAsyncOptions={setAsyncOptions}
                      asyncOptions={asyncOptions}
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
          {/* <NavFooter
              loading={loading}
              submitFunction={submitHandler}
              resetFunction={resetHandler}
              nextLabel="Submit"
            /> */}
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
