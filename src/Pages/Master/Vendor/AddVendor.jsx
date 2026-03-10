import React, { useEffect, useState } from "react";
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
  Button,
  Typography,
} from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import NavFooter from "../../../Components/NavFooter";
import { imsAxios } from "../../../axiosInterceptor";
import UploadDocs from "../../Store/MaterialIn/MaterialInWithPO/UploadDocs";
import MySelect from "../../../Components/MySelect";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import SingleProduct from "./SingleProduct";
import { validatePAN } from "../../../utils/general";

const msmeOptions = [
  { text: "Yes", value: "Y" },
  { text: "No", value: "N" },
];
const accOptions = [
  { text: "Yes", value: "Y" },
  { text: "No", value: "N" },
];
const msmeYearOptions = [
  { text: "2023-2024", value: "2023-2024" },
  { text: "2024-2025", value: "2024-2025" },
];
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

const AddVendor = () => {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [files, setFiles] = useState([]);
  const [addVendorForm] = Form.useForm();
  const [selectLoading, setSelectLoading] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const msmeStat = Form.useWatch("msmeStatus", addVendorForm);
  const einvoice = Form.useWatch("applicability", addVendorForm);

  const transactionType = Form.useWatch("transactionType", addVendorForm);

  // const [groupOptions, setGroupOptions] = useState([]);
  const [currencies, setCurrencies] = useState([]);

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
      // return arr;
    }
  };

  // const getGroupOptions = async () => {
  //   try {
  //     const response = await imsAxios.post("/groups/groupSelect2");
  //     const { data } = response;
  //     if (data?.code === 200) {
  //       const arr = data.data.map((row) => ({
  //         text: row.text,
  //         value: row.id,
  //       }));
  //       setGroupOptions(arr);
  //     } else if (data?.message?.msg) {
  //       toast.error(data.message.msg);
  //     }
  //   } catch (error) {
  //     setGroupOptions([]);
  //   }
  // };

  const getCurrencies = async () => {
    try {
      const { data } = await imsAxios.get("/backend/fetchAllCurrecy");
      const arr =
        data?.data?.map((d) => ({
          text: d.currency_symbol,
          value: d.currency_id,
          notes: d.currency_notes,
        })) || [];
      setCurrencies(arr);
    } catch (error) {
      setCurrencies([]);
    }
  };

  useEffect(() => {
    if (transactionType === "na") {
      addVendorForm.setFieldValue("accountNo", "N/A");
      addVendorForm.setFieldValue("ifsCode", "N/A");
      addVendorForm.setFieldValue("bankName", "N/A");
      addVendorForm.setFieldValue("bankBranch", "N/A");
      addVendorForm.setFieldValue("ledgerCurrency", "N/A");
    } else if (transactionType !== undefined && transactionType !== "") {
      addVendorForm.setFieldValue("accountNo", "");
      addVendorForm.setFieldValue("ifsCode", "");
      addVendorForm.setFieldValue("bankName", "");
      addVendorForm.setFieldValue("bankBranch", "");
      addVendorForm.setFieldValue("ledgerCurrency", undefined);
    }
  }, [transactionType]);

  const submitHandler = async () => {
    setLoading("submit");
    setShowSubmitConfirmModal(false);
    // return;
    const response = await imsAxios.post(
      "/vendor/addVendor",
      showSubmitConfirmModal,
    );
    setLoading(false);
    if (response.success) {
      toast.success(response?.message);
      reset();
    } else {
      setShowSubmitConfirmModal(false);
      // console.log("data.message", data.message);
      toast.error(response.message);
    }
  };

  const validateHandler = async () => {
    const formData = new FormData();
    const values = await addVendorForm.validateFields();
    console.log("files", values);

    // let uploadedFie = addVendorForm.getFieldValue("components");
    let uploadedFie = addVendorForm.getFieldValue("components");
    // console.log("uploadedFie", uploadedFie);
    // let a = uploadedFie?.map((r) => {
    //   console.log("rrrrrrrrr", r);

    //   formData.append("file", r.file[0].originFileObj);
    // });
    if (values.components && Array.isArray(values.components)) {
      values.components.map((comp) => {
        if (comp.file && Array.isArray(comp.file) && comp.file[0]) {
          formData.append("file", comp.file[0]?.originFileObj);
        }
      });
    }
    // formData.append("file", values.components[0].file[0].originFileObj);
    // console.log("a-----", uploadedFie[0].file[0].originFileObj);
    // console.log("values", values);
    // if
    let obj = {
      vendor: {
        vendorname: values.vendorName,
        panno: values.panno.toUpperCase(),
        cinno: !values.cinno
          ? "--"
          : values.cinno === ""
            ? "--"
            : values.cinno.toUpperCase(),
        term_days: values.paymentTerms ?? 30,
        msme_status: values.msmeStatus,
        msme_year: values.year,
        msme_id: values.msmeId,
        msme_type: values.type,
        msme_activity: values.activity,
        msme_effective_from: values.msmeEffectiveFrom || "--",
        eInvoice: values.applicability,
        dateOfApplicability:
          values.applicability === "Y" ? values.dobApplicabilty : "--",
        group: values.group,
        documentName:
          uploadedFie && Array.isArray(uploadedFie)
            ? uploadedFie.map((r) => r.documentName)
            : [],
        // file: formData,
      },
      branch: {
        branch: values.branch,
        address: values.address,
        state: values.state?.value || values.state,
        city: values.city,
        pincode: values.pincode,
        fax: values.fax == "" && "--",
        mobile: values.mobile,
        email: values.email == "" && "--",
        gstin: values.gstin.toUpperCase(),
        transaction_type: values.transactionType,
        account_no: values.accountNo,
        ifs_code: values.ifsCode,
        bank_name: values.bankName,
        bank_branch: values.bankBranch,
        ledger_currency: values.ledgerCurrency,
      },
    };
    // console.log("this is the obj", obj);
    formData.append("vendor", JSON.stringify(obj.vendor));
    formData.append("branch", JSON.stringify(obj.branch));

    // console.log("formData", formData);
    // console.log("obj", obj);
    setShowSubmitConfirmModal(formData);
  };

  const reset = async () => {
    setShowSubmitConfirmModal(false);

    addVendorForm.resetFields();
    setFiles([]);
  };
  // useEffect(() => {
  //   // console.log("msmsStatus", msmsStatus);
  //   if (msmsStatus) {
  //     setMsmeStat(msmsStatus);
  //   }
  // }, [msmsStatus]);

  // const changeMSmeStatus = (value) => {
  //   console.log("value", value);
  //   setMsmeStat(value);
  // };
  // useEffect(() => {
  //       setMsmeStat(value);
  // }, [third]);

  useEffect(() => {
    // getGroupOptions();
    getCurrencies();
  }, []);

  return (
    <div style={{ height: "90%" }}>
      <Form
        initialValues={initialValues}
        layout="vertical"
        form={addVendorForm}
        style={{ padding: 20 }}
      >
        <Modal
          title="Submit Confirm"
          open={showSubmitConfirmModal}
          onOk={submitHandler}
          // confirmLoading={loading === "submit"}
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
                  label="Vendor Name"
                  name="vendorName"
                  rules={rules.vendorName}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Pan Number" name="panno" rules={rules.panno}>
                  <Input
                    maxLength={10}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^A-Za-z0-9]/g, "").slice(0, 10).toUpperCase();
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
                  <InputNumber
                    style={{ width: "100%" }}
                    min={1}
                    max={999}
                    // value={paymentTerms.value}
                    // onChange={(e) => inputHandler("cin", e.target.value)}//
                    size="default"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              {/* <Col span={6}>
                <Form.Item label="Group" name="group">
                  <MySelect options={groupOptions} />
                </Form.Item>
              </Col> */}
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
                      <MySelect
                        options={msmeOptions}
                        // value={msmeStat}
                        // onChange={(value) => changeMSmeStatus(value)}
                      />
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
                        <Form.Item
                          label="MSME Type"
                          name="type"
                          rules={rules.type}
                        >
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
                        <Form.Item
                          label="Effective From"
                          name="msmeEffectiveFrom"
                        >
                          <SingleDatePicker
                            size="default"
                            setDate={(value) =>
                              addVendorForm.setFieldValue(
                                "msmeEffectiveFrom",
                                value,
                              )
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
              title={<p style={{ fontSize: "0.8rem" }}>Bank Details</p>}
            >
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Provide Bank & Ledger Currency Details
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={20}>
            <Row gutter={16}>
              <Col span={6}>
                {/* <Form.Item label="Transaction Type" name="transactionType">
                  <Input />
                </Form.Item> */}

                <Form.Item label="Transaction Type" name="transactionType">
                  <MySelect
                    options={transactionTypeOptions}
                   
                    onChange={(value) =>
                      addVendorForm.setFieldValue("transactionType", value)
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="A/c No" name="accountNo">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="IFS Code" name="ifsCode">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Bank Name" name="bankName">
                  <Input />
                </Form.Item>
              </Col>
                    <Col span={6}>
                <Form.Item label="Bank Branch" name="bankBranch">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Currency of Ledger" name="ledgerCurrency">
                  <MySelect options={currencies} />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={4}>
            <Descriptions
              size="small"
              title={<p style={{ fontSize: "0.8rem" }}>GST Details</p>}
            >
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Provide GSt Details
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={12}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="GST Number" name="gstin" rules={rules.gstin}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="E-Invoice Applicability"
                  name="applicability"
                  rules={rules.applicability}
                >
                  <MySelect
                    options={msmeOptions}
                    // value={msmeStat}
                    // onChange={(value) => changeMSmeStatus(value)}
                  />
                </Form.Item>
              </Col>
              {einvoice === "Y" && (
                <Col span={8}>
                  {" "}
                  <Form.Item
                    label="Date of Applicability"
                    name="dobApplicabilty"
                    rules={rules.dobApplicabilty}
                  >
                    <SingleDatePicker
                      size="default"
                      // setDate={setEffective}
                      setDate={(value) =>
                        addVendorForm.setFieldValue("dobApplicabilty", value)
                      }
                    />
                  </Form.Item>
                </Col>
              )}
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
                    // value={state.value}
                    // value={addVendor.branch.state}
                    // onChange={(e) => inputHandler("state", e)}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="City" name="city" rules={rules.city}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Pin Code"
                  name="pincode"
                  rules={rules.pincode}
                >
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

            {/* Bank details are maintained in a separate section */}
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
                {/* <div
                  className="remove-table-footer"
                  style={{ height: "50%", opacity: loading ? 0.5 : 1 }}
                > */}
                <div style={{ flex: 1 }}>
                  <Col
                    span={24}
                    style={{
                      height: "14rem",
                      // overflowX: "hidden",
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
                {/* </div> */}
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
      <NavFooter
        resetFunction={() => setShowResetConfirmModal(true)}
        submitFunction={validateHandler}
        nextLabel="Submit"
        // disabled={{ reset: loading }}
      />
    </div>
  );
};
const initialValues = {
  paymentTerms: 30,
  vendorName: "",
  panno: "",
  gstin: "",
  branch: "",
  state: "",
  mobile: "",
  city: "",
  vendorName: "",
  pincode: "",
  address: "",
  msmeStatus: "N",
  group: undefined,
  transactionType: "",
  accountNo: "",
  ifsCode: "",
  bankName: "",
  bankBranch: "",
  ledgerCurrency: "",
  components: [{}],
};

const rules = {
  // vendorName: [
  //   {
  //     required: true,
  //     message: "Please select the Vendor Name",
  //   },
  // ],
  // panno: [
  //   {
  //     required: true,
  //     message: "Please provide the PAN number",
  //   },
  // ],
  // year: [
  //   {
  //     required: true,
  //     message: "Please provide the year",
  //   },
  // ],
  // msmeId: [
  //   {
  //     required: true,
  //     message: "Please provide the MSME Id",
  //   },
  // ],
  // status: [
  //   {
  //     required: true,
  //     message: "Please provide the MSME status",
  //   },
  // ],
  // type: [
  //   {
  //     required: true,
  //     message: "Please provide the MSME type.",
  //   },
  // ],
  // gstin: [
  //   {
  //     required: true,
  //     message: "Please provide the gstin.",
  //   },
  // ],
  // msmeId: [
  //   {
  //     required: true,
  //     message: "Please provide the MSME Id.",
  //   },
  // ],
  // activity: [
  //   {
  //     required: true,
  //     message: "Please provide the MSME Activity.",
  //   },
  // ],
  // branch: [
  //   {
  //     required: true,
  //     message: "Please provide the branchName.",
  //   },
  // ],
  // state: [
  //   {
  //     required: true,
  //     message: "Please provide the state.",
  //   },
  // ],
  // mobile: [
  //   {
  //     required: true,
  //     message: "Please provide the mobile.",
  //   },
  // ],
  // city: [
  //   {
  //     required: true,
  //     message: "Please provide the city.",
  //   },
  // ],
  // pincode: [
  //   {
  //     required: true,
  //     message: "Please provide the pin code.",
  //   },
  // ],
  // address: [
  //   {
  //     required: true,
  //     message: "Please provide the address.",
  //   },
  // ],
  // paymentTerms: [
  //   {
  //     required: true,
  //     message: "Please provide the payment Terms.",
  //   },
  // ],
  // dobApplicabilty: [
  //   {
  //     required: true,
  //     message: "Please provide the date of applicabilty.",
  //   },
  // ],
  // dobApplicable: [
  //   {
  //     required: true,
  //     message: "Please provide the applicabilty Status.",
  //   },
  // ],
};

export default AddVendor;
