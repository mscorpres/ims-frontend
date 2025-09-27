import React from "react";
import { Chip } from "@mui/material";

interface StatusChipProps {
  value: string;
  size?: "small" | "medium";
  variant?: "outlined" | "filled";
  type?: "approval" | "payment" | "custom";
  customColor?:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
}

export const StatusChip: React.FC<StatusChipProps> = ({
  value,
  size = "small",
  variant = "filled",
  type = "approval",
  customColor,
}) => {
  const getColor = () => {
    if (customColor) return customColor;

    if (type === "approval") {
      switch (value) {
        case "APPROVED":
          return "success";
        case "PENDING":
          return "warning";
        default:
          return "error";
      }
    }

    if (type === "payment") {
      return value === "0" ? "default" : "primary";
    }

    return "default";
  };

  const getLabel = () => {
    if (type === "payment") {
      return value === "0" ? "NO" : "YES";
    }
    return value;
  };

  return (
    <Chip label={getLabel()} size={size} variant={variant} color={getColor()} />
  );
};

export default StatusChip;
