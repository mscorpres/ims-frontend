import { Input, Typography } from "antd";
import MyAsyncSelect from "../../../../../../Components/MyAsyncSelect";
import MySelect from "../../../../../../Components/MySelect";
import { gstRateOptions } from "../constants";

export const componentsItems = (
  location,
  gstType,
  getLocationList,
  setlocationlist,
  locationlist,
  syncOutQty
) => [
  {
    headerName: "#",
    name: "",
    width: 30,
    field: (_, index) => (
      <Typography.Text type="secondary">{index + 1}.</Typography.Text>
    ),
  },
  {
    headerName: "Components",
    name: "component",
    width: 250,
    flex: true,
    field: () => <Input disabled />,
  },
  {
    headerName: "Part Code",
    name: "partCode",
    width: 150,
    field: () => <Input disabled />,
  },
  {
    headerName: "Qty",
    name: "qty",
    width: 100,
    field: (row) => (
      <Input onChange={(e) => syncOutQty?.(row, e.target.value)} />
    ),
  },
  {
    headerName: "Rate",
    name: "rate",
    width: 100,
    field: () => <Input />,
  },
  {
    headerName: "Value",
    name: "value",
    width: 150,
    field: () => <Input disabled />,
  },
  {
    headerName: "GST %",
    name: "gstRate",
    width: 100,
    field: () => <MySelect options={gstRateOptions} />,
  },
  {
    headerName: "CGST",
    name: "cgst",
    width: 100,
    conditional: true,
    condition: () => gstType === "L",
    field: () => <Input disabled />,
  },
  {
    headerName: "SGST",
    name: "sgst",
    width: 100,
    conditional: true,
    condition: () => gstType === "L",
    field: () => <Input disabled />,
  },
  {
    headerName: "IGST",
    name: "igst",
    width: 100,
    conditional: true,
    condition: () => gstType === "I",
    field: () => <Input disabled />,
  },
  {
    headerName: "HSN Code",
    name: "hsn",
    width: 150,
    field: () => <Input />,
  },
  {
    headerName: "Pick Up Location",
    name: "pickuplocation",
    width: 150,
    field: () => (
      <MyAsyncSelect
        onBlur={() => setlocationlist([])}
        loadOptions={getLocationList}
        optionsState={locationlist}
      />
    ),
  },
  {
    headerName: "Remark",
    name: "description",
    width: 250,
    field: () => <Input.TextArea rows={3} />,
  },
];
