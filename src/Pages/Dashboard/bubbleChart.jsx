import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto"; // Importing Chart.js
import { Card } from "antd";

const LineChart = ({ datas, labels }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    // Configure the chart
    const config = {
      type: "bar", // Change chart type to horizontalBar
      data: {
        labels: labels,
        datasets: [
          {
            label: "Horizontal Bar Chart",
            data: datas,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(69, 34, 88, 0.7)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y", // Specify the index axis as y for horizontal bars
        responsive: true,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "", // Custom x-axis label
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "", // Custom y-axis label
            },
          },
        },
      },
    };

    // Create the chart instance
    const myChart = new Chart(ctx, config);

    // Clean up function to destroy the chart
    return () => myChart.destroy();
  }, [datas, labels]);

  return (
    <Card
      size="small"
      style={{ width: "400px", height: "250px" }}
      title={"Vendor GST Registeration Status"}
    >
      <div style={{ width: "390px", height: "220px" }}>
        <canvas ref={chartRef} width="350" height="150"></canvas>
      </div>
    </Card>
  );
};

export default LineChart;
