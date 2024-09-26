import { Button, Tooltip } from "antd";
import React, { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  tooltip?: string;
};

const IconButton = ({ icon, tooltip, ...props }: Props) => {
  return (
    <Tooltip title={tooltip}>
      <Button {...props} type="text" style={{ padding: 0, height: "auto" }}>
        {icon}
      </Button>
    </Tooltip>
  );
};

export default IconButton;
