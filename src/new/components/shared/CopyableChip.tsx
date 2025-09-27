import React from "react";
import { Chip, Tooltip } from "@mui/material";

interface CopyableChipProps {
  value: string;
  size?: "small" | "medium";
  variant?: "outlined" | "filled";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
  tooltipTitle?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const CopyableChip: React.FC<CopyableChipProps> = ({
  value,
  size = "small",
  variant = "outlined",
  color = "default",
  tooltipTitle,
  onClick,
  disabled = false,
}) => {
  const handleCopy = () => {
    if (!disabled) {
      navigator.clipboard.writeText(value);
      if (onClick) {
        onClick();
      }
    }
  };

  return (
    <Tooltip title={tooltipTitle || value}>
      <Chip
        label={value}
        size={size}
        variant={variant}
        color={color}
        onClick={handleCopy}
        disabled={disabled}
        sx={{
          cursor: disabled ? "default" : "pointer",
          "&:hover": disabled ? {} : { opacity: 0.8 },
        }}
      />
    </Tooltip>
  );
};

export default CopyableChip;
