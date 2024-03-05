import { Card, Col, Row, Typography } from "antd";

const ProductDetailsCard = ({ details }) => {
  return (
    <Col span={24}>
      <Card size="small" title="FG/SFG Details">
        <Row gutter={[0, 12]}>
          <Col span={24}>
            <Row>
              <Col span={24}>
                <Typography.Text strong>FG/SFG Ord Qty</Typography.Text>
              </Col>
              <Col span={24}>
                <Typography.Text>{details.orderedQty}</Typography.Text>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row>
              <Col span={24}>
                <Typography.Text strong>FG/SFG BOM</Typography.Text>
              </Col>
              <Col span={24}>
                <Typography.Text>{details.bom}</Typography.Text>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row>
              <Col span={24}>
                <Typography.Text strong>FG/SFG Name and SKU</Typography.Text>
              </Col>
              <Col span={24}>
                <Typography.Text>{details.productName}</Typography.Text>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </Col>
  );
};

export default ProductDetailsCard;
