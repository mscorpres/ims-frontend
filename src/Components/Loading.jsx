import React from "react";
import { Spin } from "antd";

export default function Loading({ size, offsetY }) {
  return (
    <div
      style={{
        position: "absolute",
        top: "0%",
        height: "100%",
        width: "100%",
        left: "0%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // width: "80px",
        background: "transparent",
        filter: blur(8),
        zIndex: 99,
        // transform: "translate(-50%) translateY(-50%)",
      }}
    >
      <Spin size={size} />
      {/* <Rings height="80" width="80" color="#4D636F" radius="6" visible="true" /> */}
    </div>
  );
}
