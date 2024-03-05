import { Card, Col, Divider, Row, Skeleton, Typography } from "antd";
import React from "react";
function TaxDetails({ summary, title, type, loading }) {
  return (
    <Card title={title} size="small">
      <Row gutter={[0, 8]}>
        {summary?.map((row, index) => {
          return (
            !row.hidden && (
              <Col span={24}>
                <Row>
                  <Col span={18}>
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
                  </Col>
                  <Col
                    span={6}
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      paddingRight: 10,
                    }}
                  >
                    <Typography.Text
                      copyable={row.copy && { tooltips: [false, false] }}
                      style={{
                        fontSize: window.innerWidth < 1600 ? 11 : 13,
                        marginTop: 10,
                      }}
                    >
                      {!loading && row.description}
                    </Typography.Text>
                  </Col>
                </Row>
                {index < summary.length - 1 && (
                  <Divider style={{ margin: "5px 0" }} />
                )}
              </Col>
            )
          );
        })}
      </Row>
    </Card>
  );
}
{
  /* {loading && <Skeleton.Input size="small" active />} */
}

export default TaxDetails;
