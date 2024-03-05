import { Form, Input } from "antd";
import React from "react";

export default function FormField({ field }) {
  console.log("this is the field", field);
  return (
    <Form.Item name={field.key} label={field.label}>
      {field.key === "12312" && <Input />}
      {field.key === "434092" && <Input />}
    </Form.Item>
  );
}
