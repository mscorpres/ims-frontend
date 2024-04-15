import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto"; // Importing Chart.js
import { Card, Flex } from "antd";

const AreaChart = ({ data, label }) => {
  let a = [
    `${label[0]}:${data[0]}`,
    `${label[1]}:${data[1]}`,
    `${label[2]}:${data[2]}`,
  ];
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    // Configure the chart
    const config = {
      type: "pie",
      data: {
        labels: a,
        datasets: [
          {
            data: data,
            backgroundColor: [
              "rgb(255, 99, 132)",
              "rgb(75, 192, 192)",
              "rgb(255, 205, 86)",
            ],
          },
        ],
      },
      options: {},
    };

    // Create the chart instance
    const myChart = new Chart(ctx, config);

    // Clean up function to destroy the chart
    return () => myChart.destroy();
  }, [data, label]);

  return (
    <Card size="small" style={{ height: "360px" }} title={"PO Evaluation"}>
      <Flex justify="center" style={{ height: "300px" }}>
        {" "}
        <canvas ref={chartRef} width="200" height="150"></canvas>
      </Flex>
    </Card>
  );
};

export default AreaChart;
