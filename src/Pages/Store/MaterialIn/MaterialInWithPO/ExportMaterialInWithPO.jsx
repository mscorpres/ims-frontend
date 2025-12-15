import React, { useState, useEffect } from "react";
import NavFooter from "../../../../Components/NavFooter.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  Modal,
  Row,
  Skeleton,
  Space,
  Tooltip,
  Typography,
  Form,
  Upload,
  Drawer,
  DatePicker,
} from "antd";
import { remarkCell, manualMFGCode, HSNCell } from "./TableCollumns.jsx";
import SingleProduct from "../../../Master/Vendor/SingleProduct.jsx";
import CurrenceModal from "../CurrenceModal.jsx";
import UploadDocs from "./UploadDocs.jsx";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect.jsx";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses.jsx";
import { InboxOutlined } from "@ant-design/icons";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions.jsx";
import SuccessPage from "../SuccessPage.jsx";
import { imsAxios } from "../../../../axiosInterceptor.js";
import Loading from "../../../../Components/Loading.jsx";
import MyDataTable from "../../../../Components/MyDataTable.jsx";
import {
  checkInvoiceforMIN,
  getVendorOptions,
  poMINforImport,
  uploadPOExportFile,
} from "../../../../api/general.ts";
import { convertSelectOptions } from "../../../../utils/general.ts";
import useApi from "../../../../hooks/useApi.ts";
import MyButton from "../../../../Components/MyButton/index.jsx";
import FormTable from "../../../../Components/FormTable.jsx";
import MySelect from "../../../../Components/MySelect.jsx";
import { v4 } from "uuid";

export default function ExportMaterialInWithPO({}) {
  const [poData, setPoData] = useState({ materials: [] });
  const [resetPoData, setResetPoData] = useState({ materials: [] });
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [materialInward, setMaterialInward] = useState(null);
  const [preview, setPreview] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [irnNum, setIrnNum] = useState("");
  const [searchData, setSearchData] = useState({
    vendor: "",
    poNumber: "",
  });
  const [currency, setCurrency] = useState(null);
  const [invoice, setInvoice] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(null);
  const [showCurrency, setShowCurrenncy] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [autoConsumptionOptions, setAutoConsumptionOption] = useState([]);
  const [totalValues, setTotalValues] = useState([
    { label: "Sub-Total value before Taxes", sign: "", values: [] },
  ]);
  const [currencies, setCurrencies] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);
  const [showVendorInfo, setShowVendorInfo] = useState(false);
  const [open, setOpen] = useState(false);
  const [materialInSuccess, setMaterialInSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectLocation, setSelectLocation] = useState(null);
  const [codeCostCenter, setCodeCostCenter] = useState("");
  const [isScan, setIsScan] = useState(false);
  const [uplaoaClicked, setUploadClicked] = useState(false);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [uplaodForm] = Form.useForm();
  const components = Form.useWatch("components", form);
  let costCode;
  const { executeFun, loading: loading1 } = useApi();
  const { loading } = useApi();
  const validateData = async () => {
    let validation = false;
    // let validation = true;
    // poData.materials.map((row) => {
    if (
      currency &&
      invoice &&
      invoiceDate &&
      poData.materials.length &&
      selectLocation
    ) {
      validation = true;
    } else {
      validation = false;
      // }
    }
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
      finalRate: [],
      customDuty: [],
      freight: [],
    };
    if (validation == true) {
      let formData = new FormData();
      let values = await form.validateFields();
      let values2 = await form2.validateFields();
      let a = values2?.components;
      // let a = values.components.map((comp) => {
      //   formData.append("files", comp.file[0]?.originFileObj);
      // });
      if (a?.length) {
        if (!values2?.components[0]?.file) {
          toast.info("Please upload Files");
        }
        values2.components.map((comp) => {
          formData.append("files", comp.file[0]?.originFileObj);
        });
        poData?.materials?.map((row) => {
          componentData = {
            component: [...componentData.component, row.componentKey],
            customDuty: [...componentData.customDuty, row.customDuty],
            freight: [...componentData.freight, row.freightValue],
            qty: [...componentData.qty, row.orderQty],
            rate: [...componentData.rate, row.rate],
            exchange: [...componentData?.exchange, row.exchangeRate],
            invoice: [invoice],
            // invoiceDate: [...componentData.invoiceDate, row.invoiceDate],
            hsncode: [...componentData.hsncode, row.hsn],
            remark: [...componentData.remark, row.orderremark],
            // location: [...componentData.location, row.location.value],
            finalRate: [...componentData.finalRate, row.finalRate],
            // out_location: [...componentData.out_location, row.autoConsumption],
            documentName: values2?.components?.map((r) => r.documentName),
            irn: irnNum,
            qrScan: isScan == true ? "Y" : "N",
            currency: currency,
          };
        });
        //uploading invoices
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
        toast.error("Please add at least one document");
      }
    } else {
      toast.error("Please Provide all the values of all the components");
    }
  };

  const closeDrawer = () => {
    setPreview(false);
    setOpen(false);
    let arr = previewRows.map((r) => {
      return {
        ...r,
        mfgCode: r.Manualmfgcode,
        hsnCode: r.hsn,
        autoConsumption: r.Autoconsump == "Y" ? "Yes" : "No",
      };
    });

    form.setFieldValue("components", arr);
  };

  useEffect(() => {
    previewRows && setPoData({ materials: previewRows });
  }, [previewRows]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const saveTheData = async () => {
    Modal.confirm({
      title: "Are you sure you want to submit?",
      content: "Please make sure that the values are correct",
      onOk() {
        closeDrawer();
      },
      onCancel() {},
    });
  };
  const validateInvoices = async (values) => {
    try {
      const invoices = values.componentData.invoice;
      setSubmitLoading(true);
      let payload = {
        invoice: invoices,
        vendor: searchData.vendor,
      };
      const response = await executeFun(
        () => checkInvoiceforMIN(payload),
        "select"
      );
      // const { data } = await imsAxios.post("/backend/checkInvoice", {
      //   invoice: invoices,
      //   vendor: searchData.vendor,
      // });
      let { data } = response;
      if (data) {
        setSubmitLoading(false);
        if (data.invoicesFound) {
          return Modal.confirm({
            title:
              "Following invoices are already found in our records, Do you still wish to continue?",
            // icon: <ExclamationCircleFilled />,
            content: <Row>{data.invoicesFound.map((inv) => `${inv}, `)}</Row>,
            onOk() {
              submitMIN(values, isScan);
            },
          });
        } else {
          submitMIN(values);
        }
      } else {
        console.log("some error occured");
      }
    } catch (error) {
    } finally {
      setSubmitLoading(false);
    }
  };

  const previewedcolumns = [
    {
      headerName: "#",
      field: "id",
      renderCell: ({ row }) => <ToolTipEllipses text={row.id} />,
      width: 50,
    },
    {
      headerName: "Part Code",
      field: "partCode",
      renderCell: ({ row }) => <ToolTipEllipses text={row.partCode} />,
      minWidth: 110,
    },
    {
      headerName: "Part Name",
      field: "partName",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.partName} copy={true} />
      ),
      minWidth: 250,
      flex: 1,
    },

    {
      headerName: "Hsn",
      field: "hsn",
      renderCell: ({ row }) => <ToolTipEllipses text={row.hsn} />,
      width: 110,

      // width: "12vw",
    },
    {
      headerName: "UOM",
      field: "uom",
      renderCell: ({ row }) => <ToolTipEllipses text={row.uom} />,
      width: 110,

      // width: "12vw",
    },
    {
      headerName: "Order Qty ",
      field: "qty",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.orderQty} copy={false} />
      ),
      // flex: 1,
    },
    {
      headerName: "Import Rate",
      field: "rate",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "Exchange Rate",
      field: "exchangeRate",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "Taxable Value",
      field: "taxableValue",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.taxableValue} copy={false} />
      ),
    },
    {
      headerName: "Foreign Value",
      field: "foreignValue",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "Freight Value",
      field: "freightValue",
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "Custom Duty",
      field: "customDuty",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "Total",
      field: "total",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "Final Rate",
      field: "finalRate",
      flex: 1,
      minWidth: 100,
    },
  ];

  const submitMIN = async (values, isScan) => {
    if (values.formData) {
      setSubmitLoading(true);
      const { data: fileData } = await imsAxios.post(
        "/transaction/upload-invoice",
        values.formData
      );
      if (fileData.code == "200") {
        let final = {
          companybranch: "BRMSC012",
          invoices: fileData.data,
          poid: searchData.poNumber,
          manual_mfg_code: poData.materials.map((row) => row.manualMfgCode),
          invoice: invoice,
          invoiceDate: invoiceDate,
          location: selectLocation,
        };
        final = { ...final, ...values.componentData };
        const response = await executeFun(
          () => poMINforImport(final),
          "select"
        );
        // const { data } = await imsAxios.post("/purchaseOrder/poMIN", final);
        let { data } = response;
        // setSubmitLoading(false);
        if (data.code == "200") {
          setSearchData({
            vendor: "",
            poNumber: "",
          });
          setInvoices([]);
          setSubmitLoading(false);
          setMaterialInSuccess({
            materialInId: data.transaction_id,
            poId: searchData.poNumber,
            vendor: searchData.vendor,
            components: poData?.materials?.map((row) => {
              return {
                id: row.id,
                componentName: row.component?.label,
                partNo: row.partCode,
                inQuantity: row.orderQty,
                location: selectLocation,
                poQuantity: row.poOrderQty,
              };
            }),
          });
          setIrnNum("");
        } else {
          setSubmitLoading(false);
          toast.error(data.message.msg);
        }
      } else {
        setSubmitLoading(false);
        toast.error(
          "Some error occured while uploading invoices, Please try again"
        );
      }
    }
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

  const getLocation = async (costCode) => {
    setPageLoading(true);
    const { data } = await imsAxios.post("/transaction/getLocationInMin", {
      search: "",
      cost_center: costCode,
    });
    setPageLoading(false);
    let arr = data.data.data;
    if (data.code == 200) {
      let arr = data.data.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setLocationOptions(arr);
    } else {
      setAsyncOptions([]);
    }
    return arr;
  };
  const props = {
    name: "file",
    multiple: false,

    maxCount: 1,

    beforeUpload(file) {
      return false;
    },
  };
  const getAutoComnsumptionOptions = async () => {
    setPageLoading(true);

    const { data } = await imsAxios.get(
      "/transaction/fetchAutoConsumpLocation"
    );
    setPageLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((row) => {
        return {
          value: row.id,
          text: row.text,
        };
      });
      arr = [{ value: 0, text: "NO" }, ...arr];
      setAutoConsumptionOption(arr);
    }
  };

  const inputHandler = (name, value, id) => {
    let arr = poData?.materials;
    arr = arr.map((row) => {
      let obj = row;
      if (id == row.id) {
        if (name == "orderQty" || name == "orderqty") {
          const qty = Number(value) || 0;
          const rate = Number(row.rate) || 0;
          const exchangeRate = Number(row.exchangeRate) || 0;
          const customDuty = Number(row.customDuty) || 0;
          const freightValue = Number(row.freightValue) || 0;

          const taxableValue = qty * rate;
          const foreignValue = taxableValue * exchangeRate;
          const total = taxableValue + customDuty + freightValue;
          const finalRate =
            qty > 0 ? rate + customDuty / qty + freightValue / qty : rate;

          obj = {
            ...obj,
            orderQty: qty,
            taxableValue: taxableValue,
            foreignValue: foreignValue,
            total: total,
            finalRate: finalRate,
          };
          return obj;
        } else if (name == "rate") {
          const qty = Number(row.orderQty) || 0;
          const rate = Number(value) || 0;
          const exchangeRate = Number(row.exchangeRate) || 0;
          const customDuty = Number(row.customDuty) || 0;
          const freightValue = Number(row.freightValue) || 0;

          const taxableValue = qty * rate;
          const foreignValue = taxableValue * exchangeRate;
          const total = taxableValue + customDuty + freightValue;
          const finalRate =
            qty > 0 ? rate + customDuty / qty + freightValue / qty : rate;

          obj = {
            ...obj,
            rate: rate,
            taxableValue: taxableValue,
            foreignValue: foreignValue,
            total: total,
            finalRate: finalRate,
          };
          return obj;
        } else if (name == "exchangeRate") {
          const qty = Number(row.orderQty) || 0;
          const rate = Number(row.rate) || 0;
          const exchangeRate = Number(value) || 0;
          const customDuty = Number(row.customDuty) || 0;
          const freightValue = Number(row.freightValue) || 0;

          const taxableValue = qty * rate;
          const foreignValue = taxableValue * exchangeRate;
          const total = taxableValue + customDuty + freightValue;
          const finalRate =
            qty > 0 ? rate + customDuty / qty + freightValue / qty : rate;

          obj = {
            ...obj,
            exchangeRate: exchangeRate,
            foreignValue: foreignValue,
            total: total,
            finalRate: finalRate,
          };
          return obj;
        } else if (name == "customDuty") {
          const qty = Number(row.orderQty) || 0;
          const rate = Number(row.rate) || 0;
          const exchangeRate = Number(row.exchangeRate) || 0;
          const customDuty = Number(value) || 0;
          const freightValue = Number(row.freightValue) || 0;

          const taxableValue = qty * rate;
          const foreignValue = taxableValue * exchangeRate;
          const total = taxableValue + customDuty + freightValue;
          const finalRate =
            qty > 0 ? rate + customDuty / qty + freightValue / qty : rate;

          obj = {
            ...obj,
            customDuty: customDuty,
            total: total,
            finalRate: finalRate,
          };
          return obj;
        } else if (name == "freightValue") {
          const qty = Number(row.orderQty) || 0;
          const rate = Number(row.rate) || 0;
          const exchangeRate = Number(row.exchangeRate) || 0;
          const customDuty = Number(row.customDuty) || 0;
          const freightValue = Number(value) || 0;

          const taxableValue = qty * rate;
          const foreignValue = taxableValue * exchangeRate;
          const total = taxableValue + customDuty + freightValue;
          const finalRate =
            qty > 0 ? rate + customDuty / qty + freightValue / qty : rate;

          obj = {
            ...obj,
            freightValue: freightValue,
            total: total,
            finalRate: finalRate,
          };
          return obj;
        } else if (name == "mfgCode") {
          obj = {
            ...obj,
            mfgCode: value,
            manualMfgCode: value, // Keep both in sync
          };
          return obj;
        } else if (name == "hsncode" || name == "hsn") {
          obj = {
            ...obj,
            hsncode: value,
            hsn: value, // Keep both in sync
          };
          return obj;
        } else if (name == "location") {
          obj = {
            ...obj,
            [name]: value,
          };
          return obj;
        } else {
          obj = { ...obj, [name]: value };
          return obj;
        }
      } else {
        return row;
      }
    });
    setPoData((poData) => {
      return {
        ...poData,
        materials: arr,
      };
    });
  };
  const backFunction = () => {
    setMaterialInward(null);
  };
  const getVendors = async (search) => {
    // if (search?.length > 2) {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
    // }
  };
  const resetFunction = () => {
    setPoData(resetPoData);
    setInvoices([]);
    setShowResetConfirm(false);
  };
  const getDetail = async () => {
    setSearchLoading(true);
    setPoData({ materials: [] });
    let search = {
      po: searchData.poNumber.trim(),
      vendor: searchData.vendor,
    };
    const { data } = await imsAxios.post(
      "/purchaseOrder/fetchVendorPO",
      search
    );
    setSearchLoading(false);

    if (data.code == 200) {
      let obj = data.data;
      obj = {
        ...obj,
        poId: searchData.poNumber,
        materials: obj.materials.map((mat, index) => {
          // Calculate values
          const orderQty = mat.orderqty || 0;
          const orderRate = mat.orderrate || 0;
          const exchangeRate = mat.exchange_rate || 0;
          const taxableValue = mat.totalValue || orderQty * orderRate;
          const foreignValue = mat.usdValue || taxableValue * exchangeRate;
          const customDuty = mat.custom_duty || 0;
          const freightValue = mat.freight_value || 0;
          const total = taxableValue + customDuty + freightValue;
          // Calculate finalRate, handle division by zero
          const finalRate =
            orderQty > 0
              ? orderRate + customDuty / orderQty + freightValue / orderQty
              : orderRate;

          return {
            ...mat,
            id: v4(),
            // Map field names to match column expectations
            partCode: mat.partcode || mat.c_partno || "",
            manualMfgCode: mat.mfgCode || "--",
            mfgCode: mat.mfgCode || "--", // Also add for manualMFGCode cell component
            orderQty: orderQty,
            poOrderQty: mat.po_order_qty || 0,
            pendingQty: Math.max(0, (mat.po_order_qty || 0) - orderQty),
            rate: orderRate,
            exchangeRate: exchangeRate,
            hsn: mat.hsncode || "--",
            hsncode: mat.hsncode || "--", // Also add for HSNCell component
            // Add component object for rendering
            component: {
              label: mat.component_fullname || "",
              value: mat.componentKey || "",
            },
            componentKey: mat.componentKey || "",
            // Add calculated values
            taxableValue: taxableValue,
            foreignValue: foreignValue,
            customDuty: customDuty,
            freightValue: freightValue,
            finalRate: finalRate,
            total: total,
            // Keep original fields for reference
            orderremark: mat.orderremark || "",
            gsttype: mat.gsttype || "I",
            gstrate: mat.gstrate || "0",
          };
        }),
      };
      costCode = obj.headers.cost_center_key;
      setCodeCostCenter(costCode);

      setPoData(obj);
      setResetPoData(obj);
    } else {
      toast.error(data.message.msg);
      setPoData({ materials: [] });
      //   toast.error("Some error Occurred");
    }
  };
  useEffect(() => {
    if (codeCostCenter) {
      getLocation(codeCostCenter);
    }
  }, [codeCostCenter]);

  const removeRow = (id) => {
    let arr = poData?.materials;
    arr = arr.filter((row) => row.id != id);
    setPoData((data) => ({ ...data, materials: arr }));
  };
  const columns = [
    {
      headerName: <></>,
      width: 40,
      field: "add",
      sortable: false,
      renderCell: ({ row }) => (
        // row.index >= 2 && (
        <CommonIcons action="removeRow" onClick={() => removeRow(row?.id)} />
      ),
      // ),
      // sortable: false,
    },
    {
      headerName: "Component",
      field: "component_fullname",
      // sortable: false,
      width: 200,
      renderCell: ({ row }) => <ToolTipEllipses text={row.component?.label} />,
      // width: 150,
    },
    {
      headerName: "Part No.",
      field: "partCode",
      renderCell: ({ row }) => <ToolTipEllipses text={row.partCode} />,
      sortable: false,
      width: 80,
    },
    {
      headerName: "MFG Code ",
      field: "manualMfgCode",
      renderCell: (params) => manualMFGCode(params, inputHandler),
      sortable: false,
      width: 100,
    },

    {
      headerName: "QTY",
      field: "orderQty",
      sortable: false,
      renderCell: (params) => (
        <Input
          value={params.row.orderQty}
          onChange={(e) =>
            inputHandler("orderQty", e.target.value, params.row.id)
          }
        />
      ),
      width: 120,
    },
    {
      headerName: "Pending Qty",
      field: "pendingQty",
      sortable: false,
      renderCell: ({ row }) => <ToolTipEllipses text={row.pendingQty} />,
      width: 120,
    },
    {
      headerName: "PO Order Qty",
      field: "poOrderQty",
      sortable: false,
      renderCell: ({ row }) => <ToolTipEllipses text={row.poOrderQty} />,
      width: 120,
    },
    {
      headerName: "Rate",
      field: "rate",
      sortable: false,
      renderCell: (params) => (
        <Input
          value={params.row.rate}
          onChange={(e) => inputHandler("rate", e.target.value, params.row.id)}
        />
      ),
      width: 100,
    },
    {
      headerName: "Custom Duty",
      field: "customDuty",
      sortable: false,
      renderCell: (params) => (
        <Input
          value={params.row.customDuty}
          onChange={(e) =>
            inputHandler("customDuty", e.target.value, params.row.id)
          }
        />
      ),
      width: 100,
    },
    {
      headerName: "Freight Charge",
      field: "freightValue",
      sortable: false,
      renderCell: (params) => (
        <Input
          value={params.row.freightValue}
          onChange={(e) =>
            inputHandler("freightValue", e.target.value, params.row.id)
          }
        />
      ),
      width: 100,
    },
    {
      headerName: "Exchange Rate",
      field: "exchangeRate",
      sortable: false,
      renderCell: (params) => (
        <Input
          value={params.row.exchangeRate}
          onChange={(e) =>
            inputHandler("exchangeRate", e.target.value, params.row.id)
          }
        />
      ),
      width: 100,
    },
    {
      headerName: "Taxable Value",
      field: "taxableValue",
      sortable: false,
      renderCell: ({ row }) => (
        <Input disabled={true} value={row.taxableValue} />
      ),
      width: 120,
    },
    {
      headerName: "Foreign Value",
      field: "foreignValue",
      sortable: false,
      renderCell: ({ row }) => (
        <Input disabled={true} value={row.foreignValue} />
      ),
      width: 120,
    },
    {
      headerName: "Final Rate",
      field: "finalRate",
      flex: 1,
      renderCell: ({ row }) => <Input disabled={true} value={row.finalRate} />,
      width: 100,
    },
    {
      headerName: "Total",
      field: "total",
      flex: 1,
      renderCell: ({ row }) => <Input disabled={true} value={row.total} />,
      width: 100,
    },
    {
      headerName: "HSN Code",
      field: "hsn",
      sortable: false,
      renderCell: (params) => HSNCell(params, inputHandler),
      width: 150,
    },
    {
      headerName: "Remarks",
      field: "orderremark",
      sortable: false,
      renderCell: (params) => remarkCell(params, inputHandler),
      width: 250,
    },
  ];
  const successColumns = [
    {
      headerName: "Component",
      renderCell: ({ row }) => <ToolTipEllipses text={row.componentName} />,
      field: "componentName",
      flex: 1,
    },
    { headerName: "Part No.", field: "partNo", flex: 1 },
    { headerName: "PO Quantity", field: "poQuantity", flex: 1 },
    { headerName: "In Quantity", field: "inQuantity", flex: 1 },
    { headerName: "Location", field: "location", flex: 1 },
  ];
  const newMinFunction = () => {
    setMaterialInSuccess(false);
    setPoData({ materials: [] });
    setResetPoData({ materials: [] });
    window.location.reload();
  };
  const additional = () => (
    <Space>
      <div style={{ width: 250 }}>
        <MyAsyncSelect
          allowClear
          size="default"
          selectLoading={selectLoading}
          onBlur={() => setAsyncOptions([])}
          value={searchData.vendor == "" ? null : searchData.vendor}
          onChange={(value) =>
            setSearchData((searchData) => ({ ...searchData, vendor: value }))
          }
          loadOptions={getVendors}
          optionsState={asyncOptions}
          placeholder="Select Vendor..."
        />
      </div>
      <div style={{ width: 150 }}>
        <Input
          allowClear
          placeholder="PO Number"
          value={searchData.poNumber}
          onChange={(e) =>
            setSearchData((searchData) => ({
              ...searchData,
              poNumber: e.target.value,
            }))
          }
        />
      </div>
      <Button
        disabled={searchData.vendor == "" || searchData.poNumber == ""}
        type="primary"
        loading={searchLoading}
        onClick={getDetail}
        id="submit"
      >
        Search
      </Button>

      {/* <CommonIcons
        action="downloadButton"
        onClick={() => downloadCSV(rows, columns, "Pending PO Report")}
        disabled={rows.length == 0}
      /> */}
    </Space>
  );

  useEffect(() => {
    // getDetail();
    // getLocation();
    getCurrencies();
    getAutoComnsumptionOptions();
  }, []);
  useEffect(() => {
    let grandTotal = poData?.materials.map((row) =>
      Number(row?.total).toFixed(2)
    );
    let totalTaxableValue = poData?.materials.map((row) =>
      Number(row?.taxableValue)
    );
    let customTotal = poData?.materials.map((row) => Number(row?.customDuty));
    let freightTotal = poData?.materials.map((row) =>
      Number(row?.freightValue)
    );
    let inrValue = poData?.materials.map((row) => Number(row?.inrValue));
    let obj = [
      { label: "Total Taxable Value", sign: "+", values: totalTaxableValue },
      { label: "Total Custom Duty", sign: "+", values: customTotal },
      { label: "Total Freight Charges", sign: "+", values: freightTotal },
      { label: "Total Sum", sign: "", values: grandTotal },
    ];
    setTotalValues(obj);
  }, [poData]);
  // log
  const { Text } = Typography;

  const callFileUpalod = async () => {
    setPreview(true);
    const values = uplaodForm.getFieldsValue();

    const file = values.files[0].originFileObj;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("po_id", searchData.poNumber);
    const response = await executeFun(
      () => uploadPOExportFile(formData),
      "fetch"
    );

    if (response?.data?.status === "success") {
      let { data } = response;

      // Flatten the new data structure to extract part details and other fields
      const formattedRows = data?.data?.map((item) => {
        const part = item.part;
        return {
          partCode: part.part_code,
          partName: part.part_name,
          componentKey: part.component_key,
          manualMfgCode: part.manual_mfg_code,
          hsn: item.hsn,
          uom: item.uom,
          orderQty: item.order_qty,
          importRate: item.import_rate,
          exchangeRate: item.exchange_rate,
          taxableValue: item.taxable_value,
          foreignValue: item.foreign_value,
          freightValue: item.freight_value,
          customDuty: item.custom_duty,
          total: item.total,
          finalRate: item.final_rate,
          pendingQty: item.pending_qty,
          poOrderQty: item.po_order_qty,
          value: (item.order_qty * item.import_rate).toFixed(3), // You may want to adjust the calculation for the value
        };
      });
      // Optional: map formatted rows to final structure
      let arr = formattedRows.map((r, index) => ({
        id: index + 1,
        partCode: r.partCode,
        partName: r.partName,
        component: { label: r.partName, value: r.componentKey },
        qty: r.orderQty,
        rate: r.importRate,
        hsn: r.hsn,
        value: r.value,
        gstRate: r.exchangeRate, // Example, adjust as needed
        gstType: r.uom, // Example, adjust as needed
        ...r,
      }));
      setPreviewRows(arr);
    } else {
      toast.error(response?.data?.message);
      setPreview(false);
    }
  };

  return (
    <div style={{ height: "90%", position: "relative" }}>
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        {(pageLoading || submitLoading == true) && <Loading />}
        <Col>
          <Space>
            <div style={{ width: 250 }}>
              <MyAsyncSelect
                allowClear
                size="default"
                selectLoading={loading1("select")}
                onBlur={() => setAsyncOptions([])}
                value={searchData.vendor}
                onChange={(value) =>
                  setSearchData((searchData) => ({
                    ...searchData,
                    vendor: value,
                  }))
                }
                loadOptions={getVendors}
                optionsState={asyncOptions}
                placeholder="Select Vendor..."
              />
            </div>
            <div style={{ width: 150 }}>
              <Input
                allowClear
                placeholder="PO Number"
                value={searchData.poNumber}
                onChange={(e) =>
                  setSearchData((searchData) => ({
                    ...searchData,
                    poNumber: e.target.value,
                  }))
                }
              />
            </div>
            <MyButton
              disabled={searchData.vendor == "" || searchData.poNumber == ""}
              type="primary"
              loading={searchLoading}
              onClick={getDetail}
              id="submit"
              variant="search"
            >
              Search
            </MyButton>
          </Space>
        </Col>
        <Col>
          <Space>
            {/* <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(rows, columns, "Pending PO Report")}
              disabled={rows.length == 0}
            /> */}
          </Space>
        </Col>
      </Row>
      {/* vendor info modal */}
      <Modal
        style={{
          top: 10,
        }}
        width={600}
        title={`Vendor Info : ${poData?.vendor_type?.vendorcode}`}
        open={showVendorInfo}
        onCancel={() => setShowVendorInfo(false)}
        footer={[]}
      >
        <Row gutter={[0, 16]}>
          <Col span={24}>
            <Row>
              <Col span={6}>
                <Text style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                  Vendor Name :
                </Text>
              </Col>
              <Col style={{ whiteSpace: "nowrap" }} span={18}>
                {poData?.vendor_type?.vendorname}
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row>
              <Col span={6}>
                <Text style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                  Vendor Address :
                </Text>
              </Col>
              <Col span={18}>
                {poData?.vendor_type?.vendoraddress?.replaceAll("<br>", " ")}
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row>
              <Col span={6}>
                <Text style={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                  Vendor GST :
                </Text>
              </Col>
              <Col style={{ whiteSpace: "nowrap" }} span={18}>
                {poData?.vendor_type?.gstin}
              </Col>
            </Row>
          </Col>
        </Row>
        {/* <Row>
          <Col span={24}>
            <DescriptionItem
              title="Vendor Address"
              content={poData?.vendor_type?.vendoraddress?.replaceAll(
                "<br>",
                " "
              )}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DescriptionItem title="Vendor GST" content="" />
          </Col>
        </Row> */}
      </Modal>
      {/* submit confirm modal */}

      {/* reset confirm modal */}
      <Modal
        title="Reset!"
        open={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowResetConfirm(false)}>
            No
          </Button>,
          <Button key="submit" type="primary" onClick={resetFunction}>
            Yes
          </Button>,
        ]}
      >
        <p>Are you sure you want to reset the entered data?</p>
      </Modal>

      {/* currency modal */}
      {showCurrency != null && (
        <CurrenceModal
          showCurrency={showCurrency}
          setShowCurrencyModal={setShowCurrenncy}
        />
      )}
      {/* upload doc modal */}

      {!materialInSuccess && (
        <Row gutter={8} style={{ height: "100%", padding: "0px 10px" }}>
          <Col
            span={6}
            style={{ overflowY: "hidden", maxHeight: "100%", height: "100%" }}
          >
            <Row
              style={{
                height: "76%",
              }}
              gutter={[0, 4]}
            >
              {/* vendor details */}
              <Row style={{ height: "50%", width: "100%" }}>
                <Card
                  size="small"
                  style={{ height: "100%", width: "100%" }}
                  bodyStyle={{ overflowY: "auto", maxHeight: "80%" }}
                  title="Vendor Details"
                >
                  <Row gutter={[0, 8]}>
                    <Col span={24}>
                      {!searchLoading && (
                        <Typography.Title
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                          }}
                          level={5}
                        >
                          Vendor Type
                        </Typography.Title>
                      )}
                      {!searchLoading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          {poData?.headers?.vendortype}
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={searchLoading}
                        active
                      />
                    </Col>
                    <Col span={24}>
                      {!searchLoading && (
                        <Typography.Title
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                          }}
                          level={5}
                        >
                          Vendor Name
                        </Typography.Title>
                      )}
                      {!searchLoading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          {poData?.headers?.vendorname}
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={searchLoading}
                        active
                      />
                    </Col>
                    <Col span={24}>
                      {!searchLoading && (
                        <Typography.Title
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                          }}
                          level={5}
                        >
                          Vendor Address
                        </Typography.Title>
                      )}
                      {!searchLoading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          <ToolTipEllipses
                            type="Paragraph"
                            text={poData?.headers?.vendoraddress?.replaceAll(
                              "<br>",
                              " "
                            )}
                          />
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={searchLoading}
                        active
                      />
                    </Col>
                    <Col span={24}>
                      {!searchLoading && (
                        <Typography.Title
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                          }}
                          level={5}
                        >
                          Vendor GSTIN
                        </Typography.Title>
                      )}
                      {!searchLoading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          {poData?.headers?.gstin}
                        </Typography.Text>
                      )}

                      <span display="flex"></span>
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={searchLoading}
                        active
                      />
                    </Col>
                    <Col span={24}>
                      {!searchLoading && (
                        <Typography.Title
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                          }}
                          level={5}
                        >
                          Cost Center
                        </Typography.Title>
                      )}
                      {!searchLoading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          {poData?.headers?.cost_center_name}
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={searchLoading}
                        active
                      />
                    </Col>

                    <Col span={24}>
                      {!searchLoading && (
                        <Typography.Title
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                          }}
                          level={5}
                        >
                          Project Code
                        </Typography.Title>
                      )}
                      {!searchLoading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          {poData?.headers?.project_code}
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={searchLoading}
                        active
                      />
                    </Col>

                    <Col span={24}>
                      {!searchLoading && (
                        <Typography.Title
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                          }}
                          level={5}
                        >
                          Project Description
                        </Typography.Title>
                      )}
                      {!searchLoading && (
                        <Typography.Text
                          style={{
                            fontSize:
                              window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                          }}
                        >
                          {poData?.headers?.project_description ?? "--"}
                        </Typography.Text>
                      )}
                      <Skeleton
                        paragraph={false}
                        style={{ width: "100%" }}
                        rows={1}
                        loading={searchLoading}
                        active
                      />
                    </Col>
                    <Col span={24}>
                      <Typography.Title
                        style={{
                          fontSize:
                            window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                        }}
                        level={5}
                      >
                        Currency
                      </Typography.Title>
                      <MySelect
                        onChange={(value) => setCurrency(value)}
                        value={currency}
                        options={currencies}
                        label="Currency"
                      />
                    </Col>
                    <Col span={24}>
                      <Typography.Title
                        style={{
                          fontSize:
                            window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                        }}
                        level={5}
                      >
                        Location
                      </Typography.Title>
                      <MySelect
                        onChange={(value) => setSelectLocation(value)}
                        value={selectLocation}
                        options={locationOptions}
                        label="Location"
                      />
                    </Col>
                    <Col span={24}>
                      <Typography.Title
                        style={{
                          fontSize:
                            window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                        }}
                        level={5}
                      >
                        Invoice Number
                      </Typography.Title>
                      <Input
                        name="invoice_number"
                        rules={[
                          {
                            required: true,
                            message: "Please enter invoice number",
                          },
                        ]}
                        onChange={(value) => {
                          setInvoice(value.target.value);
                        }}
                        value={invoice}
                      />
                    </Col>
                    <Col span={24}>
                      <Typography.Title
                        style={{
                          fontSize:
                            window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                        }}
                        level={5}
                      >
                        Invoice Date
                      </Typography.Title>
                      <DatePicker
                        style={{ width: "100%" }}
                        name="invoice_date"
                        onChange={(value) => setInvoiceDate(value)}
                        value={invoiceDate}
                      />
                    </Col>
                  </Row>
                </Card>
              </Row>
              <Col span={24} style={{ width: "100%", height: "20%" }}>
                <Card
                  size="small"
                  style={{ width: "100%", height: "100%" }}
                  bodyStyle={{ overflowY: "auto", maxHeight: "74%" }}
                  title="Upload Excel"
                >
                  <Row
                    span={24}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Col>
                      <MyButton
                        variant="upload"
                        text="Excel"
                        onClick={() => {
                          if (searchData?.poNumber) {
                            setOpen(true);
                          } else {
                            toast.error("Please enter PO Number");
                          }
                        }}
                      >
                        Excel
                      </MyButton>
                    </Col>
                    <Col>
                      <Button onClick={() => setUploadClicked(true)}>
                        {" "}
                        Upload Documents
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </Col>
              {/* tax details */}
              <Col span={24} style={{ width: "100%", height: "75%" }}>
                <Card
                  size="small"
                  style={{ width: "100%", height: "50%" }}
                  bodyStyle={{ overflowY: "auto", maxHeight: "100%" }}
                  title="Tax Details"
                >
                  <Row gutter={[0, 4]}>
                    {totalValues?.map((row) => (
                      <Col span={24} key={row.label}>
                        <Row>
                          <Col
                            span={18}
                            style={{
                              fontSize: "0.8rem",
                              fontWeight:
                                totalValues?.indexOf(row) ==
                                  totalValues.length - 1 && 600,
                            }}
                          >
                            {row.label}
                          </Col>
                          <Col span={6} className="right">
                            {row.sign.toString() == "" ? (
                              ""
                            ) : (
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  fontWeight:
                                    totalValues?.indexOf(row) ==
                                      totalValues.length - 1 && 600,
                                }}
                              >
                                ({row.sign.toString()}){" "}
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: "0.8rem",
                                fontWeight:
                                  totalValues?.indexOf(row) ==
                                    totalValues.length - 1 && 600,
                              }}
                            >
                              {Number(
                                row.values?.reduce((partialSum, a) => {
                                  return partialSum + Number(a);
                                }, 0)
                              ).toFixed(2)}
                            </span>
                          </Col>
                        </Row>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>
              <Modal
                title="Upload File Here"
                open={open}
                width={500}
                onCancel={() => setOpen(false)}
                footer={[
                  <Button key="back" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>,
                  <Button key="submit" type="primary" onClick={callFileUpalod}>
                    Preview
                  </Button>,
                ]}
              >
                {loading("fetch") && <Loading />}
                <Card>
                  <Form
                    // initialValues={initialValues}
                    form={uplaodForm}
                    layout="vertical"
                  >
                    <Form.Item>
                      <Form.Item
                        name="files"
                        valuePropName="fileList"
                        getValueFromEvent={normFile}
                        // rules={rules.file}
                        noStyle
                      >
                        <Upload.Dragger name="files" {...props}>
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                          </p>
                          <p className="ant-upload-text">
                            Click or drag file to this area to upload
                          </p>
                        </Upload.Dragger>
                      </Form.Item>
                    </Form.Item>

                    <Row justify="end" style={{ marginTop: 5 }}>
                      <a
                        href="http://imsv2.mscapi.live/files/sample/Import%20PO%20Sample%20File%20Format.xlsx"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MyButton variant="downloadSample" />
                      </a>
                    </Row>
                  </Form>
                </Card>
              </Modal>
              <Drawer
                width="100%"
                title="Preview Data From Excel"
                placement="right"
                onClose={() => setPreview(false)}
                destroyOnClose={true}
                open={preview}
                bodyStyle={{
                  padding: 5,
                }}
              >
                {loading1("fetch") && <Loading />}
                <Row
                  style={{
                    height: "95%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Col
                    style={{
                      height: "90%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                    span={23}
                  >
                    <MyDataTable
                      columns={previewedcolumns}
                      data={previewRows}
                      // pagination
                      loading={loading("fetch")}
                      headText="center"
                      // export={true}
                    />
                  </Col>
                  <Row
                    span={24}
                    style={{
                      width: "100%",
                      height: "10%",
                      display: "flex",
                      justifyContent: "end",
                    }}
                  >
                    <NavFooter
                      // submithtmlType="Save"
                      // resethtmlType="Back"
                      submitFunction={saveTheData}
                      nextLabel="Submit"
                      resetFunction={() => setPreview(false)}
                    ></NavFooter>
                  </Row>
                </Row>
              </Drawer>
              <Modal
                open={uplaoaClicked}
                layout="vertical"
                width={700}
                title={"Upload Document"}
                // destroyOnClose={true}
                onCancel={() => setUploadClicked(false)}
                onOk={() => setUploadClicked(false)}
                // style={{ maxHeight: "50%", height: "50%", overflowY: "scroll" }}
              >
                <Form
                  initialValues={defaultValues}
                  form={form2}
                  layout="vertical"
                >
                  <Card style={{ height: "20rem", overflowY: "scroll" }}>
                    <div style={{ flex: 1 }}>
                      <Col
                        span={24}
                        style={{
                          overflowX: "hidden",
                          overflowY: "auto",
                        }}
                      >
                        <Form.List name="components">
                          {(fields, { add, remove }) => (
                            <>
                              <Col>
                                {fields.map((field, index) => (
                                  <Form.Item noStyle>
                                    <SingleProduct
                                      fields={fields}
                                      field={field}
                                      index={index}
                                      add={add}
                                      form={form2}
                                      remove={remove}
                                      // setFiles={setFiles}
                                      // files={files}
                                    />
                                  </Form.Item>
                                ))}
                                <Row justify="center">
                                  <Typography.Text type="secondary">
                                    ----End of the List----
                                  </Typography.Text>
                                </Row>
                              </Col>
                            </>
                          )}
                        </Form.List>
                      </Col>
                    </div>
                  </Card>
                </Form>{" "}
              </Modal>
            </Row>
          </Col>
          <Col
            span={18}
            style={{
              height: "85%",
              padding: 0,
              border: "1px solid #eeeeee ",
              overflow: "hidden",
            }}
          >
            {" "}
            {pageLoading || (loading1("select") && <Loading />)}
            <FormTable columns={columns} data={poData?.materials} />
          </Col>

          <NavFooter
            backFunction={backFunction}
            hideHeaderMenu
            nextLabel="Submit"
            loading={submitLoading}
            resetFunction={() => {
              setShowResetConfirm(true);
            }}
            submitFunction={validateData}
            disabled={
              {
                // uploadDoc: !poData.headers,
                // reset: !poData.headers,
                // next: !poData.headers,
                // back: !poData.headers,
              }
            }
          />
        </Row>
      )}
      {materialInSuccess && (
        <SuccessPage
          newMinFunction={newMinFunction}
          po={materialInSuccess}
          successColumns={successColumns}
        />
      )}
    </div>
  );
}
const defaultValues = {
  components: [
    {
      // file: "",
    },
  ],
};
