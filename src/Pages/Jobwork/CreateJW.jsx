import {
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import MySelect from "../../Components/MySelect";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import NavFooter from "../../Components/NavFooter";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import AddVendorSideBar from "../PurchaseOrder/CreatePO/AddVendorSideBar";
import AddBranch from "../Master/Vendor/model/AddBranch";
import CreateCostModal from "../PurchaseOrder/CreatePO/CreateCostModal";
import AddProjectModal from "../PurchaseOrder/CreatePO/AddProjectModal";
import Loading from "../../Components/Loading";
import useLoading from "../../hooks/useLoading";
import {
  createJobWorkReq,
  getCostCentresOptions,
  getProjectOptions,
  getVendorOptions,
} from "../../api/general.ts";
import { convertSelectOptions } from "../../utils/general.ts";
import useApi from "../../hooks/useApi.ts";

// vendor type options
const vendorTypeOptions = [
  { text: "JWI", value: "j01" },
  { text: "Vendor", value: "v01" },
];

const poTypeOptions = [{ text: "New", value: "N" }];

// gst type options
const gstTypeOptions = [
  { text: "Local", value: "L" },
  { text: "Interstate", value: "I" },
];

// gst rate options
const gstRateOptions = [
  { text: "0%", value: "0" },
  { text: "5%", value: "5" },
  { text: "12%", value: "12" },
  { text: "18%", value: "18" },
  { text: "28%", value: "28" },
];
// initial values of the form
const newPurchaseOrder = {
  pocreatetype: "N",
  original_po: "",
  vendortype: "j01",
  vendorname: "",
  vendorbranch: "",
  gstin: "",
  vendoraddress: "",
  termsconditions: "",
  quotationdetails: "",
  paymentterms: "",
  paymenttermsday: 30,
  pocostcenter: "",
  project_name: "",
  project_description: "",
  billaddressid: "",
  jw_raise_by: "",
  billGST: "",
  billaddress: "",
  shipaddressid: "",
  shipGST: "",
  component: "",
  qty: 0,
  rate: 0,
  value: "",
  dueDate: "",
  hsn: "",
  gstType: "L",
  gstRate: "0",
  cgst: "",
  sgst: "",
  igst: "",
  description: "",
  location: "",
};

export default function CreateJW({}) {
  // initialize loading state
  const [loading, setLoading] = useLoading();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [asyncLocationOptions, setAsyncLocationOptions] = useState([]);
  const [requestByOptions, setRequestByOptions] = useState([]);
  const [vendorBranchOptions, setVendorBranchOptions] = useState([]);
  const [projectDescription, setProjectDescription] = useState("");
  const [billingAddressOptions, setBillingAddressOptions] = useState([]);
  const [shippingAddressOptions, setShippingAddressOptions] = useState([]);
  const [showAddProjectConfirm, setShowAddProjectConfirm] = useState(false);
  const [showBranchModel, setShowBranchModal] = useState(false);
  const [showAddCostModal, setShowAddCostModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const [taxSummary, setTaxSummary] = useState({
    value: "0",
    sgst: "0",
    cgst: "0",
    igst: "0",
    totalValue: "0",
  });
  const [uom, setUom] = useState("");
  const [createPoForm] = Form.useForm();
  // get po options
  //   in case of po type change
  const getPoOptions = async (inputValue) => {};
  //   get vendor options
  const getVendorOption = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  //   get vendor branch options
  const getVendorBranchOptions = async (inputValue) => {
    setLoading("fetch", true);
    const response = await imsAxios.post("/backend/vendorBranchList", {
      vendorcode: inputValue,
    });
    setLoading("fetch", false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row) => ({
          text: row.text,
          value: row.id,
        }));
        setVendorBranchOptions(arr);
        getVendorBranchDetails({
          vendorcode: inputValue,
          branchcode: arr[0].value,
        });
        createPoForm.setFieldValue("vendorbranch", arr[0].value);
      } else {
        toast.error(data.message.msg);
      }
    } else {
      toast.error("Some error occured while getting vendor branches ");
    }
  };
  //   getting vendor branch details
  const getVendorBranchDetails = async (inputValue) => {
    setLoading("fetch", true);
    const response = await imsAxios.post("/backend/vendorAddress", {
      vendorcode: inputValue.vendorcode,
      branchcode: inputValue.branchcode,
    });
    setLoading("fetch", false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        createPoForm.setFieldValue(
          "vendoraddress",
          data.data?.address?.replaceAll("<br>", "\n")
        );
        createPoForm.setFieldValue("gstin", data.data?.gstid);
      } else {
        toast.error(data.message.msg);
      }
    } else {
      toast.error("Some error occured while getting vendor address ");
    }
  };

  const getData = (response) => {
    const { data } = response;
    if (data) {
      if (data.length) {
        const arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));

        setAsyncLocationOptions(arr);
      }
    }
  };

  const getLocatonOptions = async (search) => {
    setLoading("selectLocation");
    const response = await imsAxios.post("/backend/fetchLocation", {
      searchTerm: search,
    });
    getData(response);
  };

  //   get cost center options

  const handleFetchCostCenterOptions = async (search) => {
    const response = await executeFun(
      () => getCostCentresOptions(search),
      "select"
    );
    let arr = [];
    if (response.success) arr = convertSelectOptions(response.data);
    setAsyncOptions(arr);
  };

  // get project options
  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };

  // get project details
  const getProjectDetails = async (inputValue) => {
    setLoading("select", true);
    const response = await imsAxios.post("/backend/projectDescription", {
      project_name: inputValue,
    });
    setLoading("select", false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        setProjectDescription(data.data);
        createPoForm.setFieldValue(
          "project_description",
          data.data?.description
        );
      } else {
        toast.error(data.message.msg);
      }
    } else {
      toast.error("Some error occured wile getting project details");
    }
  };
  //   get billing address options
  const getBillingAddressOptions = async (inputValue) => {
    setLoading("select", true);
    const response = await imsAxios.post("/backend/billingAddressList", {
      search: inputValue,
    });
    setLoading("select", false);
    const { data } = response;
    if (data[0]) {
      let arr = data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setBillingAddressOptions(arr);
    } else {
      setBillingAddressOptions([]);
      toast.error("Some error occured wile getting billing addresses");
    }
  };
  //   gettimg billing address details
  const getBillingAddressDetails = async (inputValue) => {
    setLoading("fetch", true);
    const response = await imsAxios.post("/backend/billingAddress", {
      billing_code: inputValue,
    });
    setLoading("fetch", false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        createPoForm.setFieldValue(
          "billaddress",
          data.data?.address?.replaceAll("<br>", "\n")
        );
        createPoForm.setFieldValue("billGST", data.data?.gstin);
        createPoForm.setFieldValue("billPan", data.data?.pan);
      } else {
      }
    } else {
      toast.error("Some error occured wile getting billing address details");
    }
  };
  //   get billing address options
  const getShipingAddressOptions = async (inputValue) => {
    setLoading("select", true);
    const response = await imsAxios.post("/backend/shipingAddressList", {
      search: inputValue,
    });
    setLoading("select", false);
    const { data } = response;
    if (data[0]) {
      let arr = data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setShippingAddressOptions(arr);
    } else {
      setShippingAddressOptions([]);
      toast.error("Some error occured wile getting shipping addresses");
    }
  };
  //   gettimg billing address details
  const geShipAddressDetails = async (inputValue) => {
    setLoading("fetch", true);
    const response = await imsAxios.post("/backend/shippingAddress", {
      shipping_code: inputValue,
    });
    setLoading("fetch", false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        createPoForm.setFieldValue(
          "shipaddress",
          data.data?.address?.replaceAll("<br>", "\n")
        );
        createPoForm.setFieldValue("shipGST", data.data?.gstin);
        createPoForm.setFieldValue("shipPan", data.data?.pan);
      } else {
      }
    } else {
      toast.error("Some error occured wile getting billing address details");
    }
  };

  const getusers = async (s) => {
    setLoading("select", true);
    if (s?.length > 2) {
      const { data } = await imsAxios.post("/backend/fetchAllUser", {
        search: s,
      });
      setLoading("select", false);
      let arr = [];
      if (!data.msg) {
        arr = data.map((d) => {
          return { text: d.text, value: d.id };
        });
        setRequestByOptions(arr);
      } else {
        setRequestByOptions([]);
      }
    }
  };

  //   getting component options
  const getComponentOptions = async (inputValue) => {
    setLoading("select", true);
    const response = await imsAxios.post("/backend/getSemiProductByNameAndNo", {
      search: inputValue,
    });
    setLoading("select", false);
    const { data } = response;
    if (data) {
      let arr = data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setAsyncOptions(arr);
    } else {
      toast.error("Some error occured wile getting components");
    }
  };
  //   getting component details
  const getComponentDetails = async (inputValue) => {
    setLoading("fetch", true);
    const response = await imsAxios.post("jobwork/fetchProductData4Table", {
      product_name: inputValue,
    });
    setLoading("fetch", false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        setUom(data.data?.unit);
        createPoForm.setFieldValue("qty", data.data?.description);
        createPoForm.setFieldValue("rate", data.data?.rate);
        createPoForm.setFieldValue("hsn", data.data?.hsn);
        createPoForm.setFieldValue("gstRate", data.data?.gstrate);
      } else {
        toast.error(data.message.msg);
      }
    } else {
      toast.error("Some error occured wile getting component details");
    }
  };
  const inputHandler = () => {
    let rate = createPoForm.getFieldValue("rate");
    let qty = createPoForm.getFieldValue("qty");
    let gstRate = createPoForm.getFieldValue("gstRate");
    let gstType = createPoForm.getFieldValue("gstType");
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let value = +Number(rate) * Number(qty);
    let gstAmount = (value * Number(gstRate)) / 100;
    if (gstType === "L") {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
    } else {
      igst = gstAmount;
    }

    let obj = createPoForm.getFieldValue();
    obj = {
      ...obj,
      value,
      cgst,
      sgst,
      igst,
    };
    let taxObj = {
      value,
      cgst,
      sgst,
      igst,
      total:
        +Number(value).toFixed(2) +
        +Number(cgst).toFixed(2) +
        +Number(sgst).toFixed(2) +
        +Number(igst).toFixed(2),
    };
    setTaxSummary(taxObj);
    createPoForm.setFieldsValue(obj);
  };
  // show submit confirmation modal
  const showSubmitConfirmationModal = () => {
    // submit confirm modal
    Modal.confirm({
      title: "Do you Want to submit the PO?",
      icon: <ExclamationCircleOutlined />,
      content: "Please check the details before submitting the PO",
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        submitHandler();
      },
    });
  };
  // submit handler
  const submitHandler = async () => {
    //validating form values
    const values = await createPoForm.validateFields();
    let finalObj = {
      billingaddrid: values.billaddressid,
      billingaddr: values.billaddress,
      dispatch_id: values.shipaddressid,
      dispatch_address: values.shipaddress,
      termscondition: values.termscondition ?? "--",
      quotationdetail: values.quotationdetail ?? "--",
      paymentterms: values.paymentterms ?? "--",
      paymenttermsday: values.paymenttermsday ?? 30,
      pocostcenter: values.pocostcenter,
      poproject_name: values.project_name,
      jw_raise_by: values.jw_raise_by,
      po_remark: values.po_comment ?? "--",
      vendor_name: values.vendorname.value,
      vendor_type: values.vendortype,
      vendor_branch: values.vendorbranch,
      vendor_address: values.vendoraddress,
      location: values.location,
      product: [values.component],
      qty: [values.qty],
      rate: [values.rate],
      duedate: [values.dueDate],
      part_remark: [values.description],
      part_remark: [values.description],
      hsncode: [values.hsn],
      gsttype: [values.gstType],
      gstrate: [values.gstRate],
      igst: [values.igst],
      cgst: [values.cgst],
      sgst: [values.sgst],
    };
    setLoading("submitting", true);
    const response = await executeFun(
      () => createJobWorkReq(finalObj),
      "select"
    );
    console.log("response", response);

    // const response = await imsAxios.post("/jobwork/createJobWorkReq", finalObj);
    // setLoading("submitting", false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        toast.success(data.message);
        resetHandler();
        setLoading("submitting", false);
      } else {
        toast.error(data.message.msg);
        setLoading("submitting", false);
      }
    }
    setLoading("submitting", false);
  };
  // reset handlerd
  const resetHandler = () => {
    createPoForm.resetFields();
  };
  // show reset confirm
  const showResetConfirm = () => {
    Modal.confirm({
      title: "Do you Want to reset the form?",
      icon: <ExclamationCircleOutlined />,
      content: "This will reset the form",
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        resetHandler();
      },
    });
  };
  useEffect(() => {
    getBillingAddressOptions();
    getShipingAddressOptions();
  }, []);
  return (
    <div
      style={{
        // height: "95%",
        overflowY: "scroll",
        overflowX: "hidden",
        padding: 20,
        paddingBottom: 120,
      }}
    >
      {/* vendor */}
      <Form
        form={createPoForm}
        size="small"
        scrollToFirstError={true}
        name="create-po"
        layout="vertical"
        initialValues={newPurchaseOrder}
        // onFinish={finish}
        onFieldsChange={() => {
          inputHandler();
        }}
      >
        {loading("fetch") && <Loading />}
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
            <Row gutter={6}>
              {/* PO type */}
              <Col span={6}>
                <Form.Item
                  name="pocreatetype"
                  label="PO Type"
                  rules={[
                    {
                      required: true,
                      message: "Please Select a PO Type!",
                    },
                  ]}
                >
                  <MySelect size="default" options={poTypeOptions} />
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
                    rules={[
                      {
                        required: newPurchaseOrder.pocreatetype == "S",
                        message: "Please Select a PO Type!",
                      },
                    ]}
                  >
                    <MyAsyncSelect
                      selectLoading={loading("select")}
                      size="default"
                      onBlur={() => setAsyncOptions([])}
                      loadOptions={getPoOptions}
                      optionsState={asyncOptions}
                    />
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
            <Row gutter={6}>
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
                  rules={[
                    {
                      required: true,
                      message: "Please Select a vendor Type!",
                    },
                  ]}
                >
                  <MySelect size="default" options={vendorTypeOptions} />
                </Form.Item>
              </Col>
              {/* vendor name */}
              <Col span={6}>
                <Form.Item
                  name="vendorname"
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
                  rules={[
                    {
                      required: true,
                      message: "Please Select a vendor Name!",
                    },
                  ]}
                >
                  <MyAsyncSelect
                    selectLoading={loading1("select")}
                    size="default"
                    labelInValue
                    onBlur={() => setAsyncOptions([])}
                    optionsState={asyncOptions}
                    loadOptions={getVendorOption}
                    onChange={(value) => getVendorBranchOptions(value.value)}
                  />
                </Form.Item>
              </Col>
              {/* venodr branch */}
              <Col span={6}>
                <Form.Item
                  name="vendorbranch"
                  label={
                    <div
                      style={{
                        fontSize: window.innerWidth < 1600 && "0.7rem",
                        display: "flex",
                        justifyContent: "space-between",
                        width: 350,
                        cursor: "pointer",
                      }}
                    >
                      Vendor Branch
                      <span
                        onClick={() => {
                          createPoForm.getFieldValue("vendorname")?.value
                            ? setShowBranchModal({
                                vendor_code:
                                  createPoForm.getFieldValue("vendorname")
                                    ?.value,
                              })
                            : toast.error("Please Select a vendor first");
                        }}
                        style={{ color: "#1890FF" }}
                      >
                        Add Branch
                      </span>
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please Select a vendor Branch!",
                    },
                  ]}
                >
                  <MySelect
                    onChange={(value) => {
                      getVendorBranchDetails({
                        vendorcode:
                          createPoForm.getFieldValue("vendorname")?.value,
                        branchcode: value,
                      });
                    }}
                    options={vendorBranchOptions}
                  />
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
              <Col span={18}>
                <Form.Item
                  name="vendoraddress"
                  label="Bill From Address"
                  rules={[
                    {
                      required: true,
                      message: "Please Enter bill from address!",
                    },
                  ]}
                >
                  <Input.TextArea rows={3} style={{ resize: "none" }} />
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
            <Row gutter={6}>
              {/* terms and conditions */}
              <Col span={6}>
                <Form.Item name="termscondition" label=" Terms and Conditions">
                  <Input size="default" />
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
                <Form.Item name="paymentterms" label=" Payment Terms">
                  <Input size="default" />
                </Form.Item>
              </Col>

              {/* po due date*/}
              <Col span={6}>
                <Form.Item label="Due Date (in days)" name="paymenttermsday">
                  <InputNumber
                    style={{ width: "100%" }}
                    size="default"
                    min={1}
                    max={999}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={6}>
              {/* project id */}
              {/* cost center */}
              <Col span={6}>
                <Form.Item
                  name="pocostcenter"
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
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Cost Center!",
                    },
                  ]}
                >
                  <MyAsyncSelect
                    selectLoading={loading("select")}
                    onBlur={() => setAsyncOptions([])}
                    loadOptions={handleFetchCostCenterOptions}
                    optionsState={asyncOptions}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="project_name"
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
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Project!",
                    },
                  ]}
                >
                  <MyAsyncSelect
                    selectLoading={loading("select")}
                    onBlur={() => setAsyncOptions([])}
                    loadOptions={handleFetchProjectOptions}
                    optionsState={asyncOptions}
                    onChange={getProjectDetails}
                  />
                </Form.Item>
              </Col>
              {/* project name */}
              <Col span={6}>
                <Form.Item
                  name="project_description"
                  label="Project Description"
                >
                  <Input size="default" disabled value={projectDescription} />
                </Form.Item>
              </Col>
              {/* comments */}
              <Col span={6}>
                <Form.Item label="Comments" name="po_comment">
                  <Input size="default" />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item
                  label="Requested By"
                  name="jw_raise_by"
                  rules={[
                    {
                      required: true,
                      message: "Please Select Requested By!",
                    },
                  ]}
                >
                  <MyAsyncSelect
                    selectLoading={loading("select")}
                    size="default"
                    onBlur={() => setRequestByOptions([])}
                    optionsState={requestByOptions}
                    loadOptions={getusers}
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
          <Col span={16}>
            <Row gutter={6}>
              {/* billing id */}
              <Col span={8}>
                <Form.Item
                  name="billaddressid"
                  label="Billing Id"
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Billing Address!",
                    },
                  ]}
                >
                  <MyAsyncSelect
                    selectLoading={loading("select")}
                    loadOptions={getBillingAddressOptions}
                    optionsState={billingAddressOptions}
                    options={billingAddressOptions}
                    onChange={getBillingAddressDetails}
                  />
                </Form.Item>
              </Col>
              {/* pan number */}
              <Col span={8}>
                <Form.Item
                  name="billPan"
                  label="Pan No."
                  rules={[
                    {
                      required: true,
                      message: "Please enter Billing PAN Number!",
                    },
                  ]}
                >
                  {/* <Input size="default" value={newPurchaseOrder.billPan} /> */}
                  <Input size="default" />
                </Form.Item>
              </Col>
              {/* gstin uin */}
              <Col span={8}>
                <Form.Item
                  name="billGST"
                  label="GSTIN / UIN"
                  rules={[
                    {
                      required: true,
                      message: "Please enter Billing GSTIN Number!",
                    },
                  ]}
                >
                  {/* <Input size="default" value={newPurchaseOrder.billGST} /> */}
                  <Input size="default" />
                </Form.Item>
              </Col>
            </Row>
            {/* billing address */}
            <Row>
              <Col span={24}>
                <Form.Item
                  name="billaddress"
                  label="Billing Address"
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Billing Address!",
                    },
                  ]}
                >
                  <Input.TextArea style={{ resize: "none" }} rows={3} />
                </Form.Item>
              </Col>
            </Row>
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

          <Col span={16}>
            <Row gutter={6}>
              {/* shipping id */}
              <Col span={8}>
                <Form.Item
                  name="shipaddressid"
                  label="Shipping Id"
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Shipping Address!",
                    },
                  ]}
                >
                  <MyAsyncSelect
                    selectLoading={loading("select")}
                    loadOptions={getShipingAddressOptions}
                    optionsState={shippingAddressOptions}
                    onChange={geShipAddressDetails}
                  />
                </Form.Item>
              </Col>
              {/* pan number */}
              <Col span={8}>
                <Form.Item
                  label="Pan No."
                  name="shipPan"
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Shipping PAN Number!",
                    },
                  ]}
                >
                  {/* <Input size="default" value={newPurchaseOrder.shipPan} /> */}
                  <Input size="default" />
                </Form.Item>
              </Col>
              {/* gstin uin */}
              <Col span={8}>
                <Form.Item
                  name="shipGST"
                  label=" GSTIN / UIN"
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Shipping GSTIN!",
                    },
                  ]}
                >
                  {/* <Input size="default" value={newPurchaseOrder.shipGST} /> */}
                  <Input size="default" />
                </Form.Item>
              </Col>
            </Row>
            {/* shipping address */}
            <Row>
              <Col span={24}>
                <Form.Item
                  label="Shipping Address"
                  name="shipaddress"
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Shipping Address!",
                    },
                  ]}
                >
                  <Input.TextArea style={{ resize: "none" }} rows={3} />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Divider />
        {/* product details */}
        <Row gutter={6}>
          <Col span={4}>
            <Descriptions size="small" title="Component Details">
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Provide SFG Component Details
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col span={16}>
            <Row gutter={6}>
              {/* component name*/}
              <Col span={8}>
                <Form.Item
                  name="component"
                  label="Component"
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Component!",
                    },
                  ]}
                >
                  <MyAsyncSelect
                    selectLoading={loading("select")}
                    loadOptions={getComponentOptions}
                    optionsState={asyncOptions}
                    onChange={getComponentDetails}
                  />
                </Form.Item>
              </Col>
              {/* order qty */}
              <Col span={4}>
                <Form.Item
                  label="Qty"
                  name="qty"
                  rules={[
                    {
                      required: true,
                      message: "Qty should be greater than zero!",
                    },
                  ]}
                >
                  <Input size="default" suffix={uom} type="number" />
                </Form.Item>
              </Col>
              {/* Rate */}
              <Col span={4}>
                <Form.Item
                  name="rate"
                  label="Rate"
                  rules={[
                    {
                      required: true,
                      message: "Rate should be greater than zero!",
                    },
                  ]}
                >
                  <Input size="default" type="number" />
                </Form.Item>
              </Col>
              {/* Rate */}
              <Col span={4}>
                <Form.Item name="dueDate" label="Due Date">
                  <Input size="default" />
                </Form.Item>
              </Col>
              {/* value */}
              <Col span={4}>
                <Form.Item name="value" label="Value">
                  <Input disabled size="default" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col span={4}>
                <Form.Item
                  label="Location"
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Location!",
                    },
                  ]}
                  name="location"
                >
                  <MyAsyncSelect
                    onBlur={() => setAsyncLocationOptions([])}
                    loadOptions={getLocatonOptions}
                    optionsState={asyncLocationOptions}
                    selectLoading={loading === "selectLocation"}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="hsn"
                  label="HSN Code"
                  rules={[
                    {
                      required: true,
                      message: "Please enter HSN code",
                    },
                  ]}
                >
                  <Input size="default" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="gstType"
                  label="GST Type"
                  rules={[
                    {
                      required: true,
                      message: "Please select GST type",
                    },
                  ]}
                >
                  <MySelect options={gstTypeOptions} size="default" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="gstRate"
                  label="GST Rate"
                  rules={[
                    {
                      required: true,
                      message: "Please enter GST Rate",
                    },
                  ]}
                >
                  <MySelect options={gstRateOptions} size="default" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="cgst" label="CGST">
                  <Input disabled size="default" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="sgst" label="SGST">
                  <Input disabled size="default" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="igst" label="IGST">
                  <Input size="default" disabled />
                </Form.Item>
              </Col>
            </Row>
            {/* shipping address */}
            <Row gutter={6}>
              <Col span={24}>
                <Form.Item label="Item Description" name="description">
                  <Input.TextArea style={{ resize: "none" }} rows={3} />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={4}>
            <Card size="small" title="Tax Details">
              <Row gutter={[0, 6]}>
                <Col span={12}>
                  <Typography.Text strong>Before Tax</Typography.Text>
                </Col>
                <Col span={12}>
                  <Row justify="end ">
                    <Typography.Text>{taxSummary.value}</Typography.Text>
                  </Row>
                </Col>

                <Col span={12}>
                  <Typography.Text strong>CGST</Typography.Text>
                </Col>
                <Col span={12}>
                  <Row justify="end ">
                    <Typography.Text>{taxSummary.cgst}</Typography.Text>
                  </Row>
                </Col>

                <Col span={12}>
                  <Typography.Text strong>SGST</Typography.Text>
                </Col>
                <Col span={12}>
                  <Row justify="end ">
                    <Typography.Text>{taxSummary.sgst}</Typography.Text>
                  </Row>
                </Col>

                <Col span={12}>
                  <Typography.Text strong>IGST</Typography.Text>
                </Col>
                <Col span={12}>
                  <Row justify="end ">
                    <Typography.Text>{taxSummary.igst}</Typography.Text>
                  </Row>
                </Col>

                <Col xl={24} xxl={14}>
                  <Typography.Text strong>
                    Total Value After Tax
                  </Typography.Text>
                </Col>
                <Col xl={24} xxl={10}>
                  <Row justify="end ">
                    <Typography.Text>{taxSummary.total}</Typography.Text>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
          <NavFooter
            loading={loading("submitting")}
            nextLabel="Submit"
            submitFunction={showSubmitConfirmationModal}
            resetFunction={showResetConfirm}
          />
        </Row>
      </Form>
      <Divider />
      <AddVendorSideBar
        open={showAddVendorModal}
        setOpen={setShowAddVendorModal}
      />
      <AddBranch
        getVendorBracnch={getVendorBranchOptions}
        setOpenBranch={setShowBranchModal}
        openBranch={showBranchModel}
      />
      <CreateCostModal
        showAddCostModal={showAddCostModal}
        setShowAddCostModal={setShowAddCostModal}
      />
      <AddProjectModal
        showAddProjectConfirm={showAddProjectConfirm}
        setShowAddProjectConfirm={setShowAddProjectConfirm}
      />
    </div>
  );
}
