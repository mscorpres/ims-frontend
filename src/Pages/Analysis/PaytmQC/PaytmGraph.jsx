import { Card, Col, Divider, Drawer, Row, Typography } from "antd";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Column } from "@ant-design/plots";
import { CChart } from "@coreui/react-chartjs";

function PaytmGraph({
  showGraph,
  setShowGraph,
  chartData,
  searchDate,
  totalChartData,
}) {
  return (
    <Drawer width="100vw" open={showGraph} onClose={() => setShowGraph(false)}>
      <Row>
        <Col span={6} style={{ height: 800, overflowY: "scroll" }}>
          <Card title={`Total: ${totalChartData}`} size="small">
            {chartData.map((row) => (
              <Row justify="space-between">
                <Col span={20}>
                  <Typography.Text
                    style={{ fontWeight: "bold", marginRight: 8 }}
                  >
                    {row.type} :
                  </Typography.Text>
                  <Typography.Text>{row.value}</Typography.Text>
                </Col>
                <Col span={4}>
                  <Typography.Text>
                    {Number(row.percentage).toFixed(2)} %
                  </Typography.Text>
                </Col>
                <Divider style={{ marginTop: 10, marginBottom: 10 }} />
              </Row>
            ))}
          </Card>
        </Col>
        <Col span={18}>
          <CChart
            type="bar"
            height={140}
            wrapper={false}
            data={{
              labels: chartData.map((row) => row.type),
              datasets: [
                {
                  // base: 10,
                  label: "Paytm Report " + searchDate,
                  backgroundColor: "#047780",
                  data: chartData.map((row) => row.value),
                },
              ],
            }}
            labels="months"
          />
        </Col>
      </Row>
    </Drawer>
  );
}

export default PaytmGraph;
