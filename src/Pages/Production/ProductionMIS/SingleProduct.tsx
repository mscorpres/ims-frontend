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
import MySelect from "../../../Components/MySelect";
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
  shiftLabelOptions,
  shiftLabelOptionsRaw,
}) {
  const format = "HH";
  const format1 = "HH:mm";
  const workingHours = Form.useWatch(["shifts", field.name, "shiftHours"]);
  const shift = Form.useWatch(["shifts", field.name, "shiftLabel"]);
  const workingTimings = Form.useWatch([
    "shifts",
    field.name,
    "workingTimings",
  ]);

  const handleShiftUpdate = (id: string) => {
    const found = shiftLabelOptionsRaw.find((row) => row.id === id);
    const arr = [];
    if (found) {
      arr.push(dayjs(found.start, format1));
      arr.push(dayjs(found.end, format1));
    }

    form.setFieldValue(["shifts", field.name, "shiftHours"], arr);
  };

  useEffect(() => {
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
        workDdiff = 24 * 60 + workDdiff;
      }
      const final = `${Math.floor((workDdiff - diff) / 60)}:${
        (workDdiff - diff) % 60
      }`;

      if (workDdiff < diff) {
        form.setFieldValue(
          ["shifts", field.name, "overTime"],
          dayjs(final, "HH:mm")
        );
      } else {
        form.setFieldValue(
          ["shifts", field.name, "overTime"],
          dayjs("00:00", "HH:mm")
        );
      }
    }
  }, [workingHours, workingTimings]);
  useEffect(() => {
    if (workingHours?.length > 0) {
      form.setFieldValue(
        ["shifts", field.name, "workingTimings"],
        workingHours
      );
    }
  }, [workingHours]);
  useEffect(() => {
    if (shift) {
      handleShiftUpdate(shift);
    }
  }, [shift]);
  return (
    <Card size="small" style={{ marginBottom: 5 }}>
      <Flex gap={5} wrap="wrap" justify="space-bewteen">
        <Typography.Text type="secondary" strong>
          {index + 1}.
        </Typography.Text>
        <Form.Item
          style={{ width: 100 }}
          label="Shift"
          name={[field.name, "shiftLabel"]}
          rules={rules.shiftLabel}
        >
          <MySelect options={shiftLabelOptions} />
        </Form.Item>
        <Form.Item
          style={{ width: 100 }}
          label="Line No."
          name={[field.name, "lineCount"]}
          rules={rules.lineCount}
        >
          <Input />
        </Form.Item>
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
            label="Shift Timing"
            name={[field.name, "shiftHours"]}
            rules={rules.shiftStart}
          >
            <TimePicker.RangePicker format={"HH:mm"} order={false} />
          </Form.Item>
        </div>

        <div style={{ width: 150 }}>
          <Form.Item
            label="Shift Start - End"
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
