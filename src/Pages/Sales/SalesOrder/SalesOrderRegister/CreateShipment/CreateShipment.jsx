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
  InputNumber,
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
import ToolTipEllipses from "../../../../../Components/ToolTipEllipses.jsx";
import { useNavigate, useParams } from "react-router-dom";
import NavFooter from "../../../../../Components/NavFooter.jsx";

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

  const [newArr, setNewArr] = useState([]);
  const [current, setCurrent] = useState(0);
  const [paginate, setPaginate] = useState([]);
  const [currArr, setCurrArr] = useState([]);
  const [totalPage, setTotalPage] = useState();
  const [isAnother, setIsAnother] = useState("");
  const [newId, setNewId] = useState("");
  const [details, setDetails] = useState({});
  const [editId, setEditId] = useState("");

  const { executeFun, loading } = useApi();
  const [shipmentForm] = Form.useForm();
  const navigate = useNavigate();

  const billingId = Form.useWatch("billingId", shipmentForm);
  var chunk;
  var result;
  let params = useParams();

  const shippingId = Form.useWatch("shippingId", shipmentForm);
  const calculation = (id, row) => {
    const exchangeRate = row.exchangeRate ?? 1;
    const oldbillqty = row.oldbillqty;
    const rate = row.rate;
    const inrValue =
      +Number(oldbillqty) * +Number(rate) * +Number(exchangeRate).toFixed(2);
    const foreignValue = +Number(oldbillqty) * +Number(rate);
    const foreignValueCombined = `${row.currencySymbol ?? ""} ${foreignValue}`;
    let cgst;
    let sgst;
    let igst;
    if (row.gstTypeLabel == "LOCAL") {
      cgst = (inrValue * row.gstRate) / 100;
      sgst = (inrValue * row.gstRate) / 100;
      igst = 0;
    } else {
      sgst = 0;
      cgst = 0;
      igst = (inrValue * row.gstRate) / 100;
    }
    shipmentForm.setFieldValue(["products", id, "inrValue"], inrValue);
    shipmentForm.setFieldValue(["products", id, "sgst"], sgst);
    shipmentForm.setFieldValue(["products", id, "cgst"], cgst);
    shipmentForm.setFieldValue(["products", id, "igst"], igst);

    shipmentForm.setFieldValue(
      ["products", id, "foreignValueCombined"],
      foreignValueCombined
    );
  };

  const validateHandler = async () => {
    const values = await shipmentForm.validateFields();

    Modal.confirm({
      title:
        updateShipmentRow || editId
          ? "Are you sure you want to Update this shipment?"
          : "Are you sure you want to create this shipment?",

      content: "Check all the values properly before proceeding",
      okText: updateShipmentRow || editId ? "Update" : "Create",
      onOk: () => handleSubmit(values),
    });
  };

  const handleSubmit = async (values) => {
    if (editId) {
    }
    // let response;
    if (updateShipmentRow || editId) {
      let response = await executeFun(
        () => updateShipment(values, open, editId, details),
        "submit"
      );
      if (response.success) {
        // hide();
        shipmentForm.resetFields();
        // setUpdateShipmentRow(null);
        setDetails(null);
        navigate(`/sales/order/shipments`);
      }
    } else {
      let response = await executeFun(
        () => createShipment(values, newId, details),
        "submit"
      );
      if (response.success) {
        // hide();
        shipmentForm.resetFields();
        // setUpdateShipmentRow(null);
        setDetails(null);
        navigate(`/sales/order/register`);
      }
    }
  };

  const handleFetchDetails = async (orderId) => {
    const response = await executeFun(() => getOrderDetails(orderId), "fetch");
    console.log("response", response);
    if (response.success) {
      const { client, bill, materials, ship } = response.data;
      const detailsObj = {
        clientName: client[0].clientname,
        clientCode: client[0].clientcode.value,
        clientBranch: client[0].clientbranch.label,
        address: client[0].clientaddress,
        billing_info: {
          pan: bill.billpanno,
          gst: bill.billgstid,
          cin: bill.billcinno,
          address: bill.billaddress,
        },
        shipping_info: {
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
        shippingAddress: detailsObj?.shipping_info?.address,
        products: materials.map((material) => ({
          product: material.selectedItem[0].text,
          productKey: material.itemKey,
          hsn: material.hsncode,
          qty: material.orderqty,
          pendingqty: material.pendingqty,
          oldbillqty: material.pendingqty,
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
          updateid: material.updateid,
        })),
      };
      let arr = obj.products;
      if (arr.length > 25) {
        setIsAnother(true);
        chunk = arr.length / 25;
        chunk = Math.ceil(chunk);
        setTotalPage(chunk);
        result = divideArray(arr, chunk);
        setPaginate(result);
        setCurrArr(result[0]);
        obj.products = result[0];
        shipmentForm.setFieldsValue(obj);
        setCurrent(1);
      } else {
        // chunk = arr.length;
        setTotalPage(1);
        result = arr;
        shipmentForm.setFieldsValue(obj);
      }
      setCurrent(1);
      handleFetchShippingOptions(detailsObj.clientCode);
      setDetails(detailsObj);
    }
  };
  function divideArray(arr, numSubarrays) {
    // Calculate the size of each subarray
    const subarraySize = Math.ceil(arr.length / numSubarrays);
    // console.log("subarraySize", subarraySize);
    // Initialize an empty array to store subarrays
    const subarrays = [];

    // Iterate through the array and divide it into subarrays
    let startIndex = 0;
    for (let i = 0; i < numSubarrays; i++) {
      const endIndex = startIndex + subarraySize;
      subarrays.push(arr.slice(startIndex, endIndex));
      startIndex = endIndex;
    }

    return subarrays;
  }
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
    const response = await executeFun(
      () => getUpdateShipmentDetails(id),
      "fetch"
    );
    if (response.success) {
      const {
        client,
        billing_info,
        shipping_info,
        client_info,
        client_address,
        shipping,
      } = response.data.header;
      // console.log("response.data", response.data);
      const { header, material } = response.data;
      const detailsObj = {
        clientName: client.name,
        clientCode: client.code,
        clientBranch: client_info.label,
        address: client_address,
        billing_info: {
          pan: billing_info.pan,
          gst: billing_info.gst,
          cin: billing_info.id,
          address: header?.billing_address,
        },
        shipping_info: {
          pan: shipping?.pan,
          gst: shipping?.gst,
          cin: "--",
          address: response.data.header.shipping_address,
          shippingId: shipping?.ship_id,
          soId: header.so_id,
          soShipmentId: header.so_shipment_id,
        },
        shipping_address: response.data.header.shipping_address,
      };

      const obj = {
        eWayBillNo: header.eway_bill,
        docNo: "",
        vehicleNo: header.vehicle,
        otherRef: header.other_ref,
        billingId: header.billing_info,
        billingAddress: header.billing_address,
        shippingId: header.shipping?.ship_id,
        so_id: header.so_id,
        so_shipment_id: header.so_shipment_id,
        shippingAddress: detailsObj?.shipping_address,
        products: material.map((m) => ({
          product: m.item_name,
          productKey: m.item_key,
          hsn: m.hsn_code,
          oldbillqty: m.item_qty,
          rate: m.item_rate,
          inrValue:
            +Number(m.item_qty).toFixed(2) * +Number(m.item_rate).toFixed(2),
          // pickLocation: m.item_pick_location.loc_key,

          // foreignValueCombined: m.currency_symbol + " " + m.taxablevalue,
          foreignValue:
            +Number(m.item_qty).toFixed(2) * +Number(m.item_rate).toFixed(2),
          pickLocation: m.so_type?.value === "product" ? "20210324113426" : "",
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

      console.log("detailsObj", detailsObj);
      handleFetchShippingOptions(detailsObj.clientCode);
      setDetails(detailsObj);
      let arr = obj.products;
      // console.log("arr", arr);
      if (arr.length > 25) {
        setIsAnother(true);
        // console.log("Arr", arr.length);
        chunk = arr.length / 25;
        chunk = Math.ceil(chunk);
        setTotalPage(chunk);
        // console.log("chunk", chunk);
        result = divideArray(arr, chunk);
        // console.log("result", chunk);
        setPaginate(result);
        setCurrArr(result[0]);
        // console.log("resi", result);
        // let a = [...obj];
        obj.products = result[0];
        // console.log("obj new", obj);
        shipmentForm.setFieldsValue(obj);
        // Vbt01.setFieldValue("components", result[0]);
        // Vbt01.setFieldValue("bigarr", arr);
        // setEditVBTCode(result[0]);
        // setVbtComponent(result[0]);
        setCurrent(1);
      } else {
        setCurrent(1);
        // chunk = arr.length;
        setTotalPage(1);
        result = arr;
        // console.log("res", result);
        shipmentForm.setFieldsValue(obj);
        // console.log("result", result);
        // Vbt01.setFieldValue("components", result);
        // setEditVBTCode(arr);
        // setVbtComponent(arr);
      }

      handleFetchShippingOptions(detailsObj.clientCode);
      setDetails(detailsObj);
      // console.log("lenght of ibk", obj.products.length);
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
      // console.log("details", details);
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
  ///pagination functions
  const changeToNextPage = () => {
    // setLoading(true);
    // console.log("current", current);
    let createdEntry = shipmentForm.getFieldValue("products");
    // console.log("createdEntry", createdEntry);

    let id;
    // let newArray = [];
    if (current < totalPage) {
      id = current + 1;
      setCurrent(id);
      shipmentForm.setFieldValue("products", paginate[id - 1]);
      setCurrArr(paginate[id - 1]);

      paginate[current - 1] = createdEntry;

      let newArray = [...newArr];
      setNewArr(paginate);
      // setLoading(false);
    }
  };
  const changeToBackPage = () => {
    // setLoading(true);
    let id;

    let createdEntry = shipmentForm.getFieldValue("products");
    if (current - 1 > 0) {
      id = current - 1;
      setCurrent(id);
      shipmentForm.setFieldValue("products", paginate[id - 1]);
      setCurrArr(paginate[id - 1]);
      paginate[current - 1] = createdEntry;
    }
    setNewArr(paginate);
    // console.log("id", id);
    // setLoading(false);
  };
  const backFunction = () => {
    shipmentForm.resetFields();
  };
  //////

  // useEffect(() => {
  //   if (updateShipmentRow) {
  //     console.log("update ->", updateShipmentRow);
  //     getShipmentForUpdate(updateShipmentRow.shipment_id);
  //     getlocations();
  //     handleFetchBillingOptions();
  //   }
  // }, [updateShipmentRow]);
  useEffect(() => {
    if (editId) {
      getShipmentForUpdate(editId);
      getlocations();
      handleFetchBillingOptions();
    }
  }, [editId]);
  useEffect(() => {
    if (billingId) {
      // console.log("billingId-------", billingId);
      getBillingAddress(billingId);
    }
  }, [billingId]);
  useEffect(() => {
    if (params) {
      // console.log("params", params);
      let a = params?.orderId?.replaceAll("_", "/").replaceAll("=", "-");
      // console.log("a", a.split(":"));
      let isedit = a.split(":");
      if (isedit[0] == "edit") {
        // console.log("is edit", isedit[1]);
        setEditId(isedit[1]);
      } else {
        // console.log("here");
        setNewId(params?.orderId?.replaceAll("_", "/").replaceAll("=", "-"));
      }
    }
  }, [params]);
  useEffect(() => {
    if (newId) {
      handleFetchDetails(newId);
    }
  }, [newId]);
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
    // <Drawer
    //   onClose={hide}
    //   open={updateShipmentRow ? updateShipmentRow : open}
    //   width="100vw"
    //   bodyStyle={{ overflow: "hidden", padding: 10 }}
    //   title={
    //     updateShipmentRow
    //       ? `Update Shipment ${open} `
    //       : `Create Shipment  ${open}`
    //   }
    // >
    <div style={{ height: "100%" }}>
      {" "}
      {loading("fetch") && <Loading />}
      <Form style={{ height: "90%" }} layout="vertical" form={shipmentForm}>
        {" "}
        {/* {loading("fetch") && <Loading />} */}
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
                    updateShipmentRow={details}
                  />
                  <ClientInfo details={details} />
                  <BillingInfo
                    details={details}
                    updateShipmentRow={updateShipmentRow}
                  />
                  <ShippingDetailsCard
                    details={details}
                    updateShipmentRow={details}
                  />
                </>
              )}
            </Flex>
          </Col>
          <Col span={18} style={{ height: "100%" }}>
            {/* {loading("fetch") && <Loading />} */}
            <div
              style={{ marginBottom: "4px", marginTop: "4px" }}
            >{`Page ${current} of ${totalPage}`}</div>
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
              updateShipmentRow={updateShipmentRow}
              editId={editId}
            />
          </Col>
          {current < totalPage ? (
            <NavFooter
              nextLabel="Next"
              backLabel="Back"
              submitFunction={() => {
                changeToNextPage();
              }}
              // resetFunction={backFunction}
              backFunction={() => changeToBackPage()}
              // loading={loading}
            />
          ) : (
            <NavFooter
              nextLabel={
                updateShipmentRow || editId
                  ? "Update Shipment"
                  : "Create Shipment"
              }
              submitFunction={() => {
                validateHandler();
              }}
              // resetFunction={backFunction}
              backFunction={() => changeToBackPage()}
              // loading={loading}
            />
          )}
        </Row>
      </Form>
    </div>
    // </Drawer>
  );
}
const Product = ({
  form,
  calculation,

  setAsyncOptions,
  asyncOptions,
  getlocations,
  loading,
  updateShipmentRow,
  editId,
}) => {
  return (
    <FormTable2
      removableRows={true}
      nonRemovableColumns={1}
      columns={[
        ...productItems(
          getlocations,
          setAsyncOptions,
          asyncOptions,
          loading,
          updateShipmentRow,
          editId
        ),
      ]}
      listName="products"
      watchKeys={[
        "rate",
        "qty",
        "oldbillqty",
        "gstRate",
        "exchangeRate",
        "currencySymbol",
        "cgst",
        "sgst",
        "gstTypeLabel",
        "gstRate",
      ]}
      nonListWatchKeys={["gstTypeLabel"]}
      componentRequiredRef={["rate", "qty", "pickLocation", "oldbillqty"]}
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
  );
};

const productItems = (
  getlocations,
  setAsyncOptions,
  asyncOptions,
  loading,
  updateShipmentRow,
  editId
) =>
  updateShipmentRow || editId
    ? [
        {
          headerName: "#",
          name: "",
          width: 30,
          field: (_, index) => (
            <Typography.Text type="secondary">{index + 1}.</Typography.Text>
          ),
        },
        {
          headerName: "Material",
          name: "product",
          width: 250,
          flex: true,
          field: () => <Input disabled />,
        },
        {
          headerName: "Material Description",
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
        {
          headerName: "HSN Code",
          name: "hsn",
          width: 150,
          field: () => <Input disabled={true} />,
        },
        // {
        //   headerName: "Ord. Qty",
        //   name: "qty",
        //   width: 100,
        //   field: () => <Input />,
        // },
        {
          headerName: "Bill Qty",
          name: "oldbillqty",
          width: 100,
          field: (row) => <Input />,
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
      ]
    : [
        {
          headerName: "#",
          name: "",
          width: 30,
          field: (_, index) => (
            <Typography.Text type="secondary">{index + 1}.</Typography.Text>
          ),
        },
        {
          headerName: "Material",
          name: "product",
          width: 250,
          flex: true,
          field: (row) => <ToolTipEllipses text={row.product} />,
        },
        {
          headerName: "Material Description",
          name: "remark",
          width: 250,
          // field: (row) => (
          //   <Input
          //     size="default"
          //     value={row.remark}
          //     // onChange={(e) => inputHandler("remark", e.target.value, row.id)}
          //     placeholder="Enter Remark"
          //   />
          // ),
          field: (row) => (
            <input
              style={{ height: 30 }}
              type="text"
              // value={row.remark}
              // onChange={(e) => inputHandler("remark", e.target.value, row.id)}
              placeholder="Enter Remark"
            />
          ),
        },
        {
          headerName: "HSN Code",
          name: "hsn",
          width: 150,
          field: (row) => <ToolTipEllipses text={row.hsn} />,
        },
        {
          headerName: "Order Qty",
          name: "qty",
          width: 100,
          field: (row) => row.qty,
        },
        {
          headerName: "Pending Qty",
          name: "pendingqty",
          width: 100,
          field: (row) => row.pendingqty,
        },
        {
          headerName: "Shipment Qty",
          name: "oldbillqty",
          width: 100,
          field: (row) => <InputNumber max={row.pendingqty} />,
          // field: (row) => (
          //   <input
          //     max={row.pendingqty}
          //     style={{ height: 30, width: 80 }}
          //     type="number"
          //     // value={row.remark}
          //     // onChange={(e) => inputHandler("remark", e.target.value, row.id)}
          //   />
          // ),
        },
        {
          headerName: "Rate",
          name: "rate",
          width: 100,
          field: (row) => (
            <input
              style={{ height: 30, width: 80 }}
              type="number"
              // value={row.remark}
              // onChange={(e) => inputHandler("remark", e.target.value, row.id)}
            />
          ),
          // field: (row) => <Input />,
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
          field: (row) => row.inrValue,
        },
        {
          headerName: "Foreign Value",
          width: 150,
          name: "foreignValueCombined",
          field: (row) => row.foreignValueCombined,
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
          field: (row) => row.dueDate,
          // field: (row) => (
          //   <InputMask
          //     disabled={true}
          //     name="duedate"
          //     value={row.duedate}
          //     // onChange={(e) => inputHandler("duedate", e.target.value, row.id)}
          //     className="date-text-input"
          //     mask="99-99-9999"
          //     placeholder="__-__-____"
          //     style={{ textAlign: "center", borderRadius: 5, height: 30 }}
          //     // defaultValue="01-09-2022"
          //   />
          // ),
        },
        {
          headerName: "GST Type",
          width: 100,
          name: "gstTypeLabel",
          field: (row) => row.gstTypeLabel,
        },
        {
          headerName: "GST %",
          width: 100,
          name: "gstRate",
          field: (row) => row.gstRate,
        },
        {
          headerName: "CGST",
          width: 100,
          name: "cgst",
          field: (row) => row.cgst,
        },
        {
          headerName: "SGST",
          width: 100,
          name: "sgst",
          field: (row) => row.sgst,
        },
        {
          headerName: "IGST",
          width: 100,
          name: "igst",
          field: (row) => row.igst,
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
