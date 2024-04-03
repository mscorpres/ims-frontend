import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Card, Typography } from "antd";

const LineChart = ({ data }) => {
  const chartRef = useRef(null);
  let chartInstance = null;

  useEffect(() => {
    if (chartRef && chartRef.current) {
      if (chartInstance) {
        chartInstance.destroy();
      }
      const ctx = chartRef.current.getContext("2d");
      chartInstance = new Chart(ctx, {
        type: "line", // Change type to 'line'
        data: {
          labels: data.labels,
          datasets: data.datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    }
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [data]);

  return (
    <Card
      size="small"
      style={{ width: "600px", height: "350px" }}
      title={"Analysis"}
    >
      {/* <Typography.Text>Analysis</Typography.Text> */}
      <div style={{ width: "550px", height: "300px" }}>
        <canvas ref={chartRef} width="700px" height="800px"></canvas>
      </div>
    </Card>
  );
};

export default LineChart;
