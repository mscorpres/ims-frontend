import { Card, Flex, Form, Input, TimePicker, Typography } from "antd";
import MySelect from "@/Components/MySelect";
import MyAsyncSelect from "@/Components/MyAsyncSelect";
import SingleDatePicker from "@/Components/SingleDatePicker";
import MyButton from "@/Components/MyButton";
//@ts-ignore
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox";
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
  typeOptions,
}) {
  const format = "HH";
  const format1 = "HH:mm";
  const workingHours = Form.useWatch(["shifts", field.name, "shiftHours"]);
  const shift = Form.useWatch(["shifts", field.name, "shiftLabel"]);
  const product = Form.useWatch(["shifts", field.name, "product"]);

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

  useEffect(() => {
    const found = asyncOptions.find((row: any) => row.value === product);

    if (found) {
      form.setFieldValue(["shifts", field.name, "productType"], found.type);
    }
  }, [product]);
  return (
    <div style={{ marginBottom: 12 }}>
      <CustomFieldBox>
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
            style={{ width: 140 }}
            label="Product Type"
            name={[field.name, "productType"]}
            rules={rules.shiftLabel}
          >
            <MySelect disabled options={typeOptions} />
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
              label="Product/Component"
              name={[field.name, "product"]}
              rules={rules.product}
            >
              <MyAsyncSelect
                loadOptions={handleFetchProductOptions}
                optionsState={asyncOptions}
                selectLoading={loading("select")}
                preventFetchingOnFocus={true}
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

          <Form.Item
            label="Date"
            name={[field.name, "date"]}
            rules={rules.date}
          >
            <SingleDatePicker
              setDate={(value: any) =>
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
      </CustomFieldBox>
    </div>
  );
}
