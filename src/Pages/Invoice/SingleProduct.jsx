"use client";
import { useEffect, useState } from "react";
import { Button, Form, Input, Row, Col, Typography, Space } from "antd";
import Loading from "../../Components/Loading";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import MySelect from "../../Components/MySelect";
import { imsAxios } from "../../axiosInterceptor";

export default function SingleProduct({
  index,
  field,
  fields,
  add,
  remove,
  form,
  tcsOptions,
  gstGlOptions,
  gstType,
  glOptions,
  shippingAddress,
}) {
  // const { loading } = useSelector((state) => state.imsData);

  const [loading, setLoading] = useState(false);

  const [optionState, setOptionState] = useState([]);
  const component =
    Form.useWatch(["components", field.name, "component"], form) ?? 0;
  const qty = Form.useWatch(["components", field.name, "qty"], form) ?? 0;
  const rate = Form.useWatch(["components", field.name, "rate"], form) ?? 0;
  const product =
    Form.useWatch(["components", field.name, "product"], form) ?? 0;
  const tcs = Form.useWatch(["components", field.name, "tcs"], form) ?? 0;
  const freight =
    Form.useWatch(["components", field.name, "freight"], form) ?? 0;
  const shippingCode =
    Form.useWatch(["components", field.name, "shippingAddress"], form) ?? 0;
  const gstRate =
    Form.useWatch(["components", field.name, "gstRate"], form)?.replaceAll(
      "%",
      ""
    ) ?? 0;
  const tcsPercentage =
    Form.useWatch(["components", field.name, "tcsPercentage"], form) ?? 0;
  // console.log("components form->", shippingAddress);
  const getProduct = async (searchTerm) => {
    try {
      setLoading("select");
      const { data } = await imsAxios.post("backend/getProductByNameAndNo", {
        search: searchTerm,
      });

      let arr = data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setOptionState(arr);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getProductDetails = async (product) => {
    try {
      setLoading(field.key);
      const { data } = await imsAxios.post("products/getProductForUpdate", {
        product_key: product.value,
      });

      if (data.code === 200 || data.code === "200") {
        let arr = data.data;
        form.setFieldValue(
          ["components", field.name, "hsnCode"],
          arr[0].hsncode
        );

        form.setFieldValue(["components", field.name, "remark"], arr[0].remark);
        form.setFieldValue(["components", field.name, "uom"], arr[0].uomname);
        form.setFieldValue(
          ["components", field.name, "gstRate"],
          arr[0].gstrate_name + "%"
        );
      }
    } catch (error) {
      console.log("error while fetching product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const value = +Number(qty).toFixed(2) * +Number(rate).toFixed(2);
    const gstAssesValue =
      +Number(value).toFixed(2) + +Number(freight).toFixed(2);
    const gstAmount =
      (+Number(gstAssesValue).toFixed(3) * +Number(gstRate)) / 100;
    const tcsAssValue =
      +Number(gstAssesValue).toFixed(3) + +Number(gstAmount).toFixed(3);
    const tcsAmount =
      (+Number(gstAssesValue).toFixed(3) * +Number(tcsPercentage)) / 100;
    const totalAmount =
      +Number(tcsAssValue).toFixed(3) + +Number(tcsAmount).toFixed(3);

    // setting tcs percentage on tcs change
    if (tcs) {
      const selectedTcs = tcsOptions.find((row) => row.value === tcs);

      const tcsPercentage = selectedTcs.tcsPercentage;
      const tcsGlName = selectedTcs.tcsGlName;
      const tcsGlCode = selectedTcs.tcsGl;
      form.setFieldValue(
        ["components", field.name, "tcsPercentage"],
        tcsPercentage
      );
      form.setFieldValue(["components", field.name, "tcsGlName"], tcsGlName);
      form.setFieldValue(["components", field.name, "tcsGlCode"], tcsGlCode);
    }
    form.setFieldValue(["components", field.name, "value"], value);

    form.setFieldValue(["components", field.name, "gstAmount"], gstAmount);
    form.setFieldValue(["components", field.name, "tcsAmount"], tcsAmount);
    form.setFieldValue(
      ["components", field.name, "totalAmount"],
      totalAmount.toFixed(3)
    );
    form.setFieldValue(
      ["components", field.name, "gstassValue"],
      gstAssesValue
    );
  }, [qty, rate, tcs, freight, gstRate]);

  useEffect(() => {
    form.setFieldValue("product", product.key);
    if (product) {
      getProductDetails(product);
    }
  }, [product]);

  return (
    <Row
      style={{
        background: "#f5f5f58f",
        padding: "5px 15px",
        borderRadius: 10,
        marginTop: 5,
      }}
      gutter={[6, -6]}
      key={field.key}
    >
      {loading === field.key && <Loading />}
      <Col span={1}>
        <Typography.Text type="secondary" style={{ marginRight: 5 }} strong>
          {index + 1}.
        </Typography.Text>
      </Col>
      <Col span={5}>
        <Form.Item label="Product" name={[field.name, "product"]}>
          <MyAsyncSelect
            labelInValue
            loadOptions={getProduct}
            optionsState={optionState}
            onBlur={() => setOptionState([])}
          />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="Qty">
          <Space.Compact>
            <Form.Item name={[field.name, "qty"]} noStyle>
              <Input />
            </Form.Item>
            <Form.Item name={[field.name, "uom"]} noStyle>
              <Input
                disabled
                style={{
                  width: "50%",
                }}
              />
            </Form.Item>
          </Space.Compact>
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Rate" name={[field.name, "rate"]}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="HSN Code" name={[field.name, "hsnCode"]}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="Value" name={[field.name, "value"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Freight" name={[field.name, "freight"]}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="GL" name={[field.name, "glCode"]}>
          <MySelect options={glOptions} />
        </Form.Item>
      </Col>
      <Col span={4} offset={1}>
        <Form.Item label="GST Ass. Value">
          <Space.Compact>
            <Form.Item name={[field.name, "gstassValue"]} noStyle>
              <Input />
            </Form.Item>
            <Form.Item label="%" name={[field.name, "gstRate"]} noStyle>
              <Input
                disabled
                style={{
                  width: "40%",
                }}
              />
            </Form.Item>
          </Space.Compact>
        </Form.Item>
      </Col>
      {gstType === "local" && (
        <Col span={4}>
          <Form.Item label="SGST GL" name={[field.name, "sgstGl"]}>
            <MySelect options={gstGlOptions} />
          </Form.Item>
        </Col>
      )}
      {gstType === "local" && (
        <Col span={4}>
          <Form.Item label="CGST GL" name={[field.name, "cgstGl"]}>
            <MySelect options={gstGlOptions} />
          </Form.Item>
        </Col>
      )}
      {gstType === "interstate" && (
        <Col span={4}>
          <Form.Item label="IGST GL" name={[field.name, "igstGl"]}>
            <MySelect options={gstGlOptions} />
          </Form.Item>
        </Col>
      )}
      <Col span={5}>
        <Row>
          <Col span={19}>
            <Form.Item label="TCS" name={[field.name, "tcs"]}>
              <MySelect options={tcsOptions} />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item label=" ">
              <Input disabled value={tcsPercentage + "%"} />
            </Form.Item>
          </Col>
        </Row>
      </Col>
      <Col span={4}>
        <Form.Item label="TCS GL" name={[field.name, "tcsGlName"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Row gutter={[6, -6]}>
          <Col span={4} offset={1}>
            <Form.Item label="Item Total" name={[field.name, "totalAmount"]}>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Description" name={[field.name, "remark"]}>
              <Input.TextArea placeholder="-" />
            </Form.Item>
          </Col>
        </Row>
      </Col>

      <Col span={24}>
        <Row justify="end" align="middle" style={{ height: "100%" }}>
          {fields.length > 1 && (
            <Button
              onClick={() => remove(field.name)}
              danger
              type="text"
              size="small"
            >
              - Remove Component
            </Button>
          )}
          <Button size="small" type="link" onClick={() => add()}>
            + Add Component
          </Button>
        </Row>
      </Col>
    </Row>
  );
}
const gstRateOptions = [
  { value: "0", text: "00%" },
  { value: "5", text: "05%" },
  { value: "12", text: "12%" },
  { value: "18", text: "18%" },
  { value: "28", text: "28%" },
];
