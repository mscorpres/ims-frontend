import React from "react";
import { Chip, ChipProps } from "@mui/material";

interface StatusChipProps {
  value: string;
  size?: "small" | "medium";
  variant?: "outlined" | "filled";
  type?: "approval" | "payment" | "custom";
  customColor?: ChipProps["color"];
}

export const StatusChip: React.FC<StatusChipProps> = ({
  value,
  size = "small",
  variant = "filled",
  type = "approval",
  customColor,
}) => {
  const getColorAndLabel = (): { color: ChipProps["color"]; label: string } => {
    if (customColor) return { color: customColor, label: value };

    if (type === "approval") {
      const colorMap: Record<string, ChipProps["color"]> = {
        APPROVED: "success",
        PENDING: "warning",
      };
      return { color: colorMap[value] || "error", label: value };
    }

    if (type === "payment") {
      return {
        color: value === "0" ? "default" : "primary",
        label: value === "0" ? "NO" : "YES",
      };
    }

    return { color: "default", label: value };
  };

  const { color, label } = getColorAndLabel();

  return <Chip label={label} size={size} variant={variant} color={color} />;
};

export default StatusChip;
