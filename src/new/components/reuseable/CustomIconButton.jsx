import { CircularProgress, IconButton, Tooltip } from "@mui/material";


const CustomIconButton = ({
  title: title ,
  children,
  onclick,
  size = "medium",
  loading = false,
  disabled = false,
  hoverColor = "#e1fffc",
}) => {
  return (
    <Tooltip title={title || ""}>
      <span>
        <IconButton
          disabled={disabled}
          size={size}
          onClick={onclick}
          sx={{ bgcolor: "transparent", "&:hover": { bgcolor: hoverColor } }}
        >
          {loading ? <CircularProgress size={16} /> : children}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default CustomIconButton;
