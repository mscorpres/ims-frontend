import { useState, useEffect } from "react";
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
  Flex,
  Typography,
  Upload,
  Checkbox,
  Drawer,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import Loading from "../../../../Components/Loading";

import MySelect from "../../../../Components/MySelect";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import CurrenceModal from "../../../../Components/CurrenceModal";
import AddVendorSideBar from "../../../PurchaseOrder/CreatePO/AddVendorSideBar";
import AddBranch from "../../../Master/Vendor/model/AddBranch";
import SuccessPage from "../SuccessPage";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../../axiosInterceptor";
import useApi from "../../../../hooks/useApi.ts";
import MyButton from "../../../../Components/MyButton/index.jsx";
import {
  getComponentDetail,
  getComponentOptions,
  getCostCentresOptions,
  getProjectOptions,
  getVendorBranchDetails,
  getVendorBranchOptions,
  getVendorOptions,
  uplaodFileInMINInward,
} from "../../../../api/general";
import { convertSelectOptions, getInt } from "../../../../utils/general";
import FormTable2 from "../../../../Components/FormTable2";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import {
  materialInWithoutPo,
  uploadMinInvoice,
  validateInvoice,
} from "../../../../api/store/material-in";
import SingleProduct from "../../../Master/Vendor/SingleProduct";
import { downloadCSVCustomColumns } from "../../../../Components/exportToCSV.jsx";
import MyDataTable from "../../../../Components/MyDataTable.jsx";

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
  fileComponents: [
    {
      // file: "",
    },
  ],
};

const vendorDetailsOptions = [
  { text: "JWI (Job Work In)", value: "j01" },
  { text: "Vendor", value: "v01" },
  { text: "Production Return", value: "p01" },
];

export default function MaterialInWithoutPO() {
  const [showCurrency, setShowCurrenncy] = useState(null);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(null);
  const [autoConsumptionOptions, setAutoConsumptionOption] = useState([]);
  const [isScan, setIsScan] = useState(false);
  const [open, setOpen] = useState(false);

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
  const [isApplicable, setIsApplicable] = useState(false);
  const [vendorBranchOptions, setVendorBranchOptions] = useState([]);
  const [uplaoaClicked, setUploadClicked] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);
  const [form] = Form.useForm();
  const components = Form.useWatch("components", form);
  const fileComponents = Form.useWatch("fileComponents", form);
  const { executeFun, loading } = useApi();
  const costCenter = Form.useWatch("costCenter", form);
  const vendor = Form.useWatch("vendorName", form);
  const vendorBranch = Form.useWatch("vendorBranch", form);
  const vendorType = Form.useWatch("vendorType", form);
  const [uplaodForm] = Form.useForm();
  const sampleData = [
    {
      PART_CODE: "p0001",
      MANUAL_MFG_CODE: "1",
      QTY: 12,
      RATE: "--",
      HSN: "123456",
      LOCATION: "RM021",
      AUTO_CONSUMP: "N",
      REMARK: "test",
      GST_TYPE: "LOCAL",
      GST_RATE: "18",
    },
  ];
  // console.log("fileComponents", fileComponents);
  const handleSubmit = async () => {
    const values = await form.validateFields();
    Modal.confirm({
      title: "Create MIN",
      content: "Are you sure you want to create this MIN?",
      okText: "Continue",
      confirmLoading: loading("submit"),
      cancelText: "Back",
      onOk: values.vendorType === "p01" ? submitMIN : handleValidatingInvoices,
    });
  };

  const handleValidatingInvoices = async () => {
    const values = await form.validateFields();

    const response = await executeFun(() => validateInvoice(values), "submit");
    console.log("success from validate invoice");
    if (response.success) {
      const { data } = response;
      if (data.invoicesFound) {
        return Modal.confirm({
          title:
            "Following invoices are already found in our records, Do you still wish to continue?",
          content: <Row>{data.invoicesFound.map((inv) => `${inv}, `)}</Row>,
          onOk() {
            submitMIN(values);
          },
          okText: "Continue",
          confirmLoading: loading("submit"),
          cancelText: "Cancel",
        });
      } else {
        submitMIN(values);
      }
    } else {
      submitMIN(values);
    }
  };
  const submitMIN = async () => {
    let fileName;
    const formData = new FormData();
    const vendorType = form.getFieldValue("vendorType");
    const values = await form.validateFields();
    // console.log("values", values);
    values?.fileComponents?.map((comp) => {
      formData.append("files", comp.file[0]?.originFileObj);
    });
    let fileResponse;
    if (vendorType !== "p01") {
      fileResponse = await executeFun(
        () => uploadMinInvoice(formData),
        "submit"
      );
    }
    console.log("fileResponse-------", fileResponse);

    if (fileResponse?.success || vendorType == "p01") {
      fileName = fileResponse?.data?.data;

      const response = await executeFun(
        () => materialInWithoutPo(values, fileName, vendorType),
        "submit"
      );
      console.log("response-------", response);
      if (response.success) {
        // const { data } = response.data;
        if (response.data.code == 200) {
          setShowSuccessPage({
            materialInId: response.data.data.txn,
            vendor: { vendorname: values.vendorName.label },
            components: values.components.map((row, index) => {
              return {
                id: index,
                componentName: row.component.label,
                inQuantity: row.qty,
                invoiceNumber: row.invoiceId,
                invoiceDate: row.invoiceDate,
                location: row.location.label,
              };
            }),
          });
          form.resetFields();
          vendorResetFunction();
          materialResetFunction();
          setPreviewRows([]);
          setPreview(false);
        } else {
          // console.log("r/esponse.data.message", response.data.message);
          toast.error(response.data.message);
        }
      } else {
        toast.error(response.data.message);
      }
    }
  };

  const handleFetchComponentOptions = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    let arr = [];
    if (response.success) {
      // console.log("Respomse", response);
      if (response.data[0].piaStatus == "Y") {
        toast.info(
          `PIA Status is enabled for ${response.data[0].newPart} Part Code.`
        );
      }
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
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  const handleFetchComponentDetails = async (row, rowId, value) => {
    const response = await executeFun(
      () => getComponentDetail(value.value),
      "fetch"
    );
    if (response.success) {
      const { data } = response;
      console.log("data,", data, rowId);
      form.setFieldValue(["components", rowId, "gstRate"], data.data.gstrate);
      form.setFieldValue(["components", rowId, "hsn"], data.data.hsn);
      form.setFieldValue(["components", rowId, "rate"], data.data.rate);
      form.setFieldValue(["components", rowId, "mfg"], data.data.mfgCode);
      // form.setFieldValue(["components", rowId, "value"], getInt(inrValue));
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

  const getVendorBracnch = async (vendorCode) => {
    const response = await executeFun(
      () => getVendorBranchOptions(vendorCode),
      "fetch"
    );

    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data.data);
    }
    form.setFieldValue("vendorBranch", arr[0]?.value);

    setVendorBranchOptions(arr);
    return arr;
  };

  const handleFetchVendorBranchDetails = async (branchCode) => {
    const vendorCode = form.getFieldValue("vendorName");
    const response = await executeFun(
      () => getVendorBranchDetails(vendorCode.value, branchCode),
      "fetch"
    );

    if (response.success) {
      // console.log("response =>", response?.data?.data.einvoice_status);
      setIsApplicable(response.data?.data?.einvoice_status);
      form.setFieldValue("gstin", response?.data?.data?.gstid);
      form.setFieldValue("vendorAddress", response?.data?.data.address);
    }
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
  const calculation = (rowId, obj) => {
    const { gstRate, gstType, qty, rate, exchangeRate, currency } = obj;
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
    { headerName: "In Quantity", field: "inQuantity", flex: 1 },
    { headerName: "Invoice Number", field: "invoiceNumber", flex: 1 },
    { headerName: "Invoice Date", field: "invoiceDate", flex: 1 },
    { headerName: "Location", field: "location", flex: 1 },
  ];
  useEffect(() => {
    console.log("isScan", isScan);
    if (isScan == true) {
      form.setFieldValue("QR", isScan);
    }
  }, [isScan]);

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
    let grandTotal = components?.map((row) =>
      Number(row?.cgst + row?.sgst + row?.igst + row?.value)
    );
    let cgsttotal = components?.map((row) => Number(row?.cgst));
    let sgsttotal = components?.map((row) => Number(row?.sgst));
    let igsttotal = components?.map((row) => Number(row?.igst));
    let inrValue = components?.map((row) => Number(row?.value));
    let obj = [
      { label: "Sub-Total value before Taxes", sign: "", values: inrValue },
      { label: "CGST", sign: "+", values: cgsttotal },
      { label: "SGST", sign: "+", values: sgsttotal },
      { label: "IGST", sign: "+", values: igsttotal },
      { label: "Sub-Total values after Taxes", sign: "", values: grandTotal },
    ];
    setTotalValues(obj);
  }, [components]);
  useEffect(() => {
    if (vendor) {
      getVendorBracnch(vendor.value);
    }
  }, [vendor]);
  useEffect(() => {
    if (vendorType === "p01") {
      form.resetFields([
        "vendorName",
        "vendorBranch",
        "vendorAddress",
        "gstin",
      ]);
    }
  }, [vendorType]);

  useEffect(() => {
    handleFetchVendorBranchDetails(vendorBranch);
  }, [vendorBranch]);
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
      headerName: "MFG",
      name: "mfg",
      width: 100,
      // renderCell: ({ row }) => ,
      field: (_, index) => <Input disabled />,
    },
    {
      headerName: "Manual MFG",
      name: "mfgCode",
      width: 100,
      // renderCell: ({ row }) => ,
      field: (_, index) => <Input type="string" />,
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
            } else {
              return Promise.resolve();
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
      width: 160, //comment added
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

      field: (row) => <Input disabled />,
      name: "igst",

      width: 120,
    },
    {
      headerName: "Location",
      name: "location",
      field: () => <MySelect options={locationOptions} labelInValue={true} />,
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
  const closeDrawer = () => {
    setPreview(false);
    setOpen(false);
    // setSelectedRows(previewRows);
    // setRows(previewRows);
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
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const props = {
    name: "file",
    multiple: false,

    maxCount: 1,

    beforeUpload(file) {
      return false;
    },
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
      headerName: "Location",
      field: "locationName",
      renderCell: ({ row }) => <ToolTipEllipses text={row.locationName} />,
      width: 100,
    },

    {
      headerName: "Hsn",
      field: "hsn",
      renderCell: ({ row }) => <ToolTipEllipses text={row.Hsn} />,
      width: 110,

      // width: "12vw",
    },
    {
      headerName: "Rate",
      field: "rate",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "Qty ",
      field: "qty",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => <ToolTipEllipses text={row.Qty} copy={true} />,
      // flex: 1,
    },
    {
      headerName: "Auto Consumption",
      field: "autoConsName",
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "Remark",
      field: "Remark",
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "GST RATE",
      field: "Gstrate",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "GST TYPE",
      field: "Gsttype",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.gstType} copy={true} />
      ),
    },
  ];
  const callFileUpalod = async () => {
    setPreview(true);
    const values = uplaodForm.getFieldsValue();

    const file = values.files[0].originFileObj;
    const formData = new FormData();
    formData.append("file", file);
    const response = await executeFun(
      () => uplaodFileInMINInward(formData),
      "fetch"
    );
    if (response?.data?.status == "success") {
      let { data } = response;
      let rows = data.data;
      // const formattedRows = data.data.rows.map((row) => {
      //   let rowObject = {};
      //   data.data.headers.forEach((header, index) => {
      //     rowObject[header] = row[index];
      //   });
      //   return rowObject;
      // });
      const formattedHeaders = data.data.headers.map((header) =>
        header
          .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
            index === 0 ? match.toUpperCase() : match.toLowerCase()
          )
          .replace(/\s+/g, "")
      );

      // Map the row values to headers
      const formattedRows = data.data.rows.map((row) => {
        let rowObject = {};
        formattedHeaders.forEach((header, index) => {
          rowObject[header] = row[index];
        });
        return rowObject;
      });

      let arr = formattedRows.map((r, index) => ({
        id: index + 1,
        partCode: r.Partcode.partNo,
        partName: r.Partcode.name,
        location: { label: r.Location.text, value: r.Location.value },
        locationName: r.Location.text,
        component: { label: r.Partcode.name, value: r.Partcode.key },
        qty: r.Qty,
        rate: r.Rate,
        hsn: r.Hsn,
        autoConsName: r.Autoconsump == "Y" ? "Yes" : "No",
        autoCons: {
          label: r.Autoconsump == "Y" ? "Yes" : "No",
          value: r.Autoconsump == "Y" ? "Yes" : "No",
        },
        value: (r.Qty * r.Rate).toFixed(3),
        gstRate: r.Gstrate,
        gstType: r.Gsttype.text,
        ...r,
      }));
      setPreviewRows(arr);
    } else {
      toast.error(response.message.msg);
      setPreview(false);
    }
  };
  return (
    <div style={{ height: "97%", overflow: "hidden", padding: 10 }}>
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

              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <Col
              span={6}
              style={{ height: "100%", overflowY: "auto", overflowX: "hidden" }}
            >
              {loading("fetch") && <Loading />}
              <Flex vertical gap={6}>
                <Card size="small">
                  <Row gutter={4}>
                    <Col span={24}>
                      <Form.Item name="vendorType" label="Vendor Type">
                        <MySelect options={vendorDetailsOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        style={{ marginBottom: -10 }}
                        name="vendorName"
                        extra={
                          <p
                            onClick={() => setShowAddVendorModal(true)}
                            style={{
                              textAlign: "end",
                              color: "#1890FF",
                              cursor: "pointer",
                              marginTop: 5,
                              fontSize: 12,
                            }}
                          >
                            Add Vendor
                          </p>
                        }
                        label="Vendor"
                        // rules={[
                        //   {
                        //     required: true,
                        //     message: "Please Select a vendor Name!",
                        //   },
                        // ]}
                      >
                        <MyAsyncSelect
                          selectLoading={loading("select")}
                          disabled={vendorType === "p01"}
                          labelInValue
                          onBlur={() => setAsyncOptions([])}
                          optionsState={asyncOptions}
                          loadOptions={getVendors}
                          // onChange={handleFetchPreviousRate(value, index)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12} style={{ marginBottom: -10 }}>
                      <Form.Item
                        name="vendorBranch"
                        extra={
                          <p
                            onClick={() => {
                              vendorDetails.vendorName
                                ? setShowBranchModal({
                                    vendor_code: vendorDetails.vendorName,
                                  })
                                : toast.error("Please Select a vendor first");
                            }}
                            style={{
                              color: "#1890FF",
                              cursor: "pointer",
                              fontSize: 12,
                              textAlign: "end",
                              marginTop: 5,
                            }}
                          >
                            Add Branch
                          </p>
                        }
                        label="Vendor Branch"
                        // rules={[
                        //   {
                        //     required: true,
                        //     message: "Please Select a vendor Branch!",
                        //   },
                        // ]}
                      >
                        <MySelect
                          disabled={vendorType === "p01"}
                          options={vendorBranchOptions}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12} style={{ marginBottom: -10 }}>
                      <Form.Item name="gstin" label="GSTIN">
                        <Input size="default" disabled />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Cost Center" name="costCenter">
                        <MyAsyncSelect
                          selectLoading={loading("select")}
                          onBlur={() => setAsyncOptions([])}
                          optionsState={asyncOptions}
                          loadOptions={handleFetchCostCenterOptions}
                        />
                      </Form.Item>
                    </Col>{" "}
                    {vendorType === "j01" && (
                      <Col span={24}>
                        <Form.Item name="ewaybill" label="E-Way Bill Number">
                          <Input size="default" />
                        </Form.Item>
                      </Col>
                    )}
                    {isApplicable == "Y" && (
                      <>
                        <Col span={24}>
                          <Form.Item name="QR">
                            <Checkbox
                              checked={isScan}
                              onChange={(e) => setIsScan(e.target.checked)}
                            ></Checkbox>
                            <Typography.Text
                              style={{ fontSize: 11, marginLeft: "4px" }}
                            >
                              Scan with QR
                            </Typography.Text>
                          </Form.Item>
                        </Col>
                        <Col span={24} style={{ marginBottom: -10 }}>
                          <Form.Item name="irn" label="Acknowledgment Number">
                            <Input size="default" disabled={isScan} />
                          </Form.Item>
                        </Col>
                      </>
                    )}
                    <Col span={12}>
                      {" "}
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
                    <Col span={24}>
                      <Form.Item name="vendorAddress" label="Bill From Address">
                        <Input.TextArea
                          rows={3}
                          disabled={vendorType === "p01"}
                          style={{ resize: "none" }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Invoice Date" name="invoiceDate">
                        <SingleDatePicker
                          setDate={(value) => {
                            form.setFieldValue("invoiceDate", value);
                          }}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Invoice Id" name="invoiceId">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Typography.Text style={{ fontSize: 12 }}>
                        Upload
                      </Typography.Text>
                    </Col>
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
                          text="Documents"
                          onClick={() => setUploadClicked(true)}
                        ></MyButton>
                      </Col>
                      <Col>
                        <MyButton
                          variant="upload"
                          text="Excel"
                          onClick={() => setOpen(true)}
                        >
                          Excel
                        </MyButton>
                      </Col>
                    </Row>
                  </Row>
                </Card>
                {/* <Card size="small">
                  <Form.Item label="Invoice / Document">
                    <Form.Item
                      name="invoice"
                      valuePropName="file"
                      getValueFromEvent={(e) => e?.file}
                      noStyle
                    >
                      <Upload.Dragger
                        name="invoice"
                        beforeUpload={() => false}
                        maxCount={1}
                        multiple={false}
                      >
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">
                          Click or drag file to this area to upload
                        </p>
                        <p className="ant-upload-hint">
                          Upload vendor invoice / Document.
                        </p>
                      </Upload.Dragger>
                    </Form.Item>
                  </Form.Item>
                </Card> */}

                <Card size="small">
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
              </Flex>
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
                    "mfg",
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
            <Modal
              open={uplaoaClicked}
              width={700}
              title={"Upload Document"}
              // destroyOnClose={true}
              onOk={() => setUploadClicked(false)}
              onCancel={() => setUploadClicked(false)}
              // style={{ maxHeight: "50%", height: "50%", overflowY: "scroll" }}
            >
              {" "}
              <Card style={{ height: "20rem", overflowY: "scroll" }}>
                <div style={{ flex: 1 }}>
                  <Col
                    span={24}
                    style={{
                      overflowX: "hidden",
                      overflowY: "auto",
                    }}
                  >
                    <Form.List name="fileComponents">
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
            </Modal>
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
            </Modal>{" "}
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
          </Row>
        </Form>
      )}
      <NavFooter
        resetFunction={() => setShowResetConfirm(true)}
        submitFunction={handleSubmit}
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
