import { Tooltip } from "antd";
import React from "react";
import { Typography } from "@mui/material";

 function ToolTipEllipses({ text, type, copy, width }) {
  return (
    <Tooltip
      overlayStyle={{ fontSize: "0.7rem", color: "white" }}
      placement="bottom"
      title={text}
      color="#0d9488"
    >
      {type == "Paragraph" ? (
        <Typography > {text} </Typography>
      ) : (
        <Typography
          copyable={copy && { tooltips: false }}
          style={{
            fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
            width: "100%",
          }}
        variant="subtitle"
        >
          {text}
        </Typography>
      )}
    </Tooltip>
  );
}
export default React.memo(ToolTipEllipses);
