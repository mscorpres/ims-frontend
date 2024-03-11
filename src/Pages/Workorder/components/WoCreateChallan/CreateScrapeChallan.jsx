import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Space,
  Typography,
  Modal,
  Card,
  Radio,
  Divider,
} from "antd";
import React, { useEffect, useState } from "react";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import ClientDetailsCard from "./ClientDetailsCard";
import BillingDetailsCard from "./BillingDetailsCard";
import DispatchAddress from "./DispatchDetailsCard";
import { imsAxios } from "../../../../axiosInterceptor";
import NavFooter from "../../../../Components/NavFooter";
import { toast } from "react-toastify";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import Loading from "../../../../Components/Loading";
import FormTable2 from "../../../../Components/FormTable2";
import { v4 } from "uuid";
import MySelect from "../../../../Components/MySelect";
import TextArea from "antd/es/input/TextArea";
import { postUpdatedWo } from "../api";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import MyDataTable from "../../../../Components/MyDataTable";
import FormTable from "../../../../Components/FormTable";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { getProductsOptions } from "../../../../api/general";

const CreateScrapeChallan = () => {
  const [uplaodType, setUploadType] = useState("table");

  const [addOptions, setAddOptions] = useState([]);
  const [ClientBranchOptions, setclientBranchOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [challanForm] = Form.useForm();

  const getComponent = async (searchTerm) => {
    const response = await executeFun(
      () => getProductsOptions(searchTerm, true),
      "select"
    );
    let { data } = response;
    setAsyncOptions(data);
  };
  //   get client options -->
  const getClientOptions = async (inputValue) => {
    try {
      setLoading("select");
      const response = await imsAxios.post("/backend/getClient", {
        searchTerm: inputValue,
      });
      const { data } = response;
      if (data) {
        let arr = data.data.map((row) => ({
          text: row.name,
          value: row.code,
        }));
        setAsyncOptions(arr);
      } else {
        toast.error("Some error occured wile getting vendors");
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handlebilladress = (e) => {
    console.log("clientData", clientData);
    clientData.branchList.map((item) => {
      if (item.id === e) {
        console.log("item", item);
        // challanForm.setFieldValue("billPan", clientData.client.pan_no);
        // challanForm.setFieldValue("billGST", item.gst);
        challanForm.setFieldValue("billingaddress", item.address);
      }
    });
  };

  const handleaddress = (e) => {
    console.log(e);
    // setaddid(true);
    console.log("addOptions ->", addOptions);
    addOptions.map((item) => {
      if (item.value === e) {
        challanForm.setFieldValue("shippingaddress", item.address);
      }
    });
  };
  //   get vendor branch options
  const getclientDetials = async (inputValue, dm) => {
    console.log("getclientDetials", inputValue, dm);
    try {
      setLoading("fetch");
      // setClientCode(inputValue);
      const response = await imsAxios.post("/backend/fetchClientDetail", {
        code: inputValue,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.branchList.map((row) => ({
            text: row.text,
            value: row.id,
            address: row.address,
          }));
          setclientBranchOptions(arr);
          setAddOptions(arr);
          setClientData(data);
          // challanForm.setFieldValue("billingaddress", arr.address);
          if (dm === undefined) {
            challanForm.setFieldValue("clientbranch", "");
            challanForm.setFieldValue("gstin", "");
            challanForm.setFieldValue("address", "");
          }
        } else {
          toast.error(data.message.msg);
        }
      } else {
        toast.error("Some error occured while getting Client branches ");
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form
        style={{ height: "100%" }}
        layout="vertical"
        form={challanForm}
        // initialValues={defaultValues}
      >
        <Row gutter={8} style={{ height: "95%", overflow: "hidden" }}>
          <Col span={6} style={{ height: "100%", overflow: "hidden" }}>
            <Row gutter={[0, 6]} style={{ overflow: "auto", height: "100%" }}>
              <Col span={24}>
                <Card size="small" title="Client Details">
                  <Form.Item
                    name="clientname"
                    label="Client Name"
                    rules={[
                      { required: true, message: "Please select Client!" },
                    ]}
                  >
                    <MyAsyncSelect
                      selectLoading={loading === "select"}
                      size="default"
                      labelInValue
                      onBlur={() => setAsyncOptions([])}
                      optionsState={asyncOptions}
                      loadOptions={getClientOptions}
                      onChange={(value) => getclientDetials(value.value)}
                    />
                  </Form.Item>
                  <Form.Item
                    name="clientbranch"
                    label="Client Branch"
                    rules={[
                      {
                        required: false,
                        message: "Please select client branch!",
                      },
                    ]}
                  >
                    <MySelect
                      options={ClientBranchOptions}
                      onChange={(e) => {
                        getAddInfo(e);
                      }}
                      size="default"
                      placeholder="select Client Branch!"
                    />
                  </Form.Item>
                  {uplaodType === "table" && (
                    <>
                      <Row gutter={6}>
                        <Col span={12}>
                          <Form.Item
                            name="nature"
                            label="E-way Bill Number"
                            // rules={[
                            //   {
                            //     required: true,
                            //     message: "Please input Nature of processing!",
                            //   },
                            // ]}
                          >
                            <Input />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="pd" label="Ship Doc. Number">
                            <Input />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item
                        name="vn"
                        label="Vehicle Number"
                        // rules={[{ required: true, message: "Please input Vechile Number!" }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item name="or" label="Other References">
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name="address"
                        label="Client Address"
                        rules={[
                          {
                            required: false,
                            message: "Please input select address!",
                          },
                        ]}
                      >
                        <Input disabled />
                      </Form.Item>
                    </>
                  )}
                </Card>
              </Col>

              <Col span={24}>
                <Card
                  size="small"
                  title="Billing Details"
                  style={{ height: "100%", overflow: "hidden" }}
                  bodyStyle={{ overflow: "auto", height: "98%" }}
                >
                  <Form.Item
                    name="billingid"
                    label="Select billing Address"
                    rules={[
                      {
                        required: true,
                        message: "Please select billing Address!",
                      },
                    ]}
                  >
                    <MySelect
                      options={addOptions}
                      onChange={(e) => {
                        handlebilladress(e);
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="billingaddress"
                    label="Complete Address"
                    rules={[{ required: true }]}
                  >
                    <Input.TextArea rows={3} disabled />
                  </Form.Item>
                </Card>
              </Col>
              <Col span={24}>
                <Card
                  size="small"
                  title="Dispatch Details"
                  style={{ height: "100%", overflow: "hidden" }}
                  bodyStyle={{ overflow: "auto", height: "98%" }}
                >
                  <Form.Item
                    name="dispatchid"
                    label="Select Dispatch Address"
                    rules={[
                      {
                        required: true,
                        message: "Please select Dispatch Address!",
                      },
                    ]}
                  >
                    <MySelect
                      options={addOptions}
                      onChange={(e) => {
                        handleaddress(e);
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="shippingaddress"
                    label="Complete Address"
                    rules={[{ required: true }]}
                  >
                    <Input.TextArea rows={3} disabled />
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          </Col>
          {/* {uplaodType === "table" && (
            <>
              <Col span={18} style={{ height: "90%", overflow: "auto" }}>
                {challantitle ? (
                  test === "Create shipment" || editShipment === "Shipment" ? (
                    <Product
                      form={challanForm}
                      location={locationlist}
                      calculation={calculation}
                      gsttype={gstType}
                      setlocationlist={setlocationlist}
                      locationlist={locationlist}
                      getLocationList={getLocationList}
                      getComponentOptions={getComponentOptions}
                      asyncOptions={asyncOptions}
                      setAsyncOptions={setAsyncOptions}
                      inputHandler={inputHandler}
                      minRows={minRows}
                      removeRow={removeRow}
                      CommonIcons={CommonIcons}
                      rows={rows}
                    />
                  ) : (
                    <Component
                      form={challanForm}
                      location={locationlist}
                      calculation={calculation}
                      gsttype={gstType}
                      setlocationlist={setlocationlist}
                      inputHandler={inputHandler}
                      minRows={minRows}
                      removeRow={removeRow}
                    />
                  )
                ) : show.label === "Create shipment" ||
                  editShipment === "Shipment" ? (
                  <Product
                    calculation={calculation}
                    form={challanForm}
                    location={locationlist}
                    gsttype={gstType}
                    setlocationlist={setlocationlist}
                    getLocationList={getLocationList}
                    locationlist={locationlist}
                    getComponentOptions={getComponentOptions}
                    asyncOptions={asyncOptions}
                    setAsyncOptions={setAsyncOptions}
                    getComponentDetails={getComponentDetails}
                    editShipment={editShipment}
                    inputHandler={inputHandler}
                    minRows={minRows}
                    removeRow={removeRow}
                    CommonIcons={CommonIcons}
                    rows={rows}
                  />
                ) : (
                  <Component
                    form={challanForm}
                    location={locationlist}
                    calculation={calculation}
                    gsttype={gstType}
                    setlocationlist={setlocationlist}
                    inputHandler={inputHandler}
                    minRows={minRows}
                    removeRow={removeRow}
                  />
                )}
              </Col>
            </>
          )} */}
          <Col span={18}>
            <Card>
              <FormTable2
                nonRemovableColumns={1}
                columns={[
                  ...productItems(
                    location,

                    // getComponentOptions,
                    asyncOptions,
                    setAsyncOptions,
                    getComponent
                  ),
                ]}
                listName="components"
                watchKeys={["rate", "qty", "gstRate"]}
                nonListWatchKeys={["gstType"]}
                componentRequiredRef={["rate", "qty"]}
                form={challanForm}
                // calculation={calculation}
                // rules={listRules}
              />
            </Card>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default CreateScrapeChallan;
const productItems = (
  location,
  gstType,
  getLocationList,
  setlocationlist,
  locationlist,
  // getComponentOptions,
  asyncOptions,
  setAsyncOptions,
  getComponent
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
    headerName: "Component",
    name: "productname",
    width: 250,
    flex: true,
    field: () => (
      <MyAsyncSelect
        // labelInValue
        // selectLoading={loading === "select"}
        // loadOptions={getComponentOptions}
        optionsState={asyncOptions}
        // onChange={getComponentDetails}
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

  {
    headerName: "Remark",
    name: "description",
    width: 150,
    field: (row) => <Input />,
  },
];
