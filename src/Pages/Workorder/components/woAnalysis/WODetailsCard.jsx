import { Card, Col, Row, Typography } from "antd";

const WODetailsCard = ({ details }) => {
  return (
    <Col span={24}>
      <Card size="small" title="WO Details">
        <Row gutter={[0, 12]}>
          <Col span={24}>
            <Row>
              <Col span={24}>
                <Typography.Text strong>WO ID</Typography.Text>
              </Col>
              <Col span={24}>
                <Typography.Text>{details.woId} </Typography.Text>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row>
              <Col span={24}>
                <Typography.Text strong>Client Name</Typography.Text>
              </Col>
              <Col span={24}>
                <Typography.Text>{details.client}</Typography.Text>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row>
              <Col span={24}>
                <Typography.Text strong>Created By</Typography.Text>
              </Col>
              <Col span={24}>
                <Typography.Text>{details.createdBy}</Typography.Text>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row>
              <Col span={24}>
                <Typography.Text strong>Reg Date</Typography.Text>
              </Col>
              <Col span={24}>
                <Typography.Text>{details.createdDate}</Typography.Text>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row>
              <Col span={24}>
                <Typography.Text strong>Status</Typography.Text>
              </Col>
              <Col span={24}>
                <Typography.Text>{details.status}</Typography.Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </Col>
  );
};

export default WODetailsCard;
