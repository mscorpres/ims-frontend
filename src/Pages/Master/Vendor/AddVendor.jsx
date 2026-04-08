import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import {
  Row,
  Col,
  Input,
  Form,
  Descriptions,
  Divider,
  Modal,
  InputNumber,
  Typography,
  Tooltip,
  Spin,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import NavFooter from "../../../Components/NavFooter";
import { imsAxios } from "../../../axiosInterceptor";
import MySelect from "../../../Components/MySelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import SingleProduct from "./SingleProduct";
import { validatePAN } from "../../../utils/general";
import { getVendorBranchBankOptions } from "./vendorBranchBankOptions";
import { mergeMsmeYearOptions } from "../../../utils/indianFinancialYear";
import GstRegisteredAddressesModal from "./GstRegisteredAddressesModal";

const vendorTypeOptions = [
  { text: "Import", value: "IMPT" },
  { text: "Domestic", value: "DOM" },
];

const msmeOptions = [
  { text: "Yes", value: "Y" },
  { text: "No", value: "N" },
];
const MSME_YEAR_LEGACY = [
  { text: "2023-2024", value: "2023-2024" },
  { text: "2024-2025", value: "2024-2025" },
  { text: "2025-2026", value: "2025-2026" },
  { text: "2026-2027", value: "2026-2027" },
];
const msmeYearOptions = mergeMsmeYearOptions(MSME_YEAR_LEGACY);
const msmeTypeOptions = [
  { text: "Micro", value: "Micro" },
  { text: "Small", value: "Small" },
  { text: "Medium", value: "Medium" },
];
const msmeActivityOptions = [
  { text: "Manufacturing", value: "Manufacturing" },
  { text: "Service", value: "Service" },
  { text: "Trading", value: "Trading" },
];

const transactionTypeOptions = [
  { text: "Cheque", value: "cheque" },
  { text: "e-Fund Transfer", value: "transfer" },
  { text: "UPI", value: "upi" },
  { text: "Other", value: "other" },
  { text: "N/A", value: "na" },
];

const GSTIN_LENGTH = 15;
const GSTIN_FETCH_DEBOUNCE_MS = 450;

const normalizeGstinInput = (value) =>
  String(value ?? "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, GSTIN_LENGTH);

const AddVendor = () => {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [files, setFiles] = useState([]);
  const [gstDetails, setGstDetails] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [gstSearchLoading, setGstSearchLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [addVendorForm] = Form.useForm();
  const [selectLoading, setSelectLoading] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const msmeStat = Form.useWatch("msmeStatus", addVendorForm);
  const einvoice = Form.useWatch("applicability", addVendorForm);
  const transactionType = Form.useWatch("transactionType", addVendorForm);
  const bankNameWatch = Form.useWatch("bankName", addVendorForm);
  const vendorType = Form.useWatch("vendorType", addVendorForm);
  const gstinWatch = Form.useWatch("gstin", addVendorForm);

  const gstFetchDebounceRef = useRef(null);
  const lastFetchedGstinRef = useRef("");

  const getFetchState = async (e) => {
    if (e.length > 2) {
      setSelectLoading(true);
      const { data } = await imsAxios.post("/backend/stateList", {
        search: e,
      });
      setSelectLoading(false);
      let arr = [];
      if (data && Array.isArray(data)) {
        arr = data.map((d) => {
          return { text: d.text, value: d.id };
        });
      }
      setAsyncOptions(arr);
    }
  };

  const normalizeStateToken = (v) =>
    v == null ? "" : String(v).trim().toLowerCase();

  const mapStateOptionToFieldValue = (opt) => ({
    label: opt?.text ?? opt?.label ?? opt?.value,
    value: opt?.value ?? opt?.id ?? "",
  });

  const findStateInCurrentOptions = (stateInput) => {
    const token = normalizeStateToken(stateInput);
    if (!token) return null;
    return (
      asyncOptions.find(
        (o) =>
          normalizeStateToken(o?.value) === token ||
          normalizeStateToken(o?.text) === token ||
          normalizeStateToken(o?.label) === token,
      ) || null
    );
  };

  const resolveStateFieldValue = async (stateInput) => {
    const raw = stateInput == null ? "" : String(stateInput).trim();
    if (!raw) return null;

    const fromLoaded = findStateInCurrentOptions(raw);
    if (fromLoaded) return mapStateOptionToFieldValue(fromLoaded);

    try {
      const { data } = await imsAxios.post("/backend/stateList", {
        search: raw,
      });
      const fetched =
        Array.isArray(data) && data.length > 0
          ? data.map((d) => ({ text: d.text, value: d.id }))
          : [];

      if (fetched.length > 0) {
        setAsyncOptions((prev) => {
          const merged = [...prev];
          fetched.forEach((item) => {
            if (
              !merged.some(
                (p) =>
                  normalizeStateToken(p?.value) ===
                    normalizeStateToken(item.value) ||
                  normalizeStateToken(p?.text) ===
                    normalizeStateToken(item.text),
              )
            ) {
              merged.push(item);
            }
          });
          return merged;
        });

        const token = normalizeStateToken(raw);
        const exact =
          fetched.find(
            (o) =>
              normalizeStateToken(o?.value) === token ||
              normalizeStateToken(o?.text) === token,
          ) || fetched[0];

        return mapStateOptionToFieldValue(exact);
      }
    } catch (e) {
      // no-op: fallback below
    }

    return { label: raw, value: raw };
  };

  const getCurrencies = async () => {
    try {
      const { data } = await imsAxios.get("/backend/fetchAllCurrecy");
      const arr =
        data?.data?.map((d) => ({
          text: d.currency_symbol,
          value: d.currency_id,
          notes: d.currency_notes,
        })) || [];
      setCurrencies([{ text: "N/A", value: "N/A" }, ...arr]);
    } catch (e) {
      setCurrencies([{ text: "N/A", value: "N/A" }]);
    }
  };

  const submitHandler = async () => {
    setLoading("submit");
    setShowSubmitConfirmModal(false);
    const response = await imsAxios.post("/vendor/add", showSubmitConfirmModal);
    setLoading(false);
    if (response.success) {
      toast.success(response?.message);
      reset();
    } else {
      setShowSubmitConfirmModal(false);
      toast.error(response.message);
    }
  };

  const validateHandler = async () => {
    const formData = new FormData();
    const values = await addVendorForm.validateFields();

    const uploadedFie = addVendorForm.getFieldValue("components");
    if (values.components && Array.isArray(values.components)) {
      values.components.map((comp) => {
        if (comp.file && Array.isArray(comp.file) && comp.file[0]) {
          formData.append("file", comp.file[0]?.originFileObj);
        }
      });
    }

    const obj = {
      vendor: {
        type: values.vendorType,
        name: values.vendorName,
        pan:
          values.panno != null && String(values.panno).trim() !== ""
            ? String(values.panno).toUpperCase()
            : "",
        cin: !values.cinno
          ? "--"
          : values.cinno === ""
            ? "--"
            : values.cinno.toUpperCase(),
        termDays: values.paymentTerms ?? 30,
        msmeStatus: values.msmeStatus,
        msmeYear: values.year,
        msmeId: values.msmeId,
        msmeType: values.type,
        msmeActivity: values.activity,
        msmeEffectiveFrom: values.msmeEffectiveFrom || "--",
        eInvoice: values.applicability,
        dateOfApplicability:
          values.applicability === "Y" ? values.dobApplicabilty : "--",
        group: values.group,
        documentName:
          uploadedFie && Array.isArray(uploadedFie)
            ? uploadedFie.map((r) => r.documentName)
            : [],
      },
      branch: {
        branch: values.branch,
        address: values.address,
        state: values.state?.value || values.state,
        city: values.city,
        pinCode: values.pincode,
        fax: values.fax === "" ? "--" : values.fax,
        mobile: values.mobile,
        email: values.email === "" ? "--" : values.email,
        gstin:
          values.gstin != null && String(values.gstin).trim() !== ""
            ? String(values.gstin).toUpperCase()
            : "--",
        transactionType: values.transactionType,
        ledgerCurrency: values.ledgerCurrency,
        bank: {
          accountNo: values.accountNo,
          ifsc: values.ifsCode,
          name: values.bankName,
          branch: values.bankBranch,
        },
      },
    };

    formData.append("vendor", JSON.stringify(obj.vendor));
    formData.append("branch", JSON.stringify(obj.branch));
    setShowSubmitConfirmModal(formData);
  };

  const fetchGstDetailsForGstin = async (gstinValue) => {
    setGstSearchLoading(true);
    try {
      const { data } = await imsAxios.get("/vendor/check/gstin/details", {
        params: { gstin: gstinValue },
      });

      if (data?.success === false || data?.status === "error") {
        throw new Error(
          data?.message || "Could not fetch GST details from NIC",
        );
      }

      const currentGstin = normalizeGstinInput(
        addVendorForm.getFieldValue("gstin"),
      );
      if (currentGstin !== gstinValue) {
        return;
      }

      const gstData = data?.data || data || {};
      if (!gstData || Object.keys(gstData).length === 0) {
        throw new Error("No GST details found for this GSTIN");
      }
      setGstDetails(gstData);
      setShowAddressModal(false);

      const primaryAddr =
        gstData.pradr?.addr ||
        (Array.isArray(gstData.adadr) && gstData.adadr[0]?.addr) ||
        gstData.principalPlaceAddress ||
        gstData.addr ||
        gstData.address ||
        {};

      const vendorName =
        gstData.tradeNam ||
        gstData.tradeName ||
        gstData.lgnm ||
        gstData.legalName ||
        gstData.trade_name ||
        gstData.legal_name;

      const addressString =
        gstData.principalPlaceAddress ||
        gstData.addr ||
        [
          primaryAddr.bnm,
          primaryAddr.bno,
          primaryAddr.st,
          primaryAddr.loc,
          primaryAddr.locality,
          primaryAddr.dst,
          primaryAddr.stcd,
          primaryAddr.pncd,
        ]
          .filter(Boolean)
          .join(", ");

      const stateCode =
        gstData.stateCode ||
        gstData.state ||
        primaryAddr.stcd ||
        primaryAddr.state;

      const city =
        primaryAddr.loc || primaryAddr.locality || primaryAddr.dst || "";

      const pincode =
        primaryAddr.pncd ||
        primaryAddr.pincode ||
        primaryAddr.pin ||
        primaryAddr.pincodeNumber ||
        "";

      const newValues = {};
      if (vendorName) newValues.vendorName = vendorName;
      if (addressString) newValues.address = addressString;
      if (city) newValues.city = city;
      if (pincode) newValues.pincode = pincode;
      if (stateCode) {
        const resolvedState = await resolveStateFieldValue(stateCode);
        if (resolvedState) {
          newValues.state = resolvedState;
        }
      }
      if (gstData.pan) newValues.panno = gstData.pan.toUpperCase();

      const vType = addVendorForm.getFieldValue("vendorType");
      if (vType === "DOM") {
        const einv =
          gstData.einvoiceStatus ??
          gstData.eInvoiceStatus ??
          gstData.eInvoice;
        if (einv != null && String(einv).trim() !== "") {
          const ev = String(einv).trim().toLowerCase();
          if (ev === "yes" || ev === "y" || ev === "true" || ev === "1") {
            newValues.applicability = "Y";
          } else if (
            ev === "no" ||
            ev === "n" ||
            ev === "false" ||
            ev === "0"
          ) {
            newValues.applicability = "N";
          }
        }
      }

      if (Object.keys(newValues).length > 0) {
        addVendorForm.setFieldsValue(newValues);
      }

      lastFetchedGstinRef.current = gstinValue;
      toast.success("GST details fetched successfully");
    } catch (error) {
      setGstDetails(null);
      lastFetchedGstinRef.current = "";
      toast.error(error?.message || "Could not fetch GST details");
    } finally {
      setGstSearchLoading(false);
    }
  };

  useEffect(() => {
    if (vendorType === "IMPT") {
      if (gstFetchDebounceRef.current) {
        clearTimeout(gstFetchDebounceRef.current);
        gstFetchDebounceRef.current = null;
      }
      lastFetchedGstinRef.current = "";
      setGstDetails(null);
      return;
    }

    const normalized = normalizeGstinInput(gstinWatch);

    if (gstFetchDebounceRef.current) {
      clearTimeout(gstFetchDebounceRef.current);
      gstFetchDebounceRef.current = null;
    }

    if (normalized.length < GSTIN_LENGTH) {
      lastFetchedGstinRef.current = "";
      setGstDetails(null);
      return;
    }

    if (normalized === lastFetchedGstinRef.current) {
      return;
    }

    gstFetchDebounceRef.current = setTimeout(() => {
      gstFetchDebounceRef.current = null;
      void fetchGstDetailsForGstin(normalized);
    }, GSTIN_FETCH_DEBOUNCE_MS);

    return () => {
      if (gstFetchDebounceRef.current) {
        clearTimeout(gstFetchDebounceRef.current);
        gstFetchDebounceRef.current = null;
      }
    };
  }, [gstinWatch, vendorType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyVendorName = () => {
    const name = addVendorForm.getFieldValue("vendorName");
    const text = name != null ? String(name).trim() : "";
    if (!text) {
      toast.error("No vendor name to copy");
      return;
    }
    navigator.clipboard.writeText(text).then(
      () => toast.success("Vendor name copied"),
      () => toast.error("Could not copy"),
    );
  };

  const handleUseGstAddress = async (addr) => {
    if (!addr) return;

    const addressString = [
      addr.bnm,
      addr.bno,
      addr.st,
      addr.loc,
      addr.locality,
      addr.dst,
    ]
      .filter(Boolean)
      .join(", ");

    const resolvedState = await resolveStateFieldValue(
      addr.stcd || addr.state || "",
    );

    addVendorForm.setFieldsValue({
      address: addressString,
      city: addr.loc || addr.locality || addr.dst || "",
      pincode: addr.pncd || "",
      state: resolvedState || addVendorForm.getFieldValue("state"),
    });

    setShowAddressModal(false);
    toast.success("Address filled from selected GST address");
  };

  const reset = async () => {
    setShowSubmitConfirmModal(false);
    addVendorForm.resetFields();
    setFiles([]);
  };

  useEffect(() => {}, []);

  useEffect(() => {
    getCurrencies();
  }, []);

  useEffect(() => {
    if (!transactionType) return;

    if (transactionType === "na") {
      addVendorForm.setFieldValue("accountNo", "N/A");
      addVendorForm.setFieldValue("confirmAccountNo", "N/A");
      addVendorForm.setFieldValue("ifsCode", "N/A");
      addVendorForm.setFieldValue("bankName", "N/A");
      addVendorForm.setFieldValue("bankBranch", "N/A");
      addVendorForm.setFieldValue("ledgerCurrency", "N/A");
    } else {
      if (addVendorForm.getFieldValue("accountNo") === "N/A") {
        addVendorForm.setFieldValue("accountNo", "");
      }
      if (addVendorForm.getFieldValue("confirmAccountNo") === "N/A") {
        addVendorForm.setFieldValue("confirmAccountNo", "");
      }
      if (addVendorForm.getFieldValue("ifsCode") === "N/A") {
        addVendorForm.setFieldValue("ifsCode", "");
      }
      if (addVendorForm.getFieldValue("bankName") === "N/A") {
        addVendorForm.setFieldValue("bankName", "");
      }
      if (addVendorForm.getFieldValue("bankBranch") === "N/A") {
        addVendorForm.setFieldValue("bankBranch", "");
      }
      if (addVendorForm.getFieldValue("ledgerCurrency") === "N/A") {
        addVendorForm.setFieldValue("ledgerCurrency", "");
      }
    }
  }, [transactionType, addVendorForm]);

  return (
    <div style={{ height: "calc(100vh - 165px)", overflow: "auto", padding: 10 }}>
      <Form initialValues={initialValues} layout="vertical" form={addVendorForm}>
        <GstRegisteredAddressesModal
          open={showAddressModal}
          onCancel={() => setShowAddressModal(false)}
          gstDetails={gstDetails}
          onUseAddress={handleUseGstAddress}
        />
        <Modal
          title="Submit Confirm"
          open={showSubmitConfirmModal}
          onOk={submitHandler}
          confirmLoading={loading === "submit"}
          onCancel={() => setShowSubmitConfirmModal(false)}
        >
          <p>Are you sure you want to create this vendor?</p>
        </Modal>
        <Modal
          title="Reset Confirm"
          open={showResetConfirmModal}
          onOk={reset}
          onCancel={() => setShowResetConfirmModal(false)}
        >
          <p>Are you sure you want to create this vendor?</p>
        </Modal>
        <Row gutter={16}>
          <Col span={4}>
            <Descriptions
              size="small"
              title={<p style={{ fontSize: "0.8rem" }}>Vendor Details</p>}
            >
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Provide Vendor Details
                <br /> (New Or Supplementary)
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={20}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label="Vendor Type"
                  name="vendorType"
                  rules={rules.vendorType}
                >
                  <MySelect options={vendorTypeOptions} />
                </Form.Item>
              </Col>
            </Row>

            <Divider style={{ margin: "4px 0 16px" }} />

            {vendorType !== "IMPT" && (
              <>
                <Row gutter={16}>
                  <Col span={24}>
                    <Typography.Text
                      type="secondary"
                      style={{ fontSize: "0.8rem", display: "block" }}
                    >
                      GST details load automatically when you enter a valid{" "}
                      {GSTIN_LENGTH}-character GSTIN (e.g. 06ABACS5056L1Z5).
                    </Typography.Text>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="GST Number"
                      name="gstin"
                      required={vendorType === "DOM"}
                      rules={[
                        {
                          validator: (_, value) => {
                            const vType = addVendorForm.getFieldValue("vendorType");
                            if (vType === "DOM" && !value) {
                              return Promise.reject(
                                new Error(
                                  "GST Number is required for Domestic vendors",
                                ),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input
                        maxLength={GSTIN_LENGTH}
                        placeholder="e.g. 06ABACS5056L1Z5"
                        suffix={gstSearchLoading ? <Spin size="small" /> : null}
                        onChange={(e) => {
                          const v = normalizeGstinInput(e.target.value);
                          addVendorForm.setFieldValue("gstin", v);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  {vendorType === "DOM" && (
                    <>
                      <Col span={6}>
                        <Form.Item
                          label="E-Invoice Applicability"
                          name="applicability"
                          rules={rules.applicability}
                        >
                          <MySelect options={msmeOptions} />
                        </Form.Item>
                      </Col>
                      {einvoice === "Y" && (
                        <Col span={12}>
                          <Form.Item
                            label="Date of Applicability"
                            name="dobApplicabilty"
                            rules={rules.dobApplicabilty}
                          >
                            <SingleDatePicker
                              size="default"
                              setDate={(value) =>
                                addVendorForm.setFieldValue("dobApplicabilty", value)
                              }
                            />
                          </Form.Item>
                        </Col>
                      )}
                    </>
                  )}
                </Row>

                {gstDetails && (
                  <Row gutter={16} style={{ marginTop: 8 }}>
                    <Col span={16}>
                      <div
                        style={{
                          border: "1px solid #f0f0f0",
                          borderRadius: 4,
                          padding: 8,
                          background: "#fafafa",
                          fontSize: 12,
                          lineHeight: 1.4,
                        }}
                      >
                        <div>
                          {(gstDetails.tradeNam ||
                            gstDetails.tradeName ||
                            gstDetails.lgnm ||
                            gstDetails.legalName ||
                            gstDetails.trade_name ||
                            gstDetails.legal_name ||
                            "") && (
                            <div>
                              {(gstDetails.tradeNam ||
                                gstDetails.tradeName ||
                                gstDetails.lgnm ||
                                gstDetails.legalName ||
                                gstDetails.trade_name ||
                                gstDetails.legal_name) ?? ""}
                            </div>
                          )}
                          {(gstDetails.pradr?.addr ||
                            gstDetails.principalPlaceAddress ||
                            gstDetails.addr ||
                            "") && (
                            <div>
                              {gstDetails.pradr?.addr
                                ? [
                                    gstDetails.pradr.addr.bnm,
                                    gstDetails.pradr.addr.bno,
                                    gstDetails.pradr.addr.st,
                                    gstDetails.pradr.addr.loc,
                                    gstDetails.pradr.addr.locality,
                                    gstDetails.pradr.addr.dst,
                                    gstDetails.pradr.addr.stcd,
                                    gstDetails.pradr.addr.pncd,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")
                                : gstDetails.principalPlaceAddress || gstDetails.addr}
                            </div>
                          )}
                          {(gstDetails.pradr?.addr?.stcd ||
                            gstDetails.stateCode) && (
                            <div>
                              State:{" "}
                              {gstDetails.pradr?.addr?.stcd || gstDetails.stateCode}
                            </div>
                          )}
                          {gstDetails.gstin && <div>GSTIN: {gstDetails.gstin}</div>}
                          {(gstDetails.einvoiceStatus ??
                            gstDetails.eInvoiceStatus ??
                            gstDetails.eInvoice) != null &&
                            String(
                              gstDetails.einvoiceStatus ??
                                gstDetails.eInvoiceStatus ??
                                gstDetails.eInvoice,
                            ).trim() !== "" && (
                              <div>
                                E-Invoice status:{" "}
                                {String(
                                  gstDetails.einvoiceStatus ??
                                    gstDetails.eInvoiceStatus ??
                                    gstDetails.eInvoice,
                                )}
                              </div>
                            )}
                        </div>
                        <Typography.Link
                          style={{ fontSize: 12, color: "#1677ff" }}
                          onClick={() => setShowAddressModal(true)}
                        >
                          ...more
                        </Typography.Link>
                      </div>
                    </Col>
                  </Row>
                )}
              </>
            )}

            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label="Vendor Name"
                  name="vendorName"
                  rules={rules.vendorName}
                >
                  <Input
                    suffix={
                      <Tooltip title="Copy vendor name">
                        <CopyOutlined
                          style={{
                            cursor: "pointer",
                            color: "rgba(0,0,0,0.45)",
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCopyVendorName();
                          }}
                        />
                      </Tooltip>
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Pan Number" name="panno" rules={rules.panno}>
                  <Input
                    maxLength={10}
                    onChange={(e) => {
                      const raw = e.target.value
                        .replace(/[^A-Za-z0-9]/g, "")
                        .slice(0, 10)
                        .toUpperCase();
                      const { valid, formattedPAN } = validatePAN(raw);
                      addVendorForm.setFieldValue("panno", formattedPAN);
                      if (!valid && formattedPAN.length === 10) {
                        toast.error("Invalid Pan Number! Please Enter Valid Pan Number.");
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="CIN Number" name="cinno">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Payment Terms (in-days)"
                  name="paymentTerms"
                  rules={rules.paymentTerms}
                >
                  <InputNumber style={{ width: "100%" }} min={1} max={999} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Email" name="email">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Mobile" name="mobile" rules={rules.mobile}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Fax Number" name="fax">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Row gutter={16}>
                  <Col span={4}>
                    <Form.Item
                      label="MSME Status"
                      name="msmeStatus"
                      rules={rules.status}
                    >
                      <MySelect options={msmeOptions} />
                    </Form.Item>
                  </Col>
                  {msmeStat === "Y" && (
                    <>
                      <Col span={5}>
                        <Form.Item
                          label="MSME Year"
                          name="year"
                          rules={rules.year}
                        >
                          <MySelect options={msmeYearOptions} />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          label="MSME Number"
                          name="msmeId"
                          rules={rules.msmeId}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item label="MSME Type" name="type" rules={rules.type}>
                          <MySelect options={msmeTypeOptions} />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          label="MSME Activity"
                          name="activity"
                          rules={rules.activity}
                        >
                          <MySelect options={msmeActivityOptions} />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item label="Effective From" name="msmeEffectiveFrom">
                          <SingleDatePicker
                            size="default"
                            setDate={(value) =>
                              addVendorForm.setFieldValue("msmeEffectiveFrom", value)
                            }
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>

        <Divider />
        <Row gutter={16}>
          <Col span={4}>
            <Descriptions
              size="small"
              title={<p style={{ fontSize: "0.8rem" }}>Branch Details</p>}
            >
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Provide Branch Details
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={20}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label="Branch Name"
                  name="branch"
                  rules={rules.branch}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Select State"
                  name="state"
                  rules={rules.state}
                >
                  <MyAsyncSelect
                    selectLoading={selectLoading}
                    onBlur={() => setAsyncOptions([])}
                    optionsState={asyncOptions}
                    loadOptions={getFetchState}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="City" name="city" rules={rules.city}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Pin Code" name="pincode" rules={rules.pincode}>
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Complete Address"
                  name="address"
                  rules={rules.address}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={4}>
                <Descriptions
                  size="small"
                  title={<p style={{ fontSize: "0.8rem" }}>Bank Details</p>}
                >
                  <Descriptions.Item
                    contentStyle={{
                      fontSize: window.innerWidth < 1600 && "0.7rem",
                    }}
                  >
                    Provide Bank Details
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={20}>
                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item label="Type" name="transactionType">
                      <MySelect options={transactionTypeOptions} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Currency of Ledger" name="ledgerCurrency">
                      <MySelect options={currencies} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Bank Name" name="bankName">
                      <MySelect
                        placeholder="Select bank"
                        options={getVendorBranchBankOptions(bankNameWatch)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="IFS Code" name="ifsCode">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Bank Branch" name="bankBranch">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Account Number" name="accountNo">
                      <Input.Password
                        autoComplete="new-password"
                        visibilityToggle={false}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Confirm Account Number"
                      name="confirmAccountNo"
                      dependencies={["accountNo"]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("accountNo") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("Account numbers do not match"),
                            );
                          },
                        }),
                      ]}
                    >
                      <Input autoComplete="off" />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={4} style={{ height: "20rem", overflowY: "scroll" }}>
            <Descriptions
              size="small"
              title={<p style={{ fontSize: "0.8rem" }}>Upload Document</p>}
            >
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Upload vendor PDF document
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={20}>
            <Row gutter={16}>
              <Col span={24}>
                <div style={{ flex: 1 }}>
                  <Col
                    span={24}
                    style={{
                      height: "14rem",
                      overflowY: "auto",
                    }}
                  >
                    <Form.List name="components">
                      {(fields, { add, remove }) => (
                        <>
                          <Col>
                            {fields.map((field, index) => (
                              <Form.Item key={field.key} noStyle>
                                <SingleProduct
                                  fields={fields}
                                  field={field}
                                  index={index}
                                  add={add}
                                  form={addVendorForm}
                                  remove={remove}
                                  setFiles={setFiles}
                                  files={files}
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
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
      <NavFooter
        resetFunction={() => setShowResetConfirmModal(true)}
        submitFunction={validateHandler}
        nextLabel="Submit"
      />
    </div>
  );
};
const initialValues = {
  vendorType: undefined,
  paymentTerms: 30,
  vendorName: "",
  panno: "",
  gstin: "",
  branch: "",
  state: "",
  mobile: "",
  city: "",
  pincode: "",
  address: "",
  transactionType: undefined,
  accountNo: "",
  confirmAccountNo: "",
  ifsCode: "",
  bankName: "",
  bankBranch: "",
  ledgerCurrency: "",
  msmeStatus: "N",
  group: undefined,
  components: [{}],
};

const rules = {
  vendorType: [{ required: true, message: "Please select Vendor Type" }],
};

export default AddVendor;
