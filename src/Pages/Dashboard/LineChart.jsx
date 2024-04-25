import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { Button, Card, Col, Row, Typography } from "antd";
import MySelect from "../../Components/MySelect";
import MyButton from "../../Components/MyButton";

const LineChart = ({
  labels,
  totalPOData,
  domesticPOData,
  importPOData,
  combinedPoData,
}) => {
  let a;
  const [search, setSearch] = useState("");
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
  const searchChart = async () => {
    console.log("search", search);
    console.log("combinedPoData", combinedPoData);
    a = Number(search?.value);
    console.log("a", a);
    const valuesOfSearchKeys = combinedPoData
      .map((item) => item[a])
      .filter((value) => value !== undefined);


    console.log("valuesOfSearchKeys", valuesOfSearchKeys);
  };

  return (
    <Card
      size="small"
      style={{ width: "600px", height: "350px" }}
      title={"Procurement Orders Analysis"}
    >
      {/* <Typography.Text>Analysis</Typography.Text> */}
      <Row gutter={[10, 10]}>
        <Col span={16}>
          <MySelect options={options} labelInValue onChange={setSearch} />
        </Col>
        <Col span={8}>
          <MyButton variant="search" type="primary" onClick={searchChart} />
        </Col>
      </Row>
      <div style={{ width: "550px", height: "300px" }}>
        <canvas ref={chartRef} width="700px" height="330px"></canvas>
      </div>
    </Card>
  );
};

export default LineChart;
let options = [
  { text: "April", value: "4" },
  { text: "May", value: "5" },
  { text: "June", value: "6" },
  { text: "July", value: "7" },
  { text: "August", value: "8" },
  { text: "Septemeber", value: "9" },
  { text: "October", value: "10" },
  { text: "Novemeber", value: "11" },
  { text: "Decemeber", value: "12" },
  { text: "January", value: "1" },
  { text: "Febuarary", value: "2" },
  { text: "March", value: "3" },
];
