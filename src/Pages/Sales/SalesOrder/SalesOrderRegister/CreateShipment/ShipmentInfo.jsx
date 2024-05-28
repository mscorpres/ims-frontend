import { Card, Form, Input, Col, Row } from "antd";
import MyButton from "../../../../../Components/MyButton";
import MySelect from "../../../../../Components/MySelect";

const ShipmentInfo = ({
  validateHandler,
  loading,
  billingOptions,
  shippingOptions,
  updateShipmentRow,
}) => {
  return (
    <div>
      <Card size="small" title="Shipment Info">
        <Row gutter={6}>
          {/* <Col span={12}>
            <Form.Item name="eWayBillNo" label="E-way Bill Number">
              <Input />
            </Form.Item>
          </Col> */}
          <Col span={24}>
            <Form.Item name="docNo" label="Ship Doc. Number">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="vehicleNo"
          label="Vehicle Number"
          // rules={[{ required: true, message: "Please input Vechile Number!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="otherRef" label="Other References">
          <Input />
        </Form.Item>
        {updateShipmentRow ? (
          <>
            <Form.Item name="billingId" label="Billing Name">
              <MySelect options={billingOptions} disabled />
            </Form.Item>
            <Form.Item name="billingAddress" label="Billing Address">
              <Input.TextArea rows={3} disabled />
            </Form.Item>
          </>
        ) : (
          <>
            <Form.Item name="billingId" label="Billing Name">
              <MySelect options={billingOptions} />
            </Form.Item>
            <Form.Item name="billingAddress" label="Billing Address">
              <Input.TextArea rows={3} />
            </Form.Item>
          </>
        )}

        <Form.Item name="shippingId" label="Shipping Name">
          {/* <Input options={shippingOptions} /> */}
          <Input />
        </Form.Item>
        <Form.Item name="shippingAddress" label="Shipping Address">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Row justify="end">
          <MyButton
            onClick={validateHandler}
            variant="submit"
            text={updateShipmentRow ? "Update Shipment" : "Create Shipment"}
            loading={"select"}
          />
        </Row>
      </Card>
    </div>
  );
};

export default ShipmentInfo;
const rules = {
  file: [
    {
      required: true,
      message: "Please select a file to upload",
    },
  ],
};
