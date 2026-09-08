import { Card, Col, Form, Input } from "antd";
import MySelect from "../../../../../../Components/MySelect";

const DispatchDetailsSection = ({ addOptions, handleaddress }) => (
  <Col span={24}>
    <Card
      size="small"
      title="Dispatch Details"
      style={{ height: "100%", overflow: "hidden" }}
      bodyStyle={{ overflow: "auto", height: "98%" }}
    >
      <Form.Item
        name="dispatchid"
        label="Select Dispatch Address"
        rules={[{ required: true, message: "Please select Dispatch Address!" }]}
      >
        <MySelect
          options={addOptions}
          labelInValue
          onChange={(e) => handleaddress(e)}
        />
      </Form.Item>
      <Form.Item
        name="shippingaddress"
        label="Complete Address"
        rules={[{ required: true }]}
      >
        <Input.TextArea rows={3} />
      </Form.Item>
    </Card>
  </Col>
);

export default DispatchDetailsSection;
