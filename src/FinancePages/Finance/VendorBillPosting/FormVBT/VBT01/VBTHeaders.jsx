import { Card, Col, Form, Input, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import MySelect from "../../../../../Components/MySelect";
import InputMask from "react-input-mask";
import TaxDetails from "./TaxDetails";

function VBTHeaders({
  form,
  vbtComponent,
  setVbtComponent,
  taxDetails,

  editingVBT,
  roundOffValue,
  roundOffSign,
  setRoundOffSign,
  setRoundOffValue,
  apiUrl,
  setEditVBTCode,
  editVBTCode,
  components,
  billvalues,
  billam,
}) {
  //
  // const totalBillingAmount = form.getFieldValue("billAmmount");
  // let totalVenAm = form.getFieldValue([
  //   "components",
  //   field.name,
  //   "venAmmount",
  // ]);
  // console.log("totalBillingAmount", totalBillingAmount);
  // var values = components?.reduce(
  //   (partialSum, a) => partialSum + +Number(a.totalBilAmm).toFixed(2),
  //   0
  // );

  const [pageHeaders, setPageHeaders] = useState("");
  useEffect(() => {
    let obj = {};
    if (editingVBT && vbtComponent) {
      if (vbtComponent && vbtComponent?.data) {
        setPageHeaders(vbtComponent?.data[0]);
      }

      if (editingVBT && pageHeaders) {
        obj = {
          invoiceNo: pageHeaders?.invoice_id,

          // invoiceDate: vbtComponent[0]?.invoiceDate,
          venAddress: pageHeaders?.in_vendor_addr,
          // comment: pageHeaders?.comment,
          gst: pageHeaders?.gstin_option[0],
          venCode: pageHeaders?.ven_code,
          comment:
            apiUrl === "vbt06"
              ? `Being Jobwork charges due of challan no:____on inv: ${pageHeaders?.invoice_id} dt:____of amount:____TDS:___ payable amt:____`
              : apiUrl === "vbt07"
              ? `Being -- purchase on inv ${pageHeaders?.invoice_id} date:____ of amt: ___ TDS:___ `
              : apiUrl === "vbt01"
              ? `Being purchased for on INV no. ${pageHeaders?.invoice_id} date: ___ amount: ___ TDS:___ `
              : apiUrl === "vbt02"
              ? `Being Service charges due to INV no. ${pageHeaders?.invoice_id} date of amount TDS:___ `
              : "",
          ackNum: pageHeaders?.acknowledgeIRN,
          // billAmmount: billam,
          // venAmmount: pageHeaders?.reduce(
          //   (partialSum, a) => partialSum + +Number(a.venAmmount).toFixed(3),
          //   0
          // ),
        };
        form.setFieldsValue(obj);
      }
    } else {
      obj = {
        invoiceNo: editVBTCode[0]?.invoiceNo,
        invoiceDate: editVBTCode[0]?.invoiceDate,
        venAddress: editVBTCode[0]?.venAddress,
        comment: editVBTCode[0]?.comment,
        gst: editVBTCode[0]?.gst,
        effectiveDate: editVBTCode[0]?.effectiveDate,
        billAmmount: editVBTCode[0]?.billAmount,
        ackNum: editVBTCode[0]?.acknowledgeIRN,
        // billAmmount: billam,
        // billAmmount: editVBTCode?.reduce(
        //   (partialSum, a) => partialSum + +Number(a.venAmmount).toFixed(3),
        //   0
        // ),
      };
      form.setFieldsValue(obj);
    }
  }, [vbtComponent, pageHeaders]);
  useEffect(() => {
    if (editVBTCode) {
      setVbtComponent(editVBTCode);
    }
  }, [editVBTCode]);
  useEffect(() => {
    if (editVBTCode.length > 0) {
      let roundoffv = editVBTCode.map(
        (component) => component.roundOffValue ?? "--"
      );
      let rov = roundoffv.filter((i) => i !== "--");
      // console.log("rov", rov.toString());
      // console.log("roundoffv", roundoffv);
      setRoundOffValue(rov);
      let roundoffs = editVBTCode.map(
        (component) => component.roundOffSign ?? "--"
      );
      let ros = roundoffs.filter((i) => i !== "--");
      // console.log("ros", ros.toString());
      setRoundOffSign(ros);
    }
  }, [editVBTCode]);

  return (
    <Row gutter={[0, 6]} style={{ height: "100%", overflowY: "auto" }}>
      <Col span={24} style={{ overflowY: "auto" }}>
        <TaxDetails title="Tax Details" summary={taxDetails} />
      </Col>
      <Col span={24} style={{ height: "50%" }}>
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
                {/* <SingleDatePicker
                  setDate={(value) => form.setFieldValue("invoiceDate", value)}
                /> */}
                <InputMask
                  // name="due_date[]"
                  // value={vendorData?.invoice_date}
                  // onChange={(e) =>
                  //   vendorInputHandler("invoice_date", e.target.value)
                  // }
                  className="input-date"
                  mask="99-99-9999"
                  placeholder="__-__-____"
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
                {/* <SingleDatePicker
                  setDate={(value) =>
                    form.setFieldValue("effectiveDate", value)
                  }
                /> */}
                <InputMask
                  // value={vendorData?.effective_date}
                  // onChange={(e) =>
                  //   vendorInputHandler("effective_date", e.target.value)
                  // }
                  className="date-text-input"
                  mask="99-99-9999"
                  placeholder="__-__-____"
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
                label="Invoice Amount"
                name="billAmmount"
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
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Typography.Text
                style={{ fontSize: "0.8rem", paddingBottom: 20 }}
              >
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
              <Form.Item label="Acknowledgement Number" name="ackNum">
                <Input
                // value={roundOffValue}
                // onChange={(e) => setRoundOffValue(e.target.value)}
                />
              </Form.Item>
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
