import { Input } from "antd";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import InputMask from "react-input-mask";
import MySelect from "../../../../Components/MySelect";
const gstTypeOptions = [
  { value: "I", text: "INTER STATE" },
  { value: "L", text: "LOCAL" },
];

export const componentSelect = (
  { row },
  inputHandler,
  loadOptions,
  setAsyncOptions,
  asyncOptions,
  selectLoading
) => (
  <MyAsyncSelect
    selectLoading={selectLoading}
    onBlur={() => setAsyncOptions([])}
    // onInputChange={(value) => setSearchInput(value)}
    value={row?.component}
    onChange={(value) => {
      inputHandler("component", value, row?.id);
    }}
    labelInValue
    styles={{ width: "100%" }}
    loadOptions={loadOptions}
    optionsState={asyncOptions}
  />
);
// log

export const quantityCell = ({ row }, inputHandler) => (
  <Input
    size="default"
    value={row.qty}
    onChange={(e) => inputHandler("qty", e.target.value, row.id)}
    suffix={row.unit}
  />
);
export const rateCell = ({ row }, inputHandler, currencies) => (
  <Input.Group compact>
    <Input
      size="default"
      style={{ width: "65%", borderColor: row.approval && "red" }}
      value={row.rate}
      onChange={(e) => inputHandler("rate", e.target.value, row.id)}
    />
    <div style={{ width: "35%" }}>
      <MySelect
        options={currencies}
        value={row.currency}
        onChange={(value) => inputHandler("currency", value, row.id)}
      />
    </div>
  </Input.Group>
);
export const disabledCell = ({ row }, value, inputHandler, suffix) => (
  <Input
    disabled
    value={value}
    onChange={(e) => inputHandler("qty", e.target.value, row.id)}
  />
);
export const taxableCell = ({ row }) => {
  return (
    <Input
      size="default"
      disabled={true}
      value={Number(row.inrValue).toFixed(2)}
    />
  );
};
export const foreignCell = ({ row }) => {
  return (
    <Input
      size="default"
      disabled={true}
      value={
        row?.currency == 364907247 ? 0 : Number(row?.foreginValue).toFixed(2)
      }
    />
  );
};
export const invoiceDateCell = ({ row }, inputHandler) => {
  return (
    // <SingleDatePicker
    //   row={row}
    //   value="empty"
    //   name="duedate"
    //   tablePicker={true}
    //   inputHandler={inputHandler}
    //   // onChange={(e) => inputHandler("duedate", e.target.value, row.id)}
    // />
    <InputMask
      name="duedate"
      value={row.duedate}
      onChange={(e) => inputHandler("duedate", e.target.value, row.id)}
      className="date-text-input"
      mask="99-99-9999"
      placeholder="__-__-____"
      style={{ textAlign: "center", borderRadius: 5, height: 30 }}
      // defaultValue="01-09-2022"
    />
  );
};
export const HSNCell = ({ row }, inputHandler) => (
  <Input
    type="text"
    size="default"
    value={row.hsncode}
    onChange={(e) => inputHandler("hsncode", e.target.value, row.id)}
    placeholder="Enter HSN Code"
  />
);
export const gstTypeCell = ({ row }, inputHandler) => (
  <MySelect
    value={row.gsttype}
    onChange={(value) => inputHandler("gsttype", value, row.id)}
    options={gstTypeOptions}
  />
);
export const gstRate = ({ row }, inputHandler) => (
  <Input
    size="default"
    value={row.gstrate}
    onChange={(e) => inputHandler("gstrate", e.target.value, row.id)}
    placeholder="Enter GST Rate"
  />
);
export const CGSTCell = ({ row }) => (
  <Input size="default" disabled={true} value={row.cgst} />
);
export const SGSTCell = ({ row }) => (
  <Input size="default" disabled={true} value={row.sgst} />
);
export const IGSTCell = ({ row }) => (
  <Input size="default" disabled={true} value={row.igst} />
);
export const itemDescriptionCell = ({ row }, inputHandler) => (
  <Input
    size="default"
    value={row.remark}
    onChange={(e) => inputHandler("remark", e.target.value, row.id)}
    placeholder="Enter Remark"
  />
);
