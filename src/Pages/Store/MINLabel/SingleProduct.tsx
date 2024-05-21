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
import Loading from "@/Components/Loading.jsx";
import { CommonIcons } from "@/Components/TableActions.jsx/TableActions";

export default function SingleProduct({ field, remove, form, index, loading }) {
  const details = Form.useWatch(["components", field.name], form) ?? "";

  return (
    <Col span={24}>
      {loading(details.label) && <Loading />}
      <Row gutter={[6, 6]} align="middle">
        <Col span={1}>
          <Typography.Text>{index + 1}</Typography.Text>
        </Col>
        <Col span={1}>
          <Typography.Text>{details["label"]}</Typography.Text>
        </Col>
        <Col span={2}>
          <Typography.Text>{details["Vendor Code"]}</Typography.Text>
        </Col>
        <Col span={2}>
          <Typography.Text>{details.invoiceDate}</Typography.Text>
        </Col>
        <Col span={2}>
          <Typography.Text>{details["Cost Center"]}</Typography.Text>
        </Col>
        <Col span={2}>
          <Typography.Text>{details["PRJ ID"]}</Typography.Text>
        </Col>
        <Col span={3}>
          <Typography.Text>{details["MIN ID"]}</Typography.Text>
        </Col>
        <Col span={2}>
          <Typography.Text>{details["MIN Qty"]}</Typography.Text>
        </Col>
        <Col span={2}>
          <Typography.Text>{details["qty"]}</Typography.Text>
        </Col>
        <Col span={2}>
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
        <Col span={2}>
          <Form.Item noStyle name={[field.name, "availabelQty"]}>
            <InputNumber
              //  max={+details?.boxQty}
              disabled={!details.opened}
            />
          </Form.Item>
        </Col>
        <Col style={{ paddingLeft: 10 }}>
          <CommonIcons
            action="deleteButton"
            onClick={() => remove(field.name)}
          />
        </Col>
      </Row>
    </Col>
  );
}
