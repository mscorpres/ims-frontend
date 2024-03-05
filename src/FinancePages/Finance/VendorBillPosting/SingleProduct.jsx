"use client";
import { useEffect, useState } from "react";
import { Button, Form, Input, Row, Col, Typography, Space } from "antd";
import Loading from "../../../Components/Loading";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import { CodeSandboxCircleFilled } from "@ant-design/icons";

export default function SingleComponent({
  index,
  field,
  fields,
  add,
  remove,
  form,
  // allTdsOptions,
  // tdsArray,
  // optionState,
  // setOptionState,
}) {
  const [loading, setLoading] = useState(false);
  const [glCodes, setGlCodes] = useState([]);
  const [glstate, setglState] = useState([]);
  console.log("hellllll0");
  const component =
    Form.useWatch(["components", field.name, "component"], form) ?? 0;
  console.log("component---------", form);
  // console.log("component---------", viewVbt);
  const qty =
    Form.useWatch(["components", field.name, "vbtBillQty"], form) ?? 0;
  const rate =
    Form.useWatch(["components", field.name, "vbtInRate"], form) ?? 0;
  const product =
    Form.useWatch(["components", field.name, "product"], form) ?? 0;
  const tcs = Form.useWatch(["components", field.name, "tcs"], form) ?? 0;
  const freight =
    Form.useWatch(["components", field.name, "freight"], form) ?? 0;
  const gstType = Form.useWatch(["components", field.name, "gstType"], form);
  const minId = Form.useWatch(["components", field.name, "minID"], form);

  const taxableValue =
    Form.useWatch(["components", field.name, "taxableValue"], form) ?? 0;
  const vbtInRate =
    Form.useWatch(["components", field.name, "vbtInRate"], form) ?? 0;
  const freightAmount =
    Form.useWatch(["components", field.name, "freightAmount"], form) ?? 0;
  const gstAmount =
    Form.useWatch(["components", field.name, "gstAmount"], form) ?? 0;
  const tdsPercent =
    Form.useWatch(["components", field.name, "tdsPercent"], form) ?? 0;
  const gstAssValue =
    Form.useWatch(["components", field.name, "gstAssValue"], form) ?? 0;
  const tdsAssValue =
    Form.useWatch(["components", field.name, "tdsAssValue"], form) ?? 0;
  const tdsName =
    Form.useWatch(["components", field.name, "tdsName"], form) ?? 0;
  const glName = Form.useWatch(["components", field.name, "glName"], form) ?? 0;
  const glCode =
    Form.useWatch(["components", field.name, "tds_gl_code"], form) ?? 0;
  const vbtBillQty =
    Form.useWatch(["components", field.name, "vbtBillQty"], form) ?? 0;
  const gstRate =
    Form.useWatch(["components", field.name, "gstRate"], form)?.replaceAll(
      "%",
      ""
    ) ?? 0;
  const options = [
    {
      text: "Local",
      value: "L",
    },
    {
      text: "Interstate",
      value: "I",
    },
  ];
  const getGstGlOptions = async () => {
    const response = await imsAxios.get("/tally/vbt/fetch_gst_ledger");
    const { data } = response;
    if (data) {
      if (data[0]) {
        let arr = data.map((row) => ({ value: row.id, text: row.text }));
        setglState(arr);
      }
    }
    // console.log("setglState", glstate);
  };

  // useEffect(() => {
  //   let updatedTdsPercentage = 0;
  //   if (allTdsOptions.length > 0) {
  //     let arr = allTdsOptions.filter((r) => r.tds_name === tdsName.label);
  //     form.setFieldValue(
  //       ["components", field.name, "glName"],
  //       arr[0]?.ladger_name
  //     );

  //     form.setFieldValue(
  //       ["components", field.name, "tds_gl_code"],
  //       arr[0]?.ledger_key
  //     );
  //     form.setFieldValue(
  //       ["components", field.name, "tds_key"],
  //       arr[0]?.tds_key
  //     );
  //     form.setFieldValue(
  //       ["components", field.name, "tdsPercent"],
  //       arr[0]?.tds_percent
  //     );
  //     // console.log("glName", glName);
  //     // console.log("tds_gl_code", tds_gl_code);
  //     // console.log("tdsPercent", tdsPercent);
  //     updatedTdsPercentage = arr[0]?.tds_percent;
  //   } else {
  //     updatedTdsPercentage = tdsPercent ?? 0;
  //   }
  //   console.log("allTdsOptions", allTdsOptions);

  //   const value = +Number(qty).toFixed(3) * +Number(vbtInRate).toFixed(3);
  //   const amountWithFreight = value + +Number(freightAmount).toFixed(3);
  //   let taxPercentage = gstRate;
  //   let taxAmount = +Number((amountWithFreight * taxPercentage) / 100).toFixed(
  //     3
  //   );
  //   const cgst = gstType === "L" ? +Number(taxAmount).toFixed(4) / 2 : 0;
  //   const sgst = gstType === "L" ? +Number(taxAmount).toFixed(4) / 2 : 0;
  //   const igst = gstType === "I" ? +Number(taxAmount).toFixed(4) : 0;

  //   let amountAfterTax = amountWithFreight + taxAmount;
  //   let tdsAmount = +Number(
  //     (amountWithFreight * updatedTdsPercentage) / 100
  //   ).toFixed(3);
  //   tdsAmount = +Number(tdsAmount).toFixed(2);
  //   tdsAmount = Math.round(tdsAmount);
  //   let valueAfterTDS = amountAfterTax - tdsAmount;
  //   const gstAssesValue = +Number(vbtBillQty * rate + freightAmount).toFixed(2);

  //   form.setFieldValue(["components", field.name, "taxableValue"], value);

  //   form.setFieldValue(["components", field.name, "gstAmount"], gstAmount);
  //   form.setFieldValue(["components", field.name, "igstAmount"], igst);
  //   form.setFieldValue(["components", field.name, "sgstAmount"], sgst);
  //   form.setFieldValue(["components", field.name, "cgstAmount"], cgst);
  //   form.setFieldValue(["components", field.name, "venAmmount"], valueAfterTDS);
  //   form.setFieldValue(["components", field.name, "tdsAmount"], tdsAmount);

  //   form.setFieldValue(
  //     ["components", field.name, "gstAssValue"],
  //     amountWithFreight
  //   );
  //   form.setFieldValue(
  //     ["components", field.name, "tdsAssValue"],
  //     amountWithFreight
  //   );
  // }, [
  //   qty,
  //   rate,
  //   tcs,
  //   freight,
  //   gstRate,
  //   tdsName,
  //   freightAmount,
  //   glName,
  //   tdsPercent,
  //   taxableValue,
  //   gstAssValue,
  //   glCode,
  //   gstType,
  // ]);
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
      <Col span={3}>
        <Form.Item label="MIN ID" name={[field.name, "minId"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="Vendor" name={[field.name, "vendor"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Vendor Code" name={[field.name, "venCode"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Part Code" name={[field.name, "partCode"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item label="Part" name={[field.name, "part"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>

      <Col span={2}>
        <Form.Item label="Bill Qty" name={[field.name, "billQty"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Qty" name={[field.name, "qty"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Rate" name={[field.name, "inRate"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Unit" name={[field.name, "unit"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Value" name={[field.name, "value"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="CGST" name={[field.name, "cgst"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="CGST Gl" name={[field.name, "cgstGl"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="SGST" name={[field.name, "sgst"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="SGST Gl" name={[field.name, "sgstGl"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="IGST" name={[field.name, "igst"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="IGST GL" name={[field.name, "igstGl"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>

      <Col span={2}>
        <Form.Item label="Custom Duty" name={[field.name, "custom_duty"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Freight" name={[field.name, "freight"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="Freight Gl" name={[field.name, "freight_gl"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="Gl Name" name={[field.name, "glName"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="GST Ass. Value" name={[field.name, "gsAssVal"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="GST In No." name={[field.name, "gstInNo"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="GST Rate" name={[field.name, "gstRate"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="GST Type" name={[field.name, "gstType"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="HSN/SAC" name={[field.name, "hsnSac"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>

      <Col span={3}>
        <Form.Item label="Invoice Date" name={[field.name, "invoiceDt"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Invoice No." name={[field.name, "invoiceNo"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Other Charges" name={[field.name, "otherCharges"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>

      <Col span={2}>
        <Form.Item label="TDS Amount" name={[field.name, "tdsAmm"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="TDS ass. Value" name={[field.name, "tds_ass_val"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="TDS Code" name={[field.name, "tdsCode"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="TDS Gl" name={[field.name, "tdsGl"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>

      <Col span={3}>
        <Form.Item label="VBT Gl" name={[field.name, "vbtGl"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>

      <Col span={3}>
        <Form.Item label="Vendor Amount" name={[field.name, "venAmm"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="Vendor Code" name={[field.name, "venCode"]}>
          <Input rows={1} disabled />
        </Form.Item>
      </Col>

      <Col span={4}>
        <Form.Item label="Comment" name={[field.name, "comment"]}>
          <Input.TextArea rows={2} disabled />
        </Form.Item>
      </Col>
      <Col span={6}>
        <Form.Item label="Vendor Address" name={[field.name, "venAddress"]}>
          <Input.TextArea rows={2} disabled />
        </Form.Item>
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
