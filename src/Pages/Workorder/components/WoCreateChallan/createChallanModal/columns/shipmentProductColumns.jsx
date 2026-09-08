import { Input, Typography } from "antd";
import MyAsyncSelect from "../../../../../../Components/MyAsyncSelect";
import MySelect from "../../../../../../Components/MySelect";
import { gstRateOptions } from "../constants";

const { TextArea } = Input;

const gstColumns = (gstType) => [
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
];

const pickupLocationColumn = (getLocationList, setlocationlist, locationlist) => ({
  headerName: "Pick up location",
  name: "pickuplocation",
  width: 150,
  field: () => (
    <MyAsyncSelect
      onBlur={() => setlocationlist([])}
      loadOptions={getLocationList}
      optionsState={locationlist}
    />
  ),
});

export const shipmentproductItems = (
  location,
  gstType,
  getLocationList,
  setlocationlist,
  locationlist,
  getComponentOptions,
  asyncOptions,
  setAsyncOptions,
  getComponentDetails
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
    headerName: "Products",
    name: "productname",
    width: 250,
    flex: true,
    field: () => <Input disabled />,
  },
  {
    headerName: "Secondary Products",
    name: "secondary_product",
    width: 250,
    flex: true,
    field: () => (
      <MyAsyncSelect
        loadOptions={getComponentOptions}
        optionsState={asyncOptions}
        onChange={getComponentDetails}
      />
    ),
  },
  {
    headerName: "HSN Code",
    name: "hsncode",
    width: 150,
    field: () => <Input />,
  },
  {
    headerName: "Qty",
    name: "qty",
    width: 100,
    field: () => <Input />,
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
  ...gstColumns(gstType),
  pickupLocationColumn(getLocationList, setlocationlist, locationlist),
  {
    headerName: "Product Description",
    name: "productdescription",
    width: 150,
    field: () => <TextArea row={3} />,
  },
];

export const shipmentproductItemsEdit = (
  location,
  gstType,
  getLocationList,
  setlocationlist,
  locationlist
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
    headerName: "Products",
    name: "productname",
    width: 250,
    flex: true,
    field: () => <Input disabled />,
  },
  {
    headerName: "HSN Code",
    name: "hsncode",
    width: 150,
    field: () => <Input />,
  },
  {
    headerName: "Qty",
    name: "qty",
    width: 100,
    field: () => <Input />,
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
  ...gstColumns(gstType),
  pickupLocationColumn(getLocationList, setlocationlist, locationlist),
  {
    headerName: "Product Description",
    name: "productdescription",
    width: 150,
    field: () => <TextArea row={3} />,
  },
  {
    headerName: "Remark",
    name: "challan_remark",
    width: 150,
    field: () => <Input />,
  },
];
