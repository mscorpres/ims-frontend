import {
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Result,
  Row,
  Space,
  Typography,
} from "antd";
import React from "react";
import MySelect from "../../../../Components/MySelect";
import { imsAxios } from "../../../../axiosInterceptor";
import { useParams } from "react-router";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import MyDataTable from "../../../../Components/MyDataTable";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import dayjs from "dayjs";
import MyButton from "../../../../Components/MyButton";
import Loading from "../../../../Components/Loading";

const EwayBillSalesOrder = () => {
  const [loading, setLoading] = useState(false);
  const [stateOptions, setStateOptions] = useState([]);
  const [components, setComponents] = useState([]);
  const [transporterModeOptions, setTransporterModeOptions] = useState([]);
  const [successData, setSuccessData] = useState(null);
  const params = useParams();

  const [form] = Form.useForm();
  const billtoState = Form.useWatch("billFromState", form);
  const transporterId = Form.useWatch("transporterId", form);
  console.log("billtoState", billtoState);
  // const getDetails = async () => {
  //   try {
  //     setLoading("fetch");
  //     const response = await imsAxios.post("/jwEwaybill/fetch_challan_data", {
  //       challan_no: params.soId.replaceAll("_", "/"),
  //     });

  //     const { data } = response;
  //     if (data) {
  //       if (data.code === 200) {
  //         const { header, items, docType, subSupplyType, supplyType } =
  //           data.data;
  //         const finalObj = {
  //           type: supplyType,
  //           subType: subSupplyType,
  //           docNo: header.challan_id,
  //           docType: docType,
  //           docDate: header.jw_date,
  //           billFromName: header.dispatch_company,
  //           billFromGstin: header.dispatch_gst,
  //           billFromState: {
  //             label: header.dispatch_state_name,
  //             value: header.dispatch_state,
  //           },
  //           dispatchFromPlace: header.dispatch_label,
  //           dispatchFromPincode: header.dispatch_pincode,
  //           dispatchFromAddress: header.dispatch_address,
  //           billToName: header.vendorName,
  //           billToGstin: header.vendorGstin,
  //           billToState: {
  //             label: header.dispatch_state_name,
  //             value: header.vendorState,
  //           },
  //           dispatchToPlace: header.vendorCity,
  //           dispatchToPincode: header.vendorPinCode,
  //           dispatchToAddress: header.vendor_address,
  //           vehicleNo: header.vehicle,
  //           mode: "1",
  //           vehicleType: "R",
  //           transactionType: "1",
  //         };
  //         const arr = items.map((row, index) => ({
  //           id: index + 1,
  //           component: row.component_name,
  //           hsn: row.hsn_code,
  //           qty: row.issue_qty,
  //           rate: row.part_rate,
  //           value: row.taxable_amount,
  //           uom: row.unit_name,
  //         }));
  //         setComponents(arr);
  //         form.setFieldsValue(finalObj);
  //       } else {
  //         toast.error(data.message.msg);
  //       }
  //     }
  //   } catch (error) {
  //   } finally {
  //     setLoading("fetch");
  //   }
  // };
  // -----
  const getEwayBillDetails = async () => {
    setLoading("fetch");
    const response = await imsAxios.post(
      "/so_challan_shipment/fetchDataForEwayBill",
      {
        shipment_id: params.soId.replaceAll("_", "/"),
      }
    );
    console.log("response-", response);
    let { data, header } = response;
    if (response.success) {
      // const { header } = data;
      // console.log("data", data);
      // console.log("header", header);
      const finalObj = {
        type: header.supplyType,
        subType: header.subSupplyType,
        docNo: header.invoice_no,
        docType: header.docType,
        docDate: header.delivery_challan_dt,
        billFromName: header.billing_company,
        billFromGstin: header.billing_gstno,
        dispatchFromPincode: header.billing_pin,
        // billFromState: header.billing_state,
        billFromState: {
          label: header.billing_state_name,
          value: header.billing_state,
        },
        dispatchFromPlace: header.billing_lable,
        // dispatchFromPincode: header.ship_pin,
        dispatchFromAddress: header.billingaddress,
        billToName: header.client,
        billToGstin: header.ship_gstin,
        // billToState: header.ship_state,
        billToState: {
          label: header.ship_state_name,
          value: header.ship_state,
        },
        dispatchToPlace: header.client,
        dispatchToPincode: header.ship_pin,
        dispatchToAddress: header.shippingaddress,
        vehicleNo: header.vehicle,
        mode: "1",
        vehicleType: "R",
        transactionType: "1",
      };

      const arr = data.map((row, index) => ({
        id: index + 1,
        component: row.item_name,
        hsn: row.item_hsncode,
        qty: row.item_qty,
        rate: row.item_rate,
        cgst: row.item_cgst,
        gstRate: row.item_gst_rate,
        gstType: row.item_gst_type,
        sgst: row.item_sgst,
        igst: row.item_igst,
        partNo: row.item_part_no,
        value: row.item_value,
        // uom: row.unit_name,
      }));
      setComponents(arr);
      console.log("finalObj", finalObj);
      form.setFieldsValue(finalObj);
      setLoading(false);
    } else {
      toast.error(response.message);
    }
    // setLoading(false);
  };
  const getStateOptions = async () => {
    try {
      const response = await imsAxios.get("/tally/backend/states");
      const { data } = response;
      if (data) {
        if (data.data.length) {
          const arr = data.data.map((row) => ({
            text: row.name,
            value: row.code,
          }));
          setStateOptions(arr);
        }
      }
    } catch (error) {
      setStateOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const getTransporterModeOptions = async () => {
    try {
      const response = await imsAxios.post("/jwEwaybill/trans_mode");
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          setTransporterModeOptions(data.data);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const validateHandler = async () => {
    const values = await form.validateFields();
    console.log("val", values);
    // Bill from - company name
    // Dispatch from - same as sales order
    // Bill to - client details of sales order
    // Ship to - same as sales order
    const payload = {
      supply_type: values.type,
      documnet_date: values.docDate,
      invoice_id: values.docNo,
      document_type: values.docType,
      dispatch_name: values.billFromName,
      dispatchfrom_address: values.dispatchFromAddress,
      dispatchfrom_gstin: values.billFromGstin,
      dispatchfrom_place: values.dispatchFromPlace,
      dispatchfrom_state: values.billFromState.value,
      dispatchfrom_pincode: values.dispatchFromPincode,
      shipto_name: values.billToName,
      shipto_address: values.dispatchToAddress,
      shipto_gstin: values.billToGstin,
      shipto_place: values.dispatchToPlace,
      shipto_state: values.billToState.value,
      shipto_pincode: values.dispatchToPincode,
      transporter_id: values.transporterId,
      transporter_name: values.transporterName,

      dispatchTo: {
        label: values.dispatchToPlace,
        company: values.billToName,
        pincode: values.dispatchToPincode,
        state_code: values.billToState,
        gstin: values.billToGstin,
        address: values.dispatchToAddress,
      },

      transactionType: values.transactionType,
      transporterDocNo: values.transportDoc,
      transDistance: values.transportDate,
      transMode: values.mode,
      transDistance: values.distance,

      // challan_dt: values.docDate,
      // sub_supply_type: values.subType,
      // document_type: "Delivery Challan",
      vehicleNo: values.vehicleNo,
      transporter_name: values.transporterName,
      trans_doc_date: values.transportDate,
    };
    console.log("payload", payload);
    // return;
    Modal.confirm({
      title: "Create E-Way Bill",
      content: "Please check all the entries properly before proceeding",
      okText: "Create",
      onOk: () => submitHandler(payload),
    });
  };

  const submitHandler = async (payload) => {
    // return;
    try {
      setLoading("submit");
      const response = await imsAxios.post(
        "/so_challan_shipment/createEwayBill",
        payload
      );
      // console.log("respolse", response);
      // console.log("response.data.message.message", response.message);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          setSuccessData({ ewayBillNo: response.data.data.eway_bill_no });
        } else {
          toast.error(data.message);
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getGstinDetails = async (gstin) => {
    try {
      const response = await imsAxios.get(
        `/jwEwaybill/getGstinDetails?gstin=${gstin}`
      );
      const { data } = response;
      if (data) {
        form.setFieldValue("transporterName", data.tradeName);
      }
    } catch (error) {}
  };

  useEffect(() => {
    // getDetails();
    getEwayBillDetails();
    getStateOptions();
    // getTransporterModeOptions();
  }, []);
  useEffect(() => {
    if (transporterId?.length === 15) {
      getGstinDetails(transporterId);
    }
  }, [transporterId]);
  return (
    <Form form={form} layout="vertical" style={{ padding: 10 }}>
      {loading == "fetch" && <Loading />}
      {!successData && (
        <Row gutter={[6, 6]}>
          <Col span={24}>
            <Card size="small" title="Transaction Details">
              <Row gutter={6}>
                <Col span={4}>
                  <Form.Item name="type" label="Supply Type">
                    <MySelect
                      disabled={true}
                      labelInValue={true}
                      options={supplyTypeOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    // disabled={true}
                    name="subType"
                    label="Sub Type"
                  >
                    <MySelect options={subOptions} disabled={true} />
                  </Form.Item>
                </Col>

                <Col span={4}>
                  <Form.Item name="docNo" label="Document No.">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="docType" label="Document Type">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="docDate" label="Document Date">
                    <SingleDatePicker
                      setDate={(value) => form.setFieldValue("docDate", value)}
                    />
                    {/* <SingleDatePicker
                      setDate={(value) =>
                        form.setFieldValue(
                          "docDate",
                          dayjs(value).format("DD-MM-YYYY")
                        )
                      }
                    /> */}
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="transactionType" label="Transaction Type">
                    <MySelect options={transactionTypeOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}></Col>
              </Row>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              size="small"
              title="Bill From"
              style={{ height: "100%" }}
              bodyStyle={{ height: "100%" }}
            >
              <Row gutter={6}>
                <Col span={12}>
                  <Form.Item
                    name="billFromName"
                    label="Name"
                    rules={rules.billFromName}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="billFromGstin"
                    label="GSTIN"
                    rules={rules.billFromGstin}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="billFromState"
                    label="State"
                    rules={rules.billFromState}
                  >
                    <MySelect options={stateOptions} labelInValue={true} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Dispatch From">
              <Row gutter={6}>
                <Col span={12}>
                  <Form.Item
                    name="dispatchFromPlace"
                    label="Place"
                    rules={rules.dispatchFromPlace}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dispatchFromPincode"
                    label="Pincode"
                    rules={rules.dispatchFromPincode}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="dispatchFromAddress"
                    label="Address"
                    rules={rules.dispatchFromAddress}
                  >
                    <Input.TextArea />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              size="small"
              title="Bill To"
              style={{ height: "100%" }}
              bodyStyle={{ height: "100%" }}
            >
              <Row gutter={6}>
                <Col span={12}>
                  <Form.Item
                    name="billToName"
                    label="Name"
                    rules={rules.billFromName}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="billToGstin"
                    label="GSTIN"
                    rules={rules.billToGstin}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="billToState"
                    label="State"
                    rules={rules.billToState}
                  >
                    <MySelect labelInValue={true} options={stateOptions} />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Dispatch To">
              <Row gutter={6}>
                <Col span={12}>
                  <Form.Item
                    name="dispatchToPlace"
                    label="Place"
                    rules={rules.billFromName}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dispatchToPincode"
                    label="Pincode"
                    rules={rules.dispatchToPincode}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item
                    name="dispatchToAddress"
                    label="Address"
                    rules={rules.billFromName}
                  >
                    <Input.TextArea />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card size="small" title="Transportation Details">
              <Row gutter={6}>
                <Col span={4}>
                  <Form.Item name="transporterId" label="Transporter Id">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="transporterName"
                    label="Transporter Name"
                    rules={rules.transporterName}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="fromPin"
                    label="From Pin Code"
                    rules={rules.fromPin}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="toPin"
                    label="To Pin Code"
                    rules={rules.toPin}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="distance"
                    label="Distance (in Km)"
                    rules={rules.distance}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={24}>
            <Card size="small" title="Part B">
              <Row gutter={6}>
                <Col span={4}>
                  <Form.Item name="mode" label="Transporter Mode">
                    <MySelect options={transporterModeOptions} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="vehicleType" label="Vehicle Type">
                    <MySelect options={vehicleTypeOptions} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="vehicleNo"
                    label="Vehicle No."
                    rules={rules.vehicleNo}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="transportDoc"
                    label="Transport Doc"
                    rules={rules.transportDoc}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item
                    name="transportDate"
                    label="Transport Date"
                    rules={rules.transportDate}
                  >
                    <SingleDatePicker
                      setDate={(value) =>
                        form.setFieldValue("transportDate", value)
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={24}>
            <Card
              size="small"
              title={`Items Details : ${components.length} Items`}
              extra={
                <Typography.Text>
                  Total Amount :{" "}
                  {components.reduce(
                    (a, b) => +a + +Number(b.value).toFixed(3),
                    0
                  )}
                </Typography.Text>
              }
            >
              <div style={{ height: 400, overflowY: "auto" }}>
                <MyDataTable columns={columns} data={components} />
              </div>
            </Card>
          </Col>
          <Col span={24}>
            <Row justify="end">
              <Space>
                <MyButton variant="submit" onClick={validateHandler} />
              </Space>
            </Row>
          </Col>
        </Row>
      )}
      {successData && (
        <Result
          status="success"
          title="E-Way Bill Generation Successfull"
          extra={[
            <Row justify="center" gutter={16}>
              <Col>
                <Typography.Title level={4}>E-Way Bill No:</Typography.Title>
                <Typography.Title copyable={true} level={5}>
                  {successData?.ewayBillNo}
                </Typography.Title>
              </Col>
            </Row>,
          ]}
        />
      )}
    </Form>
  );
};

export default EwayBillSalesOrder;

const supplyTypeOptions = [
  {
    text: "Outward",
    value: "O",
  },
  {
    text: "Inward",
    value: "I",
  },
];

const subOptions = [
  {
    text: "Supply",
    value: "S",
  },
  {
    text: "Export",
    value: "E",
  },
  {
    text: "Job Work",
    value: "Job Work",
  },
  {
    text: "SKD/CKD/Lots",
    value: "SK",
  },
  {
    text: "Recipient Not Known",
    value: "R",
  },
  {
    text: "For Known Use",
    value: "F",
  },
  {
    text: "Exhibition of Fairs",
    value: "Ex",
  },
  {
    text: "Lines Sales",
    value: "L",
  },
  {
    text: "Others",
    value: "O",
  },
];

const columns = [
  {
    headerName: "Item Name",
    flex: 1,
    field: "component",
    minWidth: 120,
  },
  {
    headerName: "Part No",
    flex: 1,
    field: "partNo",
    minWidth: 120,
  },
  {
    headerName: "HSN",
    field: "hsn",
    width: 120,
  },
  {
    headerName: "Qty",
    field: "qty",
    width: 120,
  },
  {
    headerName: "Rate",
    field: "rate",
    width: 120,
  },
  {
    headerName: "GST Rate",
    field: "gstRate",
    width: 120,
  },
  {
    headerName: "GST Type",
    field: "gstType",
    width: 120,
  },
  {
    headerName: "CGST",
    field: "cgst",
    width: 120,
  },
  {
    headerName: "SGST",
    field: "sgst",
    width: 120,
  },
  {
    headerName: "IGST",
    field: "igst",
    width: 120,
  },

  // {
  //   headerName: "Unit",
  //   field: "uom",
  //   width: 120,
  // },
  {
    headerName: "Taxable Amount",
    field: "value",
    width: 150,
  },
];

const vehicleTypeOptions = [
  {
    text: "Regular",
    value: "R",
  },
];
const transactionTypeOptions = [
  {
    text: "Regular",
    value: "1",
  },
  {
    text: "Bill To - Ship To",
    value: "2",
  },
  {
    text: "Bill From - Dispatch From",
    value: "3",
  },
  {
    text: "Combination of 2 & 3",
    value: "4",
  },
];
const rules = {
  vehicleNo: [
    {
      required: true,
      message: "Please enter a vehicle Number!",
    },
  ],
  billFromName: [
    {
      required: true,
      message: "Please enter a Name!",
    },
  ],
  billFromName: [
    {
      required: true,
      message: "Please enter a Name!",
    },
  ],
  dispatchFromPlace: [
    {
      required: true,
      message: "Please enter a Place!",
    },
  ],
  dispatchFromAddress: [
    {
      required: true,
      message: "Please enter Address!",
    },
  ],
  billFromGstin: [
    {
      required: true,
      message: "Please enter GST!",
    },
  ],
  billToGstin: [
    {
      required: true,
      message: "Please enter GST!",
    },
  ],
  transportDoc: [
    {
      required: true,
      message: "Please provide transport Doc!",
    },
  ],
  billToState: [
    {
      required: true,
      message: "Please select a State!",
    },
  ],
  billFromState: [
    {
      required: true,
      message: "Please select a State!",
    },
  ],
  transporterName: [
    {
      required: true,
      message: "Please provide Transporter's name!",
    },
  ],
  distance: [
    {
      required: true,
      message: "Please select a distance!",
    },
  ],
  dispatchFromPincode: [
    {
      required: true,
      message: "Please provide Pincode!",
    },
  ],
  toPin: [
    {
      required: true,
      message: "Please provide Pincode!",
    },
  ],
  fromPin: [
    {
      required: true,
      message: "Please provide Pincode!",
    },
  ],
  dispatchToPincode: [
    {
      required: true,
      message: "Please provide Pincode!",
    },
  ],
  transportDate: [
    {
      required: true,
      message: "Please provide Pincode!",
    },
  ],
};
