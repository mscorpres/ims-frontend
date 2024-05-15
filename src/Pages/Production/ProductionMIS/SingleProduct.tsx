import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  TimePicker,
  Typography,
} from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import MyButton from "../../../Components/MyButton";

export default function SingleProduct({
  index,
  field,
  add,
  remove,
  form,
  handleFetchProductOptions,
  setAsyncOptions,
  asyncOptions,
  loading,
  rules,
}) {
  const format = "HH:mm";
  return (
    <Card size="small" style={{ marginBottom: 5 }}>
      <Flex gap={5} wrap="wrap" justify="space-bewteen">
        <Typography.Text type="secondary" strong>
          {index + 1}.
        </Typography.Text>
        <div style={{ width: 250 }}>
          <Form.Item
            label="Product"
            name={[field.name, "product"]}
            rules={rules.product}
          >
            <MyAsyncSelect
              loadOptions={handleFetchProductOptions}
              optionsState={asyncOptions}
              selectLoading={loading("select")}
              onBlur={() => setAsyncOptions([])}
            />
          </Form.Item>
        </div>

        <Form.Item
          style={{ width: 100 }}
          label="Manpower"
          name={[field.name, "manPower"]}
          rules={rules.manPower}
        >
          <Input />
        </Form.Item>
        <Form.Item
          style={{ width: 100 }}
          label="Line Count"
          name={[field.name, "lineCount"]}
          rules={rules.lineCount}
        >
          <Input />
        </Form.Item>
        <Form.Item
          style={{ width: 100 }}
          label="Output"
          name={[field.name, "output"]}
          rules={rules.output}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Date" name={[field.name, "date"]} rules={rules.date}>
          <SingleDatePicker
            setDate={(value) =>
              form.setFieldValue(["shifts", field.name, "date"], value)
            }
          />
        </Form.Item>
        <Form.Item
          label="Shift Starts"
          name={[field.name, "shiftStart"]}
          rules={rules.shiftStart}
        >
          <TimePicker format={format} />
        </Form.Item>
        <Form.Item
          label="Shift End"
          name={[field.name, "shiftEnd"]}
          rules={rules.shiftEnd}
        >
          <TimePicker format={format} />
        </Form.Item>
        <Form.Item label="Over Time" name={[field.name, "overTime"]}>
          <InputNumber />
        </Form.Item>
        <Form.Item
          label="Working Hours"
          name={[field.name, "workingHours"]}
          rules={rules.workingHoursHours}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          style={{ width: 300 }}
          label="Remarks"
          name={[field.name, "remarks"]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Flex
          align="bottom"
          justify="end"
          gap={5}
          style={{
            height: "100%",
            flex: 1,
            alignSelf: "end",
            justifySelf: "flex-end",
          }}
        >
          <MyButton
            variant="delete"
            danger
            text=""
            shape="circle"
            onClick={() => remove(field.name)}
          />
          <MyButton
            variant="add"
            text=""
            shape="circle"
            onClick={() => add()}
          />
        </Flex>
      </Flex>
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
