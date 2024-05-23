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
import useApi from "../../../../../hooks/useApi.ts";
import ShipmentInfo from "./ShipmentInfo";
import { CommonIcons } from "../../../../../Components/TableActions.jsx/TableActions";
import InputMask from "react-input-mask";
import FormTable2 from "../../../../../Components/FormTable2";
import {
  createShipment,
  getOrderDetails,
  getUpdateShipmentDetails,
  updateShipment,
} from "../../../../../api/sales/salesOrder";
import Loading from "../../../../../Components/Loading";
import ClientInfo from "./ClientInfo";
import BillingInfo from "./BillingDetailsCard";
import ShippingDetailsCard from "./ShippingDetailsCard";
import {
  getBillingAddressOptions,
  getShippingAddressOptions,
  fetchLocations,
  getBillingAddressDetails,
} from "../../../../../api/general.ts";
import { convertSelectOptions } from "../../../../../utils/general.ts";
import {
  getBranchDetails,
  getClientBranches,
} from "../../../../../api/finance/clients";
import MyAsyncSelect from "../../../../../Components/MyAsyncSelect";
import { toast } from "react-toastify";

function CreateShipment({
  open,
  hide,
  updateShipmentRow,
  setUpdateShipmentRow,
}) {
  const [gstType, setgstType] = useState([]);
  const [billingOptions, setBillingOptions] = useState([]);
  const [shippingOptions, setShippinOptions] = useState([]);
  const [locationlist, setlocationlist] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const [details, setDetails] = useState({});

  const { executeFun, loading } = useApi();
  const [shipmentForm] = Form.useForm();

  const billingId = Form.useWatch("billingId", shipmentForm);

  const shippingId = Form.useWatch("shippingId", shipmentForm);
  const calculation = (id, row) => {
    const exchangeRate = row.exchangeRate ?? 1;
    const qty = row.qty;
    const rate = row.rate;
    const inrValue =
      +Number(qty) * +Number(rate) * +Number(exchangeRate).toFixed(2);
    const foreignValue = +Number(qty) * +Number(rate);
    const foreignValueCombined = `${row.currencySymbol ?? ""} ${foreignValue}`;
    shipmentForm.setFieldValue(["products", id, "inrValue"], inrValue);

    shipmentForm.setFieldValue(
      ["products", id, "foreignValueCombined"],
      foreignValueCombined
    );
  };

  const validateHandler = async () => {
    const values = await shipmentForm.validateFields();

    Modal.confirm({
      title: updateShipmentRow
        ? "Are you sure you want to Update this shipment?"
        : "Are you sure you want to create this shipment?",

      content: "Check all the values properly before proceeding",
      okText: updateShipmentRow ? "Update" : "Create",
      onOk: () => handleSubmit(values),
    });
  };

  const handleSubmit = async (values) => {
    let response;
    if (updateShipmentRow) {
      response = await executeFun(
        () => updateShipment(values, open, updateShipmentRow, details),
        "submit"
      );
    } else {
      response = await executeFun(
        () => createShipment(values, open, details),
        "submit"
      );
    }
    // return;    console.log("this is the handle submit respnse", response);
    if (response.success) {
      shipmentForm.resetFields();
      hide();
      setDetails(null);
    }

    // console.log("response", response);
    // if (response.success) {
    //   toast.success(response.message);
    // } else {
    //   toast.error(response.message);
    // }
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

          exchangeRate: material.exchangerate,
          inrValue: material.exchangetaxablevalue,
          currencySymbol: material.currency_symbol,

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

      console.log(" =>", obj);

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
  const getlocations = async (search) => {
    const response = await executeFun(() => fetchLocations(search), "select");

    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }

    setAsyncOptions(arr);
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
    if (open && !updateShipmentRow) {
      handleFetchDetails(open);
      handleFetchBillingOptions();
      getlocations();
    }
  }, [open]);

  const getShipmentForUpdate = async (id) => {
    // console.log("id", id);
    const response = await executeFun(() => getUpdateShipmentDetails(id));
    if (response.success) {
      const {
        client,
        billing_info,
        shipping_info,
        client_info,
        client_address,
        shipping_address,
      } = response.data.header;
      // console.log("client", client, billing_info, shipping_info);
      const detailsObj = {
        clientName: client.name,
        clientCode: client.code,
        clientBranch: client_info.label,
        address: client_address,
        billing_info: {
          pan: billing_info.pan,
          gst: billing_info.gst,
          cin: billing_info.id,
          address: billing_info.billaddress,
        },
        shipping_info: {
          pan: shipping_info?.ship_pan,
          gst: shipping_info.gst,
          cin: "--",
          address: shipping_address,
          shippingID: shipping_info?.ship_id,
        },
        shipping_address: shipping_address,
      };
      const { header, material } = response.data;
      const obj = {
        eWayBillNo: header.eway_bill,
        docNo: "",
        vehicleNo: header.vehicle,
        otherRef: header.other_ref,
        billingId: header.billing_info,
        billingAddress: header.billing_address,
        shippingId: header.shipping_info.ship_id,
        so_id: header.so_id,
        so_shipment_id: header.so_shipment_id,
        shippingAddress: header.shipping_address,
        products: material.map((m) => ({
          product: m.item_name,
          productKey: m.item_key,
          hsn: m.hsn_code,
          qty: m.item_qty,
          rate: m.item_rate,
          inrValue:
            +Number(m.item_qty).toFixed(2) * +Number(m.item_rate).toFixed(2),
          pickLocation: m.item_pick_location.loc_key,

          // foreignValueCombined: m.currency_symbol + " " + m.taxablevalue,
          foreignValue:
            +Number(m.item_qty).toFixed(2) * +Number(m.item_rate).toFixed(2),
          pickLocation: m.item_pick_location.loc_key,
          gstTypeLabel: m.item_gst_type,
          cgst: m.cgst,
          sgst: m.sgst,
          igst: m.igst,
          gstRate: m.item_gstrate,
          dueDate: m.item_due_date,
          remark: m.item_remarks,
          updaterow: m.updateID,
        })),
      };
      // console.log("obj", obj);

      console.log("detailsObj", detailsObj);
      handleFetchShippingOptions(detailsObj.clientCode);
      setDetails(detailsObj);
      shipmentForm.setFieldsValue(obj);
    }
  };
  const removeHtml = (value) => {
    return value.replace(/<[^>]*>/g, " ");
  };
  const getBillingAddress = async (billaddressid) => {
    const response = await executeFun(
      () => getBillingAddressDetails(billaddressid),
      "fetch"
    );

    if (response.success) {
      const { data } = response;
      shipmentForm.setFieldValue("billPan", data.data.pan);
      shipmentForm.setFieldValue("billGST", data.data.gstin);
      let newStringaddress = removeHtml(data.data.address);
      shipmentForm.setFieldValue("billingAddress", newStringaddress);
    }
  };
  const handleFetchClientBranchDetails = async (locationType, branchId) => {
    const response = await executeFun(
      () => getBranchDetails(branchId),
      `fetch`
    );
    if (response.success) {
      const details = response.data[0];
      console.log("details", details);
      if (details) {
        shipmentForm.setFieldValue("shippingAddress", details.address);
        // shipmentForm.setFieldValue("shippingAddress", {
        //   label: details.state.name,
        //   value: details.state.code,
        // });
        // const address = removeHtml(details.address);
        // if (locationType === "client") {
        //   shipmentForm.setFieldValue("gstin", details.gst);
        //   shipmentForm.setFieldValue("clientaddress", address);
        // } else if (locationType === "shipaddressid") {
        //   shipmentForm.setFieldValue("shipPan", details.panNo);
        //   shipmentForm.setFieldValue("shipGST", details.gst);
        //   shipmentForm.setFieldValue("shipaddress", address);
        // }
      }
    }
  };
  useEffect(() => {
    if (updateShipmentRow) {
      console.log("update ->", updateShipmentRow);
      getShipmentForUpdate(updateShipmentRow.shipment_id);
      getlocations();
      handleFetchBillingOptions();
    }
  }, [updateShipmentRow]);
  useEffect(() => {
    if (billingId) {
      getBillingAddress(billingId);
    }
  }, [billingId]);
  // useEffect(() => {
  //   if (clientbranch?.value && client?.value) {
  //     handleFetchClientBranchDetails("client", clientbranch.value);
  //   }
  // }, [clientbranch]);
  // useEffect(() => {
  //   if (shippingId) {
  //     console.log("shippingId", shippingId);
  //     handleFetchClientBranchDetails("client", shippingId);
  //   }
  // }, [shippingId]);
  return (
    <Drawer
      onClose={hide}
      open={updateShipmentRow ? updateShipmentRow : open}
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
              {details && (
                <>
                  <ShipmentInfo
                    form={shipmentForm}
                    validateHandler={validateHandler}
                    billingOptions={billingOptions}
                    shippingOptions={shippingOptions}
                    updateShipmentRow={updateShipmentRow}
                  />
                  <ClientInfo details={details} />
                  <BillingInfo
                    details={details}
                    updateShipmentRow={updateShipmentRow}
                  />
                  <ShippingDetailsCard
                    details={details}
                    updateShipmentRow={updateShipmentRow}
                  />
                </>
              )}
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
              CommonIcons={CommonIcons}
              getlocations={getlocations}
              loading={loading}
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

  setAsyncOptions,
  asyncOptions,
  getlocations,
  loading,
}) => {
  return (
    <Card style={{ height: "100%" }} bodyStyle={{ height: "95%" }}>
      <FormTable2
        removableRows={true}
        nonRemovableColumns={1}
        columns={[
          ...productItems(getlocations, setAsyncOptions, asyncOptions, loading),
        ]}
        listName="products"
        watchKeys={["rate", "qty", "gstRate", "exchangeRate", "currencySymbol"]}
        nonListWatchKeys={["gstType"]}
        componentRequiredRef={["rate", "qty", "pickLocation"]}
        form={form}
        calculation={calculation}
        rules={{
          pickLocation: [
            {
              required: true,
              message: "Please select a pick location",
            },
          ],
          rate: [
            {
              required: true,
              message: "Please enter Rate",
            },
          ],
          qty: [
            {
              required: true,
              message: "Please enter Qty",
            },
          ],
        }}
      />
    </Card>
  );
};

const productItems = (getlocations, setAsyncOptions, asyncOptions, loading) => [
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

  {
    headerName: "Due Date",
    width: 150,
    name: "dueDate",
    field: (row) => (
      <InputMask
        disabled={true}
        name="duedate"
        value={row.duedate}
        // onChange={(e) => inputHandler("duedate", e.target.value, row.id)}
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
    headerName: "Pick Location",

    width: 120,

    name: "pickLocation",
    field: ({ row }) => (
      <MyAsyncSelect
        onBlur={() => setAsyncOptions([])}
        loadOptions={getlocations}
        optionsState={asyncOptions}
        selectLoading={loading("select")}
      />
    ),
  },
  {
    headerName: "Item Description",
    name: "remark",
    width: 250,
    field: (row) => (
      <Input
        size="default"
        value={row.remark}
        // onChange={(e) => inputHandler("remark", e.target.value, row.id)}
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
