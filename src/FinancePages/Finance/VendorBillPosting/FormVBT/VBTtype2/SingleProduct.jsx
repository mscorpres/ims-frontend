"use client";
import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Row,
  Col,
  Typography,
  Space,
  Select,
  Tooltip,
  message,
} from "antd";
import Loading from "../../../../../Components/Loading";
import MyAsyncSelect from "../../../../../Components/MyAsyncSelect";
import MySelect from "../../../../../Components/MySelect";
import { imsAxios } from "../../../../../axiosInterceptor";
import { toast } from "react-toastify";
import { CodeSandboxCircleFilled, CalculatorOutlined } from "@ant-design/icons";

export default function SingleComponent({
  index,
  field,
  fields,
  add,
  remove,
  form,
  allTdsOptions,
  tdsArray,
  optionState,
  setOptionState,
  glCodes,
  setGlCodes,
  apiUrl,
  currencies,
  setCurrencies,
  addFreightCalc,
  setAddFreightCalc,
  addMiscCalc,
  setAddMiscCalc,
  setAddInsurCalc,
  addInsurCalc,
  allRowInsurance,
  setAllRowInsurance,
  allRowFreight,
  setAllRowFreight,
  setAllRowSws,
  allRowSws,
  loading,
  isCreate,
  setglState,
  glstate,
  lastRateArr,
  paginate,
  setPaginate,
}) {
  var lastRateFoundObj;
  const [showLastRateWarning, setShowLastRateWarning] = useState({
    rate: "",
    gl: "",
    glN: "",
  });
  var partArr = [];
  // lastOpVals.forEach((element) => {
  //   partArr.push(element.c_part_no);
  // });
  const [inrowInsur, setInrowInsur] = useState("");
  // console.log("addInsurCalc in single component", addInsurCalc);
  // console.log("allRowInsurance in single component", allRowInsurance);

  const [messageApi, contextHolder] = message.useMessage();
  let lastOpVals = form.getFieldValue("components");
  const component =
    Form.useWatch(["components", field.name, "component"], form) ?? 0;
  const qty =
    Form.useWatch(["components", field.name, "vbtBillQty"], form) ?? 0;
  const rate =
    Form.useWatch(["components", field.name, "vbtInRate"], form) ?? 0;
  const product =
    Form.useWatch(["components", field.name, "product"], form) ?? 0;
  const tcs = Form.useWatch(["components", field.name, "tcs"], form) ?? 0;
  // const freight =
  //   Form.useWatch(["components", field.name, "freightAmount"], form) ?? 0;
  const gstType = Form.useWatch(["components", field.name, "gstType"], form);
  const minId = Form.useWatch(["components", field.name, "minID"], form);
  let amountWithFreight;
  let value;
  const taxableValue =
    Form.useWatch(["components", field.name, "taxableValue"], form) ?? 0;
  const vbtInRate =
    Form.useWatch(["components", field.name, "vbtInRate"], form) ?? 0;
  const Rcurrency =
    Form.useWatch(["components", field.name, "currency"], form) ?? 0;

  const freightAmount =
    Form.useWatch(["components", field.name, "freightAmount"], form) ?? 0;
  const gstAmount =
    Form.useWatch(["components", field.name, "gstAmount"], form) ?? 0;
  const customAssVal =
    Form.useWatch(["components", field.name, "customAssVal"], form) ?? 0;
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
  const tds_key =
    Form.useWatch(["components", field.name, "tds_key"], form) ?? 0;
  // ---
  const exchangeRate =
    Form.useWatch(["components", field.name, "currencyRate"], form) ?? 0;
  const foreignValues =
    Form.useWatch(["components", field.name, "foreignValue"], form) ?? 0;
  const misc =
    Form.useWatch(["components", field.name, "miscCharges"], form) ?? 0;
  const insurance =
    Form.useWatch(["components", field.name, "insurance"], form) ?? 0;
  const customDuty =
    Form.useWatch(["components", field.name, "customDuty"], form) ?? 0;
  const sws = Form.useWatch(["components", field.name, "sws"], form) ?? 0;
  const otherDuty =
    Form.useWatch(["components", field.name, "otherDuty"], form) ?? 0;
  const igst =
    Form.useWatch(["components", field.name, "igstAmount"], form) ?? 0;
  const cifAmounts =
    Form.useWatch(["components", field.name, "cifAmounts"], form) ?? 0;
  const glCodeValue =
    Form.useWatch(["components", field.name, "glCodeValue"], form) ?? 0;
  // const totalMisc =
  //   Form.useWatch(["components", field.name, "totalMisc"], form) ?? 0;
  const gstRate =
    Form.useWatch(["components", field.name, "gstRate"], form)?.replaceAll(
      "%",
      ""
    ) ?? 0;
  const totalMisc = Form.useWatch("totalMisc", form);
  const totalInsurance = Form.useWatch("totalInsurance", form);
  const totalbillAmmount = Form.useWatch("billAmmount", form);
  const totalFreight = Form.useWatch("totalFreight", form);
  const rowIns = Form.useWatch("rowInsurance", form);

  let totalVenAm = form.getFieldValue(["components", field.name, "venAmmount"]);
  let arr = form.getFieldsValue("components");
  // console.log("arr in single ", arr);
  let vendorAmount = arr.components?.reduce(
    (partialSum, a) => partialSum + +Number(a.venAmmount).toFixed(2),
    0
  );
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
  // const getGstGlOptions = async () => {
  //   const response = await imsAxios.get("/tally/vbt/fetch_gst_ledger");
  //   const { data } = response;
  //   if (data) {
  //     if (data[0]) {
  //       let arr = data.map((row) => ({ value: row.id, text: row.text }));
  //       setglState(arr);
  //     }
  //   }
  // };

  useEffect(() => {
    let updatedTdsPercentage = 0;

    let value = qty * vbtInRate * +Number(exchangeRate).toFixed(3);
    value = +Number(value).toFixed(3);

    let foreignValues =
      Rcurrency === "364907247" ? 0 : +Number(vbtBillQty) * +Number(rate);
    foreignValues = +Number(foreignValues).toFixed(2);
    // console.log("value", value);
    // console.log("misc", misc);
    let addFreight = value + +Number(misc);
    // console.log("value----", value);
    addFreight = +Number(addFreight).toFixed(2);
    let freightInclude;
    if (addFreightCalc) {
      addFreight = (addFreight * 20) / 100;
      // console.log("addFreight----", addFreight);
      addFreight = +Number(addFreight).toFixed(2);
      freightInclude = addFreight;
    } else {
      freightInclude = form.getFieldValue([
        "components",
        field.name,
        "freightAmount",
      ]);
      addFreight = 0;
    }
    if (isCreate || totalInsurance) {
      // console.log("totalInsurance", totalInsurance);
      // console.log("inrowInsur", inrowInsur);
      if (inrowInsur === "inRowInsurance") {
        let newinsurance =
          ((+Number(misc).toFixed(2) + +Number(value).toFixed(3)) * 1.125) /
          100;
        // console.log("newinsurance", newinsurance);
        newinsurance = +Number(newinsurance).toFixed(2);
        form.setFieldValue(
          ["components", field.name, "insurance"],
          newinsurance
        );
      } else {
        // console.log("iscre", isCreate);
        // console.log("iscre insurance", insurance);
        !form.isFieldTouched(["components", field.name, "insurance"]) &&
          form.isFieldTouched("components");
      }
    }
    if (customDuty) {
      let sws = (customDuty * 10) / 100;
      sws = +Number(sws).toFixed(2);
      // console.log("sws_______", sws);
      // form.setFieldValue(["components", field.name, "sws"], sws);
      if (
        !form.isFieldTouched(["components", field.name, "sws"]) &&
        form.isFieldTouched("components")
      ) {
        form.setFieldValue(["components", field.name, "sws"], sws);
      }
    }

    let cifAmount =
      value +
      +Number(freightInclude).toFixed(2) +
      +Number(insurance).toFixed(2) +
      +Number(misc).toFixed(2);
    // console.log("cifAmounts", cifAmount);
    let cifAmounts = Number(cifAmount).toFixed(2);
    form.setFieldValue(["components", field.name, "customAssVal"], cifAmounts);

    let gstAssingValue;
    cifAmount = +Number(cifAmounts).toFixed(2);
    gstAssingValue =
      cifAmount +
      +Number(customDuty).toFixed(2) +
      +Number(sws).toFixed(2) +
      +Number(otherDuty).toFixed(2);
    gstAssingValue = +Number(gstAssingValue).toFixed(2);
    // console.log("gstAssingValue---", gstAssingValue);
    if (isCreate) {
      if (
        !form.isFieldTouched(["components", field.name, "gstAssValue"]) &&
        form.isFieldTouched("components")
      ) {
        form.setFieldValue(
          ["components", field.name, "gstAssValue"],
          gstAssingValue
        );
      }
    }
    let taxPercentage = gstRate;
    let taxAmount = +Number((gstAssingValue * taxPercentage) / 100).toFixed(2);

    const cgst = gstType === "L" ? +Number(taxAmount).toFixed(2) / 2 : 0;
    const sgst = gstType === "L" ? +Number(taxAmount).toFixed(2) / 2 : 0;
    const igst = gstType === "I" ? +Number(taxAmount).toFixed(2) : 0;
    // console.log("cgst", igst);
    taxAmount =
      +Number(cgst).toFixed(2) +
      +Number(sgst).toFixed(2) +
      +Number(igst).toFixed(2);
    let amountAfterTax = amountWithFreight + taxAmount;
    amountAfterTax = Math.round(amountAfterTax);
    if (isCreate) {
      if (
        !form.isFieldTouched(["components", field.name, "igstAmount"]) &&
        form.isFieldTouched("components")
      ) {
        form.setFieldValue(["components", field.name, "igstAmount"], igst);
      }
    }

    let tdsAmount = +Number((tdsAssValue * updatedTdsPercentage) / 100).toFixed(
      3
    );
    tdsAmount = tds_key ? +Number(tdsAmount).toFixed(2) : 0;

    tdsAmount = Math.round(tdsAmount);
    let valueAfterTDS = amountAfterTax - tdsAmount;
    const gstAssesValue = +Number(vbtBillQty * rate + freightAmount).toFixed(2);

    // console.log("freightAmount -> is here for CifValue cal", freightAmount);
    // console.log("freightInclude -> is here for CifValue cal", freightInclude);
    let cifValues =
      +Number(value).toFixed(2) +
      +Number(freightAmount).toFixed(2) +
      +Number(customDuty).toFixed(2) +
      +Number(sws).toFixed(2) +
      +Number(otherDuty).toFixed(2);
    let cifValue = +Number(cifValues).toFixed(2);

    let cifPrices = cifValue / vbtBillQty;
    let cifPrice = +Number(cifPrices).toFixed(2);
    let inrPrices = vbtInRate * +Number(exchangeRate).toFixed(3);
    let inrPrice = +Number(inrPrices).toFixed(2);
    // console.log("vbtcifPriceillQty", ci fPrice);
    form.setFieldValue(["components", field.name, "taxableValue"], value);

    form.setFieldValue(["components", field.name, "gstAmount"], gstAmount);
    // form.setFieldValue(["components", field.name, "igstAmount"], igst);
    form.setFieldValue(["components", field.name, "sgstAmount"], sgst);
    form.setFieldValue(["components", field.name, "cgstAmount"], cgst);
    form.setFieldValue(["components", field.name, "venAmmount"], value);
    form.setFieldValue(["components", field.name, "value"], value);
    form.setFieldValue(["components", field.name, "addFreight"], addFreight);
    form.setFieldValue(["components", field.name, "tdsAmount"], tdsAmount);
    form.setFieldValue(["components", field.name, "cifValue"], cifValue);
    form.setFieldValue(
      ["components", field.name, "foreignValue"],
      foreignValues
    );
    form.setFieldValue(["components", field.name, "addSumFreight"], addFreight);

    form.setFieldValue(
      ["components", field.name, "tdsAssValue"],
      amountWithFreight
    );
    form.setFieldValue(["components", field.name, "inrPrice"], inrPrice);

    form.setFieldValue(["components", field.name, "cifValue"], cifValue);
    form.setFieldValue(["components", field.name, "cifPrice"], cifPrice);
  }, [
    qty,
    rate,
    tcs,

    // freight,
    gstRate,
    tdsName,
    freightAmount,
    glName,
    tdsPercent,
    taxableValue,
    gstAssValue,
    glCode,
    gstType,
    // tdsAssValue,
    // tds_key,
    exchangeRate,
    foreignValues,
    Rcurrency,
    inrowInsur,
    otherDuty,
    sws,
    customDuty,
    misc,
    addFreightCalc,
    allRowSws,
    igst,
    insurance,
    customAssVal,
    // freightInclude,
    cifAmounts,
  ]);
  useEffect(() => {
    showRateWarning();
  }, [vbtInRate]);
  useEffect(() => {
    showGlWarning();
  }, [glCodeValue]);

  useEffect(() => {
    if (isCreate || totalFreight) {
      if (allRowFreight || totalFreight) {
        let freight =
          (totalFreight * Number(totalVenAm)) /
          +Number(vendorAmount).toFixed(2);
        freight = +Number(freight).toFixed(2);
        form.setFieldValue(
          ["components", field.name, "freightAmount"],
          freight
        );
        // } else {
        //   console.log("freig not appliect");
        //   form.setFieldValue(["components", field.name, "freightAmount"], 0);
        // }
      }
      // else {
      //   console.log("freig not appliect");
      //   form.setFieldValue(["components", field.name, "freightAmount"], 0);
      // }
    } else if (
      !form.isFieldTouched(["components", field.name, "totalFreight"]) &&
      form.isFieldTouched("components")
    ) {
      // console.log("total freight changed ");
    } else {
      // console.log("here");
    }
  }, [
    addFreightCalc,
    totalFreight,
    totalVenAm,
    totalbillAmmount,
    allRowFreight,
  ]);
  ///header calculations
  useEffect(() => {
    if (addMiscCalc) {
      if (isCreate || totalMisc) {
        let misc = (totalMisc * totalVenAm) / vendorAmount;
        misc = +Number(misc).toFixed(2);

        if (
          !form.isFieldTouched(["components", field.name, "miscCharges"]) &&
          form.isFieldTouched("components")
        ) {
          form.setFieldValue(["components", field.name, "miscCharges"], misc);
        }
      } else {
        form.setFieldValue(["components", field.name, "miscCharges"], 0);
      }
    }
  }, [addMiscCalc, misc, totalMisc]);
  useEffect(() => {
    let totalVenAm = form.getFieldValue([
      "components",
      field.name,
      "venAmmount",
    ]);
    let insurance;
    // console.log("addInsurCalc", addInsurCalc);

    if (addInsurCalc || allRowInsurance || isCreate) {
      if (totalInsurance) {
        if (totalbillAmmount === 0 || totalbillAmmount === "") {
          toast.error("Please Enter the Bill Amount");
        }

        insurance = (totalInsurance * totalVenAm) / totalbillAmmount;
        insurance = +Number(insurance).toFixed(2);
        form.setFieldValue(["components", field.name, "insurance"], insurance);
      } else if (allRowInsurance) {
        // form.setFieldValue("totalInsurance", 0);
        // form.setFieldValue(["components", field.name, "insurance"], 0);
        // console.log("rowInsurance=====", allRowInsurance);
        // form.setFieldValue(["components", field.name, "totalInsurance"], 0);

        insurance =
          ((+Number(misc).toFixed(2) + +Number(totalVenAm).toFixed(2)) *
            1.125) /
          100;
        insurance = +Number(insurance).toFixed(2);
        // console.log("insurance inside the euse", insurance);

        form.setFieldValue(["components", field.name, "insurance"], insurance);
      } else {
        form.setFieldValue(["components", field.name, "insurance"], 0);
      }
    } else {
      // console.log("insite", isCreate);
      // console.log("insite", insurance);
    }
  }, [allRowInsurance, addInsurCalc, totalInsurance, misc]);
  useEffect(() => {
    // console.log("inrowInsur", inrowInsur);
  }, [allRowInsurance]);

  const currencyOption = [
    {
      value: "$",
      label: "$",
    },
    {
      value: "₹",
      label: "₹",
    },
  ];

  const showRateWarning = () => {
    // console.log("this is the last date arr iin single, ", lastRateArr);
    const partCode = form.getFieldValue(["components", field.name, "partCode"]);

    lastRateFoundObj = lastRateArr?.find((row) => row.partCode === partCode);

    // if (form.isFieldTouched(["components", field.name, "vbtInRate"])) {
    if (lastRateFoundObj?.inRate !== vbtInRate) {
      // setShowLastRateWarning(lastRateFoundObj);
      setShowLastRateWarning((curr) => ({
        ...curr,
        rate: lastRateFoundObj?.inRate,
      }));
    } else {
      setShowLastRateWarning((curr) => ({
        ...curr,
        rate: "",
      }));
    }
    // }
  };
  const showGlWarning = () => {
    const partCode = form.getFieldValue(["components", field.name, "partCode"]);

    lastRateFoundObj = lastRateArr?.find((row) => row.partCode === partCode);
    // console.log("t----------> ", gloptions);

    // if (form.isFieldTouched(["components", field.name, "glCodeValue"])) {
    if (lastRateFoundObj?.ledgerCode !== glCodeValue) {
      setShowLastRateWarning((curr) => ({
        ...curr,
        gl: lastRateFoundObj?.ledgerCode,
        glN: lastRateFoundObj?.ledgerName,
      }));
    } else {
      setShowLastRateWarning((curr) => ({
        ...curr,
        gl: "",
        glN: "",
      }));
    }
    // }
  };

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
      {contextHolder}
      {loading === field.key && <Loading />}
      {isCreate ? (
        <>
          <Col span={1}>
            <Typography.Text type="secondary" style={{ marginRight: 5 }} strong>
              {index + 1}.
            </Typography.Text>
          </Col>
          <Col span={3}>
            <Form.Item label="MIN ID" name={[field.name, "minId"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Part Code" name={[field.name, "partCode"]}>
              <Input rows={1} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Part Name" name={[field.name, "partName"]}>
              <Input rows={1} />
            </Form.Item>
          </Col>
          {/* <Col span={4}>
        <Form.Item label="Po Number" name={[field.name, "poNumber"]}>
          <Input rows={1}   />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="Project ID" name={[field.name, "projectID"]}>
          <Input rows={1}   />
        </Form.Item>
      </Col> */}
          <Col span={2}>
            <Form.Item label="Invoice Qty" name={[field.name, "vbtBillQty"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="MIN Qty" name={[field.name, "vbtInQty"]}>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Price"
              name={[field.name, "vbtInRate"]}
              validateStatus={showLastRateWarning.rate && "warning"}
              help={
                showLastRateWarning.rate &&
                `Last price was ${showLastRateWarning.rate}`
              }
              // className="helptext"
              style={{ fontSize: 1 }}
              onBlur={() =>
                setShowLastRateWarning((curr) => ({
                  ...curr,
                  rate: "",
                }))
              }
              onFocus={() => showRateWarning()}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="Fx Value" name={[field.name, "foreignValue"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={1.5}>
            <Form.Item label="Currency" name={[field.name, "currency"]}>
              <MySelect defaultValue="$" options={currencies} />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              label="RoE"
              name={[field.name, "currencyRate"]}
              rules={[
                {
                  required: true,
                  message: "RoE is required",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="INR Value" name={[field.name, "value"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Misc Charges" name={[field.name, "miscCharges"]}>
              <Input
              // onBlur={() => {
              //   form.setFields([
              //     {
              //       name: ["components", field.name, "miscCharges"],
              //       touched: false,
              //     },
              //   ]);
              // }}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Add freight" name={[field.name, "addSumFreight"]}>
              <Input />
            </Form.Item>
          </Col>
          {/* <Col span={3}>
        <Form.Item label="Freight Gl" name={[field.name, "freight"]}>
          <Input disabled />
        </Form.Item>
      </Col> */}
          <Col span={3}>
            <Form.Item label="Freight" name={[field.name, "freightAmount"]}>
              <Input
                onBlur={() => {
                  form.setFields([
                    {
                      name: ["components", field.name, "freightAmount"],
                      touched: false,
                    },
                  ]);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Insurance" name={[field.name, "insurance"]}>
              {/* {index === 0 ? ( */}
              <Input
              // suffix={
              //   <Tooltip title="Calculate Insrance for all rows">
              //     <Button
              //       onClick={() => setInrowInsur("inRowInsurance")}
              //       // block
              //       icon={<CalculatorOutlined style={{ fontSize: "0.8rem" }} />}
              //     />
              //   </Tooltip>
              // }
              />
              {/* ) : ( */}
              {/* <Input
              suffix={
                <Tooltip title="Calculate Insrance for all rows">
                  <Button
                    disabled={true}
                    onClick={setInrowInsur("inRowInsurance")}
                    // block
                    icon={<CalculatorOutlined style={{ fontSize: "0.8rem" }} />}
                  />
                </Tooltip>
              }
            />
          )} */}
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              label="Custom Ass.Value"
              name={[field.name, "customAssVal"]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Custom Duty" name={[field.name, "customDuty"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="sws" name={[field.name, "sws"]}>
              <Input
                onBlur={() => {
                  form.setFields([
                    {
                      name: ["components", field.name, "sws"],
                      touched: false,
                    },
                  ]);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Other Duty" name={[field.name, "otherDuty"]}>
              <Input />
            </Form.Item>
          </Col>
          {/* <Col span={3}>
        <Form.Item label="GST Type" name={[field.name, "gstType"]}>
          <MySelect options={options} />
        </Form.Item>
      </Col> */}
          <Col span={3}>
            <Form.Item
              label="GST Ass. Value"
              name={[field.name, "gstAssValue"]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="GST Rate" name={[field.name, "gstRate"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="IGST" name={[field.name, "igstAmount"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="IGST G/L" name={[field.name, "IGSTGL"]}>
              {/* <MyAsyncSelect
                labelInValue
                loadOptions={getGstGlOptions}
                optionsState={glstate}
                onBlur={() => setglState([])}
              /> */}
              <MySelect
                labelInValue
                // loadOptions={getGstGlOptions}
                options={glstate}
                // onBlur={() => setglState([])}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="HSN/SAC" name={[field.name, "hsnCode"]}>
              <Input />
            </Form.Item>
          </Col>
          {/* <Col span={3}>
        <Form.Item label="HSN/SAC" name={[field.name, "hsnCode"]}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="GST Type" name={[field.name, "gstType"]}>
          <MySelect options={options} />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="GST Rate" name={[field.name, "gstRate"]}>
          <Input />
        </Form.Item>
      </Col>

      <Col span={3}>
        <Form.Item label="GST Ass. Value" name={[field.name, "gstAssValue"]}>
          <Input />
        </Form.Item>
      </Col>
      {gstType === "L" && (
        <Col span={2}>
          <Form.Item label="CGST" name={[field.name, "cgstAmount"]}>
            <Input />
          </Form.Item>
        </Col>
      )}
      {gstType === "L" && (
        <Col span={4}>
          <Form.Item label="CGST G/L" name={[field.name, "CGSTGL"]}>
            <MyAsyncSelect
              labelInValue
              loadOptions={getGstGlOptions}
              optionsState={glstate}
              onBlur={() => setglState([])}
            />
          </Form.Item>
        </Col>
      )}
      {gstType === "L" && (
        <Col span={2}>
          <Form.Item label="SGST" name={[field.name, "sgstAmount"]}>
            <Input />
          </Form.Item>
        </Col>
      )}
      {gstType === "L" && (
        <Col span={4}>
          <Form.Item label="SGST G/L" name={[field.name, "SGSTGL"]}>
            <MyAsyncSelect
              labelInValue
              loadOptions={getGstGlOptions}
              optionsState={glstate}
              onBlur={() => setglState([])}
            />
          </Form.Item>
        </Col>
      )}
      {gstType === "I" && (
        <Col span={2}>
          <Form.Item label="IGST" name={[field.name, "igstAmount"]}>
            <Input />
          </Form.Item>
        </Col>
      )}
      {gstType === "I" && (
        <Col span={4}>
          <Form.Item label="IGST G/L" name={[field.name, "IGSTGL"]}>
            <MyAsyncSelect
              labelInValue
              loadOptions={getGstGlOptions}
              optionsState={glstate}
              onBlur={() => setglState([])}
            />
          </Form.Item>
        </Col>
      )} */}
          <Col span={4}>
            <Form.Item
              label="Purchase G/L Code"
              name={[field.name, "glCodeValue"]}
              validateStatus={showLastRateWarning.gl && "warning"}
              help={
                showLastRateWarning.gl &&
                `Last GL was ${showLastRateWarning.glN}`
              }
              onBlur={() =>
                setShowLastRateWarning((curr) => ({
                  ...curr,
                  gl: "",
                  glN: "",
                }))
              }
              onFocus={() => showGlWarning()}
            >
              <MySelect options={glCodes} labelInValue />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Ven Amount" name={[field.name, "venAmmount"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="INR Price" name={[field.name, "inrPrice"]}>
              <Input />
            </Form.Item>
          </Col>{" "}
          <Col span={3}>
            <Form.Item label="CIF Value" name={[field.name, "cifValue"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="CIF Price" name={[field.name, "cifPrice"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Description"
              name={[field.name, "itemDescription"]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </>
      ) : (
        <>
          <Col span={1}>
            <Typography.Text type="secondary" style={{ marginRight: 5 }} strong>
              {index + 1}.
            </Typography.Text>
          </Col>
          <Col span={3}>
            <Form.Item label="MIN ID" name={[field.name, "minId"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Part Code" name={[field.name, "partCode"]}>
              <Input rows={1} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="Part Name" name={[field.name, "partName"]}>
              <Input rows={1} />
            </Form.Item>
          </Col>
          {/* <Col span={4}>
        <Form.Item label="Po Number" name={[field.name, "poNumber"]}>
          <Input rows={1}   />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Form.Item label="Project ID" name={[field.name, "projectID"]}>
          <Input rows={1}   />
        </Form.Item>
      </Col> */}
          <Col span={2}>
            <Form.Item label="Invoice Qty" name={[field.name, "vbtBillQty"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="MIN Qty" name={[field.name, "vbtInQty"]}>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="Price" name={[field.name, "vbtInRate"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="Fx Value" name={[field.name, "foreignValue"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={1.5}>
            <Form.Item label="Currency" name={[field.name, "currency"]}>
              <MySelect defaultValue="$" options={currencies} />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              label="RoE"
              name={[field.name, "currencyRate"]}
              rules={[
                {
                  required: true,
                  message: "RoE is required",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="INR Value" name={[field.name, "value"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Misc Charges" name={[field.name, "miscCharges"]}>
              <Input
              // onBlur={() => {
              //   form.setFields([
              //     {
              //       name: ["components", field.name, "miscCharges"],
              //       touched: false,
              //     },
              //   ]);
              // }}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Add freight" name={[field.name, "addSumFreight"]}>
              <Input />
            </Form.Item>
          </Col>
          {/* <Col span={3}>
        <Form.Item label="Freight Gl" name={[field.name, "freight"]}>
          <Input disabled />
        </Form.Item>
      </Col> */}
          <Col span={3}>
            <Form.Item label="Freight" name={[field.name, "freightAmount"]}>
              <Input
                onBlur={() => {
                  form.setFields([
                    {
                      name: ["components", field.name, "freightAmount"],
                      touched: false,
                    },
                  ]);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Insurance" name={[field.name, "insurance"]}>
              {/* {index === 0 ? ( */}
              <Input
              // suffix={
              //   <Tooltip title="Calculate Insrance for all rows">
              //     <Button
              //       onClick={() => setInrowInsur("inRowInsurance")}
              //       // block
              //       icon={<CalculatorOutlined style={{ fontSize: "0.8rem" }} />}
              //     />
              //   </Tooltip>
              // }
              />
              {/* ) : ( */}
              {/* <Input
              suffix={
                <Tooltip title="Calculate Insrance for all rows">
                  <Button
                    disabled={true}
                    onClick={setInrowInsur("inRowInsurance")}
                    // block
                    icon={<CalculatorOutlined style={{ fontSize: "0.8rem" }} />}
                  />
                </Tooltip>
              }
            />
          )} */}
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              label="Custom Ass.Value"
              name={[field.name, "customAssVal"]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Custom Duty" name={[field.name, "customDuty"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="sws" name={[field.name, "sws"]}>
              <Input
                onBlur={() => {
                  form.setFields([
                    {
                      name: ["components", field.name, "sws"],
                      touched: false,
                    },
                  ]);
                }}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Other Duty" name={[field.name, "otherDuty"]}>
              <Input />
            </Form.Item>
          </Col>
          {/* <Col span={3}>
        <Form.Item label="GST Type" name={[field.name, "gstType"]}>
          <MySelect options={options} />
        </Form.Item>
      </Col> */}
          <Col span={3}>
            <Form.Item
              label="GST Ass. Value"
              name={[field.name, "gstAssValue"]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="GST Rate" name={[field.name, "gstRate"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="IGST" name={[field.name, "igstAmount"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="IGST G/L" name={[field.name, "IGSTGL"]}>
              {/* <MyAsyncSelect
                labelInValue
                loadOptions={getGstGlOptions}
                optionsState={glstate}
                onBlur={() => setglState([])}
              /> */}
              <MySelect
                labelInValue
                // loadOptions={getGstGlOptions}
                options={glstate}
                // onBlur={() => setglState([])}
              />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="HSN/SAC" name={[field.name, "hsnCode"]}>
              <Input />
            </Form.Item>
          </Col>
          {/* <Col span={3}>
        <Form.Item label="HSN/SAC" name={[field.name, "hsnCode"]}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="GST Type" name={[field.name, "gstType"]}>
          <MySelect options={options} />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="GST Rate" name={[field.name, "gstRate"]}>
          <Input />
        </Form.Item>
      </Col>

      <Col span={3}>
        <Form.Item label="GST Ass. Value" name={[field.name, "gstAssValue"]}>
          <Input />
        </Form.Item>
      </Col>
      {gstType === "L" && (
        <Col span={2}>
          <Form.Item label="CGST" name={[field.name, "cgstAmount"]}>
            <Input />
          </Form.Item>
        </Col>
      )}
      {gstType === "L" && (
        <Col span={4}>
          <Form.Item label="CGST G/L" name={[field.name, "CGSTGL"]}>
            <MyAsyncSelect
              labelInValue
              loadOptions={getGstGlOptions}
              optionsState={glstate}
              onBlur={() => setglState([])}
            />
          </Form.Item>
        </Col>
      )}
      {gstType === "L" && (
        <Col span={2}>
          <Form.Item label="SGST" name={[field.name, "sgstAmount"]}>
            <Input />
          </Form.Item>
        </Col>
      )}
      {gstType === "L" && (
        <Col span={4}>
          <Form.Item label="SGST G/L" name={[field.name, "SGSTGL"]}>
            <MyAsyncSelect
              labelInValue
              loadOptions={getGstGlOptions}
              optionsState={glstate}
              onBlur={() => setglState([])}
            />
          </Form.Item>
        </Col>
      )}
      {gstType === "I" && (
        <Col span={2}>
          <Form.Item label="IGST" name={[field.name, "igstAmount"]}>
            <Input />
          </Form.Item>
        </Col>
      )}
      {gstType === "I" && (
        <Col span={4}>
          <Form.Item label="IGST G/L" name={[field.name, "IGSTGL"]}>
            <MyAsyncSelect
              labelInValue
              loadOptions={getGstGlOptions}
              optionsState={glstate}
              onBlur={() => setglState([])}
            />
          </Form.Item>
        </Col>
      )} */}
          <Col span={4}>
            <Form.Item
              label="Purchase G/L Code"
              name={[field.name, "glCodeValue"]}
            >
              <MySelect options={glCodes} labelInValue />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="Ven Amount" name={[field.name, "venAmmount"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="INR Price" name={[field.name, "inrPrice"]}>
              <Input />
            </Form.Item>
          </Col>{" "}
          <Col span={3}>
            <Form.Item label="CIF Value" name={[field.name, "cifValue"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item label="CIF Price" name={[field.name, "cifPrice"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Description"
              name={[field.name, "itemDescription"]}
            >
              {" "}
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
        </>
      )}
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
