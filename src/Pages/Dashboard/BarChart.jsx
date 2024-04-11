import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Card, Typography } from "antd";

const BarChart = ({ data }) => {
  const chartRef = useRef(null);
  let chartInstance = null;
  // console.log("data", data);
  useEffect(() => {
    if (chartRef && chartRef.current) {
      if (chartInstance) {
        chartInstance.destroy(); // Destroy previous chart instance
      }
      const ctx = chartRef.current.getContext("2d");
      chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: data?.labels,
          datasets: [
            {
              label: "Values in Crores",
              data: data?.values,
              backgroundColor: "rgb(235 152 96 / 20%)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: [75, 192, 192, 1],
            //  {
            //   suggestedMin: 50000,
            // },
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
    <Card
      size="small"
      style={{ width: "420px", height: "350px" }}
      title={"Part Analysis"}
    >
      {/* <Typography.Text>Part Analysis</Typography.Text> */}
      <div style={{ width: "350px", height: "330px" }}>
        {" "}
        <canvas ref={chartRef} width="200" height="150"></canvas>
      </div>
    </Card>
  );
};

export default BarChart;
