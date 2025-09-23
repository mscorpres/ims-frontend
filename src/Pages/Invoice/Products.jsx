
import { useState, useEffect } from "react";
import { Card, Col, Form, Row, Typography } from "antd";
import SingleDatePicker from "../../Components/SingleDatePicker";
import SummaryCard from "../../Components/SummaryCard";
import TaxDetails from "./TaxDetails";
import SingleProduct from "./SingleProduct";
import { imsAxios } from "../../axiosInterceptor";
import MySelect from "../../Components/MySelect";

const Products = ({
  form,
  tcsOptions,
  loading,
  setLoading,
  gstType,
  setGstType,
}) => {
  const [taxDetails, setTaxDetails] = useState(inititalTaxDetails);

  const [gstGlOptions, setGstGlOptions] = useState([]);
  const [glOptions, setGlOptions] = useState([]);
  const [shippingCode, setShippingCode] = useState([]);
  // const clientStateCode = Form("clientBranch", form);
  const client = Form.useWatch("client", form);
  const location = Form.useWatch("location", form);
  const shippingState = Form.useWatch("shippingState", form);
  const shippingCity = Form.useWatch("shippingCity", form);
  const shippingAddress = Form.useWatch("shippingAddress", form);
  const components = Form.useWatch("components", {
    form,
    preserve: true,
  });

  const getGstGlOptions = async () => {
    try {
      setLoading("fetching");
      const response = await imsAxios.get("/invoice/glOptions?name=GST");
      const { data } = response;
      if (data) {
        setGstGlOptions(data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getGlOptions = async () => {
    try {
      setLoading("fetching");
      const response = await imsAxios.get("/invoice/glOptions?name=INV01");

      const { data } = response;
      setGlOptions(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let obj = taxDetails;

    if (components && components.length > 0) {
      const beforeTax = components.reduce(
        (a, b) => a + +Number(b?.gstassValue).toFixed(3),
        0
      );
      const taxAmount = components.reduce(
        (a, b) => a + +Number(b?.gstAmount).toFixed(3),
        0
      );
      const tcsAmount = components.reduce(
        (a, b) => a + +Number(b?.tcsAmount).toFixed(3),
        0
      );
      const totalAmount = components.reduce(
        (a, b) => a + +Number(b?.totalAmount).toFixed(3),
        0
      );
      obj = [
        {
          title: "Before Tax",
          description: beforeTax,
        },
        {
          title: "CGST",
          description: taxAmount / 2,
          hidden: gstType === "interstate",
        },

        {
          title: "SGST",
          description: taxAmount / 2,
          hidden: gstType === "interstate",
        },

        { title: "IGST", description: taxAmount, hidden: gstType === "local" },

        { title: "TCS", description: tcsAmount },

        {
          title: "Total Value",
          description: +Number(totalAmount).toFixed(3) || 0,
        },
      ];
      setTaxDetails(obj);
    }
  }, [components, gstType]);
  useEffect(() => {
    getGstGlOptions();
    getGlOptions();
  }, []);
  return (
    <Row gutter={6} style={{ height: "100%" }}>
      <Col
        span={6}
        style={{ height: "100%", paddingBottom: 10, overflowY: "auto" }}
      >
        <Row gutter={[0, 6]}>
          <Col span={24}>
            <Card size="small">
              <Row gutter={4}>
                <Col span={12}>
                  <Form.Item label="Invoice Date" name="invoiceDate">
                    <SingleDatePicker
                      // value={invoiceDate}
                      setDate={(value) =>
                        form.setFieldValue("invoiceDate", value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Ref Date" name="refDate">
                    <SingleDatePicker
                      // value={invoiceDate}
                      setDate={(value) => form.setFieldValue("refDate", value)}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="Gst Type">
                    <MySelect
                      options={gstTypeOptions}
                      value={gstType}
                      onChange={setGstType}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={24}>
            <SummaryCard
              title="Client Details"
              summary={[
                { title: "Client" },
                { description: client?.label },
                { title: "Client Location" },
                { description: location?.text },
                { title: "Shipping State" },
                { description: shippingState?.label },
                { title: "Shipping City" },
                { description: shippingCity },
                { title: "Shipping Address" },
                { description: shippingAddress },
              ]}
            />
          </Col>
          <Col span={24}>
            <TaxDetails title="Tax Summary" summary={taxDetails} />
          </Col>
        </Row>
      </Col>
      <Col
        span={18}
        style={{
          height: "100%",
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        <Form.List name="components">
          {(fields, { add, remove }) => (
            <>
              <Col>
                {fields.map((field, index) => (
                  <Form.Item noStyle>
                    <SingleProduct
                      fields={fields}
                      field={field}
                      index={index}
                      add={add}
                      form={form}
                      remove={remove}
                      tcsOptions={tcsOptions}
                      gstType={gstType}
                      gstGlOptions={gstGlOptions}
                      glOptions={glOptions}
                      taxDetails={taxDetails}
                      setShippingCode={setShippingCode}
                      shippingCode={shippingCode}
                      shippingAddress={shippingAddress}
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
      </Col>
    </Row>
  );
};

const inititalTaxDetails = [
  { title: "Before Tax", description: 0 },
  { title: "CGST", description: 0 },

  { title: "SGST", description: 0 },

  { title: "IGST", description: 0 },

  { title: "TCS", description: 0 },

  { title: "Total Value", description: 0 },
];
const gstTypeOptions = [
  {
    text: "Local",
    value: "local",
  },
  {
    text: "Interstate",
    value: "interstate",
  },
];

export default Products;
