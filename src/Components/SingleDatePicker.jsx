import React, { useEffect } from "react";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import { useState } from "react";

export default function SingleDatePicker({
  setDate,
  placeholder,
  size,
  daysAgo,
  row,
  value,
  inputHandler,
  tablePicker,
  name,
  disabled,
  legal,
  format = "DD-MM-YYYY",
}) {
  const onChange = (date, dateString) => {
    if (tablePicker) {
      inputHandler(name, dateString, row.id);
      return;
    }
    if (setDate) {
      setDate(dateString);
    }
  };
  // console.log("legal", legal);
  const disabledDate = (current) => {
    if (legal) {
      return;
    } else {
      return current && current > dayjs().endOf("day");
    }
  };
  useEffect(() => {
    if (setDate) {
      if (daysAgo) {
        setDate(
          daysAgo &&
            dayjs()
              .subtract(daysAgo, "d")
              .format(format ?? format)
        );
      } else {
        setDate(value);
      }
    }
  }, []);

  return (
    <DatePicker
      legal={legal ?? false}
      disabled={disabled}
      disabledDate={disabledDate}
      size={size ?? "default"}
      style={{ width: "100%", height: "100%" }}
      format={format ?? format}
      value={
        daysAgo
          ? dayjs().subtract(daysAgo, "d")
          : value && dayjs(value, format ?? format)
      }
      onChange={onChange}
      placeholder={placeholder && placeholder}
    />
  );
}
