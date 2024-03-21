import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Card, Typography } from "antd";

const BarChart = ({ data }) => {
  const chartRef = useRef(null);
  let chartInstance = null;

  useEffect(() => {
    if (chartRef && chartRef.current) {
      if (chartInstance) {
        chartInstance.destroy(); // Destroy previous chart instance
      }
      const ctx = chartRef.current.getContext("2d");
      chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: data.labels,
          datasets: [
            {
              label: "Bar Chart",
              data: data.values,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
    return () => {
      if (chartInstance) {
        chartInstance.destroy(); // Cleanup: Destroy chart instance when component unmounts
      }
    };
  }, [data]);

  return (
    <Card size="small">
      <Typography.Text>Top Items</Typography.Text>
      <canvas ref={chartRef} width="400" height="300"></canvas>
    </Card>
  );
};

export default BarChart;
