import React, { useEffect, useRef, useState } from "react";

import { Button, Card, Col, Row, Typography } from "antd";
import MySelect from "../../Components/MySelect";
import MyButton from "../../Components/MyButton";
function RePieForPO({ combinedPoData }) {
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
    <Card>
      <Row gutter={[10, 10]}>
        <Col span={16}>
          {/* <MySelect options={options} labelInValue onChange={setSearch} /> */}
        </Col>
        <Col span={8}>
          <MyButton variant="search" type="primary" onClick={searchChart} />
        </Col>
      </Row>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            dataKey="value"
            startAngle={180}
            endAngle={0}
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default RePieForPO;
