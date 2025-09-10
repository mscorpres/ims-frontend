import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

interface InputProps extends Omit<TextFieldProps, "variant"> {
  variant?: "outlined" | "filled" | "standard";
  size?: "small" | "medium";
}

const Input: React.FC<InputProps> = ({
  variant = "outlined",
  size = "medium",
  ...props
}) => {
  return <TextField variant={variant} size={size} fullWidth {...props} />;
};

export default Input;
