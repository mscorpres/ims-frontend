import React from "react";
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material";

interface ButtonProps extends Omit<MuiButtonProps, "variant"> {
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "small" | "medium" | "large";
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  loading = false,
  children,
  disabled,
  ...props
}) => {
  const getVariant = () => {
    switch (variant) {
      case "primary":
        return "contained";
      case "secondary":
        return "contained";
      case "outline":
        return "outlined";
      case "text":
        return "text";
      default:
        return "contained";
    }
  };

  const getColor = () => {
    switch (variant) {
      case "primary":
        return "primary";
      case "secondary":
        return "secondary";
      case "outline":
        return "primary";
      case "text":
        return "primary";
      default:
        return "primary";
    }
  };

  return (
    <MuiButton
      variant={getVariant()}
      color={getColor()}
      size={size}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </MuiButton>
  );
};

export default Button;
