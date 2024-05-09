import { Card, Checkbox, Flex, Form, Input, Typography } from "antd";
import { CommonIcons } from "@/Components/TableActions.jsx/TableActions";

export default function SingleProduct({ field, remove, form, SingleDetail }) {
  const details = Form.useWatch(["components", field.name], form) ?? "";

  return (
    <Card size="small">
      <Flex justify="center" vertical gap={"10px"}>
        <Flex justify="space-between" align="center">
          <Typography.Title level={5} style={{ margin: 0 }}>
            {details.boxLabel}
          </Typography.Title>
          <CommonIcons
            action="deleteButton"
            onClick={() => remove(field.name)}
          />
        </Flex>
        <Flex gap={"15px 50px"} wrap="wrap">
          <SingleDetail label="MIN ID" value={details.minId} />
          <SingleDetail label="MIN Date" value={details.minDate} />
          <SingleDetail label="MIN Qty" value={details.minQty} />
          <SingleDetail label="Box Qty" value={details.boxQty} />
          <Form.Item name={[field.name, "opened"]} label="">
            <Checkbox
              onChange={(e) =>
                form.setFieldValue(
                  ["components", field.name, "opened"],
                  e.target.checked
                )
              }
            >
              Box Opened?
            </Checkbox>
          </Form.Item>
          <Form.Item
            name={[field.name, "availabelQty"]}
            label={
              <Typography.Text strong style={{ fontSize: "0.8rem" }}>
                Available Qty
              </Typography.Text>
            }
          >
            <Input disabled={!details.opened} />
          </Form.Item>
        </Flex>
      </Flex>
    </Card>
  );
}
