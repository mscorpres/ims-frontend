import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Row,
  Col,
  Input,
  Form,
  Divider,
  Drawer,
  Space,
  InputNumber,
  Popconfirm,
  Modal,
} from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import UploadDocs from "../../Store/MaterialIn/MaterialInWithPO/UploadDocs";
import MySelect from "../../../Components/MySelect";

const AddVendorSideBar = ({ setOpen, open }) => {
  const [addVendor, setAddVendor] = useState({
    vendor: {
      vname: "",
      pan: "",
      cin: "",
    },
    branch: {
      branchname: "",
      state: "",
      city: "",
      gst: "",
      pin: "",
      email: "",
      mobile: "",
      address: "",
      fax: "",
    },
  });
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [files, setFiles] = useState([]);

  const [addVendorForm] = Form.useForm();
  const msmeStat = Form.useWatch("msmeStatus", addVendorForm);

  const inputHandler = (name, value) => {
    if (name === "vname" || name === "pan" || name === "cin") {
      setAddVendor((addVendor) => {
        return { ...addVendor, vendor: { ...addVendor.vendor, [name]: value } };
      });
    } else {
      setAddVendor((addVendor) => {
        return { ...addVendor, branch: { ...addVendor.branch, [name]: value } };
      });
    }
  };

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

  const addVendorDetail = async () => {
    const values = await addVendorForm.validateFields();
    // setSubmitLoading(true);
    let obj = {
      vendor: {
        vendorname: values.vendorName,
        panno: values.pan,
        cinno: values.cin == "" && "--",
        term_days: values.paymentTerms ?? 30,
        msme_status: values.msmeStatus,
        msme_year: values.year,
        msme_id: values.msmeId,
        msme_type: values.type,
        msme_activity: values.activity,
      },
      branch: {
        branch: values.branchname,
        address: values.address,
        state: values.state,
        city: values.city,
        pincode: values.pin,
        fax: values.fax == "" && "--",
        mobile: values.mobile,
        email: values.email == "" && "--",
        gstin: values.gst,
      },
    };
    console.log("obj", obj);
    // return;
    const formData = new FormData();
    formData.append("vendor", JSON.stringify(obj.vendor));
    formData.append("branch", JSON.stringify(obj.branch));
    formData.append("uploadfile", files[0]);

    const { data } = await imsAxios.post("/vendor/addVendor", formData);
    setSubmitLoading(false);
    if (data.code == 200) {
      // fetchVendor();
      reset();
      toast.success(data.message.toString().replaceAll("<br/>", " "));
      setOpen(null);
      // setShowAddVendorModal(false);
    } else {
      console.log("data", data);
      toast.error(data.message.msg);
      setSubmitLoading(false);
    }
    setSubmitLoading(false);
  };

  const reset = () => {
    let obj = {
      vendorName: "",
      pan: "",
      cin: "",
      paymentTerms: "",
      branchname: "",
      address: "",
      state: "",
      city: "",
      pin: "",
      fax: "",
      mobile: "",
      email: "",
      gst: "",
    };

    addVendorForm.setFieldsValue(obj);
    setFiles([]);
  };
  const msmeOptions = [
    { text: "Yes", value: "Y" },
    { text: "No", value: "N" },
  ];
  const msmeYearOptions = [
    { text: "2023 - 2024", value: "2023 - 2024" },
    { text: "2024 - 2025", value: "2024 - 2025" },
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
  const showModal = () => {
    Modal.confirm({
      title: "Are you sure you want to create this vendor?",

      onOk() {
        addVendorDetail();
      },
      onCancel() {},
    });
  };
  useEffect(() => {
    // fetchState();
  });
  return (
    <Drawer
      width="60vw"
      title="Add Vendor"
      onClose={() => setOpen(null)}
      open={open}
      bodyStyle={{ paddingTop: 5 }}
    >
      <Form style={{ height: "100%" }} form={addVendorForm} layout="vertical">
        <div style={{ height: "97%", overflowY: "auto", overflowX: "hidden" }}>
          <Divider orientation="center">VendorDetails</Divider>
          <Row gutter={16}>
            <Col span={24}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Vendor Name"
                    name="vendorName"
                    rules={[
                      {
                        required: true,
                        message: "Please add vendor name!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Pan Number"
                    name="pan"
                    rules={[
                      {
                        required: true,
                        message: "Please add vendor PAN No.!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="CIN Number" name="cin">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="GST Number"
                    name="gst"
                    rules={[
                      {
                        required: true,
                        message: "Please provide the GST Number",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  {" "}
                  <Form.Item label="Email" name="email">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Mobile"
                    name="mobile"
                    rules={[
                      {
                        required: true,
                        message: "Please provide the mobile number",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Fax Number" name="fax">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Payment Terms (in-days)"
                    name="paymentTerms"
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={1}
                      max={999}
                      size="default"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>{" "}
            <Col span={8}>
              <Form.Item label="MSME Status" name="msmeStatus">
                <MySelect
                  options={msmeOptions}
                  // value={msmeStat}
                  // onChange={(value) => changeMSmeStatus(value)}
                />
              </Form.Item>
            </Col>{" "}
            {msmeStat === "Y" && (
              <>
                <Col span={8}>
                  <Form.Item
                    label="MSME Number"
                    name="msmeId"
                    rules={[
                      {
                        required: true,
                        message: "Please provide the MSME Id",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                {/* <Row span={24}> */}
                <Col span={8}>
                  <Form.Item
                    label="Year"
                    name="year"
                    rules={[
                      {
                        required: true,
                        message: "Please provide the year",
                      },
                    ]}
                  >
                    <MySelect options={msmeYearOptions} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Type"
                    name="type"
                    rules={[
                      {
                        required: true,
                        message: "Please provide the MSME type.",
                      },
                    ]}
                  >
                    <MySelect options={msmeTypeOptions} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Activity"
                    name="activity"
                    rules={[
                      {
                        required: true,
                        message: "Please provide the MSME Activity.",
                      },
                    ]}
                  >
                    <MySelect options={msmeActivityOptions} />
                  </Form.Item>
                </Col>
                {/* </Row> */}
              </>
            )}
          </Row>
          <Divider orientation="center">Branch Details</Divider>
          <Row gutter={16}>
            <Col span={24}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Branch Name"
                    name="branchname"
                    rules={[
                      {
                        required: true,
                        message: "Please add label for vendor branch!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Select State"
                    name="state"
                    rules={[
                      {
                        required: true,
                        message: "Please select vendor state!",
                      },
                    ]}
                  >
                    <MyAsyncSelect
                      selectLoading={selectLoading}
                      onBlur={() => setAsyncOptions([])}
                      optionsState={asyncOptions}
                      loadOptions={getFetchState}
                      value={addVendor.branch.state}
                      onChange={(e) => inputHandler("state", e)}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="City"
                    name="city"
                    rules={[
                      {
                        required: true,
                        message: "Please provide vendor City!",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Pin Code"
                    name="pin"
                    rules={[
                      {
                        required: true,
                        message: "Please provide vendor pin code!",
                      },
                    ]}
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
                    rules={[
                      {
                        required: true,
                        message: "Please provide vendor complete address!",
                      },
                    ]}
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item label="Vendor Document" name="file">
                    <Row className="material-in-upload">
                      <UploadDocs
                        // size="large"
                        // disable={poData?.materials?.length == 0}
                        setFiles={setFiles}
                        files={files}
                      />
                    </Row>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        <Row justify="end">
          <Col>
            <Space>
              <Button onClick={reset}>Reset</Button>
              {/* <Popconfirm
                title="Submit Confirm"
                description="Are you sure you want to create this vendor?"
                onConfirm={() => {}}
                okText="Yes"
                cancelText="No"
                // okButtonProps={{ loading: submitLoading }}
              > */}
              <Button
                // htmlType="submit"
                // loading={submitLoading}
                onClick={showModal}
                type="primary"
              >
                Submit
              </Button>
              {/* </Popconfirm> */}
            </Space>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default AddVendorSideBar;
