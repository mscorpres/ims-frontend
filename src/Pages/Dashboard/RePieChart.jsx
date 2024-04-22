import React from "react";
import { PieChart, Pie, Cell, Legend } from "recharts";
import {
  Card,
  Col,
  Flex,
  Input,
  List,
  Row,
  Select,
  Steps,
  Typography,
} from "antd";
const data = [
  { name: "Category A", value: 400 },
  { name: "Category B", value: 300 },
  { name: "Category C", value: 300 },
  { name: "Category D", value: 200 },
];

const RePieChart = ({ data }) => {
  // console.log("daata", data);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  //   return;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  return (
    <Card size="small" style={{ height: 400, width: 550 }}>
      <PieChart width={550} height={350}>
        <Pie
          data={data}
          cx="50%"
          cy="40%"
          labelLine={true}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data?.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </Card>
  );
};

export default RePieChart;
