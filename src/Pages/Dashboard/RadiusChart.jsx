import React from "react";

function RadiusChart() {
  const chartRef = useRef(null);
  let chartInstance = null;

  useEffect(() => {
    if (chartRef && chartRef.current) {
      if (chartInstance) {
        chartInstance.destroy();
      }
      const ctx = chartRef.current.getContext("2d");
      chartInstance = new Chart(ctx, {
        type: "radar", // Set type to 'doughnut'
        data: {
          labels: data.labels,
          datasets: [
            {
              label: "Donut Chart",
              data: data.values,
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
  }, [data]);

  return (
    <div style={{ width: "250px", height: "250px" }}>
      <canvas ref={chartRef} width="400" height="300"></canvas>
    </div>
  );
}

export default RadiusChart;
