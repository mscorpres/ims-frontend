import {
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Typography,
  Flex,
  Modal,
} from "antd";
import { useEffect, useState } from "react";
import useApi from "../../../../../hooks/useApi";
import ShipmentInfo from "./ShipmentInfo";
import { CommonIcons } from "../../../../../Components/TableActions.jsx/TableActions";
import InputMask from "react-input-mask";
import FormTable2 from "../../../../../Components/FormTable2";
import {
  createShipment,
  getOrderDetails,
} from "../../../../../api/sales/salesOrder";
import Loading from "../../../../../Components/Loading";
import ClientInfo from "./ClientInfo";
import BillingInfo from "./BillingDetailsCard";
import ShippingDetailsCard from "./ShippingDetailsCard";
import {
  getBillingAddressOptions,
  getShippingAddressOptions,
} from "../../../../../api/general";
import { convertSelectOptions } from "../../../../../utils/general";
import { getClientBranches } from "../../../../../api/finance/clients";

function CreateShipment({ open, hide }) {
  const [gstType, setgstType] = useState([]);
  const [billingOptions, setBillingOptions] = useState([]);
  const [shippingOptions, setShippinOptions] = useState([]);
  const [locationlist, setlocationlist] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [minRows, setMinRows] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [details, setDetails] = useState({});

  const { executeFun, loading } = useApi();
  const [shipmentForm] = Form.useForm();
  const calculation = () => {};

  const validateHandler = async () => {
    const values = await shipmentForm.validateFields();

    Modal.confirm({
      title: "Are you sure you want to create this shipment?",
      content: "Check all the values properly before proceeding",
      okText: "Create",
      onOk: () => handleSubmit(values),
    });
  };

  const handleSubmit = async (values) => {
    console.log("these are the values", values);
    const response = await executeFun(() => createShipment(values), "submit");
  };

  const handleFetchDetails = async (orderId) => {
    const response = await executeFun(() => getOrderDetails(orderId), "fetch");
    if (response.success) {
      const { client, bill, materials, ship } = response.data.data;
      const detailsObj = {
        clientName: client[0].clientname,
        clientCode: client[0].clientcode.value,
        clientBranch: client[0].clientbranch.label,
        address: client[0].clientaddress,
        billing: {
          pan: bill.billpanno,
          gst: bill.billgstid,
          cin: bill.billcinno,
          address: bill.billaddress,
        },
        shipping: {
          pan: ship.shippanno,
          gst: ship.shipgstid,
          cin: "--",
          address: ship.shipaddress,
        },
      };
      const obj = {
        eWayBillNo: "",
        docNo: "",
        vehicleNo: "",
        otherRef: "",
        billingId: bill.addrbillid,
        billingAddress: bill.billaddress,
        shippingId: ship.addrshipid,
        shippingAddress: ship.shipaddress,
        products: materials.map((material) => ({
          product: material.selectedItem[0].text,
          productKey: material.itemKey,
          hsn: material.hsncode,
          qty: material.orderqty,
          rate: material.rate,
          pickLocation: "",
          inrValue: material.exchangetaxablevalue,
          foreignValueCombined:
            material.currency_symbol + " " + material.taxablevalue,
          foreignValue: material.taxablevalue,
          gstTypeLabel: material.gsttype[0].text,
          cgst: material.cgst,
          sgst: material.sgst,
          igst: material.igst,
          gstRate: material.gstrate,
          dueDate: material.due_date,
          remark: material.remark,
        })),
      };
      handleFetchShippingOptions(detailsObj.clientCode);
      setDetails(detailsObj);
      shipmentForm.setFieldsValue(obj);
    }
  };

  const handleFetchBillingOptions = async () => {
    const response = await executeFun(() => getBillingAddressOptions());
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setBillingOptions(arr);
  };

  const handleFetchShippingOptions = async (clientCode) => {
    const response = await executeFun(() => getClientBranches(clientCode));
    let arr = [];
    if (response.success) {
      arr = response.data.data.map((row) => ({
        text: row.city.name,
        value: row.city.id,
      }));
    }
    setShippinOptions(arr);
  };
  useEffect(() => {
    if (open) {
      handleFetchDetails(open);
      handleFetchBillingOptions();
    }
  }, [open]);

  return (
    <Drawer
      onClose={hide}
      open={open}
      width="100vw"
      bodyStyle={{ overflow: "hidden", padding: 10 }}
      title={`Creating Shipment : ${open} `}
    >
      <Form style={{ height: "100%" }} layout="vertical" form={shipmentForm}>
        <Row gutter={8} style={{ height: "95%", overflow: "hidden" }}>
          <Col span={6} style={{ height: "100%", overflow: "hidden" }}>
            {loading("fetch") && <Loading />}
            <Flex
              gap={10}
              vertical
              style={{ overflow: "auto", height: "100%" }}
            >
              <ShipmentInfo
                form={shipmentForm}
                validateHandler={validateHandler}
                billingOptions={billingOptions}
                shippingOptions={shippingOptions}
              />
              <ClientInfo details={details} />
              <BillingInfo details={details} />
              <ShippingDetailsCard details={details} />
            </Flex>
          </Col>
          <Col span={18}>
            {loading("fetch") && <Loading />}
            <Product
              calculation={calculation}
              form={shipmentForm}
              location={locationlist}
              gsttype={gstType}
              setlocationlist={setlocationlist}
              locationlist={locationlist}
              asyncOptions={asyncOptions}
              setAsyncOptions={setAsyncOptions}
              minRows={minRows}
              CommonIcons={CommonIcons}
              currencies={currencies}
            />
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}
const Product = ({
  form,
  calculation,
  location,
  gsttype,
  setlocationlist,
  getLocationList,
  locationlist,

  currencies,
}) => {
  return (
    <Card style={{ height: "100%" }} bodyStyle={{ height: "95%" }}>
      <FormTable2
        removableRows={true}
        nonRemovableColumns={1}
        columns={[
          ...productItems(
            location,
            gsttype,
            setlocationlist,
            getLocationList,
            locationlist,
            currencies
          ),
        ]}
        listName="products"
        watchKeys={["rate", "qty", "gstRate"]}
        nonListWatchKeys={["gstType"]}
        componentRequiredRef={["rate", "qty"]}
        form={form}
        calculation={calculation}
        // rules={listRules}
      />
    </Card>
  );
};
const productItems = (gstType, inputHandler, currencies) => [
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
    name: "product",
    width: 250,
    flex: true,
    field: () => <Input disabled />,
  },

  {
    headerName: "HSN Code",
    name: "hsn",
    width: 150,
    field: () => <Input disabled={true} />,
  },
  {
    headerName: "Ord. Qty",
    name: "qty",
    width: 100,
    field: () => <Input />,
  },
  {
    headerName: "Rate",
    name: "rate",
    width: 100,
    field: (row) => <Input />,
    // field: (row) => (
    //   <Input.Group compact>
    //     <Input
    //       size="default"
    //       style={{ width: "65%", borderColor: row.approval && "red" }}
    //       value={row.rate}
    //       onChange={(e) => inputHandler("rate", e.target.value, row.id)}
    //     />
    //     <div style={{ width: "35%" }}>
    //       <MySelect
    //         options={currencies}
    //         value={row.currency}
    //         onChange={(value) => inputHandler("currency", value, row.id)}
    //       />
    //     </div>
    //   </Input.Group>
    // ),
  },

  //   {
  //     headerName: "Value",
  //     name: "value",
  //     width: 150,
  //     field: () => <Input disabled />,
  //   },
  {
    headerName: "Local Value",
    width: 150,
    name: "inrValue",
    field: (row) => (
      <Input
        disabled={true}
        // value={Number(row.inrValue).toFixed(2)}
      />
    ),
  },
  {
    headerName: "Foreign Value",
    width: 150,
    name: "foreignValueCombined",
    field: (row) => <Input disabled={true} />,
  },
  // {
  //   headerName: "Foreign Value",
  //   width: 150,
  //   name: "usdValue",
  //   field: (row) => (
  //     <Input
  //       size="default"
  //       disabled={true}
  //       value={
  //         row?.currency == 364907247 ? 0 : Number(row?.foreginValue).toFixed(2)
  //       }
  //     />
  //   ),
  // },
  // {
  //   headerName: "Pick up location",
  //   name: "pickLocation",
  //   width: 150,
  //   field: (row) => (
  //     <MySelect
  //       // onBlur={() => setlocationlist([])}
  //       options={locationlist}
  //       // optionsState={locationlist}
  //       // selectLoading={loading === "select"}
  //     />
  //   ),
  //   // <MySelect options={location} />,
  // },

  {
    headerName: "Due Date",
    width: 150,
    name: "dueDate",
    field: (row) => (
      <InputMask
        disabled={true}
        name="duedate"
        value={row.duedate}
        onChange={(e) => inputHandler("duedate", e.target.value, row.id)}
        className="date-text-input"
        mask="99-99-9999"
        placeholder="__-__-____"
        style={{ textAlign: "center", borderRadius: 5, height: 30 }}
        // defaultValue="01-09-2022"
      />
    ),
  },
  {
    headerName: "GST Type",
    width: 100,
    name: "gstTypeLabel",
    field: (row) => <Input disabled={true} />,
  },
  {
    headerName: "GST %",
    width: 100,
    name: "gstRate",
    field: (row) => <Input disabled={true} />,
  },
  {
    headerName: "CGST",
    width: 100,
    name: "cgst",
    field: (row) => <Input disabled={true} />,
  },
  {
    headerName: "SGST",
    width: 100,
    name: "sgst",
    field: (row) => <Input disabled={true} />,
  },
  {
    headerName: "IGST",
    width: 100,
    name: "igst",
    field: (row) => <Input disabled={true} />,
  },
  {
    headerName: "Item Description",
    name: "remark",
    width: 250,
    field: (row) => (
      <Input
        size="default"
        value={row.remark}
        onChange={(e) => inputHandler("remark", e.target.value, row.id)}
        placeholder="Enter Remark"
      />
    ),
  },
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  // {
  //   headerName: "Remark",
  //   name: "description",
  //   width: 150,
  //   field: (row) => <Input />,
  // },
  //   {
  //     headerName: "Product Description",
  //     name: "productdescription",
  //     width: 150,
  //     field: (row) => <TextArea row={3} />,
  //   },
];
export default CreateShipment;
const gstRateOptions = [
  {
    text: "5%",
    value: 5,
  },
  {
    text: "12%",
    value: 12,
  },
  {
    text: "18%",
    value: 18,
  },
  {
    text: "28%",
    value: 28,
  },
];
