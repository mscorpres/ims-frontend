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
import MySelect from "../../../Components/MySelect";
import { imsAxios } from "../../../axiosInterceptor";
import { useParams } from "react-router";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import MyDataTable from "../../../Components/MyDataTable";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import dayjs from "dayjs";
import MyButton from "../../../Components/MyButton";

const EWayBill = () => {
  const [loading, setLoading] = useState(false);
  const [stateOptions, setStateOptions] = useState([]);
  const [components, setComponents] = useState([]);
  const [transporterModeOptions, setTransporterModeOptions] = useState([]);
  const [successData, setSuccessData] = useState(null);
  const params = useParams();
  const [form] = Form.useForm();

  const getDetails = async () => {
    try {
      setLoading("fetch");
      if (location.href.includes("jw")) {
        var response = await imsAxios.post("/ewaybill/fetch_challan_data", {
          challan_no: params.jwId.replaceAll("_", "/"),
        });
      } else if (location.href.includes("dc")) {
        var response = await imsAxios.post("/gatepass/fetch_dc", {
          challan_no: params.jwId.replaceAll("_", "/"),
        });
      } else if (location.href.includes("scrape-wo")) {
        var response = await imsAxios.post("/wo_challan/scrape_wo_challan", {
          challan_no: params.jwId.replaceAll("_", "/"),
        });
      } else {
        var response = await imsAxios.post("/wo_challan/fetch_wo_delivery_challan", {
          challan_no: params.jwId.replaceAll("_", "/"),
        });
      }

      const { data, items } = response;
      if (data) {
        if (response?.success) {
          const { bill_from, bill_to, ship_from, ship_to } = data;
          const finalObj = {
            docNo: data?.challan_id,
            billFromName: bill_from.legalName,
            billFromGstin: bill_from.gstin,
            billFromState: {
              label: bill_from?.state?.state_name,
              value: bill_from?.state?.state_code,
            },
            billFromLocation: bill_from.location,
            billFromAddress1: bill_from.address1,
            billFromAddress2: bill_from.address2,
            billFromPincode: bill_from.pincode,
            billToName: bill_to.client,
            billToGstin: bill_to.gst,
            billToState: {
              label: bill_to?.state?.state_name,
              value: bill_to?.state?.state_code,
            },
            billToLocation: bill_to.location,
            billToAddress1: bill_to.address1,
            billToAddress2: bill_to.address2,
            billToPincode: bill_to.pincode,
            dispatchFromPlace: ship_from.legalName,
            dispatchFromPincode: ship_from.pincode,
            dispatchFromAddress1: ship_from.address1,
            dispatchFromAddress2: ship_from.address2,
            dispatchFromLocation: ship_from.location,
            dispatchFromState: {
              label: ship_from?.state.state_name,
              value: ship_from?.state.state_code,
            },
            dispatchFromGstin: ship_from.gst,
            dispatchToPlace: ship_to.company,
            dispatchToGstin: ship_to.gst,
            dispatchToPincode: ship_to.pincode,
            dispatchToAddress1: ship_to.address1,
            dispatchToAddress2: ship_to.address2,
            dispatchToState: {
              label: ship_to?.state.state_name,
              value: ship_to?.state.state_code,
            },
            dispatchToLocation: ship_to.location,
            distance: "0",
            mode: "1",
            vehicleType: "R",
            transactionType: "1",
            documentType: "CHL",
            // docDate: "09-03-2025",
            type: "O",
            vehicleNo:data?.vehicle,
          };
          // form.setValue("totalAmount",data?.total_amount)
          const arr = items.map((row, index) => ({
            id: index + 1,
            component: row.component_name,
            hsn: row.hsn_code,
            qty: row.qty,
            rate: row.rate,
            value: row.taxable_amount,
            uom: row.unit_name,
          }));
          setComponents(arr);
          form.setFieldsValue(finalObj);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading("fetch");
    }
  };
  const transactionType = Form.useWatch("transactionType", form);
  const subSupplyTypeOption = Form.useWatch("subType", form);

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
    try {
      const values = await form.validateFields();
      const payload = {
        header: {
          documentType: values.docType?.value,
          supplyType: "O",
          subSupplyType: values.subType,
          documentNo: values.docNo,
          documentDate: "09-03-2025",
          transactionType: values.transactionType,
          subSupplyDesc: values.subSupplyDesc,
        },
        billFrom: {
          gstin: values.billFromGstin,
          legalName: values.billFromName,
          addressLine1: values.billFromAddress1,
          addressLine2: values.billFromAddress2,
          location: values.billFromLocation,
          state: values.billFromState.value,
          pincode: values.billFromPincode,
        },
        billTo: {
          gstin: values.billToGstin,
          legalName: values.billToName,
          addressLine1: values.billToAddress1,
          addressLine2: values.billToAddress2,
          location: values.billToLocation,
          state: values.billToState.value,
          pincode: values.billToPincode,
        },
        shipFrom: {
          // gstin: values.dispatchFromGstin,
          legalName: values.dispatchFromName,
          addressLine1: values.dispatchFromAddress1,
          addressLine2: values.dispatchFromAddress2,
          location: values.dispatchFromLocation,
          state: values.dispatchFromState?.value,
          pincode: values.dispatchFromPincode,
        },
        shipTo: {
          // gstin: values.dispatchToGstin,
          legalName: values.dispatchToPlace,
          addressLine1: values.dispatchToAddress1,
          addressLine2: values.dispatchToAddress2,
          location: values.dispatchToLocation,
          state: values.dispatchToState?.value,
          pincode: values.dispatchToPincode,
        },
        ewaybillDetails: {
          transporterId: values.transporterId,
          transporterName: values.transporterName,
          transporterDocNo: values.transportDoc,
          transMode: values.mode,
          transDistance: values.distance,
          transporterDate: values.transportDate,
          vehicleNo: values.vehicleNo,
          vehicleType: values.vehicleType,
        },
      };

      Modal.confirm({
        title: "Create E-Way Bill",
        content: "Please check all the entries properly before proceeding",
        okText: "Create",
        onOk: () => submitHandler(payload),
      });
    } catch (error) {
      console.error(error);
      // If validation fails, show a toast with the warning message
      toast.error("Please fill the mandatory fields.");
    }
  };

  const submitHandler = async (payload) => {
    try {
      setLoading("submit");
      let response;
      if (location.href.includes("jw")) {
        response = await imsAxios.post(
          "/ewaybill/createEwayBillJobWork",
          payload
        );
      } else if (location.href.includes("dc")) {
        response = await imsAxios.post("/ewaybill/createEwayBillDc", payload);
      } else if (location.href.includes("scrape-wo")) {
        response = await imsAxios.post(
          "/ewaybill/createEwayforScrapeWo",
          payload
        );
      }
      else{
        response = await imsAxios.post(
          "/ewaybill/createEwayBillWorkOrder",
          payload
        );
      }
      const { data } = response;
      if (response) {
        if (response?.code === 200) {
          toast.success(response?.message);
          setSuccessData({ ewayBillNo: response?.data?.ewayBillNo });
        } else {
          toast.error(response.message.msg);
        }
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
    getDetails();
    getStateOptions();
    getTransporterModeOptions();
  }, []);
  // useEffect(() => {
  //   if (transporterId?.length === 15) {
  //     getGstinDetails(transporterId);
  //   }
  // }, [transporterId]);
  return (
    <Form form={form} layout="vertical" style={{ padding: 10 }}>
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
                    <MySelect
                      options={subOptions}
                      // disabled={true}
                    />
                  </Form.Item>
                </Col>
               {subSupplyTypeOption ==8 && <Col span={4}>
                  <Form.Item name="subSupplyDesc" label="Other Description">
                    <Input />
                  </Form.Item>
                </Col>}
                <Col span={4}>
                  <Form.Item name="docNo" label="Document No.">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="docType" label="Document Type">
                    <MySelect labelInValue={true} options={docTypeOptions} />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="docDate" label="Document Date">
                    <SingleDatePicker
                      setDate={(value) =>
                        form.setFieldValue(
                          "docDate",
                          dayjs(value).format("DD-MM-YYYY")
                        )
                      }
                    />
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
                  <Form.Item name="billFromName" label="Name">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="billFromGstin" label="GSTIN">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="billFromState" label="State">
                    <MySelect options={stateOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="billFromLocation" label="Location">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="billFromPincode" label="Pincode">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="billFromAddress1" label="Address1">
                    <Input.TextArea />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="billFromAddress2" label="Address2">
                    <Input.TextArea />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Dispatch From">
              <Row gutter={6}>
                <Col span={12}>
                  <Form.Item name="dispatchFromPlace" label="Legal Name">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="dispatchFromState" label="State">
                    <MySelect options={stateOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="dispatchFromPincode" label="Pincode">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="dispatchFromLocation" label="Location">
                    <Input />
                  </Form.Item>
                </Col>
                {/* <Col span={12}>
                  <Form.Item name="dispatchFromGstin" label="GSTIN">
                    <Input />
                  </Form.Item>
                </Col> */}

                {/* <Col span={12}>
                  <Form.Item name="billFromPAN" label="PAN">
                    <Input />
                  </Form.Item>
                </Col> */}
                <Col span={24}>
                  <Form.Item name="dispatchFromAddress1" label="Address1">
                    <Input.TextArea />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="dispatchFromAddress2" label="Address2">
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
                  <Form.Item name="billToName" label="Name">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="billToGstin" label="GSTIN">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="billToState" label="State">
                    <MySelect labelInValue={true} options={stateOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="billToLocation" label="Location">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="billToPincode" label="Pincode">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="billToAddress1" label="Address1">
                    <Input.TextArea />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="billToAddress2" label="Address2">
                    <Input.TextArea />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          

          <Col span={12}>
            <Card size="small" title="Ship To">
              <Row gutter={6}>
                <Col span={12}>
                  <Form.Item name="dispatchToPlace" label="Place">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="dispatchToState" label="State">
                    <MySelect labelInValue={true} options={stateOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="dispatchToPincode" label="Pincode">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="dispatchToLocation" label="Location">
                    <Input />
                  </Form.Item>
                </Col>
                {/* <Col span={12}>
                  <Form.Item name="dispatchToGstin" label="GSTIN">
                    <Input />
                  </Form.Item>
                </Col> */}
                <Col span={24}>
                  <Form.Item name="dispatchToAddress1" label="Address1">
                    <Input.TextArea />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="dispatchToAddress2" label="Address2">
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
                  <Form.Item name="transporterName" label="Transporter Name">
                    <Input />
                  </Form.Item>
                </Col>
                {/* <Col span={4}>
                  <Form.Item name="fromPin" label="From Pin Code">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="toPin" label="To Pin Code">
                    <Input />
                  </Form.Item>
                </Col> */}
                <Col span={4}>
                  <Form.Item name="distance" label="Distance (in Km)">
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
                  <Form.Item name="vehicleNo" label="Vehicle No.">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="transportDoc" label="Transport Doc">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="transportDate" label="Transport Date">
                    <SingleDatePicker
                      setDate={(value) =>
                        form.setFieldValue(
                          "transportDate",
                          dayjs(value).format("DD-MM-YYYY")
                        )
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
                  Total Amount :{form.getFieldValue("totalAmount")}
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

export default EWayBill;

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
    value: "1",
  },
  {
    text: "Import",
    value: "2",
  },
  {
    text: "Export",
    value: "3",
  },
  {
    text: "Job Work",
    value: "4",
  },
  {
    text: "For Own Use",
    value: "5",
  },
  {
    text: "Job Work Return",
    value: "6",
  },
  {
    text: "Sale Return",
    value: "7",
  },
  {
    text: "Exhibition of Fairs",
    value: "12",
  },
  {
    text: "Line Sales",
    value: "10",
  },
  {
    text: "Recipient Not Known",
    value: "11",
  },
  {
    text: "SKD/CKD/Lots",
    value: "9",
  },
  {
    text: "Others",
    value: "8",
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
    headerName: "Unit",
    field: "uom",
    width: 120,
  },
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

const docTypeOptions = [
  { value: "INV", text: "Tax Invoice" },
  { value: "BIL", text: "Bill of Supply" },
  { value: "BOE", text: "Bill of Entry" },
  { value: "CHL", text: "Delivery Challan" },
  { value: "OTH", text: "Others" },
];
