import { Card, Col, Row, Tooltip, Typography, Space } from "antd";
import React from "react";
import {
  EyeOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const LocationCard = ({
  location,
  value,
  opening,
  unit,
  owner,
  locationAddress,
}) => {
  return (
    <Col span={3}>
      <Card size="small">
        <Row>
          <Col span={24}>
            <Row justify="end">
              <Space>
                <Tooltip title={locationAddress}>
                  <InfoCircleOutlined />
                </Tooltip>
                <Tooltip title={owner}>
                  <UserOutlined />
                </Tooltip>
              </Space>
            </Row>
            <Row justify="center">
              <Typography.Text strong>{location}</Typography.Text>
            </Row>{" "}
          </Col>
          <Col span={24}>
            <Row justify="center">
              <Col span={24}>
                <Row justify="center">
                  <Typography.Text>
                    {value} {unit}
                  </Typography.Text>
                </Row>
              </Col>
              {/* <Col span={24}>
                <Row justify="center">
                  <Typography.Text>
                    Op: {value} {unit}
                  </Typography.Text>
                </Row>
              </Col> */}
            </Row>
          </Col>
        </Row>
      </Card>
    </Col>
  );
};

export default LocationCard;
