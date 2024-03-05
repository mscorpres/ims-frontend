import React from "react";
import Select from "react-select";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";

export default function TableSelect({
  value,
  options,
  fun,
  name,
  id,
  defaultValue,
  height,
}) {
  return (
    <MySelect
      className="table-select"
      onChange={(value) => fun(name, value, id)}
      options={options}
      value={value}
      height={height}
      defaultValue={options?.filter((option) => option.value == defaultValue)}
      // value={value}
    />
  );
}
