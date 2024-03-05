import React from "react";
import { Card, Typography, Row, Col } from "antd";

const ClientInfo = ({ details }) => {
  return (
    <Card size="small" title="Client Details">
      <Row gutter={[0, 6]}>
        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Text strong>Client</Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text>{details.clientName}</Typography.Text>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Text strong>Client Branch </Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text>{details.clientBranch}</Typography.Text>
            </Col>
          </Row>
        </Col>

        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Text strong>Client Address </Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text>{details.address}</Typography.Text>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default ClientInfo;
