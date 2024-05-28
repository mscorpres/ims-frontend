import { useEffect, useState } from "react";
import { Select, Empty, Spin, Row } from "antd";
import useDebounce from "@/hooks/useDebounce.ts";

export default function MyAsyncSelect({
  value,
  onChange,
  loadOptions,
  size,
  placeholder,
  onBlur,
  optionsState,
  defaultValue,
  selectLoading,
  labelInValue,
  borderBottom,
  mode,
  disabled,
  noBorder,
  color,
  hideArrow,
  fetchDefault,
  onMouseEnter,
  optionsList,
}) {
  const [searchValue, setSearchValue] = useState("");
  const updatedValue = useDebounce(searchValue);

  useEffect(() => {
    if (updatedValue.length >= 3) {
      loadOptions(updatedValue);
    }
  }, [updatedValue]);
  return (
    <Select
      onMouseEnter={onMouseEnter}
      onBlur={onBlur}
      disabled={disabled}
      showSearch
      bordered={noBorder ? false : true}
      value={value}
      // onFocus={}
      placeholder={placeholder}
      onFocus={() => fetchDefault && loadOptions("")}
      // suffixIcon={<SearchOutlined />}
      // allowClear
      defaultValue={defaultValue}
      mode={mode}
      showArrow={hideArrow ? false : true}
      size={size ? size : "default"}
      style={{
        width: "100%",
        color: color,
        cursor: "pointer",
      }}
      filterOption={false}
      onSearch={(value) => {
        setSearchValue(value);
      }}
      onChange={onChange}
      notFoundContent={
        selectLoading ? (
          <Row justify="center" style={{ padding: 5 }}>
            <Spin size="small" />
          </Row>
        ) : null
      }
      labelInValue={labelInValue}
      options={(optionsState || []).map((d) => ({
        value: d.value,
        label: d.text,
      }))}
      optionsList={(optionsState || []).map((d) => ({
        value: d.value,
        label: d.text,
      }))}
    ></Select>
  );
}
