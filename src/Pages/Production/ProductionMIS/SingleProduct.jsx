import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Row,
  TimePicker,
  Typography,
} from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";

export default function SingleProduct({
  index,
  field,
  add,
  remove,
  form,
  getdept,
  getOption,
  setAsyncOptions,
  asyncOptions,
}) {
  const format = "HH:mm";
  return (
    <Card size="small" style={{ marginBottom: 5 }}>
      <Row gutter={6}>
        <Col span={1}>
          <Typography.Text type="secondary" strong>
            {index + 1}.
          </Typography.Text>
        </Col>
        <Col span={5}>
          {" "}
          <Form.Item
            label="Product"
            name={[field.name, "sku"]}
            rules={[
              {
                required: true,
                message: "Please provide the sku.",
              },
            ]}
          >
            <MyAsyncSelect
              loadOptions={getOption}
              optionsState={asyncOptions}
              onBlur={() => setAsyncOptions([])}
            />
          </Form.Item>
        </Col>
        {/* <Col span={5}>
        {" "}
        <Form.Item label="Product Name" name={[field.name, "prodName"]}>
          <MyAsyncSelect />
        </Form.Item>
      </Col> */}
        <Col span={3}>
          {" "}
          <Form.Item
            label="Manpower"
            name={[field.name, "manpower"]}
            rules={[
              {
                required: true,
                message: "Please provide the Manpower.",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={3}>
          {" "}
          <Form.Item
            label="Line Count"
            name={[field.name, "noOfLines"]}
            rules={[
              {
                required: true,
                message: "Please provide the No. Of Lines.",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>
        <Col span={3}>
          {" "}
          <Form.Item
            label="Output"
            name={[field.name, "output"]}
            rules={[
              {
                required: true,
                message: "Please provide the Output.",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Col>

        <Col span={3}>
          {" "}
          <Form.Item
            label="Date"
            name={[field.name, "date"]}
            rules={[
              {
                required: true,
                message: "Please provide the date.",
              },
            ]}
          >
            <SingleDatePicker
              setDate={(value) =>
                form.setFieldValue(["components", field.name, "date"], value)
              }
            />
          </Form.Item>
        </Col>
        <Col span={3}>
          {" "}
          <Form.Item
            label="Shift Starts"
            name={[field.name, "start"]}
            rules={[
              {
                required: true,
                message: "Please provide the Shift Starts.",
              },
            ]}
          >
            <TimePicker format={format} />
          </Form.Item>
        </Col>
        <Col span={3}>
          {" "}
          <Form.Item
            label="Shift End"
            name={[field.name, "end"]}
            rules={[
              {
                required: true,
                message: "Please provide the Shift End.",
              },
            ]}
          >
            <TimePicker format={format} />
          </Form.Item>
        </Col>
        <Col span={3}>
          {" "}
          <Form.Item
            label="Over Time"
            name={[field.name, "overTime"]}
            rules={[
              {
                required: true,
                message: "Please provide the Over Time.",
              },
            ]}
          >
            <TimePicker format={format} />
          </Form.Item>
        </Col>
        <Col span={3}>
          {" "}
          <Form.Item
            label="Working Hours"
            name={[field.name, "workHours"]}
            rules={[
              {
                required: true,
                message: "Please provide the Working Hours.",
              },
            ]}
          >
            <TimePicker format={format} />
          </Form.Item>
        </Col>
        <Col span={5}>
          {" "}
          <Form.Item label="Remarks" name={[field.name, "remarks"]}>
            <Input.TextArea rows={1} />
          </Form.Item>
        </Col>
        {/* <Col span={12}> */}
        {/* <Row justify="end" align="middle" style={{ height: "100%" }}> */}
        <Col span={6}>
          <Flex align="center" style={{ height: "100%" }}>
            {/* {fields.length > 1 && ( */}
            <Button
              onClick={() => remove(field.name)}
              danger
              type="text"
              size="small"
            >
              - Remove Shift
            </Button>
            {/* )} */}
            <Button size="small" type="link" onClick={() => add()}>
              + Add Shift
            </Button>
          </Flex>
        </Col>
      </Row>
    </Card>
  );
}
// const gstRateOptions = [
//   { value: "0", text: "00%" },
//   { value: "5", text: "05%" },
//   { value: "12", text: "12%" },
//   { value: "18", text: "18%" },
//   { value: "28", text: "28%" },
// ];
// const deptptions = [
//   { text: "List", value: "List" },
//   { text: "Paytm Sound Box", value: "Paytm Sound Box" },
//   { text: "Paytm PCB Testing", value: "Paytm PCB Testing" },
//   { text: "Paytm Adapter Testing ", value: "Paytm Adapter Testing " },
//   { text: "Paytm VQC", value: "Paytm VQC" },
//   { text: "Mini UPS", value: "Mini UPS" },
//   { text: "Carvaan", value: "Carvaan" },
//   { text: "Smart Meter", value: "Smart Meter" },
//   { text: "Induction", value: "Induction" },
//   { text: "PCB Repair", value: "PCB Repair" },
// ];
