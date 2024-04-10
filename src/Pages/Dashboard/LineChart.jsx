import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Card, Typography } from "antd";

const LineChart = ({ labels, totalPOData, domesticPOData, importPOData }) => {
  const chartRef = useRef(null);
  let chartInstance = null;
  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    const config = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Total",
            data: totalPOData,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderWidth: 2,
          },
          {
            label: "Domestic",
            data: domesticPOData,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderWidth: 2,
          },
          {
            label: "Import",
            data: importPOData,
            borderColor: "rgba(255, 205, 86, 1)",
            backgroundColor: "rgba(255, 205, 86, 0.2)",
            borderWidth: 2,
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
    };

    // Create the chart instance
    const myChart = new Chart(ctx, config);

    // Clean up function to destroy the chart
    return () => myChart.destroy();
  }, [totalPOData, domesticPOData, importPOData]);

  return (
    <Card
      size="small"
      style={{ width: "600px", height: "350px" }}
      title={"Procurement Orders Analysis"}
    >
      {/* <Typography.Text>Analysis</Typography.Text> */}
      <div style={{ width: "550px", height: "300px" }}>
        <canvas ref={chartRef} width="700px" height="330px"></canvas>
      </div>
    </Card>
  );
};

export default LineChart;
