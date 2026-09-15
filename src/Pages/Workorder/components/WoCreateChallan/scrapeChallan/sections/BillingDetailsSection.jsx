import { Card, Col, Form, Input } from "antd";
import MySelect from "../../../../../../Components/MySelect";

const BillingDetailsSection = ({ addOptions, handlebilladress }) => (
  <Col span={24}>
    <Card
      size="small"
      title="Billing Details"
      style={{ height: "100%", overflow: "hidden" }}
      bodyStyle={{ overflow: "auto", height: "98%" }}
    >
      <Form.Item
        name="billingid"
        label="Select billing Address"
        rules={[{ required: true, message: "Please select billing Address!" }]}
      >
        <MySelect
          options={addOptions}
          labelInValue
          onChange={(e) => handlebilladress(e)}
        />
      </Form.Item>
      <Form.Item
        name="billingaddress"
        label="Complete Address"
        rules={[{ required: true }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>
    </Card>
  </Col>
);

export default BillingDetailsSection;
