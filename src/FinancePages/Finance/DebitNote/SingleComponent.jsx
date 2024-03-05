import { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Row,
  Space,
  Typography,
} from "antd";
import MySelect from "../../../Components/MySelect";
import { imsAxios } from "../../../axiosInterceptor";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { toast } from "react-toastify";

const SingleComponent = ({
  field,
  index,
  form,
  remove,
  freightGlOptions,
  setFreightGlOptions,
  // getFreightGlOptions,
  // allTdsOptions,
  // tdsArray,
  addRateDiff,
  setAddRateDiff,
  vbtType,
}) => {
  // console.log("addRateDiff", addRateDiff);
  const [newValue, setNewValue] = useState("");
  const [allTdsOptions, setAllTdsOptions] = useState([]);
  const [tdsArray, setTdsArray] = useState([]);
  const components = Form.useWatch("components", form);
  const qty = Form.useWatch(["components", field.name, "qty"], form) ?? 0;
  const rate = Form.useWatch(["components", field.name, "rate"], form) ?? 0;
  const effectiveDate =
    Form.useWatch(["components", field.name, "effectiveDate"], form) ?? 0;
  const rateDifference =
    Form.useWatch(["components", field.name, "rateDifference"], form) ?? 0;
  const freight =
    Form.useWatch(["components", field.name, "freight"], form) ?? 0;
  const gstRate = Form.useWatch(["components", field.name, "gstRate"], form);
  const tdsAmount =
    Form.useWatch(["components", field.name, "tdsAmount"], form) ?? 0;
  const tdsglName =
    Form.useWatch(["components", field.name, "tdsglName"], form) ?? 0;
  const tdsglCode =
    Form.useWatch(["components", field.name, "tdsglCode"], form) ?? 0;
  const tdsCode =
    Form.useWatch(["components", field.name, "tdsCode"], form) ?? 0;
  const value = Form.useWatch(["components", field.name, "value"], form) ?? 0;
  const valueAfterTDS =
    Form.useWatch(["components", field.name, "valueAfterTDS"], form) ?? 0;
  const rateDiff = Form.useWatch(["components", field.name, "rateDiff"], form);

  // const tdsPercent = Form.useWatch(
  //   ["components", field.name, "tdsPercent"],
  //   form
  // );
  const gstType = Form.useWatch(["components", field.name, "gstType"], form);
  const minId = Form.useWatch(["components", field.name, "minId"], form);
  // const checkbox = Form.useWatch(["components", field.name, "checkbox"], form);
  const tdsPercent = Form.useWatch(
    ["components", field.name, "tdsPercent"],
    form
  )?.replaceAll("%", "");
  const tdsName =
    Form.useWatch(["components", field.name, "tdsName"], form) ?? 0;
  // const getCheckbox = form.getFieldValue("checkbox");
  useEffect(() => {
    let updatedTdsPercentage = 0;
    if (allTdsOptions?.length > 0) {
      let arr = allTdsOptions.filter((r) => r.tds_name === tdsName.label);

      form.setFieldValue(
        ["components", field.name, "tdsglName"],
        arr[0]?.ladger_name
      );
      form.setFieldValue(
        ["components", field.name, "tdsglCode"],
        arr[0]?.ledger_key
      );
      form.setFieldValue(
        ["components", field.name, "tdsCode"],
        arr[0]?.tds_key
      );
      form.setFieldValue(
        ["components", field.name, "tdsPercent"],
        arr[0]?.tds_percent
      );

      updatedTdsPercentage = arr[0]?.tds_percent;
    } else {
      updatedTdsPercentage = tdsPercent ?? 0;
    }

    let value;
    if (addRateDiff) {
      form.setFieldValue(["components", field.name, "qty"], 0);

      value = +Number(rateDifference).toFixed(3);
      setNewValue(value);
    } else {
      form.setFieldValue(["components", field.name, "rateDifference"], 0);
      // toast.info("Please enter the billing qty");
      // form.setFieldValue(["components", field.name, "value"]);
      value = +qty * +Number(rate).toFixed(3);
      setNewValue(value);
    }
    value = newValue;
    value = +Number(value).toFixed(3);

    let amountWithFreight = value + +Number(freight).toFixed(2);

    let taxPercentage = gstType === "Local" ? +Number(+gstRate / 2) : +gstRate;

    let taxAmount = +Number((amountWithFreight * taxPercentage) / 100).toFixed(
      2
    );

    if (gstType === "Local") {
      taxAmount = taxAmount * 2;
    }

    let amountAfterTax = amountWithFreight + taxAmount;

    //   let tdsApplied =
    //     obj.tdsCodeValue &&
    //     obj.tdsData.filter((row) => row.tds_key === obj.tdsCodeValue)[0];

    let tdsAmount = +Number(
      (amountWithFreight * updatedTdsPercentage) / 100
    ).toFixed(3);
    tdsAmount = +Number(tdsAmount).toFixed(2);
    tdsAmount = Math.round(tdsAmount);
    let valueAfterTDS = amountAfterTax - tdsAmount;
    valueAfterTDS = +Number(valueAfterTDS).toFixed(4);
    form.setFieldValue(["components", field.name, "value"], value);
    form.setFieldValue(
      ["components", field.name, "gstAssValue"],
      amountWithFreight
    );
    form.setFieldValue(
      ["components", field.name, "cgst"],
      gstType === "Local" ? +Number(taxAmount).toFixed(2) / 2 : 0
    );
    form.setFieldValue(
      ["components", field.name, "sgst"],
      gstType === "Local" ? +Number(taxAmount).toFixed(2) / 2 : 0
    );
    form.setFieldValue(
      ["components", field.name, "igst"],
      gstType === "Interstate" ? +Number(taxAmount).toFixed(2) : 0
    );
    form.setFieldValue(
      ["components", field.name, "tdsAssValue"],
      amountWithFreight
    );
    form.setFieldValue(["components", field.name, "tdsAmount"], tdsAmount);
    form.setFieldValue(
      ["components", field.name, "vendorAmount"],
      valueAfterTDS
    );
  }, [
    components,
    addRateDiff,
    qty,
    tdsPercent,
    tdsCode,
    tdsglCode,
    tdsglName,
    rateDifference,
    value,
    valueAfterTDS,
    tdsAmount,
    rateDiff,
    effectiveDate,
    ///
  ]);
  // useEffect(() => {
  //   let value = 0;
  //   if (addRateDiff) {
  //     form.setFieldValue(["components", field.name, "qty"], 0);
  //     let value = +Number(rate).toFixed(3);
  //     setNewValue(value);
  //   } else {
  //     form.setFieldValue(["components", field.name, "qty"]);
  //     let value = +qty * +Number(rate).toFixed(3);
  //     setNewValue(value);
  //   }
  // }, [addRateDiff, setAddRateDiff]);
  const getTdsOptions = async (minId) => {
    const response = await imsAxios.post("/tally/vbt01/fetch_minData", {
      min_id: minId,
    });
    const { data } = response;
    data.data[0].ven_tds.push({
      ladger_name: "--",
      ledger_key: "--",
      tds_code: "--",
      tds_key: "--",
      tds_name: "--",
      tds_gl_code: "--",
      tds_percent: "0",
    });
    let arr = data.data;
    setAllTdsOptions(arr[0].ven_tds);

    if (data.code === 200) {
      let tdsC = arr[0].ven_tds.map((r) => {
        return {
          text: r.tds_name,
          value: r.tds_key,
        };
      });
      setTdsArray(tdsC);
    } else {
      // toast.error(data.message.msg);
    }
  };

  const getFreightGlOptions = async (vbtKey) => {
    // const vbtType = vbtCodes[0].split("/")[0].toLowerCase
    try {
      // setLoading("fetch");
      const response = await imsAxios.post("/tally/vbt/fetch_freight_group", {
        search: vbtType,
      });
      const { data } = response;
      let arr = [];
      if (data.code == 200) {
        arr = data.map((row) => ({
          value: row.id,
          text: row.text,
        }));
        setFreightGlOptions(arr);
      }
    } catch (error) {
      // toast.error("Some error occured while fetching freight Gls");
      // console.log("Some error occured while fetching freight Gls", error);
    } finally {
      // setLoading(false);
    }
  };
  useEffect(() => {
    if (minId?.length > 0) {
      getTdsOptions(minId);
      getFreightGlOptions();
    }
  }, [minId]);
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
      <Col span={24}>
        <Row justify="space-between" align="middle" style={{ height: "100%" }}>
          <Col span={1}>
            <Typography.Text type="secondary" style={{ marginRight: 5 }} strong>
              {index + 1}.
            </Typography.Text>
          </Col>
          {/* {index  && ( */}
          <Button
            onClick={() => remove(field.name)}
            danger
            type="text"
            size="small"
          >
            - Remove Component
          </Button>
          {/* )} */}
        </Row>
      </Col>

      <Col span={3} offset={1}>
        <Form.Item label="MIN" name={[field.name, "minId"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Invoice Date" name={[field.name, "invoiceDate"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="Invoice" name={[field.name, "invoiceNo"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Part Code" name={[field.name, "partCode"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={5}>
        <Form.Item label="Component" name={[field.name, "component"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="VBT Qty" name={[field.name, "billingQty"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Billing Qty" name={[field.name, "qty"]}>
          <Input disabled={addRateDiff} />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="In Rate" name={[field.name, "rate"]}>
          <Input disabled={addRateDiff} />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Value" name={[field.name, "value"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="Freight" name={[field.name, "freight"]}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="Freight Gl" name={[field.name, "freightGl"]}>
          <MySelect options={freightGlOptions} />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="GST Asses. Value" name={[field.name, "gstAssValue"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="GL Name" name={[field.name, "glName"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={1}>
        <Form.Item label="GST Rate" name={[field.name, "gstRate"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="GST Type" name={[field.name, "gstType"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      {gstType === "Local" && (
        <Col span={2}>
          <Form.Item label="CGST" name={[field.name, "cgst"]}>
            <Input disabled />
          </Form.Item>
        </Col>
      )}
      {gstType === "Local" && (
        <Col span={2}>
          <Form.Item label="SGST" name={[field.name, "sgst"]}>
            <Input disabled />
          </Form.Item>
        </Col>
      )}

      {gstType === "Interstate" && (
        <Col span={2}>
          <Form.Item label="IGST" name={[field.name, "igst"]}>
            <Input disabled />
          </Form.Item>
        </Col>
      )}

      <Col span={3}>
        <Form.Item label="TDS Code" name={[field.name, "tdsName"]}>
          <MySelect labelInValue options={tdsArray} />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="TDS GL" name={[field.name, "tdsglName"]}>
          <Input />
        </Form.Item>
      </Col>
      <Col span={3}>
        <Form.Item label="TDS Ass. Value" name={[field.name, "tdsAssValue"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={1}>
        <Form.Item label="TDS %" name={[field.name, "tdsPercent"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Form.Item label="TDS Amount" name={[field.name, "tdsAmount"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      {/* {allTdsOptions.length > 0 && (
        <>
          <Col span={3}>
            <Form.Item label="TDS GL" name={[field.name, "glName"]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={3}>
            <Form.Item
              label="TDS Ass. Value"
              name={[field.name, "tdsAssValue"]}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={1}>
            <Form.Item label="TDS %" name={[field.name, "tdsPercent"]}>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Form.Item label="TDS Amount" name={[field.name, "tdsAmount"]}>
              <Input disabled />
            </Form.Item>
          </Col>
        </>
      )} */}

      <Col span={2}>
        <Form.Item label="Vendor Amount" name={[field.name, "vendorAmount"]}>
          <Input disabled />
        </Form.Item>
      </Col>
      {/* {addRateDiff && (
        
      )} */}
      <Col span={3}>
        <Form.Item
          label="Total Rate Difference"
          name={[field.name, "rateDifference"]}
        >
          <Input disabled={!addRateDiff} />
        </Form.Item>
      </Col>
      <Col span={4} style={{ marginTop: "20px" }}>
        <Form.Item name={[field.name, "rateDiff"]}>
          <span>
            {" "}
            <Checkbox
              checked={addRateDiff}
              onChange={(e) => setAddRateDiff(e.target.checked)}
            >
              {" "}
              {/* <Typography.Text style={{ fontSize: "0.7rem" }}>
              Enable Rate Difference
            </Typography.Text> */}
            </Checkbox>
          </span>
          <span>
            <Typography.Text style={{ fontSize: "0.7rem" }}>
              Enable Rate Difference
            </Typography.Text>
          </span>
        </Form.Item>
      </Col>
    </Row>
  );
};

export default SingleComponent;
