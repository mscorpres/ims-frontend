import { Input } from "antd";
import MyAsyncSelect from "../../../../../Components/MyAsyncSelect";

export const scrapeChallanColumns = ({
  asyncOptions,
  setAsyncOptions,
  handleFetchComponentOptions,
  handleFetchComponentDetails,
}) => [
  {
    headerName: "Part Component",
    name: "component",
    width: 250,
    flex: 1,
    field: (row, index) => (
      <MyAsyncSelect
        onBlur={() => setAsyncOptions([])}
        labelInValue
        loadOptions={handleFetchComponentOptions}
        optionsState={asyncOptions}
        onChange={(value) => handleFetchComponentDetails(row, index, value)}
      />
    ),
  },
  {
    headerName: "Qty",
    name: "qty",
    width: 100,
    field: () => <Input type="number" />,
  },
  {
    headerName: "Rate",
    name: "rate",
    width: 100,
    field: () => <Input type="number" />,
  },
  {
    headerName: "Value",
    name: "value",
    width: 100,
    field: () => <Input type="number" />,
  },
  {
    headerName: "HSN Code",
    name: "hsnCode",
    width: 150,
    field: () => <Input />,
  },
  {
    headerName: "Remarks",
    name: "remarks",
    width: 250,
    field: () => <Input.TextArea rows={3} />,
  },
];
