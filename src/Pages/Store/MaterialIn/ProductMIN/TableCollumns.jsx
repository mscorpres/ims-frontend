import { Input } from "antd";
import InputMask from "react-input-mask";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MySelect from "../../../../Components/MySelect";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
const gstTypeOptions = [
  { value: "I", text: "INTER STATE" },
  { value: "L", text: "LOCAL" },
];

const gstRateOptions = [
  { value: 0, text: "0" },
  { value: 12, text: "12" },
  { value: 18, text: "18" },
  { value: 28, text: "28" },
];
export const componentCell = (
  { row },
  inputHandler,
  setAsyncOptions,
  getComponentDetail,
  asyncOptions,
  selectLoading,
) => (
  <MyAsyncSelect
    onBlur={() => setAsyncOptions([])}
    value={row?.component}
    onChange={(value) => {
      inputHandler("component", value, row.id);
    }}
    selectLoading={selectLoading}
    labelInValue
    loadOptions={getComponentDetail}
    optionsState={asyncOptions}
  />
);
export const QuantityCell = ({ row }, inputHandler) => (
  <Input
    value={row.orderqty}
    onChange={(e) => inputHandler("orderqty", e.target.value, row.id)}
    suffix={row.unitsname}
    type="number"
  />
);
export const rateCell = ({ row }, inputHandler, currencies) => (
  <Input.Group compact>
    <Input
      style={{ width: "65%" }}
      value={row.orderrate}
      onChange={(e) => inputHandler("orderrate", e.target.value, row.id)}
       type="number"
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
// export const rateCell = ({ row }, inputHandler) => (
//   <Input
//     value={row.orderrate}
//     onChange={(e) => inputHandler("orderrate", e.target.value, row.id)}
//   />
// <div
//   style={{
//     display: "flex",
//     alignItems: "center",
//     position: "relative",
//     width: "100%",
//   }}
// >
//   <span
//     style={{
//       display: "block",
//       height: "10px",
//       width: "15px",
//       fontSize: "0.2rem",
//       borderRight: "1px solid rgb(196, 196, 196)",
//       position: "absolute",
//       top: 12,
//       left: 5,
//       // background: "red",
//     }}
//   >
//     <select
//       className=""
//       style={{
//         height: "100%",
//         paddingLeft: "2px",
//         width: "100%",
//         color: "#404040",
//       }}
//       onChange={(e) =>
//         inputHandler("currency", e.target.value, row.id)
//       }
//       value={row.currency}
//     >
//       {currencies?.map((currency) => {
//         return <option value={currency.value}>{currency.label}</option>;
//       })}
//     </select>
//   </span>
//   <input
//     className="table-input"
//     type="text"
//     style={{
//       border: "1px solid #ccc",
//       // height: "25px",
//       width: "100%",
//       paddingLeft: "20px",
//       textAlign: "center",
//     }}
//     value={row.orderrate}
//     onChange={(e) =>
//       inputHandler("orderrate", e.target.value, row.id)
//     }
//   />
// </div>
// );

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
        value={row.invoiceId}
        onChange={(e) => inputHandler("invoiceId", e.target.value, row.id)}
      />
    </>
  );
};
export const invoiceDateCell = ({ row }, inputHandler) => {
  return (
    <InputMask
      name="due_date[]"
      value={row.invoiceDate}
      onChange={(e) => inputHandler("invoiceDate", e.target.value, row.id)}
      className="date-text-input"
      mask="99-99-9999"
      style={{ textAlign: "center" }}
      //   // defaultValue="01-09-2022"
      // />
      // <SingleDatePicker
      //   row={row}
      //   value={row.invoiceDate}
      //   // value="empty"
      //   name="invoiceDate"
      //   tablePicker={true}
      //   inputHandler={inputHandler}
      //   // onChange={(e) => inputHandler("duedate", e.target.value, row.id)}
    />
  );
};
export const HSNCell = ({ row }, inputHandler) => (
  <Input
    type="text"
    value={row.hsncode}
    onChange={(e) => inputHandler("hsncode", e.target.value, row.id)}
  />
);
export const gstTypeCell = ({ row }, inputHandler) => (
  <MySelect
    value={row.gsttype}
    // className="table-input"
    onChange={(value) => inputHandler("gsttype", value, row.id)}
    options={gstTypeOptions}
  />
);
export const gstRate = ({ row }, inputHandler) => (
  <MySelect
    value={row.gstrate}
    onChange={(value) => inputHandler("gstrate", value, row.id)}
    options={gstRateOptions}
  />
);
const isLocalGst = (row) => {
  const g = row?.gsttype;
  const v = typeof g === "object" ? g?.value ?? g?.text : g;
  return v === "L" || String(v || "").toUpperCase().startsWith("LOCAL");
};

export const CGSTCell = ({ row }) => (
  <Input disabled value={isLocalGst(row) ? row.cgst ?? 0 : 0} />
);
export const SGSTCell = ({ row }) => (
  <Input disabled value={isLocalGst(row) ? row.sgst ?? 0 : 0} />
);
export const IGSTCell = ({ row }) => (
  <Input disabled value={!isLocalGst(row) ? row.igst ?? 0 : 0} />
);

const getLocationDisplayValue = (rowLocation, locationOptions) => {
  if (rowLocation == null || rowLocation === "") return undefined;
  const hasDisplayKey =
    typeof rowLocation === "object" &&
    (rowLocation.text != null || rowLocation.label != null || rowLocation.name != null);
  if (hasDisplayKey) {
    return {
      text: rowLocation.text ?? rowLocation.label ?? rowLocation.name ?? "",
      value: rowLocation.value ?? rowLocation.id,
    };
  }
  const option = locationOptions?.find(
    (opt) =>
      opt.value === rowLocation ||
      String(opt.value) === String(rowLocation) ||
      opt.text === rowLocation ||
      String(opt.text).toLowerCase() === String(rowLocation).toLowerCase()
  );
  return option ? { text: option.text, value: option.value } : undefined;
};

export const locationCell = (
  { row },
  inputHandler,

  locationOptions,
) => (
  <>
    <MySelect
      labelInValue
      value={getLocationDisplayValue(row?.location, locationOptions)}
      onChange={(value) => {
        inputHandler("location", value, row.id);
      }}
      options={locationOptions}
    />
  </>
);
export const autoConsumptionCell = (
  { row },
  inputHandler,
  autoConsumptionOptions,
) => (
  <MySelect
    value={row?.autoConsumption}
    onChange={(value) => {
      inputHandler("autoConsumption", value, row.id);
    }}
    options={autoConsumptionOptions}
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
    type="text"
    value={row.orderremark}
    onChange={(e) => inputHandler("orderremark", e.target.value, row.id)}
  />
);
