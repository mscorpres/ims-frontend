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
  pickerType,
}) {
  const onChange = (date, dateString) => {
    if (tablePicker) {
      inputHandler(name, dateString, row.id);
      return;
    }

    if (!pickerType && setDate) {
      console.log("this is the date string", dateString);
      setDate(dateString);
    }
    if (pickerType && setDate) {
      console.log("this is the date ", date);
      console.log("this is the date string", dateString);
      setDate(date);
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
      disabled={disabled}
      disabledDate={disabledDate}
      size={size ?? "default"}
      picker={pickerType}
      style={{ width: "100%", height: "100%" }}
      format={format && !pickerType ? format : undefined}
      value={
        daysAgo
          ? dayjs().subtract(daysAgo, "d")
          : // : value && dayjs(value, format)
          value && !pickerType
          ? value && dayjs(value, format)
          : value && dayjs(value)
      }
      onChange={onChange}
      placeholder={placeholder && placeholder}
    />
  );
}
