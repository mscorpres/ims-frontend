import { Card, Col, Form, Input, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import MySelect from "../../../../Components/MySelect";
import InputMask from "react-input-mask";
import TaxDetails from "./TaxDetails";
//
function VBTHeaders({
  form,
  vbtComponent,
  taxDetails,
  editingVBT,
  roundOffValue,
  roundOffSign,
  setRoundOffSign,
  setRoundOffValue,
}) {
  const [pageHeaders, setPageHeaders] = useState("");
  console.log("vbtComponent", vbtComponent);

  let obj = {
    invoiceNo: pageHeaders?.invoice_id,
    // invoiceDate: vbtComponent[0]?.invoiceDate,
    venAddress: pageHeaders?.in_vendor_addr,
    comment: pageHeaders?.comment,
    gst: pageHeaders?.gstin_option,
    // effectiveDate: vbtComponent[0]?.effectiveDate,
    venCode: pageHeaders?.ven_code,
    // venAmmount: pageHeaders?.reduce(
    //   (partialSum, a) => partialSum + +Number(a.venAmmount).toFixed(3),
    //   0
    // ),
  };
  console.log("obj---------", pageHeaders);
  form.setFieldsValue(obj);

  useEffect(() => {
    if (vbtComponent && vbtComponent?.data) {
      setPageHeaders(vbtComponent?.data[0]);
    }
  }, [vbtComponent]);
  return (
    <Row gutter={[0, 6]} style={{ height: "100%", overflowY: "hidden" }}>
      <Col span={24} style={{ height: "60%", overflowY: "auto" }}>
        <TaxDetails title="Tax Details" summary={taxDetails} />
      </Col>
      <Col
        span={24}
        style={{ height: "130px", overflow: "auto", marginTop: "1em" }}
      >
        <Card size="small">
          <Row gutter={6}>
            <Col span={12}>
              <Form.Item
                label="Invoice Date"
                name="invoiceDate"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Invoice Date!",
                  },
                ]}
              >
                <SingleDatePicker
                  setDate={(value) => form.setFieldValue("invoiceDate", value)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                // rules={formRules.effectiveDate}
                name="effectiveDate"
                label="Effective Date"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Effective Date!",
                  },
                ]}
              >
                <SingleDatePicker
                  setDate={(value) =>
                    form.setFieldValue("effectiveDate", value)
                  }
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Invoice Number" name="invoiceNo">
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Bill Amount"
                name="venAmmount"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Bill Amount!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="GSTIN Number" name="gst">
                <MySelect />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Typography.Text style={{ fontSize: "0.8rem" }}>
                Round Off
              </Typography.Text>{" "}
              <div style={{ display: "flex" }}>
                <div style={{ width: 40 }}>
                  <RoundOffSelect
                    roundOffSign={roundOffSign}
                    setRoundOffSign={setRoundOffSign}
                  />
                </div>
                <Input
                  value={roundOffValue}
                  onChange={(e) => setRoundOffValue(e.target.value)}
                />
              </div>
            </Col>

            <Col span={24}>
              <Form.Item label="Comments" name="comment">
                <Input.TextArea placeholder="Comments" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Vendor Address" name="venAddress">
                <Input.TextArea />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}

export default VBTHeaders;

const RoundOffSelect = ({ roundOffSign, setRoundOffSign }) => {
  return (
    <select
      style={{
        height: 30,
        border: "1px lightgray solid",
        borderRadius: 5,
        outline: "none",
      }}
      value={roundOffSign}
      onInput={(value) => setRoundOffSign(value.target.value)}
    >
      <option value="+">+</option>
      <option value="-">-</option>
    </select>
  );
};
