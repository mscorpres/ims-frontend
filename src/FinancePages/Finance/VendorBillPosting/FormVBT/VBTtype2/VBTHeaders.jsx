import {
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Form,
  Input,
  Row,
  Tooltip,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import MySelect from "../../../../../Components/MySelect";
import InputMask from "react-input-mask";
import TaxDetails from "./TaxDetails";
import SingleDatePicker from "../../../../../Components/SingleDatePicker";
import { CalculatorOutlined } from "@ant-design/icons";
function VBTHeaders({
  form,
  vbtComponent,
  taxDetails,
  editingVBT,
  roundOffValue,
  roundOffSign,
  setRoundOffSign,
  setRoundOffValue,
  addFreightCalc,
  setAddFreightCalc,
  addMiscCalc,
  setAddMiscCalc,
  addInsurCalc,
  setAddInsurCalc,
  allRowInsurance,
  setAllRowInsurance,
  allRowFreight,
  setAllRowFreight,
  setAllRowSws,
  allRowSws,
  editVBTCode,
  setVbtComponent,
}) {
  var addressDetails;
  // console.log("addressDetails in", vbtComponent);
  // console.log("addressDetails in", editVBTCode);
  // let fetchedOtherData = vbtComponent && vbtComponent[0].vbtOtherData;
  // console.log("addressDetails in", fetchedOtherData);
  // let addressDetails = JSON.parse(fetchedOtherData);
  // if (addInsurCalc == false) {
  //   form.setFieldValue("totalInsurance", 0);
  // }

  useEffect(() => {
    if (vbtComponent.length > 0) {
      let fetchedOtherData = vbtComponent && vbtComponent[0].vbtOtherData;
      console.log("addressDetails in", fetchedOtherData);
      addressDetails = JSON.parse(fetchedOtherData);
      console.log("here is the", addressDetails);
    }
  }, [vbtComponent]);

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
          gst: "999999999999999",
          venCode: pageHeaders?.ven_code,
          // comment:
          //   apiUrl === "vbt06"
          //     ? `Being Jobwork charges due of challan no:____on inv: ${pageHeaders?.invoice_id} dt:____of amount:____TDS:___ payable amt:____`
          //     : apiUrl === "vbt07"
          //     ? `Being -- purchase on inv ${pageHeaders?.invoice_id} date:____ of amt: ___ TDS:___ `
          //     : apiUrl === "vbt01"
          //     ? `Being purchased for on INV no. ${pageHeaders?.invoice_id} date: ___ amount: ___ TDS:___ `
          //     : apiUrl === "vbt02"
          //     ? `Being Service charges due to INV no. ${pageHeaders?.invoice_id} date of amount TDS:___ `
          //     : "",
          // billAmmount: billam,
          // venAmmount: pageHeaders?.reduce(
          //   (partialSum, a) => partialSum + +Number(a.venAmmount).toFixed(3),
          //   0
          // ),
        };
        // console.log("obj----------", obj);
        form.setFieldsValue(obj);
      }
    } else {
      obj = {
        invoiceNo: editVBTCode[0]?.invoiceNo,
        invoiceDate: editVBTCode[0]?.invoiceDate,
        venAddress: editVBTCode[0]?.venAddress,
        comment: editVBTCode[0]?.comment,
        billAmmount: editVBTCode[0]?.billAmount,
        gst: "999999999999999",
        effectiveDate: editVBTCode[0]?.effectiveDate,
        boeDate: addressDetails?.boe_date,
        boeNo: addressDetails?.boe_no,
        cha: addressDetails?.cha,
        hawbNo: addressDetails?.hawb_no,
        mawbNo: addressDetails?.mawb_no,
        portCode: addressDetails?.port_code,
        portName: addressDetails?.port_name,
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
      setRoundOffValue(rov);
      let roundoffs = editVBTCode.map(
        (component) => component.roundOffSign ?? "--"
      );
      let ros = roundoffs.filter((i) => i !== "--");
      console.log("ros", ros.toString());
      setRoundOffSign(ros);
    }
  }, [editVBTCode]);

  return (
    <Row gutter={[0, 6]} style={{ height: "100%", overflowY: "auto" }}>
      <Col span={24} style={{ overflowY: "auto" }}>
        <Collapse>
          <TaxDetails title="Tax Details" summary={taxDetails} />
        </Collapse>
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
              <Row>
                <Col span={12}>
                  <Checkbox
                    checked={addFreightCalc}
                    onChange={(e) => setAddFreightCalc(e.target.checked)}
                  >
                    Enable Freight(20%)
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={addMiscCalc}
                    onChange={(e) => setAddMiscCalc(e.target.checked)}
                    // disabled={!totalMisc}
                  >
                    Enable Misc
                  </Checkbox>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Row gutter={6}>
                <Col span={12}>
                  <Form.Item name="totalFreight" label="Freight(BoE)">
                    <div style={{ display: "flex", marginTop: "1em" }}>
                      <Input
                        label="freight"
                        // disabled={!addFreightCalc}
                        // suffix={
                        //   <Tooltip title="Calculate Freight for all rows">
                        //     <Button
                        //       // disabled={true}
                        //       onClick={setAllRowFreight(true)}
                        //       // block
                        //       icon={
                        //         <CalculatorOutlined
                        //           style={{ fontSize: "0.8rem" }}
                        //         />
                        //       }
                        //     />
                        //   </Tooltip>
                        // }
                      />
                    </div>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="totalMisc" label="Misc.">
                    <div style={{ display: "flex", marginTop: "1em" }}>
                      <Input
                        label="Misc."
                        name="totalMiscCharges"
                        // disabled={!addMiscCalc}
                      />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Row>
                <Col span={12}>
                  <Checkbox
                    checked={addInsurCalc}
                    onChange={(e) => setAddInsurCalc(e.target.checked)}
                    disabled={allRowInsurance}
                  >
                    Insurance
                  </Checkbox>
                </Col>
                <Col span={12}>
                  <Checkbox
                    checked={allRowInsurance}
                    onChange={(e) => setAllRowInsurance(e.target.checked)}
                    disabled={addInsurCalc}
                  >
                    Apply Insur.(1.125%)
                  </Checkbox>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Row gutter={6}>
                <Col span={24}>
                  <Form.Item name="totalInsurance">
                    <div style={{ display: "flex", marginTop: "1em" }}>
                      <Input disabled={!addInsurCalc} />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            {/* <Col span={24}>
              <Form.Item label="Total SWS" name="totalsws">
                <Input
                  suffix={
                    <Tooltip title="Calculate sws for all rows">
                      <Button
                        onClick={() => setAllRowSws(true)}
                        // block
                        icon={
                          <CalculatorOutlined style={{ fontSize: "0.8rem" }} />
                        }
                      />
                    </Tooltip>
                  }
                />
              </Form.Item>
              //removed
            </Col> */}
            <Col span={24}>
              <Row gutter={4}>
                <Col span={12}>
                  <Form.Item label="Port Code" name="portCode">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Port Name" name="portName">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Row gutter={4}>
                <Col span={12}>
                  <Form.Item label="BOE Date" name="boeDate">
                    <InputMask
                      className="input-date"
                      mask="99-99-9999"
                      placeholder="__-__-____"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="BOE No." name="boeNo">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Row gutter={4}>
                <Col span={12}>
                  <Form.Item label="HAWB No." name="hawbNo">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="MAWB No." name="mawbNo">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Form.Item label="CHA" name="cha">
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Comments"
                name="comment"
                rules={[
                  {
                    required: true,
                    message: "Please Enter Comment",
                  },
                ]}
              >
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
