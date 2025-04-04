import React from "react";
import { Card, Typography, Row, Col } from "antd";

const ShippingDetailsCard = ({ details, updateShipmentRow }) => {
  return (
    <Card size="small" title="Shipping Details(as per the sales order)">
      {updateShipmentRow ? (
        <>
          <Row gutter={[0, 6]}>
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Row>
                    <Col span={24}>
                      <Typography.Text strong>Shipping CIN</Typography.Text>
                    </Col>
                    <Col span={24}>
                      <Typography.Text>
                        {details.shipping_info?.cin}
                      </Typography.Text>
                    </Col>
                  </Row>
                </Col>

                <Col span={24}>
                  <Typography.Text strong>Shipping PAN</Typography.Text>
                </Col>
                <Col span={24}>
                  <Typography.Text>
                    {details.shipping_info?.pan}
                  </Typography.Text>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Typography.Text strong>Shipping GST Number</Typography.Text>
                </Col>
                <Col span={24}>
                  <Typography.Text>
                    {details.shipping_info?.gst}
                  </Typography.Text>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Typography.Text strong>Shipping Address </Typography.Text>
                </Col>
                <Col span={24}>
                  <Typography.Text>
                    {details.shipping_info?.address}
                  </Typography.Text>
                </Col>
              </Row>
            </Col>
          </Row>
        </>
      ) : (
        <>
          <Row gutter={[0, 6]}>
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Row>
                    <Col span={24}>
                      <Typography.Text strong>Shipping CIN</Typography.Text>
                    </Col>
                    <Col span={24}>
                      <Typography.Text>{details.shipping?.cin}</Typography.Text>
                    </Col>
                  </Row>
                </Col>

                <Col span={24}>
                  <Typography.Text strong>Shipping PAN</Typography.Text>
                </Col>
                <Col span={24}>
                  <Typography.Text>{details.shipping?.pan}</Typography.Text>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Typography.Text strong>Shipping GST Number</Typography.Text>
                </Col>
                <Col span={24}>
                  <Typography.Text>{details.shipping?.gst}</Typography.Text>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Typography.Text strong>Shipping Address </Typography.Text>
                </Col>
                <Col span={24}>
                  <Typography.Text>{details.shipping?.address}</Typography.Text>
                </Col>
              </Row>
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
};

export default ShippingDetailsCard;
