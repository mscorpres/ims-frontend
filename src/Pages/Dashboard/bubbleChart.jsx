import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto"; // Importing Chart.js
import { Card, Flex } from "antd";

const LineChart = ({ datas, labels }) => {
  console.log("labels", labels);
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    // Configure the chart
    const config = {
      type: "line", // Setting the chart type to line
      data: {
        labels: labels, // Setting the labels for the x-axis
        datasets: [
          {
            label: "Line graph", // Description can be used as dataset label
            data: datas,
            borderColor: "rgba(69, 34, 88, 0.7)", // Line color
            backgroundColor: "rgba(75, 192, 192, 0.2)", // Area under the line fill color
            borderWidth: 1, // Line width
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              //   text: "GST Status", // Custom x-axis label
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
      {/* <Typography.Text>Part Analysis</Typography.Text> */}
      <div style={{ width: "390px", height: "220px" }}>
        {" "}
        <canvas ref={chartRef} width="350" height="150"></canvas>
      </div>
    </Card>
  );
};

export default LineChart;
