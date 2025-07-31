import React, { useEffect, useState } from "react";
import { v4 } from "uuid";
import AddComponent from "./AddComponents";
import { toast } from "react-toastify";
import AddVendorSideBar from "./AddVendorSideBar";
import CreateCostModal from "./CreateCostModal";
import AddBranch from "../../Master/Vendor/model/AddBranch";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import NavFooter from "../../../Components/NavFooter";
import {
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Row,
  Tabs,
  Modal,
  Button,
  InputNumber,
  Radio,
} from "antd";
import TextArea from "antd/lib/input/TextArea";
import Loading from "../../../Components/Loading";
import SuccessPage from "./SuccessPage";
import { imsAxios } from "../../../axiosInterceptor";
import AddProjectModal from "./AddProjectModal";
import useApi from "../../../hooks/useApi.ts";
import {
  getCostCentresOptions,
  getProjectOptions,
  getVendorOptions,
} from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";

export default function CreatePo() {
  const [totalValues, setTotalValues] = useState([]);
  const [newPurchaseOrder, setnewPurchaseOrder] = useState({
    vendorname: "",
    vendortype: "v01",
    vendorbranch: "",
    vendoraddress: "",
    billaddressid: "",
    billaddress: "",
    billPan: "",
    billGST: "",
    shipaddressid: "",
    shipaddress: "",
    shipPan: "",
    shipGST: "",
    termscondition: "",
    quotationdetail: "",
    paymentterms: "",
    pocostcenter: "",
    po_comment: "",
    project_name: "",
    pocreatetype: "N",
    original_po: "",
    raisedBy: "",
  });
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showDetailsCondirm, setShowDetailsConfirm] = useState(false);
  const [showAddProjectConfirm, setShowAddProjectConfirm] = useState(false);
  const [showBranchModel, setShowBranchModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddCostModal, setShowAddCostModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [billToOptions, setBillTopOptions] = useState([]);
  const [shipToOptions, setShipToOptions] = useState([]);
  const [vendorBranches, setVendorBranches] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [stateCode, setStateCode] = useState("");
  const [rowCount, setRowCount] = useState([
    {
      id: v4(),
      index: 1,
      currency: "364907247",
      exchange_rate: 1,
      component: "",
      qty: 1,
      rate: "",
      duedate: "",
      inrValue: 0,
      hsncode: "",
      gsttype: "L",
      gstrate: "",
      cgst: 0,
      sgst: 0,
      igst: 0,
      remark: "--",
      unit: "--",
      rate_cap: 0,
      tol_price: 0,
      project_req_qty: 0,
      po_exec_qty: 0,
      diffPercentage: "--",
    },
  ]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [successData, setSuccessData] = useState(false);
  const [projectDesc, setProjectDesc] = useState("");
  const [form] = Form.useForm();
  console.log("newPurchaseOrder", newPurchaseOrder);
  const { executeFun, loading: loading1 } = useApi();
  const validatePO = () => {
    let newPo = {};
    let componentData = {
      currency: [],
      exchange: [],
      component: [],
      qty: [],
      rate: [],
      duedate: [],
      hsncode: [],
      gsttype: [],
      gstrate: [],
      cgst: [],
      sgst: [],
      igst: [],
      remark: [],
      rate_cap: [],
      tol_price: [],
      project_qty: [],
      exq_po_qty: [],
    };
    rowCount.map((row) => {
      componentData.currency.push(row.currency);
      componentData.component.push(row.component.value);
      componentData.qty.push(row.qty);
      componentData.rate.push(row.rate);
      componentData.duedate.push(row.duedate);
      componentData.hsncode.push(row.hsncode);
      componentData.gsttype.push(row.gsttype);
      componentData.gstrate.push(row.gstrate);
      componentData.remark.push(row.remark);
      componentData.cgst.push(row.cgst);
      componentData.sgst.push(row.sgst);
      componentData.igst.push(row.igst);
      componentData.exchange.push(row.exchange_rate);
      componentData.rate_cap.push(row.rate_cap);
      componentData.project_qty.push(row.project_req_qty);
      componentData.exq_po_qty.push(row.po_exec_qty);
    });
    newPo = {
      ...newPurchaseOrder,
      ...componentData,
      billaddressid: newPurchaseOrder.billaddressid,
      original_po: newPurchaseOrder.original_po,
      pocostcenter: newPurchaseOrder.pocostcenter,
      pocreatetype: newPurchaseOrder.pocreatetype,
      shipaddressid: newPurchaseOrder.shipaddressid,
      vendorbranch: newPurchaseOrder.vendorbranch,
      vendorname: newPurchaseOrder.vendorname.value,
      vendortype: newPurchaseOrder.vendortype,
      pocomment: newPurchaseOrder.po_comment,
      poproject_name: newPurchaseOrder.project_name,
      paymenttermsday: newPurchaseOrder.paymenttermsday
        ? newPurchaseOrder.paymenttermsday === ""
          ? 30
          : newPurchaseOrder.paymenttermsday
        : 30,
      po_raise_by: newPurchaseOrder.raisedBy,
      advancePayment: newPurchaseOrder.advancePayment,
    };
    let error = false;
    if (rowCount.length == 0) {
      toast.error("Please add at least one component");
      return;
    } else if (
      !newPurchaseOrder.vendorname ||
      !newPurchaseOrder.vendortype ||
      !newPurchaseOrder.vendorbranch ||
      !newPurchaseOrder.vendoraddress ||
      !newPurchaseOrder.billaddressid ||
      !newPurchaseOrder.billaddress ||
      !newPurchaseOrder.shipaddressid ||
      !newPurchaseOrder.shipaddress ||
      !newPurchaseOrder.pocostcenter ||
      !newPurchaseOrder.pocreatetype
    ) {
      toast.error("Please enter all the fields");
      return;
    } else if (
      newPurchaseOrder.pocreatetype == "S" &&
      !newPurchaseOrder.original_po
    ) {
      return toast.error("Please select a PO ID in case of supplementry PO");
    }

    rowCount.map((count) => {
      if (
        count.currency == "" ||
        count.exchange == 0 ||
        count.component == "" ||
        count.qty == 0 ||
        count.rate == ""
      ) {
        error = true;
      }
    });
    if (error) {
      toast.error("Please enter all the values for all components");
      return;
    }
    setShowSubmitConfirm(newPo);
  };

  const submitHandler = async () => {
    setSubmitLoading(true);
    if (showSubmitConfirm) {
      const response = await imsAxios.post("/purchaseOrder/createPO", {
        ...showSubmitConfirm,
      }).then((res) => {
        if(res?.code == 500){
          toast.error(res?.message.msg)
          setSubmitLoading(false);
        }
        else{
          return res
        }
      });
      setSubmitLoading(false);
      const { data } = response;
      if (data) {
        setShowSubmitConfirm(null);
        if (data.code == 200) {
          resetFunction();
          rowsReset();
          setActiveTab("1");
          setSuccessData({
            vendorName: newPurchaseOrder.vendorname.label,
            project: newPurchaseOrder.project_name,
            poId: data.data.po_id,
            components: rowCount.map((row, index) => {
              return {
                id: index,
                component: row.component.label,
                // part: row.qty,
                qty: row.qty,
                rate: row.rate,
                uom: row.unit,
                value: Number(row.qty).toFixed(2) * Number(row.rate).toFixed(2),
              };
            }),
          });
        } else {
          toast.error(data.message.msg);
        }
      }
    }
  };
  const getPOs = async (searchInput) => {
    if (searchInput?.length > 2) {
      setSelectLoading(true);
      const { data } = await imsAxios.post("/backend/searchPoByPoNo", {
        search: searchInput,
      });
      setSelectLoading(false);
      let arr = [];
      if (!data.msg) {
        arr = data.map((d) => {
          return { text: d.text, value: d.id };
        });
        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
      }
    }
  };
  const getPaymentTermsDay = async (vendorCode) => {
    setPageLoading(true);
    const response = await imsAxios.post("/backend/vendorTerms", {
      vendorcode: vendorCode,
    });
    setPageLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        return data.data;
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const selectInputHandler = async (name, value) => {
    if (value) {
      let obj = newPurchaseOrder;
      if (name == "vendorname") {
        let arr = await getVendorBracnch(value.value);
        let { address, gstin } = await getVendorAddress({
          vendorCode: value,
          vendorBranch: arr[0].value,
        });
        let paymentTermsDay = await getPaymentTermsDay(value.value);
        // console.log("paymentTermsDay", paymentTermsDay);
        obj = {
          ...obj,
          [name]: value,
          vendorbranch: arr[0].value,
          vendoraddress: address.replaceAll("<br>", "\n"),
          gstin: gstin,
          paymenttermsday: paymentTermsDay.paymentterms,
          paymentterms: paymentTermsDay.po_payment_terms,
          msmeType: paymentTermsDay.msme_data.msme_type,
          msmeId: paymentTermsDay.msme_data.msme_id,
        };
      } else if (name == "vendorbranch") {
        setPageLoading(true);
        let { address, gstin } = await getVendorAddress({
          vendorCode: obj.vendorname,
          vendorBranch: value,
        });
        setPageLoading(false);
        obj = {
          ...obj,
          [name]: value,
          vendorbranch: value,
          vendoraddress: address.replaceAll("<br>", "\n"),
          gstin: gstin,
        };
      } else if (name == "shipaddressid") {
        let shippingDetails = await getShippingAddress(value);
        obj = {
          ...obj,
          [name]: value,
          shipaddress: shippingDetails.address.replaceAll("<br>", "\n"),
          shipPan: shippingDetails.pan,
          shipGST: shippingDetails.gstin,
        };
      } else if (name == "billaddressid") {
        let billingDetails = await getBillingAddress(value);
        obj = {
          ...obj,
          [name]: value,
          billaddress: billingDetails.address.replaceAll("<br>", "\n"),
          billPan: billingDetails.pan,
          billGST: billingDetails.gstin,
        };
      } else {
        obj = {
          ...obj,
          [name]: value,
        };
      }
      console.log(obj);
      form.setFieldsValue(obj);
      setnewPurchaseOrder(obj);
    }
  };
  const POoption = [
    { text: "New", value: "N" },
    { text: "Supplementary", value: "S" },
  ];
  const vendorDetailsOptions = [
    { text: "JWI (Job Work In)", value: "j01" },
    { text: "Vendor", value: "v01" },
  ];
  //getting users list
  const getusers = async (s) => {
    if (s?.length > 2) {
      setSelectLoading(true);
      const { data } = await imsAxios.post("/backend/fetchAllUser", {
        search: s,
      });
      setSelectLoading(false);
      let arr = [];
      if (!data.msg) {
        arr = data.map((d) => {
          return { text: d.text, value: d.id };
        });
        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
      }
    }
  };
  //getting vendors in the vendor select list
  const getVendors = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];

    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
    let { data } = response;
    arr = data.data;
    // //   if (!data.msg) {
    if (response.success) {
      arr = arr.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  //getting vendor branches
  const getVendorBracnch = async (vendorCode) => {
    setPageLoading(true);
    const { data } = await imsAxios.post("/backend/vendorBranchList", {
      vendorcode: vendorCode,
    });
    setPageLoading(false);
    const arr = data.data.map((d) => {
      return { value: d.id, text: d.text };
    });
    setVendorBranches(arr);
    return arr;
  };
  // getting vendor address
  const getVendorAddress = async ({ vendorCode, vendorBranch }) => {
    const { data } = await imsAxios.post("/backend/vendorAddress", {
      vendorcode: vendorCode.value,
      branchcode: vendorBranch,
    });
    return { address: data?.data?.address, gstin: data?.data.gstid };
  };
  const getBillTo = async () => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/backend/billingAddressList", {
      search: "",
    });
    setSelectLoading(false);
    let arr = [];
    arr = data.map((d) => {
      return { text: d.text, value: d.id };
    });
    setBillTopOptions(arr);
  };
  const shipTo = async () => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/backend/shipingAddressList", {
      search: "",
    });
    setSelectLoading(false);
    let arr = [];
    arr = data.map((d) => {
      return { text: d.text, value: d.id };
    });
    setShipToOptions(arr);
  };
  const handleFetchCostCenterOptions = async (search) => {
    const response = await executeFun(
      () => getCostCentresOptions(search),
      "select"
    );
    let arr = [];
    if (response.success) arr = convertSelectOptions(response.data);
    setAsyncOptions(arr);
  };
  const getBillingAddress = async (billaddressid) => {
    setPageLoading(true);
    const { data } = await imsAxios.post("/backend/billingAddress", {
      billing_code: billaddressid,
    });
    setPageLoading(false);
    return {
      gstin: data.data?.gstin,
      pan: data.data?.pan,
      address: data.data?.address,
    };

    // selectInputHandler("billDetails", data.data.address);
  };
  const getShippingAddress = async (shipaddressid) => {
    setPageLoading(true);
    const { data } = await imsAxios.post("/backend/shippingAddress", {
      shipping_code: shipaddressid,
    });
    setPageLoading(false);
    setStateCode(data?.data?.statecode);
    // console.log("stateCodeeeeeeeeeeeeee", data.data.statecode);
    return {
      gstin: data.data?.gstin,
      pan: data.data?.pan,
      address: data.data?.address,
    };
  };
  const resetFunction = () => {
    let obj = {
      vendorname: "",
      vendortype: "v01",
      vendorbranch: "",
      vendoraddress: "",
      billaddressid: "",
      billaddress: "",
      billPan: "",
      billGST: "",
      shipaddressid: "",
      shipaddress: "",
      shipPan: "",
      shipGST: "",
      termscondition: "",
      quotationdetail: "",
      paymentterms: "",
      pocostcenter: "",
      po_comment: "",
      project_name: "",
      pocreatetype: "N",
      original_po: "",
      advancePayment: "",
    };

    // form.reset
    // form.resetFields();
    form.setFieldsValue(obj);
    setnewPurchaseOrder(obj);
    form.setFieldValue("advancePayment", "");
    setShowDetailsConfirm(false);
  };
  const rowsReset = () => {
    setRowCount([
      {
        id: v4(),
        index: 1,
        currency: "364907247",
        exchange_rate: 1,
        component: "",
        qty: 1,
        rate: "",
        duedate: "",
        inrValue: 0,
        hsncode: "",
        gsttype: "L",
        gstrate: "",
        cgst: 0,
        sgst: 0,
        igst: 0,
        remark: "--",
        unit: "--",
      },
    ]);
  };
  const setNewPO = () => {
    resetFunction();
    setSuccessData(false);
  };
  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };
  const handleProjectChange = async (value) => {
    setPageLoading(true);
    const response = await imsAxios.post("/backend/projectDescription", {
      project_name: value,
    });
    setPageLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        setProjectDesc(data.data.description);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  useEffect(() => {
    if (submitLoading) {
      setTimeout(() => {
        setSubmitLoading(false);
      }, 600000);
    }
  }, [submitLoading]);
  //on selecting vendor from the list
  useEffect(() => {
    if (newPurchaseOrder.vendorname) {
      getVendorBracnch();
    }
  }, [newPurchaseOrder.vendorname]);
  // useE
  useEffect(() => {
    getBillTo();
    shipTo();
  }, []);
  //getting address of branch
  useEffect(() => {
    getVendorAddress();
  }, [newPurchaseOrder.vendorbranch]);
  //getting complete billing address
  useEffect(() => {
    getBillingAddress();
  }, [newPurchaseOrder.billaddressid]);
  useEffect(() => {
    getShippingAddress();
  }, [newPurchaseOrder.shipaddressid]);
  const finish = (values) => {
    setActiveTab("2");
    setnewPurchaseOrder(values);
  };
  return (
    <div
      style={{
        height: "90%",
      }}
    >
      {/* create confirm modal */}
      <Modal
        title="Confirm Create PO!"
        open={showSubmitConfirm}
        onCancel={() => setShowSubmitConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowSubmitConfirm(false)}>
            No
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={submitHandler}
          >
            Yes
          </Button>,
        ]}
      >
        <p>Are you sure you want to generate this Purchase Order?</p>
      </Modal>
      {/* reset vendor confirm modal */}
      <Modal
        title="Confirm Reset!"
        open={showDetailsCondirm}
        onOk={resetFunction}
        onCancel={() => setShowDetailsConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowDetailsConfirm(false)}>
            No
          </Button>,
          <Button key="submit" type="primary" onClick={resetFunction}>
            Yes
          </Button>,
        ]}
      >
        <p>Are you sure to reset details of this Purchase Order?</p>
      </Modal>
      <AddVendorSideBar
        open={showAddVendorModal}
        setOpen={setShowAddVendorModal}
      />
      <AddBranch
        getVendorBracnch={getVendorBracnch}
        setOpenBranch={setShowBranchModal}
        openBranch={showBranchModel}
      />
      <CreateCostModal
        showAddCostModal={showAddCostModal}
        setShowAddCostModal={setShowAddCostModal}
      />
      <AddProjectModal
        showAddProjectConfirm={showAddProjectConfirm}
        setShowAddProjectConfirm={setShowAddProjectConfirm}
      />
      {!successData && (
        <div style={{ height: "100%", overflow: "auto" }}>
          <Tabs
            style={{
              padding: "0 10px",
              height: "100%",
            }}
            activeKey={activeTab}
            size="small"
          >
            <Tabs.TabPane tab="Purchase Order Details" key="1">
              <div
                style={{
                  height: "100%",
                  overflowY: "scroll",
                  overflowX: "hidden",
                  padding: "0vh 20px",
                }}
              >
                {pageLoading && <Loading />}
                {/* vendor */}
                <Form
                  form={form}
                  size="small"
                  scrollToFirstError={true}
                  name="create-po"
                  layout="vertical"
                  initialValues={newPurchaseOrder}
                  onFinish={finish}
                  onFieldsChange={(value, allFields) => {
                    if (value.length == 1) {
                      selectInputHandler(value[0].name[0], value[0].value);
                    }
                  }}
                >
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="PO Type">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Provide Purchase Order type as in
                          <br /> (New Or Supplementary)
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={20}>
                      <Row gutter={16}>
                        {/* PO type */}
                        <Col span={6}>
                          <Form.Item
                            name="pocreatetype"
                            label="PO Type"
                            rules={rules.pocreatetype}
                          >
                            <MySelect size="default" options={POoption} />
                          </Form.Item>
                        </Col>

                        {newPurchaseOrder.pocreatetype == "S" && (
                          <Col span={6}>
                            <Form.Item
                              name="original_po"
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Original PO
                                </span>
                              }
                              rules={rules.original_po}
                            >
                              <MyAsyncSelect
                                selectLoading={selectLoading}
                                size="default"
                                onBlur={() => setAsyncOptions([])}
                                loadOptions={getPOs}
                                optionsState={asyncOptions}
                              />
                            </Form.Item>
                          </Col>
                        )}
                      </Row>
                    </Col>
                  </Row>
                  <Divider />
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="Vendor Details">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Type Name or Code of the vendor
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>

                    <Col span={20}>
                      <Row gutter={16}>
                        {/* vendor type */}
                        <Col span={6}>
                          <Form.Item
                            name="vendortype"
                            label={
                              <span
                                style={{
                                  fontSize:
                                    window.innerWidth < 1600 && "0.7rem",
                                }}
                              >
                                Vendor Type
                              </span>
                            }
                            rules={rules.vendortype}
                          >
                            <MySelect
                              size="default"
                              options={vendorDetailsOptions}
                            />
                          </Form.Item>
                        </Col>
                        {/* vendor name */}
                        <Col span={6}>
                          <Form.Item
                            name="vendorname"
                            rules={rules.vendorname}
                            label={
                              <div
                                style={{
                                  fontSize:
                                    window.innerWidth < 1600 && "0.7rem",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  width: 350,
                                }}
                              >
                                Vendor Name
                                <span
                                  onClick={() => setShowAddVendorModal(true)}
                                  style={{
                                    color: "#1890FF",
                                    cursor: "pointer",
                                  }}
                                >
                                  Add Vendor
                                </span>
                              </div>
                            }
                          >
                            <MyAsyncSelect
                              selectLoading={loading1("select")}
                              size="default"
                              labelInValue
                              onBlur={() => setAsyncOptions([])}
                              optionsState={asyncOptions}
                              loadOptions={getVendors}
                            />
                          </Form.Item>
                        </Col>
                        {/* venodr branch */}
                        <Col span={6}>
                          <Form.Item
                            name="vendorbranch"
                            rules={rules.vendorbranch}
                            label={
                              <div
                                style={{
                                  fontSize:
                                    window.innerWidth < 1600 && "0.7rem",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  width: 350,
                                }}
                              >
                                Vendor Branch
                                <span
                                  onClick={() => {
                                    newPurchaseOrder.vendorname.value
                                      ? setShowBranchModal({
                                          vendor_code:
                                            newPurchaseOrder.vendorname.value,
                                        })
                                      : toast.error(
                                          "Please Select a vendor first"
                                        );
                                  }}
                                  style={{ color: "#1890FF" }}
                                >
                                  Add Branch
                                </span>
                              </div>
                            }
                          >
                            <MySelect options={vendorBranches} />
                          </Form.Item>
                        </Col>
                        {/* gstin */}
                        <Col span={6}>
                          <Form.Item name="gstin" label="GSTIN">
                            <Input size="default" disabled />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={8}>
                        <Col span={6}>
                          <Form.Item name="msmeType" label="MSME Type">
                            <Input size="default" disabled />
                          </Form.Item>
                        </Col>
                        <Col span={6}>
                          <Form.Item label="MSME Id" name="msmeId">
                            <Input size="default" disabled />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="vendoraddress"
                            label="Bill From Address"
                            rules={rules.vendoraddress}
                          >
                            <TextArea rows={4} style={{ resize: "none" }} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Divider />
                  {/* PO TERMS */}
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="PO Terms">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Provide PO terms and other information
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={20}>
                      <Row gutter={16}>
                        {/* terms and conditions */}
                        <Col span={6}>
                          <Form.Item
                            name="termscondition"
                            label=" Terms and Conditions"
                          >
                            <Input size="default" />
                          </Form.Item>
                        </Col>
                        {/* quotations */}
                        <Col span={6}>
                          <Form.Item name="quotationdetail" label="Quotation">
                            <Input size="default" name="quotationdetail" />
                          </Form.Item>
                        </Col>
                        {/* payment terms */}
                        <Col span={6}>
                          <Form.Item name="paymentterms" label=" Payment Terms">
                            <Input size="default" />
                          </Form.Item>
                        </Col>

                        {/* po due date*/}
                        <Col span={6}>
                          <Form.Item
                            label="Due Date (in days)"
                            name="paymenttermsday"
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              size="default"
                              min={1}
                              max={999}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        {/* project id */}
                        {/* cost center */}
                        <Col span={4}>
                          <Form.Item
                            name="pocostcenter"
                            rules={rules.pocostcenter}
                            label={
                              <div
                                style={{
                                  fontSize:
                                    window.innerWidth < 1600 && "0.7rem",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  width: 350,
                                }}
                              >
                                Cost Center
                                <span
                                  onClick={() => setShowAddCostModal(true)}
                                  style={{
                                    color: "#1890FF",
                                    cursor: "pointer",
                                  }}
                                >
                                  Add Cost Center
                                </span>
                              </div>
                            }
                          >
                            <MyAsyncSelect
                              selectLoading={loading1("select")}
                              onBlur={() => setAsyncOptions([])}
                              loadOptions={handleFetchCostCenterOptions}
                              optionsState={asyncOptions}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            name="project_name"
                            rules={rules.project_name}
                            label={
                              <div
                                style={{
                                  fontSize:
                                    window.innerWidth < 1600 && "0.7rem",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  width: 350,
                                }}
                              >
                                Project ID
                                <span
                                  onClick={() => setShowAddProjectConfirm(true)}
                                  style={{
                                    color: "#1890FF",
                                    cursor: "pointer",
                                  }}
                                >
                                  Add Project
                                </span>
                              </div>
                            }
                          >
                            <MyAsyncSelect
                              selectLoading={loading1("select")}
                              onBlur={() => setAsyncOptions([])}
                              loadOptions={handleFetchProjectOptions}
                              optionsState={asyncOptions}
                              onChange={handleProjectChange}
                            />
                          </Form.Item>
                        </Col>
                        {/* project name */}
                        <Col span={5}>
                          <Form.Item label="Project Description">
                            <Input
                              size="default"
                              disabled
                              value={projectDesc}
                            />
                          </Form.Item>
                        </Col>
                        {/* comments */}
                        <Col span={5}>
                          <Form.Item label="Comments" name="po_comment">
                            <Input size="default" />
                          </Form.Item>
                        </Col>
                        {/* raised by */}
                        <Col span={5}>
                          <Form.Item
                            label="Requested By"
                            name="raisedBy"
                            rules={rules.raisedBy}
                          >
                            <MyAsyncSelect
                              selectLoading={selectLoading}
                              size="default"
                              onBlur={() => setAsyncOptions([])}
                              optionsState={asyncOptions}
                              loadOptions={getusers}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item  label="Advance Payment" name="advancePayment">
                            <Radio.Group>
                              <Radio value={1}>Yes</Radio>
                              <Radio value={0}>No</Radio>
                            </Radio.Group>
                          </Form.Item>
                        </Col>
                      
                      </Row>
                    </Col>
                  </Row>

                  <Divider />
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="Billing Details">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Provide billing information
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={20}>
                      <Row gutter={16}>
                        {/* billing id */}
                        <Col span={6}>
                          <Form.Item
                            name="billaddressid"
                            label="Billing Id"
                            rules={rules.billaddressid}
                          >
                            <MySelect options={billToOptions} />
                          </Form.Item>
                        </Col>
                        {/* pan number */}
                        <Col span={6}>
                          <Form.Item
                            name="billPan"
                            label="Pan No."
                            rules={rules.billPan}
                          >
                            <Input
                              size="default"
                              value={newPurchaseOrder.billPan}
                            />
                          </Form.Item>
                        </Col>
                        {/* gstin uin */}
                        <Col span={6}>
                          <Form.Item
                            name="billGST"
                            label="GSTIN / UIN"
                            rules={rules.billGST}
                          >
                            <Input
                              size="default"
                              value={newPurchaseOrder.billGST}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      {/* billing address */}
                      <Row>
                        <Col span={18}>
                          <Form.Item
                            name="billaddress"
                            label="Billing Address"
                            rules={rules.billaddress}
                          >
                            <TextArea style={{ resize: "none" }} rows={4} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Divider />
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="Shipping Details">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Provide shipping information
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>

                    <Col span={20}>
                      <Row gutter={16}>
                        {/* shipping id */}
                        <Col span={6}>
                          <Form.Item
                            name="shipaddressid"
                            label="Shipping Id"
                            rules={rules.shipaddressid}
                          >
                            <MySelect options={shipToOptions} />
                          </Form.Item>
                        </Col>
                        {/* pan number */}
                        <Col span={6}>
                          <Form.Item
                            label="Pan No."
                            name="shipPan"
                            rules={rules.shipPan}
                          >
                            <Input
                              size="default"
                              value={newPurchaseOrder.shipPan}
                            />
                          </Form.Item>
                        </Col>
                        {/* gstin uin */}
                        <Col span={6}>
                          <Form.Item
                            name="shipGST"
                            label=" GSTIN / UIN"
                            rules={rules.shipGST}
                          >
                            <Input
                              size="default"
                              value={newPurchaseOrder.shipGST}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      {/* shipping address */}
                      <Row>
                        <Col span={18}>
                          <Form.Item
                            label="Shipping Address"
                            name="shipaddress"
                            rules={rules.shipaddress}
                          >
                            <TextArea style={{ resize: "none" }} rows={4} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <NavFooter
                      submithtmlType="submit"
                      submitButton={true}
                      formName="create-po"
                      resetFunction={() => setShowDetailsConfirm(true)}
                    />
                  </Row>
                </Form>
                <Divider />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab="Add Components Details"
              style={{ height: "98%" }}
              key="2"
            >
              <div style={{ height: "100%" }}>
                <AddComponent
                  newPurchaseOrder={newPurchaseOrder}
                  setTotalValues={setTotalValues}
                  setRowCount={setRowCount}
                  rowCount={rowCount}
                  setActiveTab={setActiveTab}
                  resetFunction={resetFunction}
                  submitHandler={validatePO}
                  submitLoading={submitLoading}
                  totalValues={totalValues}
                  setStateCode={setStateCode}
                  stateCode={stateCode}
                />
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      )}
      {successData && (
        <SuccessPage
          resetFunction={resetFunction}
          po={successData}
          setNewPO={setNewPO}
        />
      )}
    </div>
  );
}

// form rules
const rules = {
  pocreatetype: [
    {
      required: true,
      message: "Please Select a PO Type!",
    },
  ],
  original_po: [
    {
      required: true,
      message: "Please Select a PO Type!",
    },
  ],
  vendortype: [
    {
      required: true,
      message: "Please Select a vendor Type!",
    },
  ],
  vendorname: [
    {
      required: true,
      message: "Please Select a vendor Name!",
    },
  ],
  vendorbranch: [
    {
      required: true,
      message: "Please Select a vendor Branch!",
    },
  ],
  vendoraddress: [
    {
      required: true,
      message: "Please Enter bill from address!",
    },
  ],
  pocostcenter: [
    {
      required: true,
      message: "Please Select a Cost Center!",
    },
  ],
  project_name: [
    {
      required: true,
      message: "Please Select a Project!",
    },
  ],
  raisedBy: [
    {
      required: true,
      message: "Please select who requested for this PO!",
    },
  ],
  billaddressid: [
    {
      required: true,
      message: "Please Select a Billing Address!",
    },
  ],
  billPan: [
    {
      required: true,
      message: "Please enter Billing PAN Number!",
    },
  ],
  billaddress: [
    {
      required: true,
      message: "Please Enter Billing Address!",
    },
  ],
  shipaddressid: [
    {
      required: true,
      message: "Please Select a Shipping Address!",
    },
  ],
  shipPan: [
    {
      required: true,
      message: "Please Enter Shipping PAN Number!",
    },
  ],
  shipGST: [
    {
      required: true,
      message: "Please Enter Shipping GSTIN!",
    },
  ],
  shipaddress: [
    {
      required: true,
      message: "Please Enter Shipping Address!",
    },
  ],
  billGST: [
    {
      required: true,
      message: "Please enter Billing GSTIN Number!",
    },
  ],
};
