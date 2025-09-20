import React from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro";

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
    label: "This Week",
    getValue: () => {
      const today = dayjs();
      return [today.startOf("week"), today.endOf("week")];
    },
  },
  {
    label: "Last Week",
    getValue: () => {
      const today = dayjs();
      const prevWeek = today.subtract(7, "day");
      return [prevWeek.startOf("week"), prevWeek.endOf("week")];
    },
  },
  {
    label: "Last 7 Days",
    getValue: () => {
      const today = dayjs();
      return [today.subtract(7, "day"), today];
    },
  },
  {
    label: "Current Month",
    getValue: () => {
      const today = dayjs();
      return [today.startOf("month"), today.endOf("month")];
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

  const handleChange = (newValue: [Dayjs | null, Dayjs | null]) => {
    const [s, e] = newValue || [];
    onChange({
      startDate: s ? s.format("YYYY-MM-DD") : "",
      endDate: e ? e.format("YYYY-MM-DD") : "",
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateRangePicker
        value={[start, end]}
        onChange={handleChange}
        disableFuture={disableFuture}
        maxDate={disableFuture ? dayjs() : undefined}
        slotProps={{
          textField: { size, sx: { minWidth: minInputWidth } },
          shortcuts: showShortcuts ? { items: defaultShortcuts } : undefined,
          actionBar: { actions: [] },
        }}
      />
    </LocalizationProvider>
  );
};

export default DateRangeField;
