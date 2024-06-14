import React, { useEffect } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const MyDatePicker = ({
  format = "DD-MM-YYYY",
  value,
  setDateRange,
  size,
  disabledtheDate,
}) => {
  useEffect(() => {
    if (value) {
      setDateRange(value);
    } else if (value === "") {
      setDateRange(getDateFormatted([dayjs().subtract(89, "d"), dayjs()]));
    } else {
      setDateRange(getDateFormatted([dayjs().subtract(89, "d"), dayjs()]));
    }
  }, []);
  useEffect(() => {
    setTimeout(() => {
      if (value === "") {
        console.log("it is coming here");
        const formatted = getDateFormatted([
          dayjs().subtract(89, "d"),
          dayjs(),
        ]);

        setDateRange(formatted);
      }
    }, 1000);
  });
  const date1 = dayjs("2024-03-31");
  const date2 = dayjs();
  let hours = date2.diff(date1, "hours");
  const days = Math.floor(hours / 24);
  hours = hours - days * 24;

  ///for R35 since the  date selected should no be of before 1 april 2024
  const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < dayjs().subtract(days, "d");
  };

  console.log("disabledDate: ", disabledtheDate);
  return (
    <DatePicker.RangePicker
      size={size ? size : "default"}
      style={{
        width: "100%",
        fontSize: window.innerWidth <= 1600 ? "0.7rem" : "0.9rem",
      }}
      value={
        value !== ""
          ? getDateFormatted(value)
          : [dayjs().subtract(89, "d"), dayjs()]
      }
      format={format}
      disabledDate={disabledtheDate == "true" ? disabledDate : ""}
      onChange={(e) => {
        setDateRange(getDateFormatted(e));
      }}
      ranges={{
        Today: [dayjs(), dayjs()],
        Yesterday: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")],
        "Last 7 Days": [dayjs().subtract(7, "d"), dayjs().subtract(1, "d")],
        "This Month": [dayjs().startOf("month"), dayjs()],
        "Last Month": [
          dayjs().startOf("month").subtract(1, "month"),
          dayjs().startOf("month").subtract(1, "d"),
        ],
        "Last 90 Days": [dayjs().subtract(89, "d"), dayjs()],
      }}
    />
  );
};

export default MyDatePicker;

const getDateFormatted = (value) => {
  if (typeof value === "string") {
    if (value.length > 0) {
      return [
        dayjs(value.substring(0, 10), "DD-MM-YYYY"),
        dayjs(value.substring(11, 21), "DD-MM-YYYY"),
      ];
    } else {
      return [dayjs().subtract(89, "d"), dayjs()];
      // return undefined;
    }
  }
  if (typeof value === "object" && value?.length) {
    return `${dayjs(value[0]).format("DD-MM-YYYY")}-${dayjs(value[1]).format(
      "DD-MM-YYYY"
    )}`;
  }
};
