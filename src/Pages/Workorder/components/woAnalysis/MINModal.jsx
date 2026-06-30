import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Typography,
  Upload,
} from "antd";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import {
  createMIN,
  getWorkOrderDetails,
} from "../api";
import { downloadCSVCustomColumns } from "../../../../Components/exportToCSV";
import {
  memo,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MySelect from "../../../../Components/MySelect";
import Loading from "../../../../Components/Loading";
import WODetailsCard from "./WODetailsCard";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import MINComponentsTable from "./MINComponentsTable";
import TaxDetails from "./TaxDetails";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import UploadDocs from "../../../Store/MaterialIn/MaterialInWithPO/UploadDocs";
import NavFooter from "../../../../Components/NavFooter";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";

const MINModal = ({ showView, setShowView, getRows }) => {
  // ////////////////
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [minForm] = Form.useForm();
  const [gstType, setGstType] = useState("L");
  const [files, setFiles] = useState([]);
  const sidebarTimerRef = useRef(null);
  const [taxTotals, setTaxTotals] = useState({
    valueTotal: 0,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
  });
  const [submitEnabled, setSubmitEnabled] = useState(false);
  const [displayLabels, setDisplayLabels] = useState([]);
  const [tableReady, setTableReady] = useState(false);
  const prevGstTypeRef = useRef(undefined);
  const calculateRowRef = useRef(() => {});
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadPreviewRows, setUploadPreviewRows] = useState([]);
  const [locationLabelsMap, setLocationLabelsMap] = useState({});

  const handleDownloadSample = () => {
    downloadCSVCustomColumns(MIN_SAMPLE_DATA, "MIN_Sample");
  };

  const handleExcelUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploadLoading(true);
    try {
      const response = await imsAxios.post(
        "/createwo/woMIN/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      const { data } = response;
      if (data.code === 200) {
        const rawRows = Array.isArray(data.data?.rows) ? data.data.rows : [];
        const mapped = rawRows.map((row) => ({
          componentKey: row[0]?.key || "",
          componentName: row[0]?.name || "",
          partCode: row[0]?.partNo || "",
          hsn: row[1] || "",
          qty: row[2] || "",
          rate: row[3] || "",
          gstTypeSuggested: row[4] || "L",
          gstRate: row[5] || "",
          remark: row[6] || "",
          locationRaw: row[7],
          locationName: row[7]?.text || row[7]?.value || (typeof row[7] === "string" ? row[7] : ""),
          locationValue: row[7]?.value || row[7]?.text || (typeof row[7] === "string" ? row[7] : ""),
        }));
        setUploadPreviewRows(mapped);
      } else {
        toast.error(data.message?.msg || data.message);
      }
    } catch {
      toast.error("Failed to upload Excel");
    }
    setUploadLoading(false);
    return Upload.LIST_IGNORE;
  };

  const handleConfirmUpload = () => {
    const suggestedGst = uploadPreviewRows[0]?.gstTypeSuggested || "L";
    const components = uploadPreviewRows.map((row) => {
      const base = {
        component: row.componentKey,
        hsn: row.hsn,
        qty: row.qty,
        rate: row.rate,
        gstRate: row.gstRate,
        remark: row.remark,
        location: row.locationValue,
      };
      const derived = computeRowTaxFields(base, suggestedGst);
      return { ...base, ...derived };
    });
    const labels = uploadPreviewRows.map((row) => ({
      component: row.componentName,
      partCode: row.partCode,
      newPartCode: "",
    }));
    setDisplayLabels(labels);
    const labelsMap = {};
    uploadPreviewRows.forEach((row) => {
      if (row.locationValue) labelsMap[row.locationValue] = row.locationName;
    });
    setLocationLabelsMap(labelsMap);
    setGstType(suggestedGst);
    minForm.setFieldsValue({ gstType: suggestedGst, components });
    refreshSidebarTotalsFromRows(components);
    setTableReady(true);
    setUploadPreviewRows([]);
    setUploadDrawerOpen(false);
    toast.success("Data imported successfully");
  };

  const validateHandler = async () => {
    recalculateAllRows(true);
    const rows = minForm.getFieldValue("components") ?? [];
    const activeRowIndexes = rows
      .map((row, index) => (Number(row?.qty) > 0 ? index : -1))
      .filter((index) => index >= 0);

    if (!activeRowIndexes.length) {
      toast.error("Enter MIN qty on at least one component.");
      return;
    }

    const missingRate = activeRowIndexes.some(
      (index) => !rows[index]?.rate && rows[index]?.rate !== 0
    );
    if (missingRate) {
      toast.error("Enter rate for every row that has MIN qty.");
      return;
    }

    try {
      const values = await minForm.validateFields(
        getMinValidateFieldNames(activeRowIndexes)
      );
      const allRows = minForm.getFieldValue("components") ?? [];
      const valuesWithMeta = {
        ...values,
        components: allRows.map((row, index) => ({
          ...row,
          ...(values.components?.[index] ?? {}),
        })),
      };
      Modal.confirm({
        title: "Submit MIN",
        content: "Are you sure you want to submit this MIN",
        okText: "Submit",
        onOk: () => submitHandler(valuesWithMeta, showView),
      });
    } catch (error) {
      if (error?.errorFields?.length) {
        minForm.scrollToField(error.errorFields[0].name, {
          behavior: "smooth",
          block: "center",
        });
        toast.error(formatMinValidationErrors(error.errorFields));
      }
    }
  };
  const refreshSidebarTotalsFromRows = useCallback((rows) => {
    setTaxTotals({
      valueTotal: getArrSum(rows, "value"),
      cgstTotal: getArrSum(rows, "cgst"),
      sgstTotal: getArrSum(rows, "sgst"),
      igstTotal: getArrSum(rows, "igst"),
    });
    setSubmitEnabled(rows.some((row) => row?.rate && row?.qty));
  }, []);

  const scheduleSidebarRefresh = useCallback(() => {
    if (sidebarTimerRef.current) {
      clearTimeout(sidebarTimerRef.current);
    }
    sidebarTimerRef.current = setTimeout(() => {
      refreshSidebarTotalsFromRows(minForm.getFieldValue("components") ?? []);
    }, 150);
  }, [minForm, refreshSidebarTotalsFromRows]);

  useEffect(
    () => () => {
      if (sidebarTimerRef.current) {
        clearTimeout(sidebarTimerRef.current);
      }
    },
    []
  );

  const submitHandler = async (values, showView) => {
    setLoading("submit");
    try {
      const data = await createMIN(values, showView);
      if (!data || data.code !== 200){
        toast.error(data.message.msg);
        return;
      }

      if (files[0]) {
        const formData = new FormData();
        formData.append("files", files[0]);
        formData.append("woid", showView.woId);
        formData.append("doc_name", "--");
        formData.append("doc_date", values.docDate);
        const uploadwodoc = await imsAxios.post(
          "/createwo/uploadAttachment",
          formData
        );
        if (uploadwodoc.data.code !== 200) {
          toast.error(uploadwodoc.data.message?.msg ?? uploadwodoc.data.message);
          return;
        }
        toast.success(uploadwodoc.data.message);
        setFiles([]);
      }

      setShowView(false);
      getRows();
      minForm.resetFields();
    } finally {
      setLoading(false);
    }
  };
  const computeRowTaxFields = useCallback((row, gstTypeVal) => {
    const value = +Number(row?.qty ?? 0) * +Number(row?.rate ?? 0);
    const gstAmount = (value * +Number(row?.gstRate || 0)) / 100;
    let cgst;
    let igst;
    let sgst;

    if (gstTypeVal === "L" && row?.gstRate) {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
      igst = undefined;
    } else if (gstTypeVal === "I" && row?.gstRate) {
      igst = gstAmount;
      cgst = undefined;
      sgst = undefined;
    }

    return {
      value: +Number(value).toFixed(3),
      cgst: cgst != null ? +Number(cgst).toFixed(3) : undefined,
      sgst: sgst != null ? +Number(sgst).toFixed(3) : undefined,
      igst: igst != null ? +Number(igst).toFixed(3) : undefined,
    };
  }, []);

  const calculateRow = useCallback(
    (fieldName) => {
      const row = minForm.getFieldValue(["components", fieldName]);
      if (!row) return;
      const derived = computeRowTaxFields(row, gstType);
      minForm.setFields([
        { name: ["components", fieldName, "value"], value: derived.value },
        { name: ["components", fieldName, "cgst"], value: derived.cgst },
        { name: ["components", fieldName, "sgst"], value: derived.sgst },
        { name: ["components", fieldName, "igst"], value: derived.igst },
      ]);
      scheduleSidebarRefresh();
    },
    [computeRowTaxFields, gstType, minForm, scheduleSidebarRefresh]
  );

  calculateRowRef.current = calculateRow;

  const onRowCalculate = useCallback((fieldName) => {
    calculateRowRef.current(fieldName);
  }, []);

  const recalculateAllRows = useCallback((sync = false) => {
    const rows = minForm.getFieldValue("components") ?? [];
    if (!rows.length) {
      refreshSidebarTotalsFromRows([]);
      return;
    }
    const fieldUpdates = rows.flatMap((row, index) => {
      const derived = computeRowTaxFields(row, gstType);
      return [
        { name: ["components", index, "value"], value: derived.value },
        { name: ["components", index, "cgst"], value: derived.cgst },
        { name: ["components", index, "sgst"], value: derived.sgst },
        { name: ["components", index, "igst"], value: derived.igst },
      ];
    });
    const apply = () => {
      minForm.setFields(fieldUpdates);
      refreshSidebarTotalsFromRows(minForm.getFieldValue("components") ?? []);
    };
    if (sync) {
      apply();
    } else {
      startTransition(apply);
    }
  }, [
    computeRowTaxFields,
    gstType,
    minForm,
    refreshSidebarTotalsFromRows,
  ]);

  const getDetails = useCallback(
    async (id, woId, sku) => {
      try {
        setLoading("fetch");
        setTableReady(false);
        setDisplayLabels([]);
        setGstType("L");
        refreshSidebarTotalsFromRows([]);
        prevGstTypeRef.current = undefined;
        minForm.setFieldValue("components", []);
        const result = await getWorkOrderDetails(id, woId, sku);
        if (result) {
          setDetails(result.details);
          const labels = result.components.map((row) => ({
            component: row.component,
            partCode: row.partCode,
            newPartCode: row.newPartCode,
          }));
          setDisplayLabels(labels);
          prevGstTypeRef.current = "L";
          startTransition(() => {
            minForm.setFieldsValue({
              components: result.components,
              gstType: "L",
            });
            refreshSidebarTotalsFromRows(result.components);
            setTableReady(true);
          });
        }
      } catch (error) {
        console.log("error while fetching MIN details", error);
      } finally {
        setLoading(false);
      }
    },
    [minForm, refreshSidebarTotalsFromRows]
  );

  useEffect(() => {
    if (showView) {
      getDetails(showView.subjectId, showView.woId, showView.sku);
    } else {
      setTableReady(false);
      setDisplayLabels([]);
      setGstType("L");
      prevGstTypeRef.current = undefined;
    }
  }, [showView, getDetails]);

  useEffect(() => {
    if (!showView) return;
    const rows = minForm.getFieldValue("components") ?? [];
    if (!rows.length) return;
    if (prevGstTypeRef.current === undefined) {
      prevGstTypeRef.current = gstType;
      return;
    }
    if (prevGstTypeRef.current === gstType) return;
    prevGstTypeRef.current = gstType;
    recalculateAllRows();
  }, [gstType, minForm, recalculateAllRows, showView]);

  const locationColumn = useMemo(
    () => ({
      headerName: "Location",
      name: "location",
      width: 180,
      field: ({ fieldName }) => {
        const locVal = minForm.getFieldValue(["components", fieldName, "location"]);
        const locText = locationLabelsMap[locVal];
        const initialOption = locVal && locText ? { value: locVal, text: locText } : null;
        return <LocationField initialOption={initialOption} />;
      },
    }),
    [locationLabelsMap, minForm]
  );

  const tableColumns = useMemo(
    () => [
      ...componentsItems(gstType, onRowCalculate, displayLabels),
      locationColumn,
    ],
    [gstType, locationColumn, onRowCalculate, displayLabels]
  );

  const tablePane = useMemo(
    () =>
      tableReady ? (
        <MINComponentsTable
          removableRows
          nonRemovableColumns={1}
          columns={tableColumns}
          listName="components"
          displayLabels={displayLabels}
        />
      ) : null,
    [tableReady, tableColumns, displayLabels]
  );

  const taxSummary = useMemo(() => {
    const { valueTotal, cgstTotal, sgstTotal, igstTotal } = taxTotals;
    const afterTax = valueTotal + cgstTotal + sgstTotal + igstTotal;
    return [
      {
        title: "Value Before Tax",
        description: +valueTotal.toFixed(2),
      },
      {
        title: "CGST",
        description: +cgstTotal.toFixed(2),
        hidden: gstType === "I",
      },
      {
        title: "SGST",
        description: +sgstTotal.toFixed(2),
        hidden: gstType === "I",
      },
      {
        title: "IGST",
        description: +igstTotal.toFixed(2),
        hidden: gstType === "L",
      },
      {
        title: "Value After Tax",
        description: +afterTax.toFixed(2),
      },
    ];
  }, [gstType, taxTotals]);

  return (
    <Drawer
      title={`MIN | ${details?.woId ?? ""}`}
      placement="right"
      onClose={() => setShowView(false)}
      bodyStyle={{
        padding: 5,
      }}
      open={showView}
      width="100%"
      destroyOnClose
    >
      {loading === "fetch" && <Loading />}
      <Form
        layout="vertical"
        form={minForm}
        style={{ height: "calc(100% - 52px)", minHeight: 0 }}
      >
        <Row gutter={6} style={{ height: "100%", overflow: "hidden" }}>
          <Col span={4} style={{ height: "100%", overflowY: "scroll" }}>
            <Row gutter={[0, 6]}>
              <Col span={24}>
                <Card size="small">
                  <Form.Item name="gstType" label="GST Type">
                    <GstTypeSelect
                      options={gstTypeOptions}
                      onGstTypeChange={setGstType}
                    />
                  </Form.Item>
                  <Form.Item
                    name="invoiceId"
                    label="Doc ID"
                    rules={[
                      {
                        required: true,
                        message: "Please select doc id!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    name="docDate"
                    label="Doc Date"
                    rules={[
                      {
                        required: true,
                        message: "Please select doc Date!",
                      },
                    ]}
                  >
                    <SingleDatePicker
                      setDate={(value) =>
                        minForm.setFieldValue("docDate", value)
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    name="eway"
                    label="E-way bill"
                    // rules={rules.docDate}
                  >
                    <Input />
                  </Form.Item>
                  <Row justify="start">
                    <Form.Item name="file">
                      <UploadDocs setFiles={setFiles} files={files} />
                    </Form.Item>
                    <Space></Space>
                  </Row>
                </Card>
              </Col>
              <Col span={24}>
                <TaxDetails
                  title="
                Tax Summary"
                  summary={taxSummary}
                />
              </Col>
              <WODetailsCard details={details} />
            </Row>
          </Col>
          <Col span={20} style={{ height: "100%", overflow: "hidden" }}>
            <Row justify="end" style={{ marginBottom: 6 }}>
              <Button
                icon={<UploadOutlined />}
                size="small"
                onClick={() => setUploadDrawerOpen(true)}
              >
                Upload Excel
              </Button>
            </Row>
            {tablePane}
          </Col>
        </Row>
      </Form>
      <NavFooter
        disabled={!submitEnabled}
        loading={loading === "submit"}
        type="primary"
        resetFunction={() => {
          minForm.resetFields();
          setShowView(false);
        }}
        submitFunction={validateHandler}
        nextLabel="Submit"
      />

      {/* Excel Upload Drawer */}
      <Drawer
        title={uploadPreviewRows.length > 0 ? "Preview Imported Data" : "Upload Excel"}
        open={uploadDrawerOpen}
        onClose={() => { setUploadDrawerOpen(false); setUploadPreviewRows([]); }}
        destroyOnClose
        width={uploadPreviewRows.length > 0 ? 900 : 480}
        footer={
          uploadPreviewRows.length > 0 ? (
            <Row justify="space-between">
              <Button onClick={() => setUploadPreviewRows([])}>Upload Another File</Button>
              <Button type="primary" onClick={handleConfirmUpload}>Confirm Import</Button>
            </Row>
          ) : null
        }
      >
        {uploadPreviewRows.length === 0 ? (
          <>
            <Spin spinning={uploadLoading}>
              <Upload.Dragger
                name="file"
                multiple={false}
                maxCount={1}
                showUploadList={false}
                accept=".xlsx,.xls,.csv"
                beforeUpload={handleExcelUpload}
              >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">Click or drag file to upload</p>
                <p className="ant-upload-hint">Supports .xlsx, .xls, .csv</p>
              </Upload.Dragger>
            </Spin>
            <div style={{ marginTop: 12, textAlign: "right" }}>
              <Button type="link" onClick={handleDownloadSample}>Download Sample File</Button>
            </div>
          </>
        ) : (
          <Table
            size="small"
            rowKey={(_, i) => i}
            dataSource={uploadPreviewRows}
            pagination={false}
            scroll={{ y: "calc(100vh - 220px)" }}
            columns={MIN_PREVIEW_COLUMNS}
          />
        )}
      </Drawer>
    </Drawer>
  );
};

export default MINModal;

const GstTypeSelect = memo(function GstTypeSelect({
  value,
  onChange,
  options,
  onGstTypeChange,
}) {
  return (
    <MySelect
      value={value}
      options={options}
      onChange={(val) => {
        onChange?.(val);
        onGstTypeChange(val);
      }}
    />
  );
});

const LocationField = memo(function LocationField({ value, onChange, initialOption }) {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(initialOption ?? null);

  useEffect(() => {
    if (initialOption) {
      setSelectedOption((prev) => prev ?? initialOption);
    }
  }, [initialOption]);

  const getLocatonOptions = async (search) => {
    setSelectLoading(true);
    try {
      const response = await imsAxios.post("/backend/fetchLocation", {
        searchTerm: search,
      });
      const { data } = response;
      if (data?.length) {
        setAsyncOptions(
          data.map((row) => ({
            text: row.text,
            value: row.id,
          }))
        );
      }
    } finally {
      setSelectLoading(false);
    }
  };

  const optionsForSelect = useMemo(() => {
    if (
      selectedOption &&
      !asyncOptions.some((opt) => opt.value === selectedOption.value)
    ) {
      return [selectedOption, ...asyncOptions];
    }
    return asyncOptions;
  }, [asyncOptions, selectedOption]);

  const handleChange = (locationId) => {
    onChange?.(locationId);
    const match = asyncOptions.find(
      (opt) => String(opt.value) === String(locationId)
    );
    if (match) {
      setSelectedOption(match);
    }
  };

  return (
    <MyAsyncSelect
      value={value}
      onChange={handleChange}
      onBlur={() => setAsyncOptions([])}
      loadOptions={getLocatonOptions}
      optionsState={optionsForSelect}
      selectLoading={selectLoading}
    />
  );
});



const componentsItems = (gstType, onCalculateRow, displayLabels) => [
  {
    headerName: "#",
    name: "",
    width: 30,
    skipFormItem: true,
    field: (_, index) => (
      <Typography.Text type="secondary">{index + 1}.</Typography.Text>
    ),
  },
  {
    headerName: "Component",
    name: "component",
    width: 220,
    flexStart: true,
    skipFormItem: true,
    field: ({ fieldName, labels }) => (
      <ToolTipEllipses
        text={labels?.component ?? displayLabels[fieldName]?.component}
      />
    ),
  },
  {
    headerName: "Part Code",
    name: "partCode",
    width: 150,
    flexStart: true,
    skipFormItem: true,
    field: ({ fieldName, labels }) => (
      <ToolTipEllipses
        text={labels?.partCode ?? displayLabels[fieldName]?.partCode}
      />
    ),
  },
  {
    headerName: "Secondary Part Code",
    name: "newPartCode",
    width: 150,
    flexStart: true,
    skipFormItem: true,
    field: ({ fieldName, labels }) => (
      <ToolTipEllipses
        text={labels?.newPartCode ?? displayLabels[fieldName]?.newPartCode}
      />
    ),
  },
  {
    headerName: "Qty",
    name: "qty",
    width: 100,
    field: ({ fieldName }) => (
      <Input onChange={() => onCalculateRow(fieldName)} />
    ),
  },
  {
    headerName: "Rate",
    name: "rate",
    width: 100,
    field: ({ fieldName }) => (
      <Input onChange={() => onCalculateRow(fieldName)} />
    ),
  },
  {
    headerName: "Value",
    name: "value",
    width: 150,
    field: () => <Input disabled />,
  },
  {
    headerName: "GST %",
    name: "gstRate",
    width: 100,
    field: ({ fieldName }) => (
      <Select
        style={{ width: "100%" }}
        options={gstRateOptions.map((opt) => ({
          label: opt.text,
          value: opt.value,
        }))}
        onChange={() => onCalculateRow(fieldName)}
      />
    ),
  },
  {
    headerName: "CGST",
    name: "cgst",
    width: 100,
    conditional: true,
    condition: () => gstType === "L",
    field: () => <Input disabled />,
  },
  {
    headerName: "SGST",
    name: "sgst",
    width: 100,
    conditional: true,
    condition: () => gstType === "L",
    field: () => <Input disabled />,
  },
  {
    headerName: "IGST",
    name: "igst",
    width: 100,
    conditional: true,
    condition: () => gstType === "I",
    field: () => <Input disabled />,
  },

  {
    headerName: "HSN Code",
    name: "hsn",
    width: 150,
    field: () => <Input />,
  },
  {
    headerName: "Remark",
    name: "remark",
    width: 150,
    field: () => <Input />,
  },
];
const gstTypeOptions = [
  {
    text: "Local",
    value: "L",
  },
  {
    text: "Interstate",
    value: "I",
  },
];

const gstRateOptions = [
  {
    text: "5%",
    value: 5,
  },
  {
    text: "12%",
    value: 12,
  },
  {
    text: "18%",
    value: 18,
  },
  {
    text: "28%",
    value: 28,
  },
];

const getArrSum = (list, key) =>
  (list ?? []).reduce((sum, row) => sum + (Number(row?.[key]) || 0), 0);

const MIN_FIELD_LABELS = {
  invoiceId: "Doc ID",
  docDate: "Doc Date",
  gstType: "GST Type",
  qty: "Qty",
  rate: "Rate",
  gstRate: "GST %",
  hsn: "HSN Code",
  location: "Location",
};

const getMinValidateFieldNames = (activeRowIndexes) => {
  const names = ["invoiceId", "docDate", "gstType"];
  activeRowIndexes.forEach((index) => {
    names.push(
      ["components", index, "qty"],
      ["components", index, "rate"],
      ["components", index, "gstRate"],
      ["components", index, "hsn"],
      ["components", index, "location"]
    );
  });
  return names;
};

const formatMinValidationErrors = (errorFields) =>
  errorFields
    .map(({ name, errors }) => {
      const fieldKey = Array.isArray(name) ? name[name.length - 1] : name;
      const rowNo =
        Array.isArray(name) && name[0] === "components"
          ? ` (row ${Number(name[1]) + 1})`
          : "";
      const label = MIN_FIELD_LABELS[fieldKey] ?? fieldKey;
      return `${label}${rowNo}: ${errors?.[0] ?? "Required"}`;
    })
    .join(" · ");



const MIN_SAMPLE_DATA = [
  { PART_CODE: "P0005", HSN: 85365090, QTY: 2, RATE: 2, GST_TYPE: "L", GST_RATE: 5, REMARK: "ok", LOCATION: "RM001" },
];

const MIN_PREVIEW_COLUMNS = [
  { title: "Part Code", dataIndex: "componentName", key: "componentName", width: 220 },
  { title: "HSN", dataIndex: "hsn", key: "hsn", width: 120 },
  { title: "Qty", dataIndex: "qty", key: "qty", width: 80 },
  { title: "Rate", dataIndex: "rate", key: "rate", width: 80 },
  { title: "GST Type", dataIndex: "gstTypeSuggested", key: "gstTypeSuggested", width: 90 },
  { title: "GST Rate", dataIndex: "gstRate", key: "gstRate", width: 90 },
  { title: "Remark", dataIndex: "remark", key: "remark", width: 120 },
  {
    title: "Location",
    dataIndex: "locationRaw",
    key: "locationRaw",
    width: 120,
    render: (val) => val?.text || val?.value || val || "",
  },
];
