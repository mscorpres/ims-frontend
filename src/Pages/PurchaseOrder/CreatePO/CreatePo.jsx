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
import { Col, Descriptions, Divider, Form, Input, Row, Tabs, Modal, Button, InputNumber, Radio,Checkbox } from "antd";
import TextArea from "antd/lib/input/TextArea";
import Loading from "../../../Components/Loading";
import SuccessPage from "./SuccessPage";
import { imsAxios } from "../../../axiosInterceptor";
import AddProjectModal from "./AddProjectModal";
import useApi from "../../../hooks/useApi.ts";
import { getCostCentresOptions, getProjectOptions, getVendorOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";

const deliveryTermOptions = [
  { label: "Within 10 days", value: "Within 10 days" },
  { label: "Within 15 days", value: "Within 15 days" },
  { label: "Within 30 days", value: "Within 30 days" },
  { label: "Other", value: "Other" },
];

const paymentTermOptions = [
  { label: "Within 7 days", value: "Within 7 days" },
  { label: "Within 15 days", value: "Within 15 days" },
  { label: "Within 30 days", value: "Within 30 days" },
  { label: "Within 45 days", value: "Within 45 days" },
  { label: "Within 60 days", value: "Within 60 days" },
  { label: "Other", value: "Other" },
];

export default function CreatePo() {
  const [totalValues, setTotalValues] = useState([]);
  const [newPurchaseOrder, setnewPurchaseOrder] = useState({
    termscondition: "",
    customDeliveryTerm: "",
    paymentterms: "",
    advancePercentage: null,
    advancePayment: 0,
    vendorname: "",
    vendortype: "v01",
    vendorbranch: "",
    vendoraddress: "",
    billaddressid: "",
    billaddress: "",
    billPan: "",
    billGST: "",
    billCode: "",
    venCode: "",
    shipaddressid: "",
    shipaddress: "",
    shipPan: "",
    shipGST: "",
    quotationdetail: "",
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
  const [userOptions, setUserOptions] = useState([]);
  const [successData, setSuccessData] = useState(false);
  const [projectDesc, setProjectDesc] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [form] = Form.useForm();
  // Move Form.useWatch calls to top level to avoid hooks violation
  const termsCondition = Form.useWatch("termscondition", form);
  const advancePayment = Form.useWatch("advancePayment", form);
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
      pocostcenter: typeof newPurchaseOrder.pocostcenter === "object" ? newPurchaseOrder.pocostcenter.value : newPurchaseOrder.pocostcenter,
      pocreatetype: newPurchaseOrder.pocreatetype,
      shipaddressid: newPurchaseOrder.shipaddressid,
      vendorbranch: newPurchaseOrder.vendorbranch,
      vendorname: newPurchaseOrder.vendorname.value,
      vendortype: newPurchaseOrder.vendortype,
      pocomment: newPurchaseOrder.po_comment,
      poproject_name: newPurchaseOrder.project_name,
      paymenttermsday: newPurchaseOrder.paymenttermsday ? (newPurchaseOrder.paymenttermsday === "" ? 30 : newPurchaseOrder.paymenttermsday) : 30,
      paymentterms: (() => {
        if (newPurchaseOrder.paymentterms === "Other" && newPurchaseOrder.customPaymentTerm?.trim()) {
          return newPurchaseOrder.customPaymentTerm.trim();
        } else if (newPurchaseOrder.paymentterms && newPurchaseOrder.paymentterms !== "Other") {
          return newPurchaseOrder.paymentterms;
        } else {
          return "As per standard terms";
        }
      })(),
      po_raise_by: newPurchaseOrder.raisedBy,
      advancePayment: newPurchaseOrder.advancePayment,
      termscondition: newPurchaseOrder.termscondition === "Other" ? newPurchaseOrder.customDeliveryTerm : newPurchaseOrder.termscondition,
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
    } else if (newPurchaseOrder.pocreatetype == "S" && !newPurchaseOrder.original_po) {
      return toast.error("Please select a PO ID in case of supplementry PO");
    }
    if (newPurchaseOrder.termscondition === "Other" && !newPurchaseOrder.customDeliveryTerm?.trim()) {
      toast.error("Please enter custom delivery term when 'Other' is selected");
      return;
    }

    if (newPurchaseOrder.paymentterms === "Advance Payment" && !newPurchaseOrder.advancePercentage) {
      toast.error("Please enter advance payment percentage");
      return;
    }

    rowCount.map((count) => {
      if (count.currency == "" || count.exchange == 0 || count.component == "" || count.qty == 0 || count.rate == "") {
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
      try {
        const response = await imsAxios.post("/purchaseOrder/createPO", {
          ...showSubmitConfirm,
        });

        setSubmitLoading(false);
        const responseData = response?.data || response;
        if (responseData) {
          setShowSubmitConfirm(null);
          if (responseData.code == 200) {
            resetFunction();
            rowsReset();
            setActiveTab("1");
            setSuccessData({
              vendorName: newPurchaseOrder.vendorname.label,
              project: newPurchaseOrder.project_name,
              poId: responseData.data?.po_id,
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
            // Handle error message - can be string or object with msg property
            const errorMessage = typeof responseData.message === "string" ? responseData.message : responseData.message?.msg || "An error occurred";
            toast.error(errorMessage);
          }
        }
      } catch (error) {
        setSubmitLoading(false);
        // Handle error response - message can be string or object
        const errorMessage = error?.response?.data?.message
          ? typeof error.response.data.message === "string"
            ? error.response.data.message
            : error.response.data.message?.msg || "An error occurred"
          : error?.message || "Failed to create PO";
        toast.error(errorMessage);
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
    if (!value) return;

    if (name === "vendorname") {
      const branches = await getVendorBracnch(value.value);
      const { address, gstin, statecode } = await getVendorAddress({
        vendorCode: value,
        vendorBranch: branches[0]?.value,
      });
      const termsData = await getPaymentTermsDay(value.value);

      const updated = {
        vendorname: value,
        vendorbranch: branches[0]?.value || "",
        vendoraddress: address?.replaceAll("<br>", "\n") || "",
        gstin: gstin || "",
        venCode: statecode || "",
        paymenttermsday: termsData?.paymentterms || 30,
        paymentterms: termsData?.po_payment_terms || "",
        msmeType: termsData?.msme_data?.msme_type || "",
        msmeId: termsData?.msme_data?.msme_id || "",
      };

      form.setFieldsValue(updated);
      setnewPurchaseOrder((prev) => ({ ...prev, ...updated }));
    } else if (name === "vendorbranch") {
      const { address, gstin, statecode } = await getVendorAddress({
        vendorCode: newPurchaseOrder.vendorname,
        vendorBranch: value,
      });

      const updated = {
        vendorbranch: value,
        vendoraddress: address?.replaceAll("<br>", "\n") || "",
        gstin: gstin || "",
        venCode: statecode || "",
      };

      form.setFieldsValue(updated);
      setnewPurchaseOrder((prev) => ({ ...prev, ...updated }));
    } else if (name === "billaddressid") {
      const billingDetails = await getBillingAddress(value);

      form.setFieldsValue({
        billaddressid: value,
        billaddress: billingDetails.address?.replaceAll("<br>", "\n") || "",
        billPan: billingDetails.pan || "",
        billGST: billingDetails.gstin || "",
        billCode: billingDetails.code || "",
      });

      setnewPurchaseOrder((prev) => ({
        ...prev,
        billaddressid: value,
        billaddress: billingDetails.address?.replaceAll("<br>", "\n") || "",
        billPan: billingDetails.pan || "",
        billGST: billingDetails.gstin || "",
        billCode: billingDetails.code || "",
      }));
    } else if (name === "shipaddressid") {
      // If "other" is selected, clear the fields and make them editable
      if (value === "other") {
        form.setFieldsValue({
          shipaddressid: value,
          shipaddress: "",
          shipPan: "",
          shipGST: "",
        });

        setnewPurchaseOrder((prev) => ({
          ...prev,
          shipaddressid: value,
          shipaddress: "",
          shipPan: "",
          shipGST: "",
        }));
        // Uncheck the checkbox when "other" is selected
        setSameAsBilling(false);
      } else if (sameAsBilling) {
        // If checkbox is checked, don't fetch shipping details, use billing details instead
        form.setFieldsValue({
          shipaddressid: value,
          shipaddress: newPurchaseOrder.billaddress,
          shipPan: newPurchaseOrder.billPan,
          shipGST: newPurchaseOrder.billGST,
        });

        setnewPurchaseOrder((prev) => ({
          ...prev,
          shipaddressid: value,
          shipaddress: prev.billaddress,
          shipPan: prev.billPan,
          shipGST: prev.billGST,
        }));
      } else {
        const shippingDetails = await getShippingAddress(value);

      form.setFieldsValue({
        shipaddressid: value,
        shipaddress: shippingDetails.address?.replaceAll("<br>", "\n") || "",
        shipPan: shippingDetails.pan || "",
        shipGST: shippingDetails.gstin || "",
      });

      setStateCode(shippingDetails.statecode || "");

      setnewPurchaseOrder((prev) => ({
        ...prev,
        shipaddressid: value,
        shipaddress: shippingDetails.address?.replaceAll("<br>", "\n") || "",
        shipPan: shippingDetails.pan || "",
        shipGST: shippingDetails.gstin || "",
      }));
    }
    } else {
      form.setFieldsValue({ [name]: value });
      setnewPurchaseOrder((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSameAsBilling = (checked) => {
    setSameAsBilling(checked);
    if (checked) {
      // Copy billing details to shipping details
      form.setFieldsValue({
        shipaddressid: newPurchaseOrder.billaddressid,
        shipaddress: newPurchaseOrder.billaddress,
        shipPan: newPurchaseOrder.billPan,
        shipGST: newPurchaseOrder.billGST,
      });

      setnewPurchaseOrder((prev) => ({
        ...prev,
        shipaddressid: prev.billaddressid,
        shipaddress: prev.billaddress,
        shipPan: prev.billPan,
        shipGST: prev.billGST,
      }));
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
        setUserOptions(arr);
      } else {
        setUserOptions([]);
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
    return { address: data?.data?.address, gstin: data?.data.gstid, statecode: data?.data.state };
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

    // Auto-select the first option (0th index) if options are available and not already selected
    if (arr.length > 0 && !newPurchaseOrder.billaddressid) {
      const firstOption = arr[0].value;
      // Use selectInputHandler to populate billing details
      await selectInputHandler("billaddressid", firstOption);
    }
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
    // Add "other" option to the shipping options
    arr.push({ text: "Other", value: "other" });
    setShipToOptions(arr);
  };
  const handleFetchCostCenterOptions = async (search) => {
    const response = await executeFun(() => getCostCentresOptions(search), "select");
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
      code: data.data?.statecode,
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
      // termscondition: "",
      quotationdetail: "",
      pocostcenter: "",
      po_comment: "",
      project_name: "",
      pocreatetype: "N",
      original_po: "",
      termscondition: "",
      customDeliveryTerm: "",
      paymentterms: "",
      advancePayment: 0,
      advancePercentage: null,
    };

    // form.reset
    // form.resetFields();
    form.setFieldsValue(obj);
    setnewPurchaseOrder(obj);
    form.setFieldValue("advancePayment", "");
    setSameAsBilling(false);
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
    const response = await executeFun(() => getProjectOptions(search), "select");
    setAsyncOptions(response.data);
  };
  const handleProjectChange = async (value) => {
    const projectValue = typeof value === "object" ? value : { value: value, label: value };
    setnewPurchaseOrder((prev) => ({
      ...prev,
      project_name: projectValue,
    }));

    setPageLoading(true);
    const response = await imsAxios.post("/backend/projectDescription", {
      project_name: typeof value === "object" ? value.value : value,
    });
    setPageLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        setProjectDesc(data.data.description);

        await handleProjectCostCenter(typeof value === "object" ? value.value : value);
      } else {
        toast.error(data.message.msg);
      }
    }
  };

  const handleProjectCostCenter = async (projectName) => {
    setPageLoading(true);
    try {
      const response = await imsAxios.post("/purchaseOrder/costCenter", {
        project_name: projectName,
      });
      setPageLoading(false);
      const responseData = response?.success !== undefined ? response : response?.data || response;

      if (responseData && responseData.success && responseData.data && Array.isArray(responseData.data) && responseData.data.length > 0) {
        const costCenterData = responseData.data[0];
        const costCenterOption = {
          value: costCenterData.id,
          label: costCenterData.text,
        };

        form.setFieldsValue({ pocostcenter: costCenterOption });
        const updatedPO = { ...newPurchaseOrder, pocostcenter: costCenterOption };
        setnewPurchaseOrder(updatedPO);
      } else {
        toast.error(data?.message?.msg || "Failed to fetch cost center");
      }
    } catch (error) {
      setPageLoading(false);
      toast.error("Error fetching project cost center");
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

  // Sync shipping details when billing address ID changes and checkbox is checked
  useEffect(() => {
    if (sameAsBilling && newPurchaseOrder.billaddressid) {
      form.setFieldsValue({
        shipaddressid: newPurchaseOrder.billaddressid,
        shipaddress: newPurchaseOrder.billaddress,
        shipPan: newPurchaseOrder.billPan,
        shipGST: newPurchaseOrder.billGST,
      });

      setnewPurchaseOrder((prev) => ({
        ...prev,
        shipaddressid: prev.billaddressid,
        shipaddress: prev.billaddress,
        shipPan: prev.billPan,
        shipGST: prev.billGST,
      }));
    }
  }, [sameAsBilling, newPurchaseOrder.billaddressid]);
  const finish = (values) => {
    setnewPurchaseOrder((prev) => ({
      ...prev,
      ...values,
      project_name: prev.project_name || values.project_name,
      pocostcenter: prev.pocostcenter || values.pocostcenter,
    }));
    setActiveTab("2");
  };
  return (
    <div
      style={{
        height: "85%",
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
          <Button key="submit" type="primary" loading={submitLoading} onClick={submitHandler}>
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
      <AddVendorSideBar open={showAddVendorModal} setOpen={setShowAddVendorModal} />
      <AddBranch getVendorBracnch={getVendorBracnch} setOpenBranch={setShowBranchModal} openBranch={showBranchModel} />
      <CreateCostModal showAddCostModal={showAddCostModal} setShowAddCostModal={setShowAddCostModal} />
      <AddProjectModal showAddProjectConfirm={showAddProjectConfirm} setShowAddProjectConfirm={setShowAddProjectConfirm} />
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
                          <Form.Item name="pocreatetype" label="PO Type" rules={rules.pocreatetype}>
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
                                    fontSize: window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Original PO
                                </span>
                              }
                              rules={rules.original_po}
                            >
                              <MyAsyncSelect selectLoading={selectLoading} size="default" onBlur={() => setAsyncOptions([])} loadOptions={getPOs} optionsState={asyncOptions} />
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
                                  fontSize: window.innerWidth < 1600 && "0.7rem",
                                }}
                              >
                                Vendor Type
                              </span>
                            }
                            rules={rules.vendortype}
                          >
                            <MySelect size="default" options={vendorDetailsOptions} />
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
                                  fontSize: window.innerWidth < 1600 && "0.7rem",
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
                            <MyAsyncSelect selectLoading={loading1("select")} size="default" labelInValue onBlur={() => setAsyncOptions([])} optionsState={asyncOptions} loadOptions={getVendors} />
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
                                  fontSize: window.innerWidth < 1600 && "0.7rem",
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
                                          vendor_code: newPurchaseOrder.vendorname.value,
                                        })
                                      : toast.error("Please Select a vendor first");
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
                          <Form.Item name="vendoraddress" label="Bill From Address" rules={rules.vendoraddress}>
                            <TextArea
                              value={newPurchaseOrder.vendoraddress}
                              rows={4}
                              style={{
                                resize: "none",
                                backgroundColor: "#ffffff",
                                color: "#1f1f1f",
                                fontWeight: 600,
                                fontSize: "14px",
                                lineHeight: "1.6",
                                opacity: 1,
                                border: "1px solid #d9d9d9",
                                borderRadius: "6px",
                                padding: "12px 16px",
                                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
                              }}
                              disabled
                            />
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
                          <Form.Item name="termscondition" label="Delivery Terms">
                            <MySelect
                              options={deliveryTermOptions}
                              onChange={(value) => {
                                if (value !== "Other") {
                                  form.setFieldsValue({ customDeliveryTerm: "" });
                                }
                              }}
                            />
                          </Form.Item>
                          <Form.Item noStyle>
                            {termsCondition === "Other" && (
                              <Form.Item name="customDeliveryTerm" style={{ marginTop: 8 }}>
                                <Input placeholder="Enter custom delivery term" />
                              </Form.Item>
                            )}
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
                          <Form.Item name="paymentterms" label="Payment Terms">
                            <MySelect
                              options={paymentTermOptions}
                              onChange={(value) => {
                                // Agar "Other" nahi select kiya to custom field clear kar do
                                if (value !== "Other") {
                                  form.setFieldsValue({
                                    customPaymentTerm: "",
                                  });
                                  setnewPurchaseOrder((prev) => ({ ...prev, customPaymentTerm: "" }));
                                }
                              }}
                            />
                          </Form.Item>
                          {form.getFieldValue("paymentterms") === "Other" && (
                            <Form.Item name="customPaymentTerm" rules={[{ required: true, message: "Please enter payment terms" }]} style={{ marginTop: 8 }}>
                              <Input.TextArea
                                rows={2}
                                placeholder="e.g. 30% Advance, balance against delivery"
                                onChange={(e) => {
                                  setnewPurchaseOrder((prev) => ({ ...prev, customPaymentTerm: e.target.value }));
                                }}
                              />
                            </Form.Item>
                          )}
                        </Col>

                        {/* po due date*/}
                        {/* <Col span={6}>
                          <Form.Item label="Due Date (in days)" name="paymenttermsday">
                            <InputNumber style={{ width: "100%" }} size="default" min={1} max={999} />
                          </Form.Item>
                        </Col> */}

                        
                      </Row>
                      <Row gutter={16} style={{marginTop: 16}}>
                        <Col span={5}>
                          <Form.Item label="Advance Payment" name="advancePayment">
                            <Radio.Group
                              onChange={(e) => {
                                const isYes = e.target.value === 1;
                                if (!isYes) {
                                  form.setFieldsValue({ advancePercentage: null });
                                  setnewPurchaseOrder((prev) => ({ ...prev, advancePercentage: null }));
                                }

                                // Auto-fill "Other" input agar Advance = Yes aur "Other" selected hai
                                if (isYes && form.getFieldValue("paymentterms") === "Other") {
                                  const percent = form.getFieldValue("advancePercentage") || "";
                                  const currentText = form.getFieldValue("customPaymentTerm") || "";
                                  let newText = "";

                                  if (percent) {
                                    // Agar pehle se "XX% Advance" likha hai to update karo, warna add karo
                                    if (currentText.includes("% Advance")) {
                                      newText = currentText.replace(/\d+% Advance/, `${percent}% Advance`);
                                    } else {
                                      newText = currentText ? `${percent}% Advance, ${currentText}` : `${percent}% Advance`;
                                    }
                                  } else {
                                    newText = currentText;
                                  }

                                  form.setFieldsValue({ customPaymentTerm: newText });
                                  setnewPurchaseOrder((prev) => ({ ...prev, customPaymentTerm: newText }));
                                }
                              }}
                            >
                              <Radio value={1}>Yes</Radio>
                              <Radio value={0}>No</Radio>
                            </Radio.Group>
                          </Form.Item>
                        </Col>
                        {/* Advance Percentage Input */}
                        <Col span={3}>
                          <Form.Item noStyle>
                            {advancePayment === 1 && (
                              <Form.Item name="advancePercentage" label="Advance %" rules={[{ required: true, message: "Enter %" }]}>
                                <InputNumber
                                  min={1}
                                  max={100}
                                  formatter={(v) => `${v}%`}
                                  parser={(v) => v.replace("%", "")}
                                  style={{ width: "100%" }}
                                  onChange={(value) => {
                                    // Jab bhi % change ho aur "Other" selected ho → auto update text
                                    if (form.getFieldValue("paymentterms") === "Other") {
                                      const currentText = form.getFieldValue("customPaymentTerm") || "";
                                      let newText = "";

                                      if (value) {
                                        if (currentText.includes("% Advance")) {
                                          newText = currentText.replace(/\d+% Advance/, `${value}% Advance`);
                                        } else {
                                          newText = currentText ? `${value}% Advance, ${currentText}` : `${value}% Advance`;
                                        }
                                      } else {
                                        newText = currentText.replace(/\d+% Advance,?\s*/, "").trim();
                                      }

                                      form.setFieldsValue({ customPaymentTerm: newText });
                                      setnewPurchaseOrder((prev) => ({ ...prev, customPaymentTerm: newText }));
                                    }
                                  }}
                                />
                              </Form.Item>
                            )}
                          </Form.Item>
                        </Col>

                      </Row>
                      <Row gutter={16} style={{ marginTop: 16 }}>

                        
                        {/* project id */}

                        <Col span={5}>
                          <Form.Item
                            name="project_name"
                            rules={rules.project_name}
                            label={
                              <div
                                style={{
                                  fontSize: window.innerWidth < 1600 && "0.7rem",
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
                            <Input size="default" disabled value={projectDesc} />
                          </Form.Item>
                        </Col>
                        {/* cost center */}
                        <Col span={4}>
                          <Form.Item
                            name="pocostcenter"
                            rules={rules.pocostcenter}
                            label={
                              <div
                                style={{
                                  fontSize: window.innerWidth < 1600 && "0.7rem",
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
                            <MyAsyncSelect selectLoading={loading1("select")} onBlur={() => setAsyncOptions([])} loadOptions={handleFetchCostCenterOptions} optionsState={asyncOptions} />
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
                          <Form.Item label="Requested By" name="raisedBy" rules={rules.raisedBy}>
                            <MyAsyncSelect
                              selectLoading={selectLoading}
                              size="default"
                              onBlur={() => setUserOptions([])}
                              optionsState={userOptions}
                              loadOptions={getusers}
                              onChange={(value) => selectInputHandler("raisedBy", value)}
                            />
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
                          <Form.Item name="billaddressid" label="Billing Id" rules={rules.billaddressid}>
                            <MySelect options={billToOptions} />
                          </Form.Item>
                        </Col>
                        {/* pan number */}
                        <Col span={6}>
                          <Form.Item name="billPan" label="Pan No." rules={rules.billPan}>
                            <Input size="default" value={newPurchaseOrder.billPan} disabled />
                          </Form.Item>
                        </Col>
                        {/* gstin uin */}
                        <Col span={6}>
                          <Form.Item name="billGST" label="GSTIN / UIN" rules={rules.billGST}>
                            <Input size="default" value={newPurchaseOrder.billGST} disabled />
                          </Form.Item>
                        </Col>
                      </Row>
                      {/* billing address */}
                      <Row>
                        <Col span={18}>
                          <Form.Item name="billaddress" label="Billing Address" rules={rules.billaddress}>
                            <TextArea
                              value={newPurchaseOrder.billaddress}
                              disabled
                              rows={5}
                              style={{
                                resize: "none",
                                backgroundColor: "#ffffff",
                                color: "#1f1f1f",
                                fontWeight: 600,
                                fontSize: "14px",
                                lineHeight: "1.6",
                                opacity: 1,
                                border: "1px solid #d9d9d9",
                                borderRadius: "6px",
                                padding: "12px 16px",
                                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
                              }}
                              className="bold-disabled-textarea"
                            />
                          </Form.Item>
                        </Col>
                        
                      </Row>
                      <Col span={6}>
                          <Form.Item label=" " style={{ marginTop: "10px" }}>
                            <Checkbox
                              checked={sameAsBilling}
                              onChange={(e) =>
                                handleSameAsBilling(e.target.checked)
                              }
                            >
                              Same as Billing Address
                            </Checkbox>
                          </Form.Item>
                        </Col>
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
                            <MySelect
                              options={shipToOptions}
                              disabled={sameAsBilling}
                            />
                          </Form.Item>
                        </Col>
                        {/* same as billing checkbox */}
                       
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
                              disabled={
                                sameAsBilling ||
                                newPurchaseOrder.shipaddressid !== "other"
                              }
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
                              disabled={
                                sameAsBilling ||
                                newPurchaseOrder.shipaddressid !== "other"
                              }
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      {/* shipping address */}
                      <Row>
                        <Col span={18}>
                          <Form.Item label="Shipping Address" name="shipaddress" rules={rules.shipaddress}>
                            <TextArea
                              value={newPurchaseOrder.shipaddress}
                              disabled={
                                sameAsBilling ||
                                newPurchaseOrder.shipaddressid !== "other"
                              }
                              rows={5}
                              style={{
                                resize: "none",
                                backgroundColor: "#ffffff",
                                color: "#1f1f1f",
                                fontWeight: 600,
                                fontSize: "14px",
                                lineHeight: "1.6",
                                opacity: 1,
                                border: "1px solid #d9d9d9",
                                borderRadius: "6px",
                                padding: "12px 16px",
                                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
                              }}
                              className="bold-disabled-textarea"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <NavFooter submithtmlType="submit" submitButton={true} formName="create-po" resetFunction={() => setShowDetailsConfirm(true)} />
                  </Row>
                </Form>
                <Divider />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab="Add Components Details" style={{ height: "98%" }} key="2">
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
                  gstState={newPurchaseOrder.billCode == newPurchaseOrder.venCode ? "L" : "I"}
                />
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      )}
      {successData && <SuccessPage resetFunction={resetFunction} po={successData} setNewPO={setNewPO} />}
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
