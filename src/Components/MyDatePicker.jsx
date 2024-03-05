import React, { useEffect, useState } from "react";

// import dayjs from "dayjs";
import dayjs from "dayjs";
import { DatePicker } from "antd";
const { RangePicker } = DatePicker;

// const format = "DD-MM-YYYY";

export default function MyDatePicker({
  setDateRange,
  size,
  spacedFormat,
  startingDate,
  format = "DD-MM-YYYY",
}) {
  const [searchDateRange, setSearchDateRange] = useState([
    startingDate ? dayjs() : dayjs().subtract(89, "d"),
    dayjs(),
  ]);

  useEffect(() => {
    if (searchDateRange[0] && searchDateRange[1]) {
      const from = searchDateRange[0];
      const to = searchDateRange[1];
      let dash = spacedFormat ? " - " : "-";
      const formattedDate = from + dash + to;
      setDateRange(formattedDate);
    }
  }, [searchDateRange]);
  useEffect(() => {
    const from = startingDate
      ? dayjs().subtract(1, "d").format(format)
      : dayjs().subtract(89, "d").format(format);
    const to = dayjs().format(format);

    const formattedDate = from + "-" + to;
    setSearchDateRange([from, to]);
  }, []);

  const disabledDate = (current) => {
    return current && current > dayjs().endOf("day");
  };
  return (
    <RangePicker
      // className="date-picker"
      size={size ? size : "default"}
      style={{
        width: "100%",
        fontSize: window.innerWidth <= 1600 ? "0.7rem" : "0.9rem",
      }}
      defaultValue={searchDateRange}
      disabledDate={disabledDate}
      format={format}
      ranges={{
        Today: [dayjs(), dayjs()],
        Yesterday: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")],
        "Last 7 Days": [dayjs().subtract(7, "d"), dayjs().subtract(1, "d")],
        "This Month": [dayjs().startOf("month"), dayjs().endOf("month")],
        "Last Month": [
          dayjs().startOf("month").subtract(1, "month"),
          dayjs().startOf("month").subtract(1, "d"),
        ],
        "Last 3 Months": [
          dayjs().subtract(89, "d"),
          dayjs(),
          // dayjs().endOf("month").subtract(1, "month"),
        ],
      }}
      // style={{ height: "38px" }}
      onChange={(e) => {
        setSearchDateRange(
          e.map((item) => {
            return dayjs(item).format(format);
          })
        );
      }}
    />
  );
}
