import {
  Card,
  Checkbox,
  Col,
  Flex,
  Form,
  Input,
  InputNumber,
  Row,
  Typography,
} from "antd";
import { CommonIcons } from "@/Components/TableActions.jsx/TableActions";

export default function SingleProduct({ field, remove, form, index }) {
  const details = Form.useWatch(["components", field.name], form) ?? "";

  return (
    <Col span={24}>
      <Row gutter={[6, 6]} align="middle">
        <Col span={1}>
          <Typography.Text>{index + 1}</Typography.Text>
        </Col>
        <Col span={4}>
          <Typography.Text>{details.boxLabel}</Typography.Text>
        </Col>
        <Col span={4}>
          <Typography.Text>{details.minId}</Typography.Text>
        </Col>
        <Col span={4}>
          <Typography.Text>{details.minQty}</Typography.Text>
        </Col>
        <Col span={3}>
          <Typography.Text>{details.boxQty}</Typography.Text>
        </Col>
        <Col span={3}>
          <Flex justify="center">
            <Checkbox
              onChange={(e) =>
                form.setFieldValue(
                  ["components", field.name, "opened"],
                  e.target.checked
                )
              }
            ></Checkbox>
          </Flex>
        </Col>
        <Col span={4}>
          <Form.Item noStyle name={[field.name, "availabelQty"]}>
            <InputNumber max={+details?.boxQty} disabled={!details.opened} />
          </Form.Item>
        </Col>
        <Col>
          <CommonIcons
            action="deleteButton"
            onClick={() => remove(field.name)}
          />
        </Col>
      </Row>
    </Col>
  );
}
