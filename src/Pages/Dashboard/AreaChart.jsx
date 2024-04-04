import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto"; // Importing Chart.js
import { Card, Flex } from "antd";

const AreaChart = ({ data }) => {
  const chartRef = useRef(null);
  console.log("data", data);
  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");

    // Define data for the chart
    data = {
      labels: ["Pending PO", "Overage PO"],
      datasets: [
        {
          label: "overall",
          data: data,
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(75, 192, 192)",
            "rgb(255, 205, 86)",
          ],
        },
      ],
    };

    // Configure the chart
    const config = {
      type: "polarArea", // Change the chart type to 'line' to create an area chart
      data: data,
      options: {
        scales: {
          r: {
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
      },
    };

    // Create the chart instance
    const myChart = new Chart(ctx, config);

    // Clean up function to destroy the chart
    return () => myChart.destroy();
  }, [data]);

  return (
    <Card
      size="small"
      style={{ height: "350px" }}
      //   title={"Part Analysis"}
    >
      <Flex justify="center" style={{ height: "300px" }}>
        {" "}
        <canvas ref={chartRef} width="200" height="150"></canvas>
      </Flex>
    </Card>
  );
};

export default AreaChart;
