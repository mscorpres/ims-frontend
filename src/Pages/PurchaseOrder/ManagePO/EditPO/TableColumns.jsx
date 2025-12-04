import { Input } from "antd";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import InputMask from "react-input-mask";
import MySelect from "../../../../Components/MySelect";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
const gstTypeOptions = [
  { value: "I", text: "INTER STATE" },
  { value: "L", text: "LOCAL" },
];

export const componenetSelect = (
  { row },
  inputHandler,
  loadOptions,
  setAsyncOptions,
  asynOptions
) => (
  <MyAsyncSelect
    onBlur={() => setAsyncOptions([])}
    value={row?.component}
    onChange={(value) => {
      inputHandler("component", value, row?.id);
    }}
    labelInValue
    styles={{ width: "100%" }}
    loadOptions={loadOptions}
    optionsState={asynOptions}
  />
);

export const quantityCell = ({ row }, inputHandler) => (
  <Input
    style={{ border: row.qtyApproval && "1px solid red" }}
    value={row.qty}
    onChange={(e) => inputHandler("qty", e.target.value, row.id)}
    suffix={row.unit}
  />
);

export const rateCell = ({ row }, inputHandler, currencies) => (
  <Input.Group compact>
    <Input
      style={{ width: "65%", border: row.rateAppr && "1px solid red" }}
      value={row.rate}
      onChange={(e) => inputHandler("rate", e.target.value, row.id)}
    />
    <div style={{ width: "35%" }}>
      <MySelect
        onChange={(value) => inputHandler("currency", value, row.id)}
        value={row.currency}
        options={currencies}
      />
    </div>
  </Input.Group>
);
export const disabledCell = (value, inputHandler) => (
  <Input
    disabled={true}
    value={value}
    // onChange={(e) => inputHandler("project_rate", e.target.value, row.id)}
  />
);
export const taxableCell = ({ row }) => {
  return <Input disabled={true} value={row.inrValue} />;
};
export const foreignCell = ({ row }) => {
  return <Input disabled={true} value={row.foreginValue} />;
};
export const invoiceDateCell = ({ row }, inputHandler) => {
  return (
    // <SingleDatePicker
    //   row={row}
    //   name="duedate"
    //   value={row.duedate != "" ? row.duedate : "empty"}
    //   tablePicker={true}
    //   inputHandler={inputHandler}
    // />
    <InputMask
      name="duedate"
      value={row.duedate ?? ""}
      onChange={(e) => inputHandler("duedate", e.target.value, row.id)}
      className="date-text-input"
      mask="99-99-9999"
      placeholder="Invoice Date"
      style={{ textAlign: "center" }}
      // defaultValue="01-09-2022"
    />
  );
};
export const HSNCell = ({ row }, inputHandler) => (
  <Input
    type="text"
    value={row.hsncode}
    onChange={(e) => inputHandler("hsncode", e.target.value, row.id)}
    placeholder="Enter HSN"
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
    type="text"
    value={row.gstrate}
    onChange={(e) => inputHandler("gstrate", e.target.value, row.id)}
    placeholder="Enter GST Rate"
  />
);
export const CGSTCell = ({ row }) => <Input disabled={true} value={row.cgst} />;
export const SGSTCell = ({ row }) => <Input disabled={true} value={row.sgst} />;
export const IGSTCell = ({ row }) => <Input disabled={true} value={row.igst} />;
export const itemDescriptionCell = ({ row }, inputHandler) => (
  <Input
    type="text"
    value={row.remark}
    onChange={(e) => inputHandler("remark", e.target.value, row.id)}
    placeholder="Enter Remark"
  />
);
export const internalRemarkCell = ({ row }, inputHandler) => (
  <Input
    placeholder="Internal Remark..."
    value={row.internal_remark || ""}
    onChange={(e) => inputHandler("internal_remark", e.target.value, row.id)}
    // style={{ backgroundColor: "#fffbe6" }}
  />
);
