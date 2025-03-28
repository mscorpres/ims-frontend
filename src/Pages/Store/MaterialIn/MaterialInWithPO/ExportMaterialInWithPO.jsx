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
} from "antd";
import {
  QuantityCell,
  taxableCell,
  foreignCell,
  invoiceIdCell,
  invoiceDateCell,
  HSNCell,
  gstTypeCell,
  CGSTCell,
  SGSTCell,
  IGSTCell,
  locationCell,
  remarkCell,
  rateCell,
  autoConsumptionCell,
  gstRate,
  manualMFGCode,
} from "./TableCollumns.jsx";
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
  poMINforMIN,
  uploadPOExportFile,
} from "../../../../api/general.ts";
import { convertSelectOptions } from "../../../../utils/general.ts";
import useApi from "../../../../hooks/useApi.ts";
import MyButton from "../../../../Components/MyButton/index.jsx";
import FormTable from "../../../../Components/FormTable.jsx";

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
  const [showCurrency, setShowCurrenncy] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [autoConsumptionOptions, setAutoConsumptionOption] = useState([]);
  const [totalValues, setTotalValues] = useState([
    { label: "cgst", sign: "+", values: [] },
    { label: "sgst", sign: "+", values: [] },
    { label: "cigst", sign: "+", values: [] },
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
  const [codeCostCenter, setCodeCostCenter] = useState("");
  const [isScan, setIsScan] = useState(false);
  const [uplaoaClicked, setUploadClicked] = useState(false);
  const [form] = Form.useForm();
  const [uplaodForm] = Form.useForm();
  const components = Form.useWatch("components", form);
  let costCode;
  const { executeFun, loading: loading1 } = useApi();
  const { loading } = useApi();
  console.log(form.getFieldsValue());
  const validateData = async () => {
    // let validation = false;
    let validation = true;
    // poData.materials.map((row) => {
    //   if (
    //     row.c_partno &&
    //     row.currency &&
    //     row.gstrate &&
    //     row.invoiceDate &&
    //     row.invoiceId &&
    //     row.location &&
    //     row.orderqty
    //   ) {
    //     validation = true;
    //   } else {
    //     validation = false;
    //   }
    // });
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
      let values = await form.validateFields();
      let a = values.components;
      // let a = values.components.map((comp) => {
      //   formData.append("files", comp.file[0]?.originFileObj);
      // });
      if (a?.length) {
        if (!values?.components[0]?.file) {
          toast.info("Please upload Files");
        }
        values.components.map((comp) => {
          formData.append("files", comp.file[0]?.originFileObj);
        });
        // poData.materials.map((row) => {
        //   componentData = {
        //     component: [...componentData.component, row.componentKey],
        //     qty: [...componentData.qty, row.orderqty],
        //     rate: [...componentData.rate, row.orderrate],
        //     currency: [...componentData.currency, row.currency],
        //     exchange: [
        //       ...componentData.exchange,
        //       row.exchange_rate == 0 ? 1 : row.exchange_rate,
        //     ],
        //     invoice: [...componentData.invoice, row.invoiceId],
        //     invoiceDate: [...componentData.invoiceDate, row.invoiceDate],
        //     hsncode: [...componentData.hsncode, row.hsncode],
        //     gsttype: [...componentData.gsttype, row.gsttype],
        //     gstrate: [...componentData.gstrate, row.gstrate],
        //     cgst: [...componentData.cgst, row.cgst],
        //     sgst: [...componentData.sgst, row.sgst],
        //     igst: [...componentData.igst, row.igst],
        //     remark: [...componentData.remark, row.orderremark],
        //     location: [...componentData.location, row.location.value],
        //     out_location: [...componentData.out_location, row.autoConsumption],
        //     documentName: values.components.map((r) => r.documentName),
        //     irn: irnNum,
        //     qrScan: isScan == true ? "Y" : "N",
        //   };
        // });
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
        //uploading invoices
        console.log("this is the component data", componentData);
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
    // setSelectedRows(previewRows);
    // setRows(previewRows);
    console.log(previewRows);
    let arr = previewRows.map((r) => {
      console.log(r);
      return {
        ...r,
        mfgCode: r.Manualmfgcode,
        hsnCode: r.hsn,
        autoConsumption: r.Autoconsump == "Y" ? "Yes" : "No",
      };
    });

    form.setFieldValue("components", arr);
  };

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
    console.log(values)
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
    console.log("isScan", isScan);
    // return;
    // log
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
          poid: poData.headers.transaction,
          manual_mfg_code: poData.materials.map((row) => row.mfgCode),
        };
        final = { ...final, ...values.componentData };
        const response = await executeFun(() => poMINforMIN(final), "select");
        // const { data } = await imsAxios.post("/purchaseOrder/poMIN", final);
        // console.log("data po min", data);
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
            poId: poData.headers.transaction,
            vendor: poData.headers.vendorcode,
            components: poData.materials.map((row) => {
              return {
                id: row.c_partno,
                componentName: row.component_fullname,
                partNo: row.c_partno,
                inQuantity: row.orderqty,
                invoiceNumber: row.invoiceId,
                invoiceDate: row.invoiceDate,
                location: row.location.label,
                poQuantity: row.po_order_qty,
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

  console.log(previewRows);
  const inputHandler = (name, value, id) => {
    console.log(poData);
    let arr = poData?.materials;
    arr = arr.map((row) => {
      let obj = row;
      if (id == row.id) {
        if (name == "orderqty") {
          if (value <= row.maxQty) {
            obj = {
              ...obj,
              [name]: value,
              inrValue: value * row.orderrate,
              usdValue: value * row.orderrate * row.exchange_rate,
              igst:
                row.gsttype == "L"
                  ? 0
                  : (value * row.orderrate * row.gstrate) / 100,
              sgst:
                row.gsttype == "I"
                  ? 0
                  : (value * row.orderrate * row.gstrate) / 200,
              cgst:
                row.gsttype == "I"
                  ? 0
                  : (value * row.orderrate * row.gstrate) / 200,
            };
          }
          return obj;
        } else if (name == "orderrate") {
          obj = {
            ...obj,
            [name]: value,
            inrValue: value * row.orderqty,
            usdValue: value * row.orderqty * row.exchange_rate,
            igst:
              row.gsttype == "L"
                ? 0
                : (value * row.orderqty * row.gstrate) / 100,
            sgst:
              row.gsttype == "I"
                ? 0
                : (value * row.orderqty * row.gstrate) / 200,
            cgst:
              row.gsttype == "I"
                ? 0
                : (value * row.orderqty * row.gstrate) / 200,
          };
          return obj;
        } else if (name == "gsttype") {
          if (value == "I") {
            obj = {
              ...obj,
              [name]: value,
              igst: (row.inrValue * row.gstrate) / 100,
              sgst: 0,
              cgst: 0,
            };
          } else if (value == "L") {
            obj = {
              ...obj,
              igst: 0,
              [name]: value,
              sgst: (row.inrValue * row.gstrate) / 200,
              cgst: (row.inrValue * row.gstrate) / 200,
            };
          }
          return obj;
        } else if (name == "gstrate") {
          obj = {
            ...obj,
            [name]: value,
            igst: row.gsttype == "L" ? 0 : (value * row.inrValue) / 100,
            sgst: row.gsttype == "I" ? 0 : (value * row.inrValue) / 200,
            cgst: row.gsttype == "I" ? 0 : (value * row.inrValue) / 200,
          };
          return obj;
        } else if (name == "currency") {
          if (value == "364907247") {
            obj = {
              ...obj,
              currency: value,
              usdValue: 0,
              exchange_rate: 1,
            };
          } else {
            obj = {
              ...obj,
              [name]: value,
            };
            setShowCurrenncy({
              currency: value,
              price: row.inrValue,
              exchange_rate: row.exchange_rate,
              symbol: currencies.filter((cur) => cur.value == value)[0].text,
              rowId: row.id,
              inputHandler: inputHandler,
            });
          }

          return obj;
        } else if (name == "exchange_rate") {
          obj = {
            ...obj,
            exchange_rate: value.rate,
            currency: value.currency,
            usdValue: row.inrValue * value.rate,
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
    console.log("this is the vendor options", response.data);
    if (response.success) {
      arr = convertSelectOptions(response.data);
      console.log("this is the arr options", arr);
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
        // materials: obj.materials.map((mat, index) => {
        //   let percentage = mat.gstrate;
        //   return {
        //     // adding properties in materials array
        //     ...mat,
        //     id: v4(),
        //     gsttype: mat.gsttype,
        //     inrValue: mat?.orderqty * mat?.orderrate,
        //     cgst:
        //       mat.gsttype == "I"
        //         ? 0
        //         : (mat?.orderqty * mat?.orderrate * (percentage / 2)) / 100,
        //     sgst:
        //       mat.gsttype == "I"
        //         ? 0
        //         : (mat?.orderqty * mat?.orderrate * (percentage / 2)) / 100,
        //     igst:
        //       mat.gsttype == "L"
        //         ? 0
        //         : (mat?.orderqty * mat?.orderrate * percentage) / 100,
        //     invoiceDate: "",
        //     invoiceId: "",
        //     location: { label: "RM021", value: "20210910142629" },
        //     maxQty: mat?.orderqty,
        //     autoConsumption: 0,
        //     pendingqtybyorderqty: mat.orderqty + " /" + mat.po_order_qty,
        //     mfg: mat.mfgCode,
        //   };
        // }),
      };
      costCode = obj.headers.cost_center_key;
      // console.log("obj", costCode);
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
    // console.log("obj", costCode);
    // console.log("codeCostCenter", codeCostCenter);
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
      renderCell: ({ row }) => <ToolTipEllipses text={row.manualMfgCode} />,
      sortable: false,
      width: 100,
    },

    {
      headerName: "QTY",
      field: "orderQty",
      sortable: false,
      renderCell: ({ row }) => <ToolTipEllipses text={row.orderQty} />,
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
      renderCell: ({ row }) => <ToolTipEllipses text={row.rate} />,
      width: 100,
    },
    {
      headerName: "Exchange Rate",
      field: "exchangeRate",
      sortable: false,
      renderCell: ({ row }) => <ToolTipEllipses text={row.exchangeRate} />,
      width: 100,
    },
    {
      headerName: "Taxable Value",
      field: "taxableValue",
      sortable: false,
      renderCell: ({ row }) => <ToolTipEllipses text={row.taxableValue} />,
      width: 120,
    },
    {
      headerName: "Foreign Value",
      field: "foreignValue",
      sortable: false,
      renderCell: ({ row }) => <ToolTipEllipses text={row.foreignValue} />,
      width: 120,
    },
    {
      headerName: "HSN Code",
      field: "hsn",
      sortable: false,
      renderCell: ({ row }) => <ToolTipEllipses text={row.hsn} />,
      width: 150,
    },
    {
      headerName: "Location",
      field: "location",
      sortable: false,
      renderCell: (params) =>
        locationCell(params, inputHandler, locationOptions),
      width: 150,
    },
    {
          headerName: "Invoice ID",
          field: "invoiceId",
          sortable: false,
          renderCell: (params) => invoiceIdCell(params, inputHandler),
          width: 200,
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
    { headerName: "Invoice Number", field: "invoiceNumber", flex: 1 },
    { headerName: "Invoice Date", field: "invoiceDate", flex: 1 },
    { headerName: "Location", field: "location", flex: 1 },
  ];
  const newMinFunction = () => {
    setMaterialInSuccess(false);
    setPoData({ materials: [] });
    setResetPoData({ materials: [] });
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
      Number(row?.cgst + row?.sgst + row?.igst + row.inrValue)
    );
    let cgsttotal = poData?.materials.map((row) => Number(row?.cgst));
    let sgsttotal = poData?.materials.map((row) => Number(row?.sgst));
    let igsttotal = poData?.materials.map((row) => Number(row?.igst));
    let inrValue = poData?.materials.map((row) => Number(row?.inrValue));
    let obj = [
      { label: "Sub-Total value before Taxes", sign: "", values: inrValue },
      { label: "CGST", sign: "+", values: cgsttotal },
      { label: "SGST", sign: "+", values: sgsttotal },
      { label: "IGST", sign: "+", values: igsttotal },
      { label: "Sub-Total values after Taxes", sign: "", values: grandTotal },
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
      console.log(response);
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

      // Log the processed rows
      console.log(formattedRows);

      // Optional: map formatted rows to final structure
      let arr = formattedRows.map(
        (r, index) => (
          console.log(r, index),
          {
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
          }
        )
      );
      console.log(arr);
      setPreviewRows(arr);
    } else {
      toast.error(response.message.msg);
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
          <Col span={6}>
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
                      <Col span={24}>
                        {/* <Form.Item name="QR"> */}
                        <Checkbox
                          checked={isScan}
                          onChange={(e) => setIsScan(e.target.checked)}
                        ></Checkbox>
                        <Typography.Text
                          style={{
                            fontSize: 11,
                            marginLeft: "4px",
                            marginBottom: "4px",
                          }}
                        >
                          Scan with QR Code
                        </Typography.Text>
                        {/* </Form.Item> */}
                      </Col>
                      <span display="flex">
                        <Row gutter={[0, 0]}>
                          <Col span={10}>
                            <Typography.Title
                              style={{
                                marginTop: "5px",
                                fontSize:
                                  window.innerWidth < 1600
                                    ? "0.85rem"
                                    : "0.95rem",
                              }}
                              level={5}
                            >
                              Acknowledgment Number
                            </Typography.Title>
                          </Col>
                          <Col span={14}>
                            <Input
                              style={{
                                marginTop: "5px",
                              }}
                              placeholder="Please enter Acknowledgment Number"
                              onChange={(e) => setIrnNum(e.target.value)}
                            />
                          </Col>
                        </Row>
                      </span>
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
                        onClick={() => setOpen(true)}
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
              <Col span={24} style={{ width: "100%", height: "50%" }}>
                <Card
                  size="small"
                  style={{ width: "100%", height: "100%" }}
                  bodyStyle={{ overflowY: "auto", maxHeight: "74%" }}
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
                      <MyButton
                        variant="downloadSample"
                        onClick={() =>
                          downloadCSVCustomColumns(sampleData, "RM Inward")
                        }
                      />
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
                {loading("fetch") && <Loading />}
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
                  form={form}
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
                                      form={form}
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
            style={{ height: "85%", padding: 0, border: "1px solid #eeeeee " }}
          >
            {" "}
            {pageLoading || (loading1("select") && <Loading />)}
            <FormTable columns={columns} data={previewRows} />
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
            disabled={{
              uploadDoc: !poData.headers,
              reset: !poData.headers,
              next: !poData.headers,
              back: !poData.headers,
            }}
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
