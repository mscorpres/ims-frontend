import React, { useEffect, useState } from "react";
import {
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Row,
  Switch,
  Tabs,
} from "antd";
import CreateCostModal from "./Create/CreateCostModal";
import AddProjectModal from "./Create/AddProjectModal";
import Loading from "../../../Components/Loading";
import { v4 } from "uuid";
import AddComponent from "./Create/AddComponents";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { useNavigate, useParams } from "react-router-dom";

import NavFooter from "../../../Components/NavFooter";
import SuccessPage from "./Create/SuccessPage";
import useApi from "../../../hooks/useApi.ts";
import {
  getBranchDetails,
  getClientBranches,
  getClientsOptions,
} from "../../../api/finance/clients";
import { convertSelectOptions, getInt } from "../../../utils/general.ts";
import {
  getBillingAddressDetails,
  getBillingAddressOptions,
  getCostCentresOptions,
  getProjectDetails,
  getProjectOptions,
  getUsersOptions,
  getVendorBranchOptions,
} from "../../../api/general.ts";
import {
  createOrder,
  getOrderDetails,
  updateOrder,
} from "../../../api/sales/salesOrder";
import { toast } from "react-toastify";
import ClientBranchAdd from "../../../FinancePages/Clients/modal/ClientBranchAdd";

const SalesOrderForm = () => {
  const [successData, setSuccessData] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [clientBranchOptions, setClientBranchOptions] = useState([]);
  const [showAddProjectConfirm, setShowAddProjectConfirm] = useState(false);
  const [billToOptions, setBillTopOptions] = useState([]);
  const [projectDesc, setProjectDesc] = useState([]);
  const [totalValues, setTotalValues] = useState([]);
  const [branchAddOpen, setBranchAddOpen] = useState(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [uploadfile, setUploadFile] = useState(false);
  const [biliingStateCode, setBiliingStateCode] = useState("");
  const [shippingStateCode, setShippingStateCode] = useState("");
  const [derivedType, setDerivedType] = useState("");
  const [rowCount, setRowCount] = useState([
    {
      id: v4(),
      type: "product",
      index: 1,
      currency: "364907247",
      exchange_rate: 1,
      component: "",
      qty: 1,
      rate: "",
      duedate: "",
      inrValue: 0,
      hsncode: "",
      gsttype: derivedType,
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

  const [confirmReset, setConfirmReset] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddCostModal, setShowAddCostModal] = useState(false);
  const [showDetailsCondirm, setShowDetailsConfirm] = useState(false);
  const [fileupload, setFileUpload] = useState("table");
  const [pageLoading, setPageLoading] = useState(false);
  const [copyinfo, setCopyInfo] = useState("");
  const [stateOptions, setStateOptions] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const iscomponents = Form.useWatch("pocreatetype", form);
  const client = Form.useWatch("client", form);
  const clientbranch = Form.useWatch("clientbranch", form);
  const billaddressid = Form.useWatch("billaddressid", form);
  const dispatchStateCode = Form.useWatch("shippingstate", form);
  const shipaddressid = Form.useWatch("shipaddressid", form);
  const fetchQty = form.getFieldValue("qty");

  const { executeFun, loading } = useApi();
  const { orderId } = useParams();
  const stateCode = async () => {
    // const values = await form.validateFields();
    // let dispatchStateCode = "7";
    // let billingStateCode = "07";
    // console.log("biliingStateCode-----", biliingStateCode);
    // console.log("shippingStateCode-----", shippingStateCode);
    if (
      Number(dispatchStateCode?.key) == Number(biliingStateCode) ||
      Number(biliingStateCode) == Number(shippingStateCode)
    ) {
      console.log("here");
      setDerivedType("L");

      // setDerivedType({ value: "I", text: "INTER STATE" });
    } else {
      console.log("same");
      setDerivedType("I");
      // setDerivedType({ value: "L", text: "LOCAL" });
    }
  };
  console.log("derivedType", derivedType);
  useEffect(() => {
    // console.log("here in state code");
    stateCode();
  }, [dispatchStateCode, biliingStateCode, shippingStateCode]);
  const toggleInputType = (checked) => {
    setCopyInfo(checked);
    // console.log(`switch to ${checked}`);
  };
  // const onChange = (checked) => {
  //   console.log(`switch to ${checked}`);
  // };
  const handleFetchClientOptions = async (search) => {
    const response = await executeFun(
      () => getClientsOptions(search),
      "clientSelect"
    );
    if (response.success) {
      const arr = convertSelectOptions(response.data.data, "name", "code");
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const handleFetchClientBranchOptions = async (clientCode) => {
    const response = await executeFun(
      () => getClientBranches(clientCode),
      // ?\
      "select"
    );
    console.log("response of client", response);
    if (response.success) {
      // console.log("response.data.data", response.data.data);
      const arr = response.data.data.map((row) => ({
        text: row.city.name,
        value: row.city.id,
      }));
      console.log(
        " response.data?.data?.state?.key]",
        response.data?.data[0].state.code
      );
      setShippingStateCode(response.data?.data[0]?.state?.code);
      form.setFieldValue("clientbranch", arr[0]);
      return setClientBranchOptions(arr);
    }
    setClientBranchOptions([]);
  };
  const handleFetchClientBranchDetails = async (locationType, branchId) => {
    const response = await executeFun(
      () => getBranchDetails(branchId),
      `clientLoading`
    );

    if (response.success) {
      const details = response.data[0];
      if (details) {
        form.setFieldValue("billingState", {
          label: details.state.name,
          value: details.state.code,
        });
        const address = removeHtml(details.address);
        if (locationType === "client") {
          form.setFieldValue("gstin", details.gst);
          form.setFieldValue("clientaddress", address);
          form.setFieldValue("clientPan", details.panNo);
        } else if (locationType === "shipaddressid") {
          form.setFieldValue("shipPan", details.panNo);
          form.setFieldValue("shipGST", details.gst);
          form.setFieldValue("shipaddress", address);
        }
      }
    }
  };
  const handleFetchCostCentresOptions = async (search) => {
    const response = await executeFun(
      () => getCostCentresOptions(search),
      "select"
    );
    if (response.success) {
      const arr = convertSelectOptions(response.data);
      return setAsyncOptions(arr);
    }
    setAsyncOptions([]);
  };
  const handleFetchUsersOptions = async (search) => {
    const response = await executeFun(
      () => getUsersOptions(search),
      "fetchUsers"
    );
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
      setAsyncOptions(arr);
    }
    setAsyncOptions(arr);
  };
  // add
  const getBillingAddress = async (billaddressid) => {
    const response = await executeFun(
      () => getBillingAddressDetails(billaddressid),
      "dispatchLoading"
    );

    if (response.success) {
      const { data } = response;
      form.setFieldValue("billPan", data.data.pan);
      // console.log("data.data.statecode", data.data.statecode);
      form.setFieldValue("billingStateCode");
      setBiliingStateCode(data.data.statecode);
      form.setFieldValue("billGST", data.data.gstin);
      let newStringaddress = removeHtml(data.data.address);
      form.setFieldValue("billaddress", newStringaddress);
    }
  };
  const handleFetchBillingOptions = async () => {
    const response = await executeFun(
      () => getBillingAddressOptions(),
      "dispatchLoading"
    );
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setBillTopOptions(arr);
  };

  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };
  const getState = async (e) => {
    setPageLoading(true);
    const { data } = await imsAxios.get("/tally/backend/states", { search: e });
    setPageLoading(false);
    if (data.data[0]) {
      let arr = data.data.map((row) => ({
        text: row.name,
        value: row.code,
      }));
      setStateOptions(arr);
    }
  };
  const handleProjectChange = async (projectId) => {
    const response = await executeFun(
      () => getProjectDetails(projectId),
      "termsLoading"
    );
    let desc = "--";
    if (response.success) {
      desc = response.data.data.description;
    }
    setProjectDesc(desc);
  };

  const getShippingAddress = async (shipaddressid) => {
    setPageLoading(true);
    const { data } = await imsAxios.post("/backend/shippingAddress", {
      shipping_code: shipaddressid,
    });
    setPageLoading(false);
    form.setFieldValue("shipPan", data.data.pan);
    form.setFieldValue("shipGST", data.data.gstin);
    let newStringaddress = removeHtml(data.data.address);
    form.setFieldValue("shipaddress", newStringaddress);
  };

  // getting order details
  const handleFetchOrderDetails = async (orderId) => {
    const response = await executeFun(
      () => getOrderDetails(orderId.replaceAll("_", "/")),
      "fetch"
    );
    console.log("response for edit", response);
    if (response.success) {
      const { bill, materials, ship, client } = response.data;
      // if (client[0]?.projectname.length > 0) {
      //   handleProjectChange(client[0]?.projectname);
      // }
      const obj = {
        client: client[0].clientcode,
        vendortype: "c01",
        clientbranch: client[0].clientbranch,
        clientaddress: client[0].clientaddress,
        billaddressid: bill.addrbillid,
        billaddress: bill.billaddress,
        billPan: bill.billpanno,
        billGST: bill.billgstid,
        shipaddressid: ship.addrshipid,
        paymenttermsday: client[0].soDueDate,
        shipaddress: ship.shipaddress,
        shipPan: ship.shippanno,
        shipGST: ship.shipgstid,
        paymentterms: client[0].paymentterms,
        pocostcenter: client[0].costcenter,
        po_comment: client[0].socomment,
        project_name: {
          label: client[0].projectname,
          value: client[0].projectname,
        },
        original_po: "",
        quotationdetail: client[0].quotation_detail,
        termscondition: client[0].terms_condition,
      };
      const arr = materials.map((row, index) => ({
        id: { v4 },
        // pocreatetype: client[0].soType_value,
        type: row.so_type.value,
        updateRow: row.updateid,
        index: index + 1,
        currency: row.currency,
        exchange_rate: row.exchangerate,
        component: {
          label: row.selectedItem[0]?.text,
          value: row.selectedItem[0]?.id,
        },
        qty: row.orderqty,
        rate: row.rate,
        inrValue:
          getInt(row.orderqty) * getInt(row.rate) * getInt(row.exchangerate),
        usdValue:
          row.exchangerate === "364907247"
            ? 0
            : getInt(row.orderqty) * getInt(row.rate),
        duedate: row.due_date, //this
        hsncode: row.hsncode,
        // gsttype: row.gsttype,
        gsttype: row.gsttype[0].id, //this
        gstrate: row.gstrate,
        cgst: row.cgst,
        sgst: row.sgst,
        igst: row.igst,
        remark: row.remark,
        foreginValue: 0,
        unit: "", //this one
        rate_cap: 0,
        tol_price: 0,
        project_req_qty: 0,
        po_exec_qty: 0,
        diffPercentage: "--",
      }));
      form.setFieldsValue(obj);
      setRowCount(arr);
      console.log("arr", arr);
      console.log("obj", obj);
    }
  };

  const validateSales = async () => {
    console.log("rows =>", rowCount);
    setSelectLoading(true);
    const values = await form.validateFields();
    console.log("values are here", values);
    const payload = {
      headers: {
        bill_id: values.billaddressid,
        billing_address: values.billaddress,
        comment: values.po_comment,
        cost_center: values.pocostcenter?.value ?? values.pocostcenter,
        customer_address: values.clientaddress,
        customer_branch: values.clientbranch.value,
        customer_gstin: values.gstin,
        customer: values.client.value,
        delivery_term: values.termscondition,
        due_day: values.paymenttermsday,
        payment_term: values.paymentterms,
        project: values.project_name?.value ?? values.project_name,
        quotation_detail: values.quotationdetail,
        shipping_address: values.shipaddress,
        shipping_gstin: values.shipGST,
        shipping_id: values.shipaddressid,
        shipping_pan: values.shipPan,
        so_id: orderId?.replaceAll("_", "/"),
        // so_type: values.pocreatetype,
        terms_condition: values.termscondition,
      },
      materials: {
        so_type: rowCount.map((component) => component.type),
        items: rowCount.map((component) => component.component.value),
        updaterow: rowCount.map((component) => component.updateRow ?? 0),
        currency: rowCount.map((component) => component.currency),
        deviation: rowCount.map((component) => component.remark),
        due_date: rowCount.map((component) => component.duedate),
        exchange_rate: rowCount.map((component) => component.exchange_rate),
        gst_rate: rowCount.map((component) => component.gstrate),
        gst_type: rowCount.map((component) => component.gsttype),
        hsn: rowCount.map((component) => component.hsncode),
        price: rowCount.map((component) => component.rate),
        qty: rowCount.map(
          (component) => +Number(+Number(component.qty).toFixed(2))
        ),
        remark: rowCount.map((component) => component.remark),
        cgst: rowCount.map((component) => component.cgst),
        sgst: rowCount.map((component) => component.sgst),
        igst: rowCount.map((component) => component.igst),
      },
    };

    if (orderId) {
      const response = await executeFun(() => updateOrder(payload), "submit");
      if (response.success) {
        setActiveTab("1");
        form.resetFields();
        navigate(`/sales/order/register`);
      } else {
        setConfirmSubmit(null);
        console.log("response.message", response);
        setConfirmSubmit(false);
        toast.error(data.message.msg);
      }
      setConfirmSubmit(false);
    } else {
      const response = await executeFun(() => createOrder(payload), "submit");
      // console.log("response", response);
      if (response.success) {
        setActiveTab("1");
        form.resetFields();
        // newdata.resetFields();
        setUploadFile(false);
        setSelectLoading(false);
        setSelectLoading(false);
        setConfirmSubmit(null);
        toast.success(response.message.msg);
      } else {
        // console.log("response.data", response.data);
        setConfirmSubmit(null);
        toast.error(response.message.msg);

        setSelectLoading(false);
      }
      setConfirmSubmit(null);
    }
    setSelectLoading(false);
    setConfirmSubmit(false);
  };

  const setNewPO = () => {
    resetFunction();
    setSuccessData(false);
  };

  const resetFunction = () => {
    setRowCount([{}]);
    // console.log("here");
    form.resetFields();
    setShowDetailsConfirm(false);
  };
  const resetFunction2 = () => {
    // console.log("here");
    setRowCount([
      // {
      //   id: v4(),
      //   type: "product",
      //   index: 1,
      //   currency: "364907247",
      //   exchange: "1",
      //   component: "",
      //   qty: 1,
      //   rate: "",
      //   duedate: "",
      //   inrValue: 0,
      //   hsncode: "",
      //   gsttype: derivedType,
      //   gstrate: "",
      //   cgst: 0,
      //   sgst: 0,
      //   igst: 0,
      //   remark: "--",
      //   unit: "--",
      // },
    ]);
    setConfirmReset(false);
  };

  const nextFun = () => {
    setActiveTab("2");
  };
  const callFileUpload = async () => {
    setPageLoading(true);
    // console.log("pageLoading", pageLoading);
    const values = await form.validateFields();
    const formData = new FormData();
    formData.append("file", values.files[0].originFileObj);
    const response = await imsAxios.post(
      "/sellRequest/uploadSOItems",
      formData
    );
    let { data } = response;
    if (response.success) {
      toast.success(response.message);
      setPageLoading(false);
      uploadInputhandler(data);
    } else {
      setPageLoading(false);
      toast.error(response.message);
    }
    setPageLoading(false);
  };
  console.log("pageLoading", pageLoading);
  const uploadInputhandler = (source) => {
    let arr = source;
    arr = arr.map((row, index) => ({
      id: v4(),
      type: row.item_type,
      index: (rowCount?.length ?? 0) + index + 1,
      currency: row.currency,
      exchange_rate: 1,
      component: {
        label: row.item?.text,
        value: row.item?.value,
      },
      qty: row.qty,
      rate: row.rate,
      duedate: row.due_date,
      inrValue: +Number(row.rate) * +Number(row.qty) * +Number(1),
      hsncode: row.hsn,
      gsttype: row.gst_type,
      gstrate: row.gst_rate,
      cgst:
        row.gst_type === "I"
          ? 0
          : (+Number(row.rate) *
              +Number(row.qty) *
              +Number(1) *
              +Number(row.gst_rate)) /
            2 /
            100,
      sgst:
        row.gst_type === "I"
          ? 0
          : (+Number(row.rate) *
              +Number(row.qty) *
              +Number(1) *
              +Number(row.gst_rate)) /
            2 /
            100,
      igst:
        row.gst_type !== "I"
          ? 0
          : (+Number(row.rate) *
              +Number(row.qty) *
              +Number(1) *
              +Number(row.gst_rate)) /
            100,
      remark: row.item_desc,
      unit: row.unit,
    }));

    console.log("after calculation", arr);
    setRowCount((curr) => [...curr, ...arr]);
  };

  useEffect(() => {
    if (showAddVendorModal === true) {
      navigate("/tally/clients/add");
    }
  }, [showAddVendorModal]);
  const removeHtml = (value) => {
    return value.replace(/<[^>]*>/g, " ");
  };
  useEffect(() => {
    if (client) {
      handleFetchClientBranchOptions(client?.value);
    }
  }, [client]);
  useEffect(() => {
    if (clientbranch?.value && client?.value) {
      handleFetchClientBranchDetails("client", clientbranch.value);
    }
  }, [clientbranch]);

  useEffect(() => {
    handleFetchBillingOptions();
    if (orderId) {
      handleFetchOrderDetails(orderId);
    }
  }, []);
  useEffect(() => {
    getState();
  }, []);
  useEffect(() => {
    if (derivedType) {
      setRowCount((curr) =>
        curr.map((row) => ({
          ...row,
          gsttype: derivedType,
        }))
      );
    }
  }, [derivedType]);
  useEffect(() => {
    if (billaddressid) {
      getBillingAddress(billaddressid);
    }
  }, [billaddressid]);

  // useEffect(() => {
  //   if (shipaddressid) {
  //     handleFetchClientBranchDetails("shipaddressid", shipaddressid);
  //   }
  // }, [shipaddressid]);
  useEffect(() => {
    if (copyinfo) {
      let gst = form.getFieldValue("gstin");
      let address = form.getFieldValue("clientaddress");
      let pan = form.getFieldValue("clientPan");

      // console.log("gst", gst, client);
      if (client) {
        // form.setFieldValue("shipPan", details.panNo);
        form.setFieldValue("shipGST", gst);
        form.setFieldValue("shipPan", pan);
        form.setFieldValue("shipaddress", address);
        form.setFieldValue("shipaddressid", client.label);
        form.setFieldValue("shipaddressid", client.label);
      } else {
        toast.info("Please Fill in the client details.");
        // setCopyInfo(false);
      }
    }
  }, [copyinfo]);

  return (
    <div
      style={{
        height: "95%",
      }}
    >
      <Modal
        title="Confirm Reset!"
        open={showDetailsCondirm}
        onCancel={() => setShowDetailsConfirm(false)}
        okText="Yes"
        cancelText="Go Back"
        onOk={() => resetFunction()}
      >
        <p>Are you sure to reset details of this Sales Order?</p>
      </Modal>
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
          {" "}
          <Form
            form={form}
            size="small"
            style={{ height: "90%" }}
            scrollToFirstError={true}
            layout="vertical"
            initialValues={initialValues}
          >
            <Tabs
              style={{
                padding: "0 10px",
                height: "100%",
              }}
              activeKey={activeTab}
              size="small"
            >
              <Tabs.TabPane tab="Sales Order Details" key="1">
                <div
                  style={{
                    height: "100%",
                    overflowY: "scroll",
                    overflowX: "hidden",
                    padding: "0vh 20px",
                    paddingBottom: 50,
                  }}
                >
                  {pageLoading && <Loading />}
                  {/* vendor */}

                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="Client Details">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Type Name or Code of the Client
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>

                    <Col span={20}>
                      {loading("clientLoading") && <Loading />}
                      <Row gutter={16}>
                        {/* vendor type */}
                        {/* <Col span={6}>
                          <Form.Item
                            name="vendortype"
                            label="Client Type"
                            rules={rules.vendortype}
                          >
                           
                            {/* <Input value="Customer" /> */}
                        {/* </Form.Item> */}
                        {/* </Col> */}
                        {/* vendor name */}
                        <Col span={6}>
                          <Form.Item
                            name="client"
                            rules={rules.client}
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
                                Name
                                <span
                                  onClick={() => setShowAddVendorModal(true)}
                                  style={{
                                    color: "#1890FF",
                                    cursor: "pointer",
                                  }}
                                >
                                  Add Client
                                </span>
                              </div>
                            }
                          >
                            <MyAsyncSelect
                              selectLoading={loading("clientSelect")}
                              labelInValue
                              onBlur={() => setAsyncOptions([])}
                              optionsState={asyncOptions}
                              loadOptions={handleFetchClientOptions}
                            />
                          </Form.Item>
                        </Col>
                        {/* venodr branch */}
                        <Col span={6}>
                          <Form.Item
                            name="clientbranch"
                            rules={rules.clientbranch}
                            label={
                              <div
                                style={{
                                  fontSize:
                                    window.innerWidth < 1600 && "0.7rem",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  width: 350,
                                  cursor: "pointer",
                                }}
                              >
                                Branch
                                <span
                                  onClick={() => {
                                    client
                                      ? setShowBranchModal({
                                          name: client?.label,
                                          code: client?.key,
                                        })
                                      : toast.error(
                                          "Please Select a Client first"
                                        );
                                  }}
                                  style={{ color: "#1890FF" }}
                                >
                                  Add Branch
                                </span>
                              </div>
                            }
                          >
                            <MySelect
                              options={clientBranchOptions}
                              labelInValue
                            />
                          </Form.Item>
                        </Col>
                        {/* gstin */}
                        <Col span={6}>
                          <Form.Item name="gstin" label="GSTIN">
                            <Input size="default" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={8}>
                        <Col span={14}>
                          <Form.Item
                            name="clientaddress"
                            label="Billing Address"
                            rules={rules.vendoraddress}
                          >
                            <Input.TextArea
                              rows={4}
                              style={{ resize: "none" }}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Divider />
                  {/* SO TERMS */}
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="SO Terms">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Provide SO terms and other information
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={20}>
                      {loading("termsLoading") && <Loading />}
                      <Row gutter={16}>
                        {/* terms and conditions */}
                        <Col span={6}>
                          <Form.Item
                            name="termscondition"
                            label=" Terms and Conditions"
                            // rules={rules.termscondition}
                          >
                            <Input size="default" />
                          </Form.Item>
                        </Col>
                        {/* quotations */}
                        <Col span={6}>
                          <Form.Item
                            name="quotationdetail"
                            label="Quotation"
                            // rules={[
                            //   {
                            //     required: true,
                            //     message: "Please provide a quotationdetail!",
                            //   },
                            // ]}
                          >
                            <Input size="default" name="quotationdetail" />
                          </Form.Item>
                        </Col>
                        {/* payment terms */}
                        <Col span={6}>
                          <Form.Item
                            name="paymentterms"
                            label=" Payment Terms"
                            // rules={rules.paymentterms}
                          >
                            <Input size="default" />
                          </Form.Item>
                        </Col>

                        {/* po due date*/}
                        <Col span={6}>
                          <Form.Item
                            // rules={[
                            //   {
                            //     required: true,
                            //     message: "Please select Due Date ",
                            //   },
                            // ]}
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
                            // rules={rules.pocostcenter}
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
                              selectLoading={loading("select")}
                              onBlur={() => setAsyncOptions([])}
                              loadOptions={handleFetchCostCentresOptions}
                              optionsState={asyncOptions}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            name="project_name"
                            // rules={rules.project_name}
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
                              selectLoading={loading("select")}
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
                          <Form.Item
                            label="Comments"
                            name="po_comment"
                            // rules={rules.po_comment}
                          >
                            <Input size="defautl" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  <Divider />
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="Dispatch from">
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
                      {loading("dispatchLoading") && <Loading />}
                      <Row gutter={16}>
                        {/* billing id */}
                        <Col span={6}>
                          <Form.Item
                            name="billaddressid"
                            label="Billing Name"
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
                              // value={newPurchaseOrder.billPan}
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
                              // value={newPurchaseOrder.billGST}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      {/* billing address */}
                      <Row>
                        <Col span={14}>
                          <Form.Item
                            name="billaddress"
                            label="Bill From Address"
                            rules={rules.billaddress}
                          >
                            <Input.TextArea
                              style={{ resize: "none" }}
                              rows={4}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Divider />
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="Ship To">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Provide shipping information
                        </Descriptions.Item>
                      </Descriptions>{" "}
                      <Switch disabled={!client} onChange={toggleInputType} />
                    </Col>

                    <Col span={20}>
                      {loading("clientLoading") && <Loading />}
                      <Row gutter={16}>
                        {/* shipping id */}
                        <Col span={6}>
                          <Form.Item
                            name="shipaddressid"
                            label="Name"
                            rules={rules.shipaddressid}
                          >
                            {/* <MySelect
                              // options={shipToOptions}
                              options={clientBranchOptions}
                            /> */}
                            <Input size="default" />
                          </Form.Item>
                        </Col>
                        {/* pan number */}
                        <Col span={6}>
                          <Form.Item
                            label="Pan No."
                            name="shipPan"
                            // rules={rules.shipPan}
                          >
                            <Input
                              size="default"
                              // value={newPurchaseOrder.shipPan}
                            />
                          </Form.Item>
                        </Col>
                        {/* gstin uin */}
                        <Col span={6}>
                          <Form.Item
                            name="shipGST"
                            label=" GSTIN / UIN"
                            // rules={rules.shipGST}
                          >
                            <Input
                              size="default"
                              // value={newPurchaseOrder.shipGST}
                            />
                          </Form.Item>
                        </Col>
                        {copyinfo == false && (
                          <Col span={6}>
                            <Form.Item
                              name="shippingstate"
                              label="State"
                              // rules={rules.shipGST}
                            >
                              <MySelect
                                // selectLoading={loading("clientSelect")}
                                labelInValue
                                onBlur={() => setStateOptions([])}
                                options={stateOptions}
                                // loadOptions={getState}
                              />
                            </Form.Item>
                          </Col>
                        )}
                      </Row>
                      {/* shipping address */}
                      <Row>
                        <Col span={14}>
                          <Form.Item
                            label="Address"
                            name="shipaddress"
                            rules={rules.shipaddress}
                          >
                            <Input.TextArea
                              style={{ resize: "none" }}
                              rows={4}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <NavFooter
                      submithtmlType="submit"
                      submitButton={true}
                      formName="create-po"
                      submitFunction={nextFun}
                      resetFunction={() => setShowDetailsConfirm(true)}
                    />
                  </Row>

                  <Divider />
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane
                tab="Add Products"
                style={{ height: "100%" }}
                key="2"
              >
                <div style={{ height: "100%" }}>
                  <AddComponent
                    // newPurchaseOrder={newPurchaseOrder}
                    setTotalValues={setTotalValues}
                    setRowCount={setRowCount}
                    rowCount={rowCount}
                    setActiveTab={setActiveTab}
                    resetFunction={resetFunction}
                    submitHandler={validateSales}
                    //  setSelectLoading(false);
                    submitLoading={loading("submit")}
                    selectLoading={selectLoading}
                    // submitLoading={submitLoading}
                    totalValues={totalValues}
                    form={form}
                    iscomponents={iscomponents}
                    setConfirmSubmit={setConfirmSubmit}
                    confirmSubmit={confirmSubmit}
                    fileupload={fileupload}
                    setFileUpload={setFileUpload}
                    callFileUpload={callFileUpload}
                    setUploadFile={setUploadFile}
                    uploadfile={uploadfile}
                    dispatchStateCode={dispatchStateCode}
                    derivedType={derivedType}
                    resetFunction2={resetFunction2}
                    confirmReset={confirmReset}
                    setConfirmReset={setConfirmReset}
                    setPageLoading={setPageLoading}
                    pageLoading={pageLoading}
                  />
                </div>
              </Tabs.TabPane>
            </Tabs>
          </Form>
        </div>
      )}
      <ClientBranchAdd
        setBranchAddOpen={setShowBranchModal}
        branchAddOpen={showBranchModal}
      />

      {successData && (
        <SuccessPage
          resetFunction={resetFunction}
          po={successData}
          setNewPO={setNewPO}
        />
      )}
    </div>
  );
};

export default SalesOrderForm;

const rules = {
  pocreatetype: [
    {
      required: true,
      message: "Please Select a PO Type!",
    },
  ],
  po_comment: [
    {
      required: true,
      message: "Please provide a comment!",
    },
  ],
  paymentterms: [
    {
      required: true,
      message: "Please provide a paymentterms!",
    },
  ],
  paymenttermsday: [
    {
      required: true,
      message: "Please provide a Due Date!",
    },
  ],
  quotation: [
    {
      required: true,
      message: "Please provide a quotationdetail!",
    },
  ],
  termscondition: [
    {
      required: true,
      message: "Please provide terms and conditons!",
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
  client: [
    {
      required: true,
      message: "Please Select a client Name!",
    },
  ],
  clientbranch: [
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

const initialValues = {
  pocreatetype: "component",
  vendorname: "",
  vendortype: "c01",
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
  original_po: "",
};

const vendorDetailsOptions = [{ text: "Customer", value: "c01" }];
