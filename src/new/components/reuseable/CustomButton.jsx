import { Button, CircularProgress } from "@mui/material";

const CustomButton = ({
  title,
  starticon,
  endicon,
  loading = false,
  disabled = false,
  variant = "contained",
  size = "medium",
  onclick,
  htmlType = "button",
}) => {
  return (
    <Button
    type={htmlType}
      variant={variant}
      onClick={onclick} 
      size={size}
      sx={{
        px: size === "small" ? 2 : 3,
        py:0.7,
        bgcolor: variant==="text" || variant==="outlined"  ? "transparent" : "#0d9488",
        "&:hover": { bgcolor: variant==="text" || variant==="outlined" ? "#e0f2f1" : "#0f766e" },
        color: variant==="text" || variant==="outlined" ? "#0d9488" : "white",
        borderColor: variant==="outlined" ? "#0d9488" : "transparent",
        fontWeight: variant==="text" ? 600 : "normal",
      }}
    disabled={disabled}
      endIcon={endicon && endicon}
      startIcon={loading ? <CircularProgress size={16} color="inhert" /> : starticon && starticon }
    >
      { title}
    </Button>
  );
};

export default CustomButton;
