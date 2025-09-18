
import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import React from "react";


type Props = {
    title: string;
    subtitle: string;
   children: React.ReactNode
};

const CustomFieldBox: React.FC<Props> = ({ title, subtitle, children}) => {
  return (
    <Card sx={{ flexGrow: 1, flexShrink: 0 }} >
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
        className="bg-[#e0f2f1] px-[10px] py-[5px]"
      />
      <CardContent >{children}</CardContent>
    </Card>
  );
};

export default CustomFieldBox;
