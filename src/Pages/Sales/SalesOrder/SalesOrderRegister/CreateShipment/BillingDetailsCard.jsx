import React from "react";
import { Card, Typography, Row, Col } from "antd";

const BillingInfo = ({ details, updateShipmentRow }) => {
  console.log("updateShipmentRow", updateShipmentRow);
  console.log("details=>", details);
  return (
    <Card size="small" title="Billing Details (as per the sales order)">
      {/* <Row gutter={[0, 6]}>
        {details.billing?.cin && (
          <Col span={24}>
            <Row>
              <Col span={24}>
                <Typography.Text strong>CIN</Typography.Text>
              </Col>
              <Col span={24}>
                <Typography.Text>{details.billing?.cin}</Typography.Text>
              </Col>
            </Row>
          </Col>
        )}

        {details.billing?.pan && (
          <Col span={24}>
            <Row>
              <Col span={24}>
                <Typography.Text strong>PAN</Typography.Text>
              </Col>
              <Col span={24}>
                <Typography.Text>{details.billing?.pan}</Typography.Text>
              </Col>
            </Row>
          </Col>
        )}
        {details.billing?.gst && (
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
        )}
        {details.billing?.address && (
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
        )}
      </Row> */}
      {/* {updateShipmentRow ? ( */}
      <>
        <Row gutter={[0, 6]}>
          {details.billing?.cin && (
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Typography.Text strong>CIN</Typography.Text>
                </Col>
                <Col span={24}>
                  <Typography.Text>{details.billing_info?.cin}</Typography.Text>
                </Col>
              </Row>
            </Col>
          )}

          {details.billing_info?.pan && (
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Typography.Text strong>PAN</Typography.Text>
                </Col>
                <Col span={24}>
                  <Typography.Text>{details.billing_info?.pan}</Typography.Text>
                </Col>
              </Row>
            </Col>
          )}
          {details.billing_info?.gst && (
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Typography.Text strong>GST Number</Typography.Text>
                </Col>
                <Col span={24}>
                  <Typography.Text>{details.billing_info?.gst}</Typography.Text>
                </Col>
              </Row>
            </Col>
          )}
          {details.address && (
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Typography.Text strong>Address </Typography.Text>
                </Col>
                <Col span={24}>
                  <Typography.Text>
                    {details.billing_info.address}
                  </Typography.Text>
                </Col>
              </Row>
            </Col>
          )}
        </Row>
      </>
      {/* ) : (
        <>
          <Row gutter={[0, 6]}>
            {details.billing?.cin && (
              <Col span={24}>
                <Row>
                  <Col span={24}>
                    <Typography.Text strong>CIN</Typography.Text>
                  </Col>
                  <Col span={24}>
                    <Typography.Text>{details.billing?.cin}</Typography.Text>
                  </Col>
                </Row>
              </Col>
            )}

            {details.billing?.pan && (
              <Col span={24}>
                <Row>
                  <Col span={24}>
                    <Typography.Text strong>PAN</Typography.Text>
                  </Col>
                  <Col span={24}>
                    <Typography.Text>{details.billing?.pan}</Typography.Text>
                  </Col>
                </Row>
              </Col>
            )}
            {details.billing?.gst && (
              <Col span={24}>
                <Row>
                  <Col span={24}>
                    <Typography.Text strong>GST Number</Typography.Text>
                  </Col>
                  <Col span={24}>
                    <Typography.Text>{details.billing?.gst}</Typography.Text>
                  </Col>
                </Row>
              </Col>
            )}
            {details.billing?.address && (
              <Col span={24}>
                <Row>
                  <Col span={24}>
                    <Typography.Text strong>Address </Typography.Text>
                  </Col>
                  <Col span={24}>
                    <Typography.Text>
                      {details.billing?.address}
                    </Typography.Text>
                  </Col>
                </Row>
              </Col>
            )}
          </Row>
        </>
      )} */}
    </Card>
  );
};

export default BillingInfo;
