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
  //
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
import { postUpdatedWo, submitScrapreChallan } from "../api";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import MyDataTable from "../../../../Components/MyDataTable";
import FormTable from "../../../../Components/FormTable";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import {
  getComponentDetail,
  getComponentOptions,
  getProductsOptions,
} from "../../../../api/general";
import useApi from "../../../../hooks/useApi";
import { convertSelectOptions } from "../../../../utils/general";
import { useNavigate, useSearchParams } from "react-router-dom";

const CreateScrapeChallan = () => {
  const [uplaodType, setUploadType] = useState("table");
  const [addOptions, setAddOptions] = useState([]);
  const [ClientBranchOptions, setclientBranchOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [clientcode, setClientCode] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [editScrapeChallan, setEditScrapeChallan] = useState("");
  const [challanId, setChallanID] = useState("");

  const [challanForm] = Form.useForm();
  const isthereClientCode = Form.useWatch("clientname", challanForm);
  const [ModalForm] = Form.useForm();
  const defaultValues = {
    vendorType: "v01",
    vendorName: "",
    vendorBranch: "",
    gstin: "",
    vendorAddress: "",
    ewaybill: "",
    companybranch: "BRMSC012",
    projectID: "",
    costCenter: "",
    components: [
      {
        component: "",
        qty: "",
        rate: "",
        value: "",
        hsnCode: "",
        remarks: "",
      },
    ],
  };
  var challan = searchParams.get("challan");

  const navigate = useNavigate();
  const { executeFun, loading: loading1 } = useApi();
  const components = Form.useWatch("components", challanForm);
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
        let obj = {
          productname: "",
          hsncode: "",
          qty: "",
          rate: "",
          value: "",
          description: "",
        };
        // challanForm.setFieldValue("components", [obj]);
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
    clientData.branchList.map((item) => {
      if (item.id === e.value || item.id === e) {
        // challanForm.setFieldValue("billPan", clientData.client.pan_no);
        // challanForm.setFieldValue("billGST", item.gst);
        challanForm.setFieldValue("billingaddress", item.address);
        challanForm.setFieldValue("clientAddrId", item.id);
      }
    });
  };
  const getAddInfo = async (e) => {
    try {
      setLoading("fetch");
      const { data } = await imsAxios.post("backend/fetchClientAddress", {
        addressID: e,
        code: clientcode,
      });
      if (data.code === 200) {
        console.log("data---", data);
        // createWoForm.setFieldValue("gstin", data.data.gst);
        challanForm.setFieldValue("address", data.data.address);
        toast.error(data.message.msg);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleaddress = (e) => {
    // setaddid(true);
    console.log("addOptions ->", addOptions);
    addOptions.map((item) => {
      if (item.value === e.value || item.value === e) {
        challanForm.setFieldValue("shippingaddress", item.address);
      }
    });
  };
  //   get vendor branch options
  const getclientDetials = async (inputValue, dm) => {
    console.log("getclientDetials", inputValue, dm);
    try {
      setLoading("fetch");
      setClientCode(inputValue);
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
          if (dm === undefined && editScrapeChallan !== "edit") {
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
  const handleFetchComponentOptions = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    console.log("response", response);
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  const calculation = (fieldName, watchValues) => {
    const { qty, rate, gstRate } = watchValues;
    const value = +Number(qty ?? 0) * +Number(rate ?? 0).toFixed(3);
    const gstAmount = (+Number(value).toFixed(3) * +Number(gstRate)) / 100;
    let cgst = 0,
      igst = 0,
      sgst = 0;

    // if (gstType === "L" && gstRate) {
    //   cgst = gstAmount / 2;
    //   sgst = gstAmount / 2;
    //   igst = undefined;
    // } else if (gstType === "I" && gstRate) {
    //   igst = gstAmount;
    //   cgst = undefined;
    //   sgst = undefined;
    // }
    challanForm.setFieldValue(
      ["components", fieldName, "value"],
      +Number(value).toFixed(3)
    );
    // challanForm.setFieldValue(
    //   ["components", fieldName, "cgst"],
    //   +Number(cgst).toFixed(3)
    // );
    // challanForm.setFieldValue(
    //   ["components", fieldName, "sgst"],
    //   +Number(sgst).toFixed(3)
    // );
    // minFochallanFormm.setFieldValue(
    //   ["components", fieldName, "igst"],
    //   +Number(igst).toFixed(3)
    // );
  };
  const handleFetchComponentDetails = async (row, rowId, value) => {
    const response = await executeFun(
      () => getComponentDetail(value.value),
      "fetch"
    );
    if (response.success) {
      const { data } = response;
      console.log("data", data);
      challanForm.setFieldValue(
        ["components", rowId, "gstRate"],
        data.data.gstrate
      );
      challanForm.setFieldValue(
        ["components", rowId, "hsnCode"],
        data.data.hsn
      );
      challanForm.setFieldValue(["components", rowId, "rate"], data.data.rate);
    }
  };
  const validateHandler = async () => {
    const values = await challanForm.validateFields();
    Modal.confirm({
      title: "Do you want to submit Scrape Challan?",
      content: (
        <Form form={ModalForm} layout="vertical">
          <Form.Item
            name="remark"
            label="Remark"
            rules={[
              {
                required: true,
                message: "Please input remark!",
              },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Please input the remark" />
          </Form.Item>
        </Form>
      ),
      onOk: () => submitHandler(values),
      okText: "Submit",
    });
  };
  const submitHandler = async () => {
    setLoading(true);
    const values = await challanForm.validateFields();
    const remarkvalue = await ModalForm.validateFields();
    // console.log("value", values);
    // console.log("remarkvalue", remarkvalue);

    let payload = {
      header: {
        billingaddr: values.billingaddress,
        billingid: values.billingid.value,
        client_id: values.clientname.value,
        client_addr_id: values.clientbranch,
        clientaddr: values.address,
        dispatchaddr: values.shippingaddress,
        dispatchid: values.dispatchid.value,

        eway_no: values.nature,
        ship_doc: values.pd,
        other_ref: values.or,
        vehicle: values.vn,
        insert_dt: values.insertDate,
        challan_remark: remarkvalue.remark,
      },
      material: {
        component: values.components.map((r) => r.component.key),
        hsncode: values.components.map((r) => r.hsnCode),
        qty: values.components.map((r) => r.qty),
        rate: values.components.map((r) => r.rate),
        value: values.components.map((r) => r.value),
        comp_remark: values.components.map((r) => r.remarks),
      },
    };
    // console.log("payload", payload);
    // console.log("addressid", values);
    let response;
    let editPayload = {
      challan_id: challanId,
      header: {
        clientadd_id: values.components[0]?.clientBranchId,
        clientaddress: values.address,
        ship_doc_no: values.pd,
        vehicle: values.vn,
        eway_no: values.nature,
        other_ref: values.or,
        billingid: values.billingid && values.billingid?.value,
        billingaddress: values.billingaddress,
        dispatchid: values.dispatchid && values.dispatchid?.value,
        dispatchaddress: values.shippingaddress,
        challan_remark: remarkvalue.remark,
      },
      material: {
        id: values.components.map((r) => r.rowID),
        id: values.components.map((r) => r.rowID),
        component: values.components.map((r) => r.componentKey),
        qty: values.components.map((r) => r.qty),
        rate: values.components.map((r) => r.rate),
        hsncode: values.components.map((r) => r.hsnCode),
        remark: values.components.map((r) => r.remarks),
      },
    };
    console.log("editPayload", editPayload);
    // navigate("/woviewchallan");
    // return;
    if (editScrapeChallan === "edit") {
      // console.log("her");
      response = await imsAxios.post(
        "/wo_challan/updateWO_ScrapChallan",
        editPayload
      );
      console.log("response of edit ", response);
      let { data } = response;
      if (data.status === "success") {
        toast.success(data.message);
        challanForm.resetFields();
        setLoading(true);
        navigate("/woviewchallan");
      } else {
        toast.error(data.message.msg);
        setLoading(true);
      }
    } else {
      response = await executeFun(
        () => submitScrapreChallan(payload),
        "select"
      );
    }
    // console.log(response);
    if (response.success) {
      setLoading(true);
      challanForm.resetFields();
    } else {
      toast.error(response.data.error);
    }
    setLoading(true);
  };
  const getScrapeDetails = async (challan) => {
    const response = await imsAxios.post("/wo_challan/editWO_ScrapChallan", {
      challan_no: challan,
    });
    console.log("response", response);
    setEditScrapeChallan("edit");
    const { data } = response;
    if (data.status === "success") {
      // console.log(" data.header.challan_remark", data.header.challan_remark);
      challanForm.setFieldValue("clientname", data.header.clientcode.label);
      challanForm.setFieldValue("clientnameCode", data.header.clientcode.value);
      challanForm.setFieldValue("clientbranch", data.header.client_branch);
      // challanForm.setFieldValue(
      //   "clientbranchid",
      //   data.header.clientaddress?.value
      // );
      challanForm.setFieldValue("nature", data.header.eway_no);
      challanForm.setFieldValue("pd", data.header.ship_doc_no);
      challanForm.setFieldValue("vn", data.header.vehicle);
      challanForm.setFieldValue("or", data.header.other_ref);
      challanForm.setFieldValue("address", data.header.clientaddress?.label);
      // challanForm.setFieldValue("addressid", data.header.clientaddress?.value);
      challanForm.setFieldValue("billingid", data.header.billing_info);
      challanForm.setFieldValue("billingaddress", data.header.billing_address);
      challanForm.setFieldValue("dispatchid", data.header.dispatch_info);
      ModalForm.setFieldValue("remark", data.header.challan_remark);
      challanForm.setFieldValue(
        "shippingaddress",
        data.header.dispatch_address
      );
      let arr = data.material.map((r) => {
        return {
          component: r.component_name,
          qty: r.out_qty,
          rate: r.part_rate,
          valu: r.component_name,
          hsnCode: r.hsn_code,
          remarks: r.remarks,
          rowID: r.row_id,
          componentKey: r.component_key,
          clientBranchId: data.header?.clientaddress?.value,
        };
      });
      console.log("arr", arr);

      challanForm.setFieldValue("components", arr);
      // const fields = challanForm.getFieldsValue();
      // fields.components = arr;
    }
  };
  useEffect(() => {
    if (challan) {
      getScrapeDetails(challan);
      setChallanID(challan);
    }
  }, [challan]);
  useEffect(() => {
    if (isthereClientCode && editScrapeChallan === "edit") {
      let a = challanForm.getFieldValue("clientnameCode");
      console.log("isthereClientCode", a);
      getclientDetials(a);
    }
  }, [isthereClientCode]);

  return (
    <>
      <Form
        style={{ height: "100%" }}
        layout="vertical"
        form={challanForm}
        initialValues={defaultValues}
      >
        <Row gutter={8} style={{ height: "95%", overflow: "hidden" }}>
          <Col span={6} style={{ height: "90%", overflow: "hidden" }}>
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
                      // selectLoading={loading === "select"}
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
                        required: true,
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
                      placeholder="Select Client Branch!"
                    />
                  </Form.Item>
                  {uplaodType === "table" && (
                    <>
                      <Row gutter={6}>
                        <Col span={12}>
                          <Form.Item name="nature" label="E-way Bill Number">
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
                      {!editScrapeChallan && (
                        <Form.Item
                          label="Insert Date"
                          name="insertDate"
                          rules={[
                            {
                              required: true,
                              message: "Please Enter Insert Date",
                            },
                          ]}
                        >
                          <SingleDatePicker
                            setDate={(value) =>
                              challanForm.setFieldValue("insertDate", value)
                            }
                          />
                        </Form.Item>
                      )}
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
                      labelInValue
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
                      labelInValue
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

          <Col span={18}>
            <Card style={{ height: "10rem" }}>
              <FormTable2
                removableRows={true}
                nonRemovableColumns={1}
                // columns={[
                //   ...productItems(
                //     location,

                //     asyncOptions,
                //     setAsyncOptions,
                //     getComponent
                //   ),
                // ]}
                columns={columns({
                  handleFetchComponentOptions,
                  loading,
                  asyncOptions,
                  setAsyncOptions,

                  handleFetchComponentDetails,
                  // handleFetchPreviousRate,
                  // compareRates,
                  challanForm,
                  // currencies,
                  // setShowCurrenncy,
                })}
                listName="components"
                watchKeys={["rate", "qty", "gstRate"]}
                nonListWatchKeys={["gstType"]}
                componentRequiredRef={["rate", "qty"]}
                form={challanForm}
                calculation={calculation}
                rules={listRules}
                addableRow={true}
                reverse={true}
                newRow={defaultValues.components[0]}
              />
            </Card>
          </Col>
        </Row>
      </Form>
      <NavFooter
        type="primary"
        resetFunction={() => {
          challanForm.resetFields();
        }}
        submitFunction={validateHandler}
        nextLabel="Submit"
      />
    </>
  );
};
const listRules = {
  hsn: [
    {
      required: true,
      message: "Please enter a HSN code!",
    },
  ],
  location: [
    {
      required: true,
      message: "Please select a Location!",
    },
  ],
  qty: [
    {
      required: true,
      message: "Please enter MIN Qty!",
    },
  ],
  file: [
    {
      required: true,
      message: "Please select document!",
    },
  ],
  rate: [
    {
      required: true,
      message: "Please component rate!",
    },
  ],
  docDate: [
    {
      required: true,
      message: "Please select doc Date!",
    },
  ],
  invoiceId: [
    {
      required: true,
      message: "Please select doc id!",
    },
  ],
};

export default CreateScrapeChallan;

const columns = ({
  loading,
  asyncOptions,
  setAsyncOptions,
  handleFetchComponentOptions,
  handleFetchComponentDetails,
  // handleFetchPreviousRate,
  // compareRates,
  challanForm,
  // currencies,
  // setShowCurrenncy,
}) => [
  {
    headerName: "Part Component",
    name: "component",
    field: (row, index) => (
      <MyAsyncSelect
        onBlur={() => setAsyncOptions([])}
        // selectLoading={loading("select")}
        labelInValue
        loadOptions={handleFetchComponentOptions}
        optionsState={asyncOptions}
        onChange={(value) => {
          handleFetchComponentDetails(row, index, value);

          // handleFetchPreviousRate(value, index);
        }}
      />
    ),
    width: 250,
    flex: 1,
  },
  {
    headerName: "Qty",
    name: "qty",
    width: 100,
    // renderCell: ({ row }) => ,
    field: (_, index) => <Input type="number" />,
  },
  {
    headerName: "Rate",
    name: "rate",
    width: 100,
    // renderCell: ({ row }) => ,
    field: (_, index) => <Input type="number" />,
  },
  {
    headerName: "Value",
    name: "value",
    width: 100,
    // renderCell: ({ row }) => ,
    field: (_, index) => <Input type="number" />,
  },
  // {
  //   headerName: "Rate",
  //   name: "rate",
  //   rules: [
  //     {
  //       warningOnly: true,
  //       validator: (first, value) => {
  //         let fieldName = first.field.split(".");
  //         fieldName = fieldName.map((row) => {
  //           if (!isNaN(row)) {
  //             return +row;
  //           } else return row;
  //         });
  //         fieldName.pop();
  //         const row = form.getFieldValue(fieldName);
  //         const vendorType = form.getFieldValue("vendorType");

  //         if (
  //           row.previousRate != row.rate &&
  //           row.previousRate &&
  //           vendorType === "v01"
  //         ) {
  //           return Promise.reject(`Prev. rate was ${row.previousRate}`);
  //         } else {
  //           return Promise.resolve();
  //         }
  //       },
  //     },
  //   ],
  //   field: (row, index) => (
  //     <Input
  //       onChange={(e) => compareRates(e.target.value, index)}
  //       addonAfter={
  //         <div style={{ width: 50 }}>
  //           <Form.Item noStyle name={[index, "currency"]}>
  //             <MySelect
  //               options={currencies}
  //               onChange={(value) => {
  //                 value !== "364907247"
  //                   ? setShowCurrenncy({
  //                       currency: value,
  //                       price: row.value,
  //                       exchangeRate: row.exchangeRate,
  //                       symbol: currencies.filter(
  //                         (cur) => cur.value == value
  //                       )[0].text,
  //                       rowId: index,
  //                       form: form,
  //                     })
  //                   : form.setFieldValue(
  //                       ["components", index, "exchangeRate"],
  //                       1
  //                     );
  //               }}
  //             />
  //           </Form.Item>
  //         </div>
  //       }
  //     />
  //   ),
  //   width: 200,
  // },

  {
    headerName: "HSN Code",
    name: "hsnCode",
    field: () => <Input />,
    width: 150,
  },

  {
    headerName: "Remarks",
    name: "remarks",
    field: () => <Input.TextArea rows={3} />,
    width: 250,
  },
];
