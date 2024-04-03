import React from "react";
import "./index.css";
import { Row, Typography } from "antd";

const CircleNumber = ({ value, heading }) => {
  return (
    <Row justify="center" gutter={[0, 6]}>
      <div className="circle-number">
        <div className="circle">
          <span>{value}</span>
        </div>
      </div>
      <Row justify="center">
        <Typography.Text>{heading}</Typography.Text>
      </Row>
    </Row>
  );
};

export default CircleNumber;
