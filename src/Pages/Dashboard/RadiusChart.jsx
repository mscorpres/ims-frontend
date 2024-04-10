import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Card } from "antd";

function RadiusChart({ datas, labels }) {
  const chartRef = useRef(null);
  let chartInstance = null;
  console.log("data, labels", datas, labels);

  useEffect(() => {
    if (chartRef && chartRef.current) {
      if (chartInstance) {
        chartInstance.destroy();
      }
      const ctx = chartRef.current.getContext("2d");
      chartInstance = new Chart(ctx, {
        type: "radar", // Set type to 'doughnut'
        data: {
          labels: labels,
          datasets: [
            {
              label: "vendors",
              data: datas,
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          elements: {
            line: {
              borderWidth: 3,
            },
          },
        },
      });
    }
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [datas]);

  return (
    <Card style={{ width: "350px", height: "250px" }}>
      <div style={{ width: "250px", height: "450px" }}>
        <canvas ref={chartRef} width="400px" height="450px"></canvas>
      </div>
    </Card>
  );
}

export default RadiusChart;
