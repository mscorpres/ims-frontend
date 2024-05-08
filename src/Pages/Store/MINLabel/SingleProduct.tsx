import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Typography,
  Upload,
} from "antd";
import UploadDocs from "../MaterialIn/MaterialInWithPO/UploadDocs";
import MyButton from "@/Components/MyButton";
import Loading from "@/Components/Loading.jsx";
export default function SingleProduct({
  index,
  field,
  fields,
  add,
  remove,
  form,
  setFiles,
  files,
  loading,
  scannedData,
  SingleDetail,

  reset,
  submitData,
  scanTheQr,
  ready,
  ref,
  setScannedData,
  setReady,
  setBoxCheck,
  boxChecked,
  // allTdsOptions,
  // tdsArray,
  // optionState,
  // setOptionState,
}) {
  // console.log("Upload event:", loading);
  const details = Form.useWatch(["components", field.name], form) ?? "";

  return (
    <Row
      style={{
        // background: "#f5f5f58f",
        padding: "5px 15px",
        borderRadius: 10,
        marginTop: 5,
        maxHeight: "50%",
        height: "50%",
        overflowX: "hidden",
        overflowY: "auto",
      }}
      gutter={[6, 10]}
      key={field.key}
    >
      <Col span={12}>
        {/* <Flex vertical justify="center" gap={10}> */}
        {/* <Flex justify="center"> */}
      </Col>
      <Col span={24}>
        <Card title="Scan Details">
          {(loading("fetch") || scannedData.loading) && <Loading />}

          <Flex justify="center" vertical gap={"10px"}>
            <div style={{ display: "flex" }}>
              <Col span={1}>
                <Typography.Text
                  type="secondary"
                  style={{ marginRight: 5 }}
                  strong
                >
                  {index + 1}.
                </Typography.Text>
              </Col>
              <Col span={3}>
                <Typography.Text strong>MIN Details</Typography.Text>
              </Col>
            </div>
            <Divider />
            <Flex gap={"15px 50px"} wrap="wrap">
              <SingleDetail label="MIN ID" value={details.minId} />
              <SingleDetail label="MIN Date" value={details.minDate} />
              <SingleDetail label="Component" value={details.component} />
              <SingleDetail label="Part Code" value={details.partCode} />
              <SingleDetail label="MIN Qty" value={details.minQty} />
              <SingleDetail label="Cost Center" value={details.costCenter} />
              <SingleDetail label="Vendor" value={details.vendor} />
              <SingleDetail label="Vendor Code" value={details.vendorCode} />
              <SingleDetail label="Project" value={details.project} />
            </Flex>
            <div>
              <Typography.Text strong>Box Details</Typography.Text>
              <Divider />
            </div>
            <Flex gap={20} wrap="wrap">
              <Form.Item name={[field.name, "opened"]} label="">
                <Checkbox
                  // checked={boxChecked}
                  onChange={(e) =>
                    form.setFieldValue(
                      ["components", field.name, "opened"],
                      e.target.checked
                    )
                  }
                >
                  Box Opened
                </Checkbox>
              </Form.Item>
              <SingleDetail label="Box Label" value={details.boxLabel} />

              <SingleDetail label="Box Qty" value={details.boxQty} />
              <SingleDetail label="Box Created Date" value={details.boxDate} />
              <Form.Item
                name={[field.name, "availabelQty"]}
                // name="availabelQty"
                label={
                  <Typography.Text strong style={{ fontSize: "0.8rem" }}>
                    Available Qty
                  </Typography.Text>
                }
              >
                <Input
                  disabled={
                    form.getFieldValue(["components", field.name, "opened"]) ==
                    false
                  }
                />
              </Form.Item>
            </Flex>
          </Flex>

          <Divider />
          <Row
            justify={"space-between"}
            align="middle"
            style={{ height: "100%" }}
          >
            <div style={{ display: "grid" }}>
              {/* <MyButton
                size="large"
                text="Scan Label"
                variant="scan"
                type="default"
                onClick={scanTheQr}
                loading={loading("fetch") || scannedData.loading}
              /> */}
              {/* </Flex> */}
              {/* <Flex justify="center"> */}
              {/* <Typography.Text
                strong
                style={{
                  color: ready ? "green" : "red",
                  fontSize: 12,
                  marginLeft: "4px",
                  marginTop: "4px",
                }}
              >
                {ready
                  ? "Ready to Scan !!!"
                  : "Click the scan button to start scanning !!!"}
              </Typography.Text> */}
            </div>
            {/* </Flex> */}
            {/* </Flex> */}

            {/* hidden input */}

            {/* <div style={{ display: "flex" }}> */}
            {/* <Row>
              {fields.length > 1 && (
                <Col span={14}>
                  <Button
                    onClick={() => remove(field.name)}
                    danger
                    type="text"
                    size="small"
                  >
                    - Remove Document
                  </Button>
                </Col>
              )}
              <Col span={4}>
                <Button size="small" type="link" onClick={() => add()}>
                  + Add Document
                </Button>
              </Col>
            </Row> */}
            {/* </div> */}
          </Row>
          <Flex justify="center" gap={5}>
            <MyButton variant="reset" onClick={reset}>
              Reset
            </MyButton>
            {/* <MyButton
            variant="submit"
            onClick={submitData}
            disabled={!details.boxQty}
            loading={loading("submit")}
          /> */}
          </Flex>
        </Card>
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
