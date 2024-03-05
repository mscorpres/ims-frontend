import { Select, Spin } from "antd";
export default function MySelect({
  options,
  selectLoading,
  size,
  value,
  onChange,
  disabled,
  labelInValue,
  mode,
  placeholder,
  defaultValue,
}) {
  return (
    <Select
      labelInValue={labelInValue}
      mode={mode}
      defaultValue={defaultValue}
      placeholder={placeholder}
      disabled={disabled}
      allowClear
      value={value}
      notFoundContent={selectLoading ? <Spin size="small" /> : null}
      onChange={onChange}
      optionFilterProp="text"
      size={size ? size : "default"}
      style={{
        width: "100%",
      }}
      fieldNames={{ label: "text" }}
      showSearch
      showArrow={true}
      filterOption={(input, option) => {
        return (option?.text?.toString()?.toLowerCase() ?? "").includes(
          input?.toString()?.toLowerCase()
        );
      }}
      options={options}
    />
  );
}
