import React, { useState, useEffect } from "react";
import NavFooter from "../../../../Components/NavFooter";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Tabs,
  Typography,
} from "antd";

import UploadDocs from "../MaterialInWithPO/UploadDocs";
import Loading from "../../../../Components/Loading";
import { v4 } from "uuid";

import MySelect from "../../../../Components/MySelect";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import CurrenceModal from "../../../../Components/CurrenceModal";
import AddVendorSideBar from "../../../PurchaseOrder/CreatePO/AddVendorSideBar";
import AddBranch from "../../../Master/Vendor/model/AddBranch";
import SuccessPage from "../SuccessPage";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../../axiosInterceptor";
import useApi from "../../../../hooks/useApi";
import {
  getComponentDetail,
  getComponentOptions,
  getCostCentresOptions,
  getProjectOptions,
  getVendorOptions,
} from "../../../../api/general";
import { convertSelectOptions, getInt } from "../../../../utils/general";
import FormTable2 from "../../../../Components/FormTable2";

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
      gstType: "L",
      location: "",
      autoConsumption: 0,
      currency: "364907247",
      exchangeRate: 1,
    },
  ],
};

export default function MaterialInWithoutPO() {
  const [showCurrency, setShowCurrenncy] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(null);
  const [autoConsumptionOptions, setAutoConsumptionOption] = useState([]);

  const [totalValues, setTotalValues] = useState([
    { label: "cgst", sign: "+", values: [] },
    { label: "sgst", sign: "+", values: [] },
    { label: "cigst", sign: "+", values: [] },
    { label: "Sub-Total value before Taxes", sign: "", values: [] },
  ]);
  const [currencies, setCurrencies] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const [vendorBranchOptions, setVendorBranchOptions] = useState([]);
  const [materialInward, setMaterialInward] = useState([
    {
      id: v4(),
      component: "",
      orderqty: 0,
      orderrate: 0, //will come from backend on co mponent selection
      currency: "364907247", //will be default at fiest, check
      gstrate: 0,
      unitsname: "--",
      gsttype: "L",
      hsncode: "",
      inrValue: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      invoiceDate: "",
      invoiceId: "",
      location: "",
      // location: "20210910142629",
      exchange_rate: 0,
      orderremark: "",
      locationName: "",
      autoConsumption: 0,
    },
  ]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [vendorSectionLoading, setVendorSectionLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [form] = Form.useForm();
  const components = Form.useWatch("components", form);
  const { executeFun, loading } = useApi();
  const costCenter = Form.useWatch("costCenter", form);
  const vendorDetailsOptions = [
    { text: "JWI (Job Work In)", value: "j01" },
    { text: "Vendor", value: "v01" },
    { text: "Production Return", value: "p01" },
  ];
  // const addRow = () => {
  //   let arr = materialInward;
  //   let newRow = {
  //     id: v4(),
  //     component: "",
  //     orderqty: 0,
  //     orderrate: 0, //will come from backend on co mponent selection
  //     currency: materialInward[0].currency, //will be default at fiest, check
  //     gstrate: 0,
  //     unitsname: "--",
  //     gsttype: "L",
  //     hsn: "",
  //     inrValue: 0,
  //     cgst: 0,
  //     sgst: 0,
  //     igst: 0,
  //     invoiceDate: "",
  //     invoiceId: "",
  //     location: "",
  //     exchange_rate: 0,
  //     orderremark: "",
  //     locationName: "",
  //     autoConsumption: 0,
  //   };
  //   arr = [newRow, ...arr];
  //   setMaterialInward(arr);
  // };
  // const removeRow = (id) => {
  //   let arr = materialInward;
  //   arr = arr.filter((row) => row.id != id);
  //   setMaterialInward(arr);
  // };
  const validataData = async () => {
    const values = await form.getFieldsValue();
    console.log("these are the values", values);
    if (vendorDetails.vendorType == "") {
      return toast.error("Please select a vendor type");
    } else if (
      vendorDetails.vendorType != "p01" &&
      vendorDetails.vendorName == ""
    ) {
      return toast.error("Please select a vendor");
    } else if (
      vendorDetails.vendorType != "p01" &&
      vendorDetails.vendorBranch == ""
    ) {
      toast.error("Please select a branch of vendor");
    } else if (
      form.getFieldValue("vendorType") == "j01" &&
      !form.getFieldValue("ewaybill")
    ) {
      return toast.error("Please enter a e-way bill number");
    } else if (
      form.getFieldValue("vendorType") == "j01" &&
      form.getFieldValue("ewaybill").length < 12
    ) {
      return toast.error("Please enter a valid e-way bill number");
    }

    let validation = false;
    materialInward.map((row) => {
      if (row.component && row.invoiceId && row.location && row.orderqty) {
        validation = true;
      } else {
        validation = false;
      }
    });
    let componentData = {
      qty: [],
      rate: [],
      currency: [],
      exchange: [],
      invoice: [],
      invoiceDate: [],
      hsncode: [],
      gsttype: [],
      gstrate: [],
      cgst: [],
      sgst: [],
      igst: [],
      remark: [],
      location: [],
      out_location: [],
      component: [],
    };
    if (validation == true) {
      let formData = new FormData();
      if (invoices?.length) {
        invoices?.map((file) => {
          formData.append("files", file);
        });
      } else if (
        !invoices.length &&
        form.getFieldValue("vendorType") == "v01"
      ) {
        return toast.error("Please add at least one file");
      }
      materialInward.map((row) => {
        componentData = {
          component: [...componentData.component, row.component.value],
          qty: [...componentData.qty, row.orderqty],
          rate: [...componentData.rate, row.orderrate],
          currency: [...componentData.currency, row.currency],
          exchange: [...componentData.exchange, row.exchange_rate],
          invoice: [...componentData.invoice, row.invoiceId],
          invoiceDate: [...componentData.invoiceDate, row.invoiceDate ?? ""],
          hsncode: [...componentData.hsncode, row.hsncode ?? ""],
          gsttype: [...componentData.gsttype, row.gsttype],
          gstrate: [...componentData.gstrate, row.gstrate],
          cgst: [...componentData.cgst, row.cgst],
          sgst: [...componentData.sgst, row.sgst],
          igst: [...componentData.igst, row.igst],
          remark: [...componentData.remark, row.orderremark],
          location: [...componentData.location, row.location],
          out_location: [...componentData.out_location, row.autoConsumption],
        };
      });
      if (
        (componentData.currency.filter((v, i, a) => v === a[0]).length ===
          componentData.currency.length) !=
        true
      ) {
        validation = false;
        return toast.error("Currency of all components should be the same");
      } else if (
        (componentData.gsttype.filter((v, i, a) => v === a[0]).length ===
          componentData.gsttype.length) !=
        true
      ) {
        validation = false;
        return toast.error("gst type of all components should be the same");
      }
      // here submit

      Modal.confirm({
        title: "Are you sure you want to submt this MIN",
        // icon: <ExclamationCircleFilled />,
        content: "",
        onOk() {
          validateInvoices({
            formData: formData,
            componentData: componentData,
          });
        },
      });
    } else {
      toast.error("Please Provide all the values");
    }
  };
  const submitMIN = async () => {
    // let fileData;
    // axiosResponseFunction(async () => {
    //   if (invoices?.length) {
    //     setSubmitLoading(true);
    //     const { data: uploadedFile } = await imsAxios.post(
    //       "/transaction/upload-invoice",
    //       values.formData
    //     );
    //     fileData = uploadedFile;
    //     // form.getFieldValue("vendorType")
    //     if (fileData.code != 200) {
    //       return toast.error(
    //         "Some error occured while uploading invoices, Please try again"
    //       );
    //     } else {
    //       let final = {
    //         companybranch: "BRMSC012",
    //         attachment: fileData ? fileData.data : "",
    //       };
    //       let venDetails = {
    //         companybranch: vendorDetails.companybranch,
    //         vendor:
    //           vendorDetails.vendorName.length > 0
    //             ? vendorDetails.vendorName
    //             : "--",
    //         vendorbranch:
    //           vendorDetails.vendorBranch.length > 0
    //             ? vendorDetails.vendorBranch
    //             : "--",
    //         address: vendorDetails.vendorAddress,
    //         vendortype: vendorDetails.vendorType,
    //         ewaybill: vendorDetails.ewaybill ?? "--",
    //         cost_center: form.getFieldValue("costCenter"),
    //         project_id: form.getFieldValue("projectID"),
    //       };
    //       final = {
    //         ...final,
    //         ...values.componentData,
    //         ...venDetails,
    //       };
    //       setSubmitLoading(true);
    //       const { data } = await imsAxios.post(
    //         "/transaction/min_transaction",
    //         final
    //       );
    //       setSubmitLoading(false);
    //       if (data.code == "200") {
    //         // setvalues(false);
    //         setActiveTab("1");
    //         setShowSuccessPage({
    //           materialInId: data.data.txn,
    //           vendor: { vendorname: vendorDetails.vendor },
    //           components: materialInward.map((row, index) => {
    //             return {
    //               id: index,
    //               componentName: row.component.label,
    //               inQuantity: row.orderqty,
    //               invoiceNumber: row.invoiceId,
    //               invoiceDate: row.invoiceDate,
    //               location: row.locationName,
    //             };
    //           }),
    //         });
    //         vendorResetFunction();
    //         materialResetFunction();
    //       } else {
    //         toast.error(data.message.msg);
    //       }
    //     }
    //   } else {
    //     if (form.getFieldValue("vendorType") == "v01") {
    //       return toast.error("Please add at least one file!!");
    //     }
    //     let final = {
    //       companybranch: "BRMSC012",
    //       attachment: fileData ? fileData.data : "",
    //     };
    //     let venDetails = {
    //       companybranch: vendorDetails.companybranch,
    //       vendor: vendorDetails.vendorName,
    //       vendorbranch: vendorDetails.vendorBranch,
    //       address: vendorDetails.vendorAddress,
    //       vendortype: vendorDetails.vendorType,
    //       ewaybill: vendorDetails.ewaybill ?? "--",
    //     };
    //     final = { ...final, ...values.componentData, ...venDetails };
    //     setSubmitLoading(true);
    //     const { data } = await imsAxios.post(
    //       "/transaction/min_transaction",
    //       final
    //     );
    //     setSubmitLoading(false);
    //     if (data.code == "200") {
    //       setActiveTab("1");
    //       setShowSuccessPage({
    //         materialInId: data.data.txn,
    //         vendor: { vendorname: vendorDetails.vendor },
    //         components: materialInward.map((row, index) => {
    //           return {
    //             id: index,
    //             componentName: row.component.label,
    //             inQuantity: row.orderqty,
    //             invoiceNumber: row.invoiceId,
    //             invoiceDate: row.invoiceDate,
    //             location: row.locationName,
    //           };
    //         }),
    //       });
    //       vendorResetFunction();
    //       materialResetFunction();
    //     } else {
    //       toast.error(data.message.msg);
    //     }
    //   }
    // });
  };
  const validateInvoices = async () => {
    const values = await form.validateFields();
    console.log("these are the values", values);
    // try {
    //   const invoices = values.componentData.invoice;
    //   setSubmitLoading(true);
    //   const { data } = await imsAxios.post("/backend/checkInvoice", {
    //     invoice: invoices,
    //     vendor: vendorcode,
    //   });
    //   if (data) {
    //     setSubmitLoading(false);
    //     if (data.invoicesFound) {
    //       return Modal.confirm({
    //         title:
    //           "Following invoices are already found in our records, Do you still wish to continue?",
    //         // icon: <ExclamationCircleFilled />,
    //         content: <Row>{data.invoicesFound.map((inv) => `${inv}, `)}</Row>,
    //         onOk() {
    //           submitMIN(values);
    //         },
    //       });
    //     } else {
    //       submitMIN(values);
    //     }
    //   } else {
    //     console.log("some error occured");
    //   }
    // } catch (error) {
    // } finally {
    //   setSubmitLoading(false);
    // }
  };
  const handleFetchComponentOptions = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  const getCurrencies = async () => {
    const { data } = await imsAxios.get("/backend/fetchAllCurrecy");

    let arr = [];
    arr = data.data.map((d) => {
      return {
        text: d.currency_symbol,
        value: d.currency_id,
        notes: d.currency_notes,
      };
    });
    setCurrencies(arr);
  };

  const getLocation = async (costCenter) => {
    setSelectLoading(true);
    setLocationOptions([]);
    const { data } = await imsAxios.post("/transaction/getLocationInMin", {
      search: "",
      cost_center: costCenter,
    });
    setSelectLoading(false);
    if (data.code == 200) {
      let arr = data.data.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setLocationOptions(arr);
    } else {
      toast.error(data.message.msg);
    }
  };
  const getAutoComnsumptionOptions = async () => {
    setPageLoading(true);
    let { data } = await imsAxios.get("/transaction/fetchAutoConsumpLocation");
    setPageLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((row) => {
        return {
          value: row.id,
          text: row.text,
        };
      });
      arr = [{ text: "NO", value: 0 }, ...arr];
      setAutoConsumptionOption(arr);
    }
  };
  const getVendors = async (search) => {
    if (search?.length > 2) {
      const response = await executeFun(
        () => getVendorOptions(search),
        "select"
      );
      let arr = [];
      if (response.success) {
        arr = convertSelectOptions(response.data);
      }
      setAsyncOptions(arr);
    }
  };
  const handleFetchComponentDetails = async (row, rowId, value) => {
    const response = await executeFun(
      () => getComponentDetail(value.value),
      "fetch"
    );
    if (response.success) {
      const { data } = response;
      form.setFieldValue(["components", rowId, "gstRate"], data.gstrate);
      form.setFieldValue(["components", rowId, "hsn"], data.hsn);
      form.setFieldValue(["components", rowId, "rate"], data.rate);
    }
  };
  const handleFetchPreviousRate = async (component, rowId, vendor) => {
    const formVendor = vendor ?? form.getFieldValue("vendorName");
    const vendorType = form.getFieldValue("vendorType");
    if (formVendor && component && vendorType === "v01") {
      const response = await executeFun(() =>
        getComponentDetail(component.value, formVendor.value)
      );
      if (response.success) {
        form.setFieldValue(
          ["components", rowId, "previousRate"],
          response.data.rate
        );
      }
    }
  };

  const compareRates = (value, rowId) => {
    const previousRate = form.getFieldValue([
      "components",
      rowId,
      "previousRate",
    ]);
    if (previousRate !== value) {
      console.log("rate difference", previousRate);
    }
    form
      .validateFields()
      .then((values) => console.log("these are the values", values));
  };
  // const inputHandler = async (name, value, id) => {
  //   // let arr = materialInward;
  //   // if (name == "component") {
  //   //   if (value) {
  //   //     setPageLoading(true);
  //   //     const { data } = await imsAxios.post(
  //   //       "/component/getComponentDetailsByCode",
  //   //       {
  //   //         component_code: value.value,
  //   //       }
  //   //     );
  //   //     setPageLoading(false);
  //   //     if (data.code == 200) {
  //   //       arr = arr.map((row) => {
  //   //         if (row.id == id) {
  //   //           let obj = row;
  //   //           obj = {
  //   //             ...obj,
  //   //             [name]: value,
  //   //             gstrate: data.data.gstrate,
  //   //             orderrate: data.data.rate,
  //   //             unitsname: data.data.unit,
  //   //             hsn: data.data.hsn,
  //   //           };
  //   //           return obj;
  //   //         } else {
  //   //           return row;
  //   //         }
  //   //       });
  //   //     } else {
  //   //       toast.error(data.message.msg);
  //   //     }
  //   //   } else {
  //   //     arr = arr.map((row) => ({
  //   //       ...row,
  //   //       [name]: value,
  //   //     }));
  //   //   }
  //   // } else {
  //   //   arr = arr.map((row) => {
  //   //     let obj = row;
  //   //     if (id == row.id) {
  //   //       if (name == "orderqty") {
  //   //         obj = {
  //   //           ...obj,
  //   //           [name]: value,
  //   //           inrValue: value * row.orderrate,
  //   //           usdValue: value * row.orderrate * row.exchange_rate,
  //   //           igst:
  //   //             row.gsttype == "L"
  //   //               ? 0
  //   //               : (value * row.orderrate * row.gstrate) / 100,
  //   //           sgst:
  //   //             row.gsttype == "I"
  //   //               ? 0
  //   //               : (value * row.orderrate * row.gstrate) / 200,
  //   //           cgst:
  //   //             row.gsttype == "I"
  //   //               ? 0
  //   //               : (value * row.orderrate * row.gstrate) / 200,
  //   //         };
  //   //         return obj;
  //   //       } else if (name == "orderrate") {
  //   //         obj = {
  //   //           ...obj,
  //   //           [name]: value,
  //   //           inrValue: value * row.orderqty,
  //   //           usdValue: value * row.orderqty * row.exchange_rate,
  //   //           igst:
  //   //             row.gsttype == "L"
  //   //               ? 0
  //   //               : (value * row.orderqty * row.gstrate) / 100,
  //   //           sgst:
  //   //             row.gsttype == "I"
  //   //               ? 0
  //   //               : (value * row.orderqty * row.gstrate) / 200,
  //   //           cgst:
  //   //             row.gsttype == "I"
  //   //               ? 0
  //   //               : (value * row.orderqty * row.gstrate) / 200,
  //   //         };
  //   //         return obj;
  //   //       } else if (name == "gsttype") {
  //   //         if (value == "I") {
  //   //           obj = {
  //   //             ...obj,
  //   //             [name]: value,
  //   //             igst: (row.inrValue * row.gstrate) / 100,
  //   //             sgst: 0,
  //   //             cgst: 0,
  //   //           };
  //   //         } else if (value == "L") {
  //   //           obj = {
  //   //             ...obj,
  //   //             igst: 0,
  //   //             [name]: value,
  //   //             sgst: (row.inrValue * row.gstrate) / 200,
  //   //             cgst: (row.inrValue * row.gstrate) / 200,
  //   //           };
  //   //         }
  //   //         return obj;
  //   //       } else if (name == "gstrate") {
  //   //         obj = {
  //   //           ...obj,
  //   //           [name]: value,
  //   //           igst: row.gsttype == "L" ? 0 : (value * row.inrValue) / 100,
  //   //           sgst: row.gsttype == "I" ? 0 : (value * row.inrValue) / 200,
  //   //           cgst: row.gsttype == "I" ? 0 : (value * row.inrValue) / 200,
  //   //         };
  //   //         return obj;
  //   //       } else if (name == "currency") {
  //   //         if (value == "364907247") {
  //   //           obj = {
  //   //             ...obj,
  //   //             currency: value,
  //   //             usdValue: 0,
  //   //             exchange_rate: 1,
  //   //           };
  //   //         } else {
  //   //           obj = {
  //   //             ...obj,
  //   //             [name]: value,
  //   //           };
  //   //           setShowCurrenncy({
  //   //             currency: value,
  //   //             price: row.inrValue,
  //   //             exchange_rate: row.exchange_rate,
  //   //             symbol: currencies.filter((cur) => cur.value == value)[0].text,
  //   //             rowId: row.id,
  //   //             inputHandler: inputHandler,
  //   //           });
  //   //         }
  //   //         return obj;
  //   //       } else if (name == "exchange_rate") {
  //   //         obj = {
  //   //           ...obj,
  //   //           exchange_rate: value.rate,
  //   //           currency: value.currency,
  //   //           usdValue: row.inrValue * value.rate,
  //   //         };
  //   //         return obj;
  //   //       } else if (name == "location") {
  //   //         obj = {
  //   //           ...obj,
  //   //           [name]: value.value,
  //   //           locationName: value.label,
  //   //         };
  //   //         return obj;
  //   //       } else {
  //   //         obj = { ...obj, [name]: value };
  //   //         return obj;
  //   //       }
  //   //     } else {
  //   //       return row;
  //   //     }
  //   //   });
  //   // }
  //   // setMaterialInward(arr);
  // };
  // const vendorInputHandler = async (name, value) => {
  //   // if (value) {
  //   //   let obj = vendorDetails;
  //   //   if (name == "vendorName") {
  //   //     setVendorSectionLoading(true);
  //   //     setVendorCode(value.value);
  //   //     const { data } = await imsAxios.post("/backend/vendorBranchList", {
  //   //       vendorcode: value.value,
  //   //     });
  //   //     setVendorSectionLoading(false);
  //   //     if (data.code == 200) {
  //   //       const arr = data.data.map((row) => {
  //   //         return {
  //   //           value: row.id,
  //   //           text: row.text,
  //   //         };
  //   //       });
  //   //       setVendorSectionLoading(true);
  //   //       const { data: data1 } = await imsAxios.post(
  //   //         "/backend/vendorAddress",
  //   //         {
  //   //           vendorcode: value.value,
  //   //           branchcode: arr[0].value,
  //   //         }
  //   //       );
  //   //       setVendorSectionLoading(false);
  //   //       setVendorBranchOptions(arr);
  //   //       obj = {
  //   //         ...obj,
  //   //         [name]: value.value,
  //   //         vendorBranch: arr[0].value,
  //   //         gstin: data1.data.gstid,
  //   //         vendorAddress: data1.data.address.replaceAll("<br>", "\n"),
  //   //         vendor: value.label,
  //   //       };
  //   //     } else {
  //   //       toast.error(data.message.msg);
  //   //     }
  //   //   } else if (name == "vendorBranch") {
  //   //     setVendorSectionLoading(true);
  //   //     const { data } = await imsAxios.post("/backend/vendorAddress", {
  //   //       vendorcode: vendorDetails.vendorName,
  //   //       branchcode: value,
  //   //     });
  //   //     setVendorSectionLoading(false);
  //   //     if (data.code == 200) {
  //   //       obj = {
  //   //         ...obj,
  //   //         [name]: value,
  //   //         gstin: data.data.gstid,
  //   //         vendorAddress: data.data.address.replaceAll("<br>", "\n"),
  //   //       };
  //   //     } else {
  //   //       toast.error(data.message.msg);
  //   //     }
  //   //   } else {
  //   //     obj = { ...obj, [name]: value };
  //   //   }
  //   //   form.setFieldsValue(obj);
  //   //   setVendorDetails(obj);
  //   // }
  // };
  const getVendorBracnch = async (vendorCode) => {
    const { data } = await imsAxios.post("/backend/vendorBranchList", {
      vendorcode: vendorCode,
    });

    const arr = data.data.map((d) => {
      return { value: d.id, text: d.text };
    });
    setVendorBranchOptions(arr);
    return arr;
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
        form.setFieldValue("projectName", data.data.description);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const vendorResetFunction = () => {
    // let obj = {
    //   vendorType: "v01",
    //   vendorName: "",
    //   vendorBranch: "",
    //   gstin: "",
    //   vendorAddress: "",
    // };
    // // setVendorDetails(obj);
    // setShowResetConfirm(false);
    // form.setFieldsValue(obj);
  };
  const materialResetFunction = () => {
    setMaterialInward([
      {
        id: v4(),

        component: "",
        orderqty: 0,
        orderrate: 0, //will come from backend on co mponent selection
        currency: "364907247", //will be default at fiest, check
        gstrate: 0,
        unitsname: "--",
        gsttype: "L",
        hsncode: "",
        inrValue: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        invoiceDate: "",
        invoiceId: "",
        location: "",
        exchange_rate: 0,
        autoConsumption: 0,
      },
    ]);
    setShowResetConfirm(false);
  };
  const calculation = (rowId, obj) => {
    const { gstRate, gstType, qty, rate, exchangeRate, currency } = obj;
    console.log("this is the udpated exchangeRate", exchangeRate);
    const inrValue = getInt(qty) * getInt(rate) * getInt(exchangeRate ?? 1);
    const foreignValue = getInt(qty) * getInt(rate);

    let finalGstRate = gstType === "L" ? getInt(gstRate) / 2 : getInt(gstRate);
    let gst = getInt((inrValue * finalGstRate) / 100);
    form.setFieldValue(["components", rowId, "value"], getInt(inrValue));
    form.setFieldValue(
      ["components", rowId, "cgst"],
      gstType === "L" ? gst : 0
    );
    form.setFieldValue(
      ["components", rowId, "sgst"],
      gstType === "L" ? gst : 0
    );
    form.setFieldValue(
      ["components", rowId, "igst"],
      gstType === "L" ? 0 : gst
    );
    form.setFieldValue(
      ["components", rowId, "foreignValue"],
      currency === "364907247" ? 0 : foreignValue
    );
  };
  // const columns = [
  //   {
  //     headerName: <CommonIcons action="addRow" onClick={addRow} />,
  //     width: 40,
  //     field: "add",
  //     sortable: false,
  //     renderCell: ({ row }) =>
  //       materialInward.indexOf(row) >= 1 && (
  //         <CommonIcons action="removeRow" onClick={() => removeRow(row?.id)} />
  //       ),
  //     sortable: false,
  //   },
  //   {
  //     headerName: "Part Component",
  //     field: "c_partno",
  //     sortable: false,
  //     renderCell: (params) =>
  //       componentCell(
  //         params,
  //         inputHandler,
  //         setAsyncOptions,
  //         getComponentDetail,
  //         asyncOptions,
  //         loading("select")
  //       ),
  //     width: 300,
  //   },
  //   {
  //     headerName: "QTY",
  //     field: "gstqty",
  //     sortable: false,
  //     renderCell: (params) => QuantityCell(params, inputHandler),
  //     width: 120,
  //   },
  //   {
  //     headerName: "Rate",
  //     field: "orderrate",
  //     sortable: false,
  //     renderCell: (params) => rateCell(params, inputHandler, currencies),
  //     width: 180,
  //   },
  //   // {
  //   //   headerName: "Currency",
  //   //   field: "currency",
  //   //   sortable: false,
  //   //   renderCell: (params) => currencyCell(params, inputHandler, currencies),
  //   //   width: 80,
  //   // },
  //   {
  //     headerName: "Taxable Value",
  //     field: "inrValue",
  //     sortable: false,
  //     renderCell: taxableCell,
  //     width: 120,
  //   },
  //   {
  //     headerName: "Foreign Value",
  //     field: "usdValue",
  //     sortable: false,
  //     renderCell: foreignCell,
  //     width: 120,
  //   },
  //   {
  //     headerName: "Invoice ID",
  //     field: "invoiceId",
  //     sortable: false,
  //     renderCell: (params) => invoiceIdCell(params, inputHandler),
  //     width: 200,
  //   },
  //   {
  //     headerName: "Invoice Date",
  //     field: "invoiceDate",
  //     sortable: false,
  //     renderCell: (params) => invoiceDateCell(params, inputHandler),
  //     width: 120,
  //   },
  //   {
  //     headerName: "HSN Code",
  //     field: "hsncode",
  //     sortable: false,
  //     renderCell: (params) => HSNCell(params, inputHandler),
  //     width: 150,
  //   },
  //   {
  //     headerName: "GST Type",
  //     field: "gsttype",
  //     sortable: false,
  //     renderCell: (params) => gstTypeCell(params, inputHandler),
  //     // flex: 1,
  //     width: 200,
  //   },
  //   {
  //     headerName: "GST Rate",
  //     field: "gstrate",
  //     sortable: false,
  //     renderCell: (params) => gstRate(params, inputHandler),
  //     // flex: 1,
  //     width: 100,
  //   },
  //   {
  //     headerName: "CGST",
  //     renderCell: (params) => CGSTCell(params, inputHandler),
  //     // flex: 1,
  //     field: "cgst",
  //     sortable: false,
  //     width: 120,
  //   },
  //   {
  //     headerName: "SGST",
  //     renderCell: (params) => SGSTCell(params, inputHandler),
  //     // flex: 1,
  //     field: "sgst",
  //     sortable: false,
  //     width: 120,
  //   },
  //   {
  //     headerName: "IGST",
  //     renderCell: (params) => IGSTCell(params, inputHandler),
  //     // flex: 1,
  //     field: "igst",
  //     sortable: false,
  //     width: 120,
  //   },
  //   {
  //     headerName: "Location",
  //     field: "location",
  //     sortable: false,
  //     renderCell: (params) =>
  //       locationCell(params, inputHandler, locationOptions),
  //     width: 150,
  //   },
  //   {
  //     headerName: "Auto Consump",
  //     field: "autoConsumption",
  //     sortable: false,
  //     renderCell: (params) =>
  //       autoConsumptionCell(params, inputHandler, autoConsumptionOptions),
  //     width: 150,
  //   },
  //   {
  //     headerName: "Remarks",
  //     field: "orderremark",
  //     sortable: false,
  //     renderCell: (params) => remarkCell(params, inputHandler),
  //     width: 250,
  //   },
  // ];
  const successColumns = [
    {
      headerName: "Component",
      renderCell: ({ row }) => <ToolTipEllipses text={row.componentName} />,
      field: "componentName",
      flex: 1,
    },
    // { headerName: "Part No.", field: "partNo", flex: 1 },
    // { headerName: "PO Quantity", field: "poQuantity", flex: 1 },
    { headerName: "In Quantity", field: "inQuantity", flex: 1 },
    { headerName: "Invoice Number", field: "invoiceNumber", flex: 1 },
    { headerName: "Invoice Date", field: "invoiceDate", flex: 1 },
    { headerName: "Location", field: "location", flex: 1 },
  ];
  useEffect(() => {
    getAutoComnsumptionOptions();
    getCurrencies();
    getLocation();
  }, []);
  useEffect(() => {
    if (costCenter) {
      getLocation(costCenter);
    }
  }, [costCenter]);
  useEffect(() => {
    let grandTotal = materialInward?.map((row) =>
      Number(row?.cgst + row?.sgst + row?.igst + row.inrValue)
    );
    let cgsttotal = materialInward?.map((row) => Number(row?.cgst));
    let sgsttotal = materialInward?.map((row) => Number(row?.sgst));
    let igsttotal = materialInward?.map((row) => Number(row?.igst));
    let inrValue = materialInward?.map((row) => Number(row?.inrValue));
    let obj = [
      { label: "Sub-Total value before Taxes", sign: "", values: inrValue },
      { label: "CGST", sign: "+", values: cgsttotal },
      { label: "SGST", sign: "+", values: sgsttotal },
      { label: "IGST", sign: "+", values: igsttotal },
      { label: "Sub-Total values after Taxes", sign: "", values: grandTotal },
    ];
    setTotalValues(obj);
  }, [materialInward]);
  // useEffect(() => {
  //   if (vendorDetails.vendorType === "p01") {
  //     let obj = form.getFieldsValue();
  //     obj = {
  //       ...obj,
  //       vendorName: "",
  //       vendorBranch: "",
  //       gstin: "",
  //       vendorAddress: "",
  //     };
  //     setVendorDetails(obj);
  //     form.setFieldsValue(obj);
  //   }
  // }, [vendorDetails.vendorType]);
  return (
    <div style={{ height: "95%", overflow: "hidden" }}>
      {showCurrency != null && (
        <CurrenceModal
          showCurrency={showCurrency}
          setShowCurrencyModal={setShowCurrenncy}
        />
      )}

      <Modal
        title="Reset!"
        open={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowResetConfirm(false)}>
            No
          </Button>,
          <Button key="submit" type="primary" onClick={vendorResetFunction}>
            Yes
          </Button>,
        ]}
      >
        <p>Are you sure you want to reset the entered data?</p>
      </Modal>
      <AddVendorSideBar
        open={showAddVendorModal}
        setOpen={setShowAddVendorModal}
      />
      <AddBranch
        getVendorBracnch={getVendorBracnch}
        setOpenBranch={setShowBranchModal}
        openBranch={showBranchModal}
      />

      {!showSuccessPage && (
        <Form
          style={{ height: "100%" }}
          initialValues={defaultValues}
          form={form}
          layout="vertical"
        >
          <Row
            gutter={8}
            style={{
              height: "90%",
              padding: "0px 10px",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <Col
              span={6}
              style={{ height: "98%", overflowY: "auto", overflowX: "hidden" }}
            >
              <Card size="small" title="Vendor details">
                {vendorSectionLoading && <Loading />}
                <Row>
                  <Col span={24}>
                    <Form.Item name="vendorType" label="Vendor Type">
                      <MySelect options={vendorDetailsOptions} />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="vendorName"
                      label={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: 350,
                          }}
                        >
                          Vendor Name
                          <span
                            onClick={() => setShowAddVendorModal(true)}
                            style={{ color: "#1890FF", cursor: "pointer" }}
                          >
                            Add Vendor
                          </span>
                        </div>
                      }
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Please Select a vendor Name!",
                      //   },
                      // ]}
                    >
                      <MyAsyncSelect
                        selectLoading={loading("select")}
                        disabled={form.getFieldValue("vendorType") == "p01"}
                        labelInValue
                        onBlur={() => setAsyncOptions([])}
                        optionsState={asyncOptions}
                        loadOptions={getVendors}
                        // onChange={handleFetchPreviousRate(value, index)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="vendorBranch"
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
                              vendorDetails.vendorName
                                ? setShowBranchModal({
                                    vendor_code: vendorDetails.vendorName,
                                  })
                                : toast.error("Please Select a vendor first");
                            }}
                            style={{ color: "#1890FF" }}
                          >
                            Add Branch
                          </span>
                        </div>
                      }
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Please Select a vendor Branch!",
                      //   },
                      // ]}
                    >
                      <MySelect
                        disabled={form.getFieldValue("vendorType") == "p01"}
                        options={vendorBranchOptions}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Row gutter={4}>
                      <Col
                        span={
                          form.getFieldValue("vendorType") == "j01" ? 12 : 24
                        }
                      >
                        <Form.Item name="gstin" label="GSTIN">
                          <Input size="default" disabled />
                        </Form.Item>
                      </Col>
                      {form.getFieldValue("vendorType") == "j01" && (
                        <Col span={12}>
                          <Form.Item name="ewaybill" label="E-Way Bill Number">
                            <Input size="default" />
                          </Form.Item>
                        </Col>
                      )}
                    </Row>
                  </Col>
                  <Col span={24}>
                    <Form.Item label="Cost Center" name="costCenter">
                      <MyAsyncSelect
                        selectLoading={loading("select")}
                        onBlur={() => setAsyncOptions([])}
                        optionsState={asyncOptions}
                        loadOptions={handleFetchCostCenterOptions}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Row gutter={6}>
                      <Col span={12}>
                        <Form.Item label="Project ID" name="projectID">
                          <MyAsyncSelect
                            selectLoading={loading("select")}
                            onBlur={() => setAsyncOptions([])}
                            optionsState={asyncOptions}
                            loadOptions={handleFetchProjectOptions}
                            onChange={handleProjectChange}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item label="Project Name" name="projectName">
                          <Input size="default" disabled />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>

                  <Col span={24}>
                    <Form.Item
                      name="vendorAddress"
                      label="Bill From Address"
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Please Enter bill from address!",
                      //   },
                      // ]}
                    >
                      <Input.TextArea
                        rows={4}
                        disabled={form.getFieldValue("vendorType") == "p01"}
                        style={{ resize: "none" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Col span={24} style={{ height: "10%" }}>
                  <Row className="material-in-upload">
                    <UploadDocs
                      // disable={poData?.materials?.length == 0}
                      setFiles={setInvoices}
                      files={invoices}
                    />
                  </Row>
                </Col>
              </Card>
              <Card
                className="small-text"
                size="small"
                style={{ marginTop: 5 }}
                title="Tax Detail"
              >
                <Row gutter={[0, 4]}>
                  {totalValues?.map((row) => (
                    <Col span={24} key={row.label}>
                      <Row>
                        <Col
                          span={18}
                          style={{
                            fontWeight:
                              totalValues?.indexOf(row) ==
                                totalValues.length - 1 && 600,
                          }}
                        >
                          <Typography.Text>{row.label}</Typography.Text>
                        </Col>
                        <Col span={6} className="right">
                          {row.sign.toString() == "" ? (
                            ""
                          ) : (
                            <span
                              style={{
                                fontWeight:
                                  totalValues?.indexOf(row) ==
                                    totalValues.length - 1 && 600,
                              }}
                            >
                              <Typography.Text>
                                ({row.sign.toString()}){" "}
                              </Typography.Text>
                            </span>
                          )}
                          <span
                            style={{
                              fontWeight:
                                totalValues?.indexOf(row) ==
                                  totalValues.length - 1 && 600,
                            }}
                          >
                            <Typography.Text>
                              {Number(
                                row.values?.reduce((partialSum, a) => {
                                  return partialSum + Number(a);
                                }, 0)
                              ).toFixed(2)}
                            </Typography.Text>
                          </span>
                        </Col>
                      </Row>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
            <Col style={{ height: "100%" }} span={18}>
              <div style={{ height: "98%", border: "1px solid #EEEEEE" }}>
                {pageLoading && <Loading />}
                <FormTable2
                  form={form}
                  addableRow={true}
                  removableRows={true}
                  reverse={true}
                  newRow={defaultValues.components[0]}
                  listName="components"
                  nonRemovableColumns={1}
                  watchKeys={[
                    "rate",
                    "qty",
                    "component",
                    "gstRate",
                    "gstType",
                    "exchangeRate",
                    "currency",
                  ]}
                  calculation={calculation}
                  columns={columns({
                    handleFetchComponentOptions,
                    loading,
                    asyncOptions,
                    setAsyncOptions,
                    locationOptions,
                    autoConsumptionOptions,
                    handleFetchComponentDetails,
                    handleFetchPreviousRate,
                    compareRates,
                    form,
                    currencies,
                    setShowCurrenncy,
                  })}
                />
              </div>
            </Col>
          </Row>
        </Form>
      )}
      <NavFooter
        resetFunction={() => setShowResetConfirm(true)}
        submitFunction={validataData}
        nextLabel="Submit"
        loading={submitLoading}
      />
      {showSuccessPage && (
        <SuccessPage
          newMinFunction={() => setShowSuccessPage(false)}
          successColumns={successColumns}
          po={showSuccessPage}
        />
      )}
    </div>
  );
}

const gstTypeOptions = [
  { value: "I", text: "INTER STATE" },
  { value: "L", text: "LOCAL" },
];
const columns = ({
  loading,
  asyncOptions,
  setAsyncOptions,
  handleFetchComponentOptions,
  locationOptions,
  autoConsumptionOptions,
  handleFetchComponentDetails,
  handleFetchPreviousRate,
  compareRates,
  form,
  currencies,
  setShowCurrenncy,
}) => [
  {
    headerName: "Part Component",
    name: "component",
    field: (row, index) => (
      <MyAsyncSelect
        onBlur={() => setAsyncOptions([])}
        selectLoading={loading("select")}
        labelInValue
        loadOptions={handleFetchComponentOptions}
        optionsState={asyncOptions}
        onChange={(value) => {
          handleFetchComponentDetails(row, index, value);

          handleFetchPreviousRate(value, index);
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
    rules: [
      {
        warningOnly: true,
        validator: (first, value) => {
          let fieldName = first.field.split(".");
          fieldName = fieldName.map((row) => {
            if (!isNaN(row)) {
              return +row;
            } else return row;
          });
          fieldName.pop();
          const row = form.getFieldValue(fieldName);
          const vendorType = form.getFieldValue("vendorType");

          if (
            row.previousRate != row.rate &&
            row.previousRate &&
            vendorType === "v01"
          ) {
            return Promise.reject(`Prev. rate was ${row.previousRate}`);
          }
        },
      },
    ],
    field: (row, index) => (
      <Input
        onChange={(e) => compareRates(e.target.value, index)}
        addonAfter={
          <div style={{ width: 50 }}>
            <Form.Item noStyle name={[index, "currency"]}>
              <MySelect
                options={currencies}
                onChange={(value) => {
                  value !== "364907247"
                    ? setShowCurrenncy({
                        currency: value,
                        price: row.value,
                        exchangeRate: row.exchangeRate,
                        symbol: currencies.filter(
                          (cur) => cur.value == value
                        )[0].text,
                        rowId: index,
                        form: form,
                      })
                    : form.setFieldValue(
                        ["components", index, "exchangeRate"],
                        1
                      );
                }}
              />
            </Form.Item>
          </div>
        }
      />
    ),
    width: 200,
  },

  {
    headerName: "Taxable Value",
    name: "value",

    field: () => <Input disabled />,
    width: 120,
  },
  {
    headerName: "Foreign Value",
    name: "foreignValue",
    field: () => <Input disabled />,
    width: 120,
  },
  {
    headerName: "Invoice ID",
    name: "invoiceId",
    field: () => <Input />,
    width: 200,
  },
  {
    headerName: "Invoice Date",
    name: "invoiceDate",
    field: () => <Input />,
    width: 120,
  },
  {
    headerName: "HSN Code",
    name: "hsnCode",
    field: () => <Input />,
    width: 150,
  },
  {
    headerName: "GST Type",
    name: "gstType",
    field: () => <MySelect options={gstTypeOptions} />,
    // flex: 1,
    width: 160,
  },
  {
    headerName: "GST Rate",
    name: "gstRate",
    field: () => <Input />,
    // flex: 1,
    width: 100,
  },
  {
    headerName: "CGST",
    field: () => <Input disabled />,
    // flex: 1,

    name: "cgst",
    width: 120,
  },
  {
    headerName: "SGST",
    field: () => <Input disabled />,
    name: "sgst",

    width: 120,
  },
  {
    headerName: "IGST",
    field: () => <Input disabled />,
    name: "igst",

    width: 120,
  },
  {
    headerName: "Location",
    name: "location",
    field: () => <MySelect options={locationOptions} />,
    width: 120,
  },
  {
    headerName: "Auto Consump",
    name: "autoConsumption",
    field: () => <MySelect options={autoConsumptionOptions} />,

    width: 150,
  },
  {
    headerName: "Remarks",
    name: "remarks",
    field: () => <Input />,
    width: 250,
  },
];
