import React, { useState, useRef } from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers";
import {
  Box,
  Button,
  Typography,
  Popover,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { CalendarToday, KeyboardArrowDown, Clear } from "@mui/icons-material";

export type DateRangeValue = {
  startDate?: string;
  endDate?: string;
} | null;

type DateRangeFieldProps = {
  value: DateRangeValue;
  onChange: (next: { startDate: string; endDate: string }) => void;
  size?: "small" | "medium";
  minInputWidth?: number;
  disableFuture?: boolean;
  showShortcuts?: boolean;
};

const defaultShortcuts = [
  {
    label: "Today",
    getValue: () => {
      const today = dayjs();
      return [today, today];
    },
  },
  {
    label: "Yesterday",
    getValue: () => {
      const yesterday = dayjs().subtract(1, "day");
      return [yesterday, yesterday];
    },
  },
  {
    label: "Last 7 Days",
    getValue: () => {
      const today = dayjs();
      return [today.subtract(6, "day"), today];
    },
  },
  {
    label: "This Month",
    getValue: () => {
      const today = dayjs();
      return [today.startOf("month"), today];
    },
  },
  {
    label: "Last Month",
    getValue: () => {
      const today = dayjs();
      const lastMonth = today.subtract(1, "month");
      return [lastMonth.startOf("month"), lastMonth.endOf("month")];
    },
  },
  {
    label: "Last 90 Days",
    getValue: () => {
      const today = dayjs();
      return [today.subtract(89, "day"), today];
    },
  },
  { label: "Reset", getValue: () => [null, null] },
];

export const DateRangeField: React.FC<DateRangeFieldProps> = ({
  value,
  onChange,
  size = "small",
  minInputWidth = 150,
  disableFuture = true,
  showShortcuts = true,
}) => {
  const start = value?.startDate ? dayjs(value.startDate) : null;
  const end = value?.endDate ? dayjs(value.endDate) : null;
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const endDatePickerRef = useRef<HTMLDivElement>(null);

  const handleShortcutClick = (shortcut: (typeof defaultShortcuts)[0]) => {
    const [startDate, endDate] = shortcut.getValue();
    onChange({
      startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
      endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
    });
    setAnchorEl(null);
  };

  const handleStartDateChange = (newValue: Dayjs | null) => {
    onChange({
      startDate: newValue ? newValue.format("YYYY-MM-DD") : "",
      endDate: end ? end.format("YYYY-MM-DD") : "",
    });

    // Auto-focus to end date picker if start date is selected and end date is not set
    if (newValue && !end) {
      // Small delay to ensure the start date is processed first
      setTimeout(() => {
        const endDateInput = endDatePickerRef.current?.querySelector(
          "input"
        ) as HTMLInputElement;
        if (endDateInput) {
          endDateInput.focus();
          endDateInput.click();
        }
      }, 150);
    }
  };

  const handleEndDateChange = (newValue: Dayjs | null) => {
    onChange({
      startDate: start ? start.format("YYYY-MM-DD") : "",
      endDate: newValue ? newValue.format("YYYY-MM-DD") : "",
    });
  };

  const handleClear = () => {
    onChange({
      startDate: "",
      endDate: "",
    });
  };

  const open = Boolean(anchorEl);

  const formatDisplayValue = () => {
    if (!start && !end) return "Select date range";
    if (start && end) {
      return `${start.format("MMM DD, YYYY")} - ${end.format("MMM DD, YYYY")}`;
    }
    if (start) return `From ${start.format("MMM DD, YYYY")}`;
    if (end) return `Until ${end.format("MMM DD, YYYY")}`;
    return "Select date range";
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Button
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<KeyboardArrowDown />}
        startIcon={<CalendarToday />}
        sx={{
          minWidth: minInputWidth,
          justifyContent: "space-between",
          textTransform: "none",
          color: "text.primary",
          borderColor: "grey.300",
          "&:hover": {
            borderColor: "primary.main",
          },
        }}
      >
        <Typography variant="body2" sx={{ flex: 1, textAlign: "left" }}>
          {formatDisplayValue()}
        </Typography>
        {start || end ? (
          <Tooltip title="Clear">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              sx={{ ml: 1, p: 0.5 }}
            >
              <Clear fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: { minWidth: 400, maxWidth: 500 },
        }}
      >
        <Box sx={{ p: 2 }}>
          {showShortcuts && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Quick Select
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
                {defaultShortcuts.map((shortcut, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    size="small"
                    onClick={() => handleShortcutClick(shortcut)}
                    sx={{
                      textTransform: "none",
                      minWidth: "auto",
                      px: 1.5,
                      py: 0.5,
                      fontSize: "0.75rem",
                      color:
                        shortcut.label === "Reset"
                          ? "error.main"
                          : "text.primary",
                      borderColor:
                        shortcut.label === "Reset" ? "error.main" : "grey.300",
                      "&:hover": {
                        borderColor:
                          shortcut.label === "Reset"
                            ? "error.dark"
                            : "primary.main",
                        bgcolor:
                          shortcut.label === "Reset"
                            ? "error.light"
                            : "primary.light",
                      },
                    }}
                  >
                    {shortcut.label}
                  </Button>
                ))}
              </Box>
              <Divider sx={{ my: 2 }} />
            </>
          )}

          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Select Date Range
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ mb: 1, display: "block" }}>
                  Start Date
                </Typography>
                <DatePicker
                  value={start}
                  onChange={handleStartDateChange}
                  disableFuture={disableFuture}
                  maxDate={disableFuture ? dayjs() : undefined}
                  slotProps={{
                    textField: {
                      size,
                      sx: { width: "100%" },
                      placeholder: "Start date",
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }} ref={endDatePickerRef}>
                <Typography variant="caption" sx={{ mb: 1, display: "block" }}>
                  End Date
                </Typography>
                <DatePicker
                  value={end}
                  onChange={handleEndDateChange}
                  disableFuture={disableFuture}
                  maxDate={disableFuture ? dayjs() : undefined}
                  slotProps={{
                    textField: {
                      size,
                      sx: { width: "100%" },
                      placeholder: "End date",
                    },
                  }}
                />
              </Box>
            </Box>
          </LocalizationProvider>
        </Box>
      </Popover>
    </Box>
  );
};

export default DateRangeField;
