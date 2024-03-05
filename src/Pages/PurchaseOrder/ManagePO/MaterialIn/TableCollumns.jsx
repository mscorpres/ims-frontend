import { Input } from "antd";
import InputMask from "react-input-mask";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MySelect from "../../../../Components/MySelect";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
const gstTypeOptions = [
  { value: "I", text: "INTER STATE" },
  { value: "L", text: "LOCAL" },
];
// export const currencyCell = ({ row }, inputHandler, currencies) => (
//   <MySelect
//     onChange={(value) => inputHandler("currency", value, row.id)}
//     value={row.currency}
//     options={currencies}
//   />
// );

export const QuantityCell = ({ row }, inputHandler) => (
  <Input
    disabled={row.completed}
    value={row.orderqty}
    onChange={(e) => inputHandler("orderqty", e.target.value, row.id)}
    suffix={row.unitsname}
  />
);
export const rateCell = ({ row }, inputHandler, currencies) => (
  <Input.Group compact>
    <Input
      disabled={row.completed}
      style={{ width: "65%" }}
      value={row.orderrate}
      onChange={(e) => inputHandler("orderrate", e.target.value, row.id)}
    />
    <div style={{ width: "35%" }}>
      <MySelect
        disabled={row.completed}
        onChange={(value) => inputHandler("currency", value, row.id)}
        value={row.currency}
        options={currencies}
      />
    </div>
  </Input.Group>
);
export const taxableCell = ({ row }) => {
  return <Input disabled={true} value={row.inrValue} />;
};
export const foreignCell = ({ row }) => {
  return <Input disabled={true} value={row.usdValue} />;
};
export const invoiceIdCell = ({ row }, inputHandler) => {
  return (
    <>
      <Input
        disabled={row.completed}
        value={row.invoiceId}
        onChange={(e) => inputHandler("invoiceId", e.target.value, row.id)}
        placeholder="Enter Invoice ID"
      />
    </>
  );
};
export const invoiceDateCell = ({ row }, inputHandler) => {
  return (
    <SingleDatePicker
      row={row}
      disabled={row.completed}
      name="invoiceDate"
      value={row.invoiceDate == "" ? "empty" : row.invoiceDat}
      tablePicker={true}
      inputHandler={inputHandler}
    />
  );
};
export const HSNCell = ({ row }, inputHandler) => (
  <Input
    type="text"
    disabled={row.completed}
    value={row.hsncode}
    onChange={(e) => inputHandler("hsncode", e.target.value, row.id)}
    placeholder="Enter HSN"
  />
);
export const gstTypeCell = ({ row }, inputHandler) => (
  <MySelect
    value={row.gsttype}
    disabled={row.completed}
    // className="table-input"
    onChange={(value) => inputHandler("gsttype", value, row.id)}
    options={gstTypeOptions}
  />
);
export const gstRate = ({ row }, inputHandler) => (
  <Input
    type="text"
    disabled={row.completed}
    value={row.gstrate}
    onChange={(e) => inputHandler("gstrate", e.target.value, row.id)}
    placeholder="Enter HSN"
  />
);
export const CGSTCell = ({ row }) => <Input disabled={true} value={row.cgst} />;
export const SGSTCell = ({ row }) => <Input disabled={true} value={row.sgst} />;
export const IGSTCell = ({ row }) => <Input disabled={true} value={row.igst} />;

export const locationCell = (
  { row },
  inputHandler,
  setAsyncOptions,
  getLocation,
  asyncOptions
) => (
  <MyAsyncSelect
    onBlur={() => setAsyncOptions([])}
    value={row?.location}
    onChange={(value) => {
      inputHandler("location", value, row.id);
    }}
    disabled={row.completed}
    labelInValue
    loadOptions={getLocation}
    optionsState={asyncOptions}
    placeholder="Select Location..."
  />
);
export const autoConsumptionCell = (
  { row },
  inputHandler,
  autoConsumptionOptions
) => (
  <MySelect
    value={row?.autoConsumption}
    onChange={(value) => {
      inputHandler("autoConsumption", value, row.id);
    }}
    disabled={row.completed}
    labelInValue
    options={autoConsumptionOptions}
    placeholder="Select Auto Consumption..."
  />
);
// export const autoConsumptionCell = (row) => {
//   return (
//     <div style={{ width: "100%" }}>
//       <MySelect
//         height={window.innerWidth <= 1600 ? "28px" : "33px"}
//         fontSize={window.innerWidth <= 1600 ? "0.5rem" : "0.6rem"}
//         isDisabled={true}
//         value={autoComnsumptionOptions.filter((o) => o.value == "no")[0]}
//         options={autoComnsumptionOptions}
//         className="table-input"
//       />
//     </div>
//   );
// };
export const remarkCell = ({ row }, inputHandler) => (
  <Input
    disabled={row.completed}
    type="text"
    value={row.orderremark}
    onChange={(e) => inputHandler("orderremark", e.target.value, row.id)}
    placeholder="Enter Remark"
  />
);
