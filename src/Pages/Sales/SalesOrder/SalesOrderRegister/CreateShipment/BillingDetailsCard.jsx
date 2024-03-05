import React from "react";
import { Card, Typography, Row, Col } from "antd";

const BillingInfo = ({ details }) => {
  return (
    <Card size="small" title="Billing Details (as per the sales order)">
      <Row gutter={[0, 6]}>
        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Text strong>Billing CIN</Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text>{details.billing?.cin}</Typography.Text>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Text strong>Billing PAN</Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text>{details.billing?.pan}</Typography.Text>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Text strong>Billing GST Number</Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text>{details.billing?.gst}</Typography.Text>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Text strong>Billing Address </Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text>{details.billing?.address}</Typography.Text>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default BillingInfo;
