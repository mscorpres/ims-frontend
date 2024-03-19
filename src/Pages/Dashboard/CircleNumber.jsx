import React from "react";
import "./index.css";
import { Typography } from "antd";

const CircleNumber = ({ value, heading }) => {
  return (
    <div>
      <div className="circle-number">
        <div className="circle">
          <span>{value}</span>
        </div>
      </div>
      <Typography.Text>{heading}</Typography.Text>
    </div>
  );
};

export default CircleNumber;
