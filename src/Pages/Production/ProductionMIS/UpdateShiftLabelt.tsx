import { Flex, Form, TimePicker, Typography } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import MyButton from "@/Components/MyButton";
import useApi from "@/hooks/useApi";
import { updateShiftLabels } from "@/api/production/mis";

interface Props {
  options: any[];
  fetchLabels: () => Promise<void>;
}

const UpdateShiftLabel = ({ options, fetchLabels }: Props) => {
  const [form] = Form.useForm();

  const { executeFun, loading } = useApi();

  const handleUpdate = async (id: string, range: []) => {
    const response = await executeFun(
      () => updateShiftLabels(id, range),
      `submit-${id}`
    );
    if (response.success) {
      fetchLabels();
    }
  };
  useEffect(() => {
    const arr = options.map((row) => {
      const updatedStart = dayjs(row.start, "HH:mm");
      const updatedEnd = dayjs(row.end, "HH:mm");
      return { ...row, range: [updatedStart, updatedEnd] };
    });
    form.setFieldValue("shifts", arr);
  }, [options]);

  return (
    <Form
      form={form}
      layout="vertical"
      style={{ height: "95%", overflowY: "auto" }}
      //   initialValues={}
    >
      <Form.List name="shifts">
        {(fields, { add, remove }) => (
          <Flex vertical>
            {fields.map((field, index) => (
              <Shift
                loading={loading}
                field={field}
                handleUpdate={handleUpdate}
              />
            ))}
          </Flex>
        )}
      </Form.List>
    </Form>
  );
};

export default UpdateShiftLabel;

const Shift = ({ field, handleUpdate, loading }) => {
  const shift = Form.useWatch(["shifts", field.name]);
  const updateHandler = () => {
    handleUpdate(shift.id, shift.range);
  };

  return (
    <Form.Item noStyle>
      <Flex>
        <Typography.Title level={5}>
          {field.key + 1}. {shift?.name}
        </Typography.Title>
      </Flex>
      <Flex align="center" gap={5}>
        <div style={{ width: "80%" }}>
          <Form.Item
            label="Shift Hours"
            name={[field.name, "range"]}
            // rules={rules.shiftStart}
          >
            <TimePicker.RangePicker format={"HH:mm"} order={false} />
          </Form.Item>
        </div>
        <MyButton
          loading={loading(`submit-${shift?.id}`)}
          size="small"
          variant="submit"
          onClick={updateHandler}
          text=""
          style={{ borderRadius: "100%", marginTop: 10 }}
        />
      </Flex>
    </Form.Item>
  );
};
