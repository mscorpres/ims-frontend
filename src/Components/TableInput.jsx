import { Input } from "antd";

import InputMask from "react-input-mask";
import MySelect from "./MySelect";
import MyAsyncSelect from "./MyAsyncSelect";
const gstTypeOptions = [
  { value: "I", text: "INTER STATE" },
  { value: "L", text: "LOCAL" },
];

export const asyncSelectComponent = ({
  row,
  inputHandler,
  loadOptions,
  setAsyncOptions,
  asyncOptions,
  selectLoading,
  value,
}) => (
  <MyAsyncSelect
    selectLoading={selectLoading}
    onBlur={() => setAsyncOptions([])}
    value={value}
    onChange={(value) => {
      inputHandler("component", value, row?.id);
    }}
    labelInValue
    loadOptions={loadOptions}
    optionsState={asyncOptions}
  />
);
export const inputComponent = ({ ...args }) => (
  <Input
    value={
      args.type == "calculated" ? args.value : args.row[args.value?.toString()]
    }
    onChange={(e) => {
      args.inputHandler(args.value, e.target.value, args.row?.id);
    }}
    disabled={args.disabled}
    suffix={args.suffix ?? ""}
  />
);
