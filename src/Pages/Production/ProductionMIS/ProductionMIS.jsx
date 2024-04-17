import { Card, Col, Divider, Form, Row, Typography } from "antd";
import React, { useState } from "react";
import SingleProduct from "./SingleProduct";
import NavFooter from "../../../Components/NavFooter";
import { imsAxios } from "../../../axiosInterceptor";
import { getProductsOptions } from "../../../api/general";
import useApi from "../../../hooks/useApi";
import { convertSelectOptions } from "../../../utils/general";
import dayjs from "dayjs";
import { toast } from "react-toastify";
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
    <>
      <Row span={24}>
        <Card
          title={"Production MIS"}
          style={{ height: "100%", margin: "2em" }}
          size="small"
        >
          <Form
            initialValues={initialValues}
            layout="vertical"
            form={misForm}
            style={{ padding: 20 }}
            // onFinish={onFinish}
          >
            {" "}
            <div style={{ flex: 1 }}>
              <Col
                span={24}
                style={{
                  height: "90%",
                  width: "100%",
                  overflowX: "hidden",
                  overflowY: "auto",
                }}
              >
                <Form.List name="components">
                  {(fields, { add, remove }) => (
                    <>
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
                              // dateRange={dateRange}
                              // setDateRange={setDateRange}
                              // format={format}
                            />
                          </Form.Item>
                        ))}
                        <Row justify="center">
                          <Typography.Text type="secondary">
                            ----End of the List----
                          </Typography.Text>
                        </Row>
                      </Col>
                    </>
                  )}
                </Form.List>
              </Col>{" "}
              <NavFooter
                loading={loading}
                submitFunction={submitHandler}
                resetFunction={resetHandler}
                nextLabel="Submit"
              />
            </div>
          </Form>
        </Card>
      </Row>
    </>
  );
}

export default ProductionMIS;
const initialValues = {
  department: "",
  sku: "",
  prodName: "",
  manpower: "",
  noOfLines: "",
  output: "",
  start: "",
  end: "",
  overTime: "",
  workHours: "",
  remarks: "",
  components: [{}],
  date: "",
};
