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
  const transporterId = Form.useWatch("transporterId", form);

  const getDetails = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/jwEwaybill/fetch_challan_data", {
        challan_no: params.jwId.replaceAll("_", "/"),
      });

      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const { header, items, docType, subSupplyType, supplyType } =
            data.data;
          const finalObj = {
            type: supplyType,
            subType: subSupplyType,
            docNo: header.challan_id,
            docType: docType,
            docDate: header.jw_date,
            billFromName: header.dispatch_company,
            billFromGstin: header.dispatch_gst,
            billFromState: {
              label: header.dispatch_state_name,
              value: header.dispatch_state,
            },
            dispatchFromPlace: header.dispatch_label,
            dispatchFromPincode: header.dispatch_pincode,
            dispatchFromAddress: header.dispatch_address,
            billToName: header.vendorName,
            billToGstin: header.vendorGstin,
            billToState: {
              label: header.dispatch_state_name,
              value: header.vendorState,
            },
            dispatchToPlace: header.vendorCity,
            dispatchToPincode: header.vendorPinCode,
            dispatchToAddress: header.vendor_address,
            vehicleNo: header.vehicle,
            mode: "1",
            vehicleType: "R",
            transactionType: "1",
          };
          const arr = items.map((row, index) => ({
            id: index + 1,
            component: row.component_name,
            hsn: row.hsn_code,
            qty: row.issue_qty,
            rate: row.part_rate,
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

    const payload = {
      challan_ID: params.jwId.replaceAll("_", "/"),
      transactionType: values.transactionType,
      transporterId: values.transporterId,
      transporterName: values.transporterName,
      transporterDocNo: values.transportDoc,
      transporterDate: values.transportDate,
      transMode: values.mode,
      transDistance: values.distance,
      document_type: values.docType,

      challan_dt: values.docDate,
      supply_type: values.type,
      sub_supply_type: values.subType,
      document_type: "Delivery Challan",
      dispatch_name: values.billFromName,
      dispatch_address: values.dispatchFromAddress,
      dispatch_gstin: values.billFromGstin,
      dispatch_place: values.dispatchFromPlace,
      dispatch_state: values.billFromState.value,
      dispatch_pincode: values.dispatchFromPincode,
      shipto_name: values.billToName,
      shipto_address: values.dispatchToAddress,
      shipto_gstin: values.billToGstin,
      shipto_place: values.dispatchToPlace,
      shipto_state: values.billToState.value,
      shipto_pincode: values.dispatchToPincode,
      vehicleNo: values.vehicleNo,
    };

    Modal.confirm({
      title: "Create E-Way Bill",
      content: "Please check all the entries properly before proceeding",
      okText: "Create",
      onOk: () => submitHandler(payload),
    });
  };

  const submitHandler = async (payload) => {
    try {
      setLoading("submit");
      const response = await imsAxios.post("/jwEwaybill/create", payload);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          setSuccessData({ ewayBillNo: data.data.ewayBillNo });
        } else {
          toast.error(data.message.msg);
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
  useEffect(() => {
    if (transporterId?.length === 15) {
      getGstinDetails(transporterId);
    }
  }, [transporterId]);
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
                  <Form.Item disabled={true} name="subType" label="Sub Type">
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
                    <Input disabled={true} />
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
              </Row>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Dispatch From">
              <Row gutter={6}>
                <Col span={12}>
                  <Form.Item name="dispatchFromPlace" label="Place">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="dispatchFromPincode" label="Pincode">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="dispatchFromAddress" label="Address">
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
              </Row>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="Dispatch To">
              <Row gutter={6}>
                <Col span={12}>
                  <Form.Item name="dispatchToPlace" label="Place">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="dispatchToPincode" label="Pincode">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="dispatchToAddress" label="Address">
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
                <Col span={4}>
                  <Form.Item name="fromPin" label="From Pin Code">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="toPin" label="To Pin Code">
                    <Input />
                  </Form.Item>
                </Col>
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
