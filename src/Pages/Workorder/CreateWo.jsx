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
import { useEffect, useState, useRef } from "react";
import MySelect from "../../Components/MySelect";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import NavFooter from "../../Components/NavFooter";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import AddClientBranch from "./components/createworkorder/AddClientBranch";
import AddClientModal from "./components/createworkorder/AddClientModal";
import CreateCostModal from "../PurchaseOrder/CreatePO/CreateCostModal";
import AddProjectModal from "../PurchaseOrder/CreatePO/AddProjectModal";
import Loading from "../../Components/Loading";
import useApi from "../../hooks/useApi.ts";
import { convertSelectOptions } from "../../utils/general.ts";
import { getCostCentresOptions, getProjectOptions } from "../../api/general.ts";

// vendor type options

const poTypeOptions = [{ text: "New", value: "N" }];
// check kro
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
};

export default function CreateWO({}) {
  // initialize loading state
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [ClientBranchOptions, setclientBranchOptions] = useState([]);
  const [bomOptions, setBomOptions] = useState([]);
  const [showAddProjectConfirm, setShowAddProjectConfirm] = useState(false);
  const [showBranchModel, setShowBranchModal] = useState(false);
  const [showBillingModel, setShowBillingModal] = useState(false);
  const [showAddCostModal, setShowAddCostModal] = useState(false);
  const [clientcode, setClientCode] = useState("");
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  const [projectDesc, setProjectDesc] = useState("");
  const [taxSummary, setTaxSummary] = useState({
    value: "0",
    sgst: "0",
    cgst: "0",
    igst: "0",
    totalValue: "0",
  });
  const [uom, setUom] = useState("");
  const [createWoForm] = Form.useForm();
  const [clientData, setClientData] = useState([]);
  const [addOptions, setAddOptions] = useState([]);

  const { executeFun, loading: loading1 } = useApi();
  //   get client options -->
  const getClientOptions = async (inputValue) => {
    try {
      setLoading("select");
      const response = await imsAxios.post("/backend/getClient", {
        searchTerm: inputValue,
      });
      const { data } = response;
      if (data) {
        let arr = data.data.map((row) => ({
          text: row.name,
          value: row.code,
        }));
        setAsyncOptions(arr);
      } else {
        toast.error("Some error occured wile getting vendors");
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };
  //   get vendor branch options
  const getclientDetials = async (inputValue, dm) => {
    try {
      setLoading("fetch");
      setClientCode(inputValue);
      const response = await imsAxios.post("/backend/fetchClientDetail", {
        code: inputValue,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.branchList.map((row) => ({
            text: row.text,
            value: row.id,
            address: row.address,
          }));
          setclientBranchOptions(arr);
          setAddOptions(arr);
          setClientData(data);
          if (dm === undefined) {
            createWoForm.setFieldValue("clientbranch", "");
            createWoForm.setFieldValue("gstin", "");
            createWoForm.setFieldValue("caddress", "");
          }
        } else {
          toast.error(data.message.msg);
        }
      } else {
        toast.error("Some error occured while getting Client branches ");
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  //   getting component options
  const getComponentOptions = async (inputValue) => {
    setLoading("select");
    const response = await imsAxios.post("/backend/getProductByNameAndNo", {
      search: inputValue,
    });
    setLoading(false);
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
  // ??
  const getComponentDetails = async (inputValue) => {
    setLoading("fetch");
    const response = await imsAxios.post("/createwo/fetchProductData", {
      product_key: inputValue,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        fetchbomlist(data.data.product_sku);
        setUom(data.data?.unit);
        createWoForm.setFieldValue("qty", data.data?.description);
        createWoForm.setFieldValue("rate", data.data?.rate);
        createWoForm.setFieldValue("hsn", data.data?.hsn);
        createWoForm.setFieldValue("gstRate", data.data?.gstrate);
      } else {
        toast.error(data.message.msg);
      }
    } else {
      toast.error("Some error occured wile getting component details");
    }
  };

  const fetchbomlist = async (search) => {
    const response = await imsAxios.post("backend/fetchBomProduct", {
      search: search,
    });
    let arr = response.data.data.map((row) => ({
      text: row.bomname,
      value: row.bomid,
    }));

    setBomOptions(arr);
  };

  const handleshipadress = (e) => {
    clientData.branchList.map((item) => {
      if (item.id === e) {
        createWoForm.setFieldValue("shipPan", clientData.client.pan_no);
        createWoForm.setFieldValue("shipGST", item.gst);
        createWoForm.setFieldValue("shipaddress", item.address);
      }
    });
  };

  const handlebilladress = (e) => {
    clientData.branchList.map((item) => {
      if (item.id === e) {
        createWoForm.setFieldValue("billPan", clientData.client.pan_no);
        createWoForm.setFieldValue("billGST", item.gst);
        createWoForm.setFieldValue("billaddress", item.address);
      }
    });
  };

  const inputHandler = () => {
    let rate = createWoForm.getFieldValue("rate");
    let qty = createWoForm.getFieldValue("qty");
    let gstRate = createWoForm.getFieldValue("gstRate");
    let gstType = createWoForm.getFieldValue("gstType");
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

    let obj = createWoForm.getFieldValue();
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
    createWoForm.setFieldsValue(obj);
  };
  // show submit confirmation modal
  const showSubmitConfirmationModal = () => {
    // submit confirm modal
    Modal.confirm({
      title: "Do you Want to submit the WO?",
      icon: <ExclamationCircleOutlined />,
      content: "Please check the details before submitting the WO",
      okText: "Yes",
      cancelText: "No",
      onOk: () => {
        submitHandler();
      },
    });
  };

  //get client details

  //get other info on branch select
  const getAddInfo = async (e) => {
    try {
      setLoading("fetch");
      const { data } = await imsAxios.post("backend/fetchClientAddress", {
        addressID: e,
        code: clientcode,
      });
      if (data.code === 200) {
        createWoForm.setFieldValue("gstin", data.data.gst);
        createWoForm.setFieldValue("caddress", data.data.address);
        toast.error(data.message.msg);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  // submit handler
  const submitHandler = async () => {
    //validating form values
    const values = await createWoForm.validateFields();
    console.log("values right here", values);
    // return;
    let finalObj = {
      client_name: values.clientname.value,
      qty: values.qty,
      gstrate: values.gstRate,
      gsttype: values.gstType,
      product: values.product,
      rate: values.rate,
      billingaddrid: values.billaddressid,
      dispatch_id: values.shipaddressid,
      remark: values.description,
      paymenttermsday: "",
      billingaddr: values.billaddress,
      termscondition: values.termscondition,
      paymentterms: values.paymentterms,
      client_address: values.caddress,
      client_branch: values.clientbranch,
      duedate: values.dueDate,
      client_type: "client",
      // hsn: "--",
      dispatch_address: values.shipaddress,
      hsncode: values.hsn,
      insert_dt: values.insertDate,
      cost_center: values.wocostcenter,
      project: values.project_name,
      //       cost_center: values.insertDate,
      //       project: values.project,
      //       cost_center: “”,
      // project: “”,
    };
    // console.log("final obj------", finalObj);
    // return;
    setLoading("submitting");
    const response = await imsAxios.post(
      "createwo/createWorkOrderReq",
      finalObj
    );
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        toast.success(data.message);
        resetHandler();
      } else {
        toast.error(data.message.msg);
      }
    }
  };

  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };
  const handleProjectChange = async (value) => {
    // setPageLoading(true);
    const response = await imsAxios.post("/backend/projectDescription", {
      project_name: value,
    });
    // setPageLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        setProjectDesc(data.data.description);
      } else {
        toast.error(data.message.msg);
      }
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
  // reset handlerd
  const resetHandler = () => {
    createWoForm.resetFields();
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
    createWoForm.setFieldValue("wocreatetype", poTypeOptions[0].text);
  }, []);

  return (
    <div
      style={{
        height: "93%",
        overflowY: "scroll",
        overflowX: "hidden",
        padding: "0vh 20px",
      }}
    >
      {/* vendor */}
      <Form
        form={createWoForm}
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
        {loading === "fetch" && <Loading />}
        <Row>
          <Col span={4}>
            <Descriptions size="small" title="WO Type">
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Provide Work Order type as in
                <br /> (New Or Supplementary)
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={20}>
            <Row gutter={6}>
              {/* WO type */}
              <Col span={6}>
                <Form.Item
                  name="wocreatetype"
                  label="WO Type"
                  rules={[
                    {
                      required: true,
                      message: "Please Select a WO Type!",
                    },
                  ]}
                >
                  <MySelect size="default" options={poTypeOptions} />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span={4}>
            <Descriptions size="small" title="Client Details">
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Type Name or Code of the Client
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col span={20}>
            <Row gutter={6}>
              <Col span={6}>
                <Form.Item
                  name="clientname"
                  label={
                    <div
                      style={{
                        fontSize: window.innerWidth < 1600 && "0.7rem",
                        display: "flex",
                        justifyContent: "space-between",
                        width: 350,
                      }}
                    >
                      Client Name
                      <span
                        onClick={() => setShowAddClientModal(true)}
                        style={{
                          color: "#1890FF",
                          cursor: "pointer",
                        }}
                      >
                        Add Client
                      </span>
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Client Name!",
                    },
                  ]}
                >
                  <MyAsyncSelect
                    selectLoading={loading === "select"}
                    size="default"
                    labelInValue
                    onBlur={() => setAsyncOptions([])}
                    optionsState={asyncOptions}
                    loadOptions={getClientOptions}
                    onChange={(value) => getclientDetials(value.value)}
                  />
                </Form.Item>
              </Col>
              {/* client branch */}
              <Col span={6}>
                <Form.Item
                  name="clientbranch"
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
                      Client Branch
                      <span
                        onClick={() => {
                          createWoForm.getFieldValue("clientname")?.value
                            ? setShowBranchModal({
                                vendor_code:
                                  createWoForm.getFieldValue("clientname")
                                    ?.value,
                              })
                            : toast.error("Please Select a Client first");
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
                      message: "Please Select a client Branch!",
                    },
                  ]}
                >
                  <MySelect
                    options={ClientBranchOptions}
                    onChange={(e) => {
                      getAddInfo(e);
                    }}
                    size="default"
                    placeholder="select Client Branch!"
                  />
                </Form.Item>
              </Col>
              {/* gstin */}
              <Col span={6}>
                <Form.Item name="gstin" label="GSTIN">
                  <Input size="default" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="caddress" label="Address">
                  <Input size="default" disabled />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Divider />
        {/* PO TERMS */}
        <Row>
          <Col span={4}>
            <Descriptions size="small" title="WO Terms">
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Provide WO terms and other information
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={20}>
            <Row gutter={6}>
              <Col span={5}>
                <Form.Item
                  name="wocostcenter"
                  rules={[
                    {
                      required: true,
                      message: "Please select a cost center!",
                    },
                  ]}
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
                >
                  <MyAsyncSelect
                    selectLoading={loading1("select")}
                    onBlur={() => setAsyncOptions([])}
                    loadOptions={handleFetchCostCenterOptions}
                    optionsState={asyncOptions}
                  />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item
                  name="project_name"
                  rules={[
                    {
                      required: true,
                      message: "Please select a cost center!",
                    },
                  ]}
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
                >
                  <MyAsyncSelect
                    selectLoading={loading1("select")}
                    onBlur={() => setAsyncOptions([])}
                    loadOptions={handleFetchProjectOptions}
                    optionsState={asyncOptions}
                    onChange={handleProjectChange}
                  />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item label="Project Description">
                  <Input size="default" disabled value={projectDesc} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="termscondition"
                  label=" Terms and Conditions"
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Terms and Condition!",
                    },
                  ]}
                >
                  <Input size="default" />
                </Form.Item>
              </Col>
              {/* payment terms */}
              <Col span={6}>
                <Form.Item
                  name="paymentterms"
                  label=" Payment Terms"
                  rules={[
                    {
                      required: true,
                      message: "Please Enter the Pament Terms!",
                    },
                  ]}
                >
                  <Input size="default" />
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
                  <MySelect
                    options={addOptions}
                    onChange={(e) => {
                      handlebilladress(e);
                    }}
                  />
                </Form.Item>
              </Col>
              {/* pan number */}
              <Col span={4}>
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
                  <Input size="default" disabled />
                </Form.Item>
              </Col>

              {/* gstin uin */}
              <Col span={8}>
                <Form.Item
                  name="billGST"
                  label={
                    <div
                      style={{
                        fontSize: window.innerWidth < 1600 && "0.7rem",
                        display: "flex",
                        justifyContent: "space-between",
                        width: 350,
                      }}
                    >
                      GSTIN / UIN
                      {/* <span
                        ref={billingId}
                        id="Billing"
                        onClick={() => {
                          if(createWoForm.getFieldValue("clientname")?.value){
                              setId(true)
                              setShowBillingModal(true)
                          }else{
                            toast.error("Please Select a Client first");
                          }
                        }}
                        style={{
                          color: "#1890FF",
                          cursor: "pointer",
                        }} 
                      >
                        Create New Billing Details
                      </span> */}
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please enter Billing GSTIN Number!",
                    },
                  ]}
                >
                  {/* <Input size="default" value={newPurchaseOrder.billGST} /> */}
                  <Input size="default" disabled />
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
                  <Input.TextArea
                    style={{ resize: "none" }}
                    rows={3}
                    disabled
                  />
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
                  <MySelect
                    options={addOptions}
                    onChange={(e) => {
                      handleshipadress(e);
                    }}
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
                  <Input size="default" disabled />
                </Form.Item>
              </Col>
              {/* gstin uin */}
              <Col span={8}>
                <Form.Item
                  name="shipGST"
                  label={
                    <div
                      style={{
                        fontSize: window.innerWidth < 1600 && "0.7rem",
                        display: "flex",
                        justifyContent: "space-between",
                        width: 350,
                      }}
                    >
                      GSTIN / UIN
                      {/* <span
                      ref={shippingId}
                      id="Shipping"
                      onClick={() => {
                        if(createWoForm.getFieldValue("clientname")?.value){
                            setId(false)
                            setShowBillingModal(true)
                        }else{
                          toast.error("Please Select a Client first");
                        }
                      }}
                      style={{
                          color: "#1890FF",
                          cursor: "pointer",
                        }}
                      >
                        Create New Shipping Details
                      </span> */}
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please Enter Shipping GSTIN!",
                    },
                  ]}
                >
                  {/* <Input size="default" value={newPurchaseOrder.shipGST} /> */}
                  <Input size="default" disabled />
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
                  <Input.TextArea
                    style={{ resize: "none" }}
                    rows={3}
                    disabled
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Divider />
        {/* product details */}
        <Row gutter={6}>
          <Col span={4}>
            <Descriptions size="small" title="Product Details">
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Provide Product Details
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col span={16}>
            <Row gutter={6}>
              {/* component name*/}
              <Col span={8}>
                <Form.Item
                  name="product"
                  label="Product Name"
                  rules={[
                    {
                      required: true,
                      message: "Please Select a Product!",
                    },
                  ]}
                >
                  <MyAsyncSelect
                    selectLoading={loading === "select"}
                    loadOptions={getComponentOptions}
                    optionsState={asyncOptions}
                    onChange={getComponentDetails}
                  />
                </Form.Item>
              </Col>
              {/* order qty */}
              <Col span={4}>
                <Form.Item
                  label="Order Qty"
                  name="qty"
                  rules={[
                    {
                      required: true,
                      message: "Qty should be greater than zero!",
                    },
                  ]}
                >
                  <Input size="default" suffix={uom} />
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
                  <Input size="default" />
                </Form.Item>
              </Col>
              {/* Rate */}
              <Col span={4}>
                <Form.Item name="dueDate" label="Due Date">
                  <Input size="default" type="date" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="insertDate" label="Insert Date">
                  <Input size="default" type="date" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col span={4}>
                <Form.Item
                  name="bom"
                  label="BOM"
                  rules={[
                    {
                      required: true,
                      message: "Please select bom code",
                    },
                  ]}
                >
                  <MyAsyncSelect
                    selectLoading={loading === "select"}
                    loadOptions={fetchbomlist}
                    optionsState={bomOptions}
                    onBlur={() => setAsyncOptions([])}
                  />
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
                  name="hsn"
                  label="HSN"
                  rules={[
                    {
                      required: true,
                      message: "Please enter HSN Number!",
                    },
                  ]}
                >
                  {/* <Input size="default" value={newPurchaseOrder.billPan} /> */}
                  <Input size="default" />
                </Form.Item>
              </Col>
              <Col span={2}>
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
              <Col span={3}>
                <Form.Item name="cgst" label="CGST">
                  <Input disabled size="default" />
                </Form.Item>
              </Col>
              <Col span={3}>
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
            loading={loading === "submitting"}
            nextLabel="Submit"
            submitFunction={showSubmitConfirmationModal}
            resetFunction={showResetConfirm}
          />
        </Row>
      </Form>
      <Divider />
      <AddClientModal
        open={showAddClientModal}
        setOpen={setShowAddClientModal}
      />
      <AddClientBranch
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
