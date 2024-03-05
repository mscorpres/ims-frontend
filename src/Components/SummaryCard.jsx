import { Card, Col, Divider, Row, Skeleton, Typography } from "antd";
import React from "react";

function SummaryCard({ summary, title, type, loading }) {
  return (
    <Card title={title} size="small">
      <Row gutter={[0, 8]}>
        {summary?.map((row, index) => (
          <Col span={24}>
            {row.title && (
              <Typography.Text
                style={{
                  fontWeight: "bold",
                  display: "block",
                  fontSize: window.innerWidth < 1600 ? 11 : 13,
                  marginBottom: 5,
                }}
              >
                {row.title}
              </Typography.Text>
            )}
            {loading && <Skeleton.Input size="small" active />}
            {row.description && !loading && (
              <Typography.Text
                copyable={row.copy && { tooltips: [false, false] }}
                style={{
                  fontSize: window.innerWidth < 1600 ? 11 : 13,
                  marginTop: 10,
                }}
              >
                {!loading && row.description}
              </Typography.Text>
            )}
            {index < summary.length - 1 && (
              <Divider style={{ margin: "5px 0" }} />
            )}
          </Col>
        ))}
      </Row>
    </Card>
  );
}

export default SummaryCard;
