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
import { useEffect } from "react";
import dayjs from "dayjs";

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
  const format = "HH";
  const workingHours = Form.useWatch(["shifts", field.name, "shiftStart"]);
  const workingTimings = Form.useWatch([
    "shifts",
    field.name,
    "workingTimings",
  ]);

  useEffect(() => {
    if (
      workingHours?.length > 0 &&
      (workingTimings?.length === 0 || !workingTimings)
    ) {
      console.log("here is", workingHours);
      form.setFieldValue(
        ["shifts", field.name, "workingTimings"],
        workingHours
      );
    }
    if (workingHours?.length === 2 && workingTimings?.length === 2) {
      // work timing
      let obj = workingTimings;

      let diff = obj[1].diff(obj[0], "m");
      if (diff < 0) {
        diff = 24 * 60 + diff;
      }

      let workObj = workingHours;

      let workDdiff = workObj[1].diff(workObj[0], "m");
      if (workDdiff < 0) {
        workDdiff = 24 + workDdiff;
      }
      const final = `${Math.floor((workDdiff - diff) / 60)}:${
        (workDdiff - diff) % 60
      }`;

      form.setFieldValue(
        ["shifts", field.name, "overTime"],
        dayjs(final, "HH:mm")
      );
    }
  }, [workingHours, workingTimings]);
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
          label="Line No."
          name={[field.name, "lineCount"]}
          rules={rules.lineCount}
        >
          <Input />
        </Form.Item>
        <Form.Item
          style={{ width: 100 }}
          label="Shift"
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
        <div style={{ width: 150 }}>
          <Form.Item
            label="Shift Hours"
            name={[field.name, "shiftStart"]}
            rules={rules.shiftStart}
          >
            <TimePicker.RangePicker format={"HH:mm"} />
          </Form.Item>
        </div>

        <div style={{ width: 150 }}>
          <Form.Item
            label="Work Timing"
            name={[field.name, "workingTimings"]}
            rules={rules.workingHoursHours}
          >
            <TimePicker.RangePicker
              order={false}
              format={format}
              showNow={false}
            />
            {/* <InputNumber /> */}
          </Form.Item>
        </div>
        <Form.Item label="Over Time" name={[field.name, "overTime"]}>
          <TimePicker format={"HH:mm"} />
          {/* <InputNumber /> */}
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
