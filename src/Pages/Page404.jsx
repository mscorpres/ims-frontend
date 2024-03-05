import { Empty } from "antd";
import React from "react";

export default function Page404() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
      }}
    >
      <Empty
        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
        imageStyle={{
          height: 200,
        }}
        description={
          <span style={{ fontSize: 30, color: "rgba(0,0,0,0.5)" }}>
            404 Page Not Found
          </span>
        }
      ></Empty>
    </div>
  );
}
