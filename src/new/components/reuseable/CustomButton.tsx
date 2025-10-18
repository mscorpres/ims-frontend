import { Button } from "@mui/material";
import React, { FC } from "react";
type CustomButtonProps = {
  title: string;
  variant?: "contained" | "text" | "outlined";
  onclick: () => void;
  loading?: boolean;
  starticon?: React.ReactNode;
  endicon?: React.ReactNode;
  disabled?: boolean;
  size?: "small" | "medium";
};

const CustomButton: FC<CustomButtonProps> = ({
  title,
  starticon,
  endicon,
  loading = false,
  disabled = false,
  variant = "contained",
  size = "medium",
  onclick,
}) => {
  return (
    <Button
      variant={variant}
      onClick={onclick} 
      size={size}
      sx={{
        px: size === "small" ? 1.8 : 3,
        py:0.9,
        bgcolor: variant==="text" || variant==="outlined"  ? "transparent" : "#0d9488",
        "&:hover": { bgcolor: variant==="text" || variant==="outlined" ? "#e1fffc" : "#0f766e" },
        color: variant==="text" || variant==="outlined" ? "#0d9488" : "white",
        borderColor: variant==="outlined" ? "#0d9488" : "transparent",
        fontWeight: variant==="text" ? 600 : "normal",
      }}
    disabled={disabled}
      endIcon={endicon && endicon}
      startIcon={starticon && starticon}
    >
      {loading ? "Loading..." : title}
    </Button>
  );
};

export default CustomButton;
