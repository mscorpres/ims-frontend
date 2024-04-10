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

const AddVendor = () => {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [files, setFiles] = useState([]);
  const [addVendorForm] = Form.useForm();
  const [selectLoading, setSelectLoading] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [effective, setEffective] = useState("");
  // const [msmeStat, setMsmeStat] = useState("");
  const msmeStat = Form.useWatch("msmeStatus", addVendorForm);
  const einvoice = Form.useWatch("applicability", addVendorForm);
  console.log("okkk", einvoice);
  const components = Form.useWatch("components", {
    form: addVendorForm,
    preserve: true,
  });
  // setMsmeStat(msmsStatus);
  const [searchTerm, setSearchTerm] = useState("");
  const getFetchState = async (e) => {
    if (e.length > 2) {
      setSelectLoading(true);
      const { data } = await imsAxios.post("/backend/stateList", {
        search: e,
      });
      setSelectLoading(false);
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
      // return arr;
    }
  };

  const submitHandler = async () => {
    const formData = new FormData();
    formData.append("vendor", JSON.stringify(showSubmitConfirmModal.vendor));
    formData.append("branch", JSON.stringify(showSubmitConfirmModal.branch));
    formData.append("uploadfile", files);
    console.log("formData", formData);
    console.log("files", files);
    setLoading("submit");
    setShowSubmitConfirmModal(false);
    return;
    const response = await imsAxios.post("/vendor/addVendor", formData);
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        toast.success(data.message);
        reset();
      } else {
        setShowSubmitConfirmModal(false);
        // console.log("data.message", data.message);
        toast.error(data.message.msg);
      }
    }
  };

  const validateHandler = async () => {
    const values = await addVendorForm.validateFields();
    console.log("values", values);
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
        eInvoice: values.applicability,
        dateOfApplicability:
          values.applicability === "Y" ? values.dobApplicabilty : "--",
      },
      branch: {
        branch: values.branch,
        address: values.address,
        state: values.state,
        city: values.city,
        pincode: values.pincode,
        fax: values.fax == "" && "--",
        mobile: values.mobile,
        email: values.email == "" && "--",
        gstin: values.gstin.toUpperCase(),
      },
    };
    // console.log("obj", obj);
    setShowSubmitConfirmModal(obj);
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
  // const changeMSmeStatus = (value) => {
  //   console.log("value", value);
  //   setMsmeStat(value);
  // };
  // useEffect(() => {
  //       setMsmeStat(value);
  // }, [third]);

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
                  label="Vendor Name"
                  name="vendorName"
                  rules={rules.vendorName}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Pan Number" name="panno" rules={rules.panno}>
                  <Input />
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
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={4}>
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
            <Row gutter={[10, 10]}>
              <Col span={24}>
                <div
                  className="remove-table-footer"
                  style={{ height: "50%", opacity: loading ? 0.5 : 1 }}
                >
                  <div style={{ flex: 1 }}>
                    <Col
                      span={24}
                      style={{
                        height: "90%",
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
  components: [{}],
};

const rules = {
  vendorName: [
    {
      required: true,
      message: "Please select the Vendor Name",
    },
  ],
  panno: [
    {
      required: true,
      message: "Please provide the PAN number",
    },
  ],
  year: [
    {
      required: true,
      message: "Please provide the year",
    },
  ],
  msmeId: [
    {
      required: true,
      message: "Please provide the MSME Id",
    },
  ],
  status: [
    {
      required: true,
      message: "Please provide the MSME status",
    },
  ],
  type: [
    {
      required: true,
      message: "Please provide the MSME type.",
    },
  ],
  gstin: [
    {
      required: true,
      message: "Please provide the gstin.",
    },
  ],
  msmeId: [
    {
      required: true,
      message: "Please provide the MSME Id.",
    },
  ],
  activity: [
    {
      required: true,
      message: "Please provide the MSME Activity.",
    },
  ],
  branch: [
    {
      required: true,
      message: "Please provide the branchName.",
    },
  ],
  state: [
    {
      required: true,
      message: "Please provide the state.",
    },
  ],
  mobile: [
    {
      required: true,
      message: "Please provide the mobile.",
    },
  ],
  city: [
    {
      required: true,
      message: "Please provide the city.",
    },
  ],
  pincode: [
    {
      required: true,
      message: "Please provide the pin code.",
    },
  ],
  address: [
    {
      required: true,
      message: "Please provide the address.",
    },
  ],
  paymentTerms: [
    {
      required: true,
      message: "Please provide the payment Terms.",
    },
  ],
  dobApplicabilty: [
    {
      required: true,
      message: "Please provide the date of applicabilty.",
    },
  ],
  dobApplicable: [
    {
      required: true,
      message: "Please provide the applicabilty Status.",
    },
  ],
};

export default AddVendor;
