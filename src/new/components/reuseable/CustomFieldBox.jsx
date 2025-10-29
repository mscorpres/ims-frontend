import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import React from "react";

const CustomFieldBox = ({ title, subtitle, children }) => {
  return (
    <Card sx={{ flexGrow: 0, flexShrink: 0, backgroundColor: "#e0f0ef5b" }}>
      <CardHeader
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ fontSize: 12 }}>
            {subtitle}
          </Typography>
        }
        className="bg-[#29a39983] px-[10px] py-[5px]"
      />
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default CustomFieldBox;
