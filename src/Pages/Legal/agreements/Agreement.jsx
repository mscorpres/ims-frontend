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
  Button,
  Space,
  Drawer,
  Upload,
} from "antd";
import { useEffect, useState, useRef } from "react";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import NavFooter from "../../../Components/NavFooter";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import {
  ExclamationCircleOutlined,
  DownloadOutlined,
  UsergroupDeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import Loading from "../../../Components/Loading";
import SingleDatePicker from "../../../Components/SingleDatePicker";

// gst type options
const gstTypeOptions = [
  { text: "Local", value: "L" },
  { text: "Interstate", value: "I" },
];
const options = [
  { text: "Date", value: "date" },
  { text: "On Termination", value: "Ontermination" },
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

export default function Agreeement({}) {
  // initialize loading state
  document.title = "Add Agreement";
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
  const [taxSummary, setTaxSummary] = useState({
    value: "0",
    sgst: "0",
    cgst: "0",
    igst: "0",
    totalValue: "0",
  });
  const [uom, setUom] = useState("");
  const [addAgreementForm] = Form.useForm();
  const [clientData, setClientData] = useState([]);
  const [addOptions, setAddOptions] = useState([]);
  const [showViewModel, setShowViewModal] = useState(false);
  const [file, setfile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [partysearch, setPartySearch] = useState("");
  const [rows, setRows] = useState([]);
  const [dateType, setDateType] = useState("");
  const [natureofagreementOptions, setNatureofagreementOptions] = useState([]);
  const [typeofagreementOptions, settypeofagreementOptions] = useState([]);
  const getagrementtypes = async () => {
    console.log(partysearch);
    setRows([]);
    const response = await imsAxios.get("/agreement/fetchagreementtypes");
    console.log(response.data.data);
    if (response.status === 200) {
      const uniqueNatureOfAgreement = [
        ...new Set(response.data.data.map((item) => item.nature_of_agreement)),
      ];
      const uniquetypeOfAgreement = [
        ...new Set(response.data.data.map((item) => item.type_of_agreement)),
      ];
      const newArr = uniqueNatureOfAgreement.map((value) => ({
        text: value,
        value: value,
      }));
      const newArr1 = uniquetypeOfAgreement.map((value) => ({
        text: value,
        value: value,
      }));
      setNatureofagreementOptions(newArr);
      settypeofagreementOptions(newArr1);
    }
    if (response.data.data.length === 0) {
      toast.error("create agreement type");
    }
  };

  useEffect(() => {
    getagrementtypes();
  }, []);

  const getClientOptions = async (searchTerm) => {
    console.log(searchTerm.length);
    if (searchTerm.length > 2) {
      setLoading("select");
      const response = await imsAxios.post("/agreement/fetchparties", {
        searchTerm: searchTerm,
      });
      const { data } = response;
      console.log(data.parties);
      if (response.status === 200) {
        let arr = data.parties.map((row) => ({
          value: row.party_name,
          text: row.party_name,
        }));
        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
        toast.error(data.msg);
      }
      setLoading(false);
    }
  };

  //   get client options -->

  //   get vendor branch options
  const getclientDetials = async (inputValue, dm) => {
    console.log(inputValue);
    console.log(dm);
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/agreement/fetchparties", {
        searchTerm: inputValue,
      });
      console.log(response.data);
      if (response.status === 200) {
        const newarr = response.data.parties.filter(
          (row) => row.party_name === inputValue
        );
        console.log(newarr);
        if (dm === "first") {
          addAgreementForm.setFieldValue(
            "firstpartyadd",
            newarr[0].party_address
          );
          addAgreementForm.setFieldValue("firstpartycin", newarr[0].party_cin);
        } else {
          addAgreementForm.setFieldValue(
            "secondpartyadd",
            newarr[0].party_address
          );
          addAgreementForm.setFieldValue("secondpartycin", newarr[0].party_cin);
        }
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  //   getting component options

  // show submit confirmation modal
  const showSubmitConfirmationModal = () => {
    // submit confirm modal
    Modal.confirm({
      title: "Do you Want to submit the Agreement?",
      icon: <ExclamationCircleOutlined />,
      content: "Please check the details before submitting the Agreement",
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
    const values = await addAgreementForm.validateFields();

    // console.log(
    //   "values,values____________________________________________",
    //   values
    // );
    // return;
    const formdata = new FormData();
    formdata.append("agreement_name", "testgreement");
    formdata.append("stamp_number", values.stampnumber);
    formdata.append("first_party", values.firstpartyname.label);
    formdata.append("second_party", values.secondpartyname.label);
    formdata.append("agreement_type", values.agreementtype);
    formdata.append("agreement_nature", values.agreementnature);
    formdata.append("effective_date", values.effectivedate);
    formdata.append("agreement_title", values.agreementTitle);
    formdata.append("doc_version", "v1");
    formdata.append("other_parties", "NA");
    formdata.append("execution_date", values.executiondate);
    formdata.append("agreement_description", values.agreementDes);
    formdata.append("description", "i am agreement description");
    formdata.append("renewal_date", values.renewaldate);
    formdata.append("create_type", "NEW");
    if (values.selectType === "date") {
      formdata.append("expiry_date", values.expirydate);
    } else {
      formdata.append("expiry_date", "On Termination");
    }

    values.file.fileList.map((item) => {
      formdata.append("file", item.originFileObj);
    });
    console.log("formdata", formdata);
    // return;
    setLoading("submitting");
    const response = await imsAxios.post("agreement/addagreement", formdata);
    setLoading(false);
    const { data } = response;
    if (data) {
      if (response.status === 200) {
        toast.success(data.msg);
        addAgreementForm.resetFields();
      } else {
        toast.error(data.msg);
      }
    }
  };

  // add agreement
  const addagreement = async () => {
    const values = await addAgreementForm.validateFields();
    console.log(values);
  };

  // reset handlerd
  const resetHandler = () => {
    addAgreementForm.resetFields();
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
  const props = {
    onRemove: (file) => {
      setFileList(fileList.filter((item) => item.uid !== file.uid));
    },
    beforeUpload: (file) => {
      console.log(fileList);
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };
  const options = [
    {
      text: "Date",
      value: "date",
    },
    {
      text: "On termination",
      value: "onTermination",
    },
  ];

  return (
    <>
      <div
        style={{
          height: "93%",
          overflowY: "scroll",
          overflowX: "hidden",
          padding: "0vh 20px",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        {/* vendor */}
        <Form
          form={addAgreementForm}
          size="small"
          scrollToFirstError={true}
          name="create-po"
          layout="vertical"
          initialValues={newPurchaseOrder}
          // onFieldsChange={() => {
          //     inputHandler();
          // }}
        >
          {loading === "fetch" && <Loading />}
          <Row>
            <Col span={4}>
              <Descriptions size="small" title="Agreement Type">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Provide Agreement type
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={20}>
              <Row gutter={6}>
                {/* WO type */}
                <Col span={6}>
                  <Form.Item
                    name="agreementnature"
                    label="Nature of Agreement"
                    rules={[
                      {
                        required: true,
                        message: "Please Select a Nature of agreement!",
                      },
                    ]}
                  >
                    <MySelect
                      size="default"
                      options={natureofagreementOptions}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="agreementtype"
                    label="Type of Agreement"
                    rules={[
                      {
                        required: true,
                        message: "Please Select a Type of agreement!",
                      },
                    ]}
                  >
                    <MySelect size="default" options={typeofagreementOptions} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col span={4}>
              <Descriptions size="small" title="First Party Details">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Type Name or Code of the Party
                </Descriptions.Item>
              </Descriptions>
            </Col>

            <Col span={20}>
              <Row gutter={6}>
                <Col span={6}>
                  <Form.Item
                    name="firstpartyname"
                    label={
                      <div
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                          display: "flex",
                          justifyContent: "space-between",
                          width: 350,
                        }}
                      >
                        Name
                      </div>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please Select a party!",
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
                      onChange={(value) =>
                        getclientDetials(value.value, "first")
                      }
                    />
                  </Form.Item>
                </Col>
                {/* client branch */}
                <Col span={6}>
                  <Form.Item
                    name="firstpartyadd"
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
                        Address
                      </div>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please Select a Party Address!",
                      },
                    ]}
                  >
                    <Input size="default" disabled />
                  </Form.Item>
                </Col>
                {/* gstin */}
                <Col span={6}>
                  <Form.Item name="firstpartycin" label="CIN">
                    <Input size="default" disabled />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col span={4}>
              <Descriptions size="small" title="Second Party Details">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Type Name or Code of the Party
                </Descriptions.Item>
              </Descriptions>
            </Col>

            <Col span={20}>
              <Row gutter={6}>
                <Col span={6}>
                  <Form.Item
                    name="secondpartyname"
                    label={
                      <div
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                          display: "flex",
                          justifyContent: "space-between",
                          width: 350,
                        }}
                      >
                        Name
                      </div>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please Select a party!",
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
                      onChange={(value) =>
                        getclientDetials(value.value, "second")
                      }
                    />
                  </Form.Item>
                </Col>
                {/* client branch */}
                <Col span={6}>
                  <Form.Item
                    name="secondpartyadd"
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
                        Address
                      </div>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please Select a Party Address!",
                      },
                    ]}
                  >
                    <Input size="default" disabled />
                  </Form.Item>
                </Col>
                {/* gstin */}
                <Col span={6}>
                  <Form.Item name="secondpartycin" label="CIN">
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
              <Descriptions size="small" title="Agreement Dates">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Provide Dates
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={20}>
              <Row gutter={6}>
                {/* terms and conditions */}
                <Col span={3}>
                  <Form.Item
                    name="effectivedate"
                    label="Effective Date"
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Effective Date!",
                      },
                    ]}
                  >
                    <SingleDatePicker
                      legal={true}
                      setDate={(value) => {
                        addAgreementForm.setFieldValue("effectivedate", value);
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col span={5}>
                  <Form.Item
                    name="selectType"
                    label="Expiry"
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: "Please Enter Expiry Date!",
                    //   },
                    // ]}
                  >
                    <MySelect
                      options={options}
                      onChange={setDateType}
                      value={dateType}
                    />
                  </Form.Item>
                </Col>
                {dateType === "date" ? (
                  <Col span={3}>
                    <Form.Item
                      name="expirydate"
                      label="Expiry Date"
                      rules={[
                        {
                          required: true,
                          message: "Please Enter Expiry Date!",
                        },
                      ]}
                    >
                      <SingleDatePicker
                        legal={true}
                        setDate={(value) => {
                          addAgreementForm.setFieldValue("expirydate", value);
                        }}
                      />
                    </Form.Item>
                  </Col>
                ) : (
                  ""
                )}
                <Col span={3}>
                  <Form.Item
                    name="executiondate"
                    label="Execution Date"
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Execution Date!",
                      },
                    ]}
                  >
                    <SingleDatePicker
                      legal={true}
                      setDate={(value) => {
                        addAgreementForm.setFieldValue("executiondate", value);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item
                    name="renewaldate"
                    label="Renewal Date"
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Effective Date!",
                      },
                    ]}
                  >
                    <SingleDatePicker
                      legal={true}
                      setDate={(value) => {
                        addAgreementForm.setFieldValue("renewaldate", value);
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col span={4}>
              <Descriptions size="small" title="Other Details">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Provide other information
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={16}>
              <Row gutter={6}>
                {/* pan number */}
                <Col span={8}>
                  <Form.Item
                    name="agreementTitle"
                    label="Agreement Title"
                    rules={[
                      {
                        required: true,
                        message: "Please enter Agreement Title!",
                      },
                    ]}
                  >
                    {/* <Input size="default" value={newPurchaseOrder.billPan} /> */}
                    <Input size="default" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="stampnumber"
                    label="Stamp Number"
                    rules={[
                      {
                        required: true,
                        message: "Please enter Billing Stamp Number!",
                      },
                    ]}
                  >
                    {/* <Input size="default" value={newPurchaseOrder.billPan} /> */}
                    <Input size="default" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="agreementDes"
                    label="Agreement Description"
                    rules={[
                      {
                        required: true,
                        message: "Please enterAgreement Description!",
                      },
                    ]}
                  >
                    {/* <Input size="default" value={newPurchaseOrder.billPan} /> */}
                    <Input.TextArea row={3} size="default" />
                  </Form.Item>
                </Col>
              </Row>
              {/* billing address */}
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col span={4}>
              <Descriptions size="small" title="Attach Agreement Copy">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Provide Attachment
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={16}>
              <Row gutter={6}>
                {/* pan number */}
                <Col span={8}>
                  <Form.Item
                    name="file"
                    label="Select File"
                    rules={[
                      {
                        required: true,
                        message: "Please Select Document!",
                      },
                    ]}
                  >
                    <Upload {...props}>
                      <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
              {/* billing address */}
            </Col>
          </Row>
          <Row gutter={6}>
            <NavFooter
              loading={loading === "submitting"}
              nextLabel="Submit"
              submitFunction={showSubmitConfirmationModal}
              resetFunction={showResetConfirm}
            />
          </Row>
        </Form>
        <Divider />
      </div>
      <ViewModal
        show={showViewModel}
        setshow={setShowViewModal}
        loading={loading}
        setLoading={setLoading}
        component={<Loading />}
      />
    </>
  );
}

const ViewModal = ({
  loading,
  setLoading,
  show,
  setshow,
  detaildata,
  status,
  component,
}) => {
  const viewcolumns = [
    {
      headerName: "#",
      width: 50,
      field: "index",
    },
    {
      headerName: "first party",
      width: 180,
      field: "first_party",
    },
    {
      headerName: "second party",
      width: 180,
      field: "second_party",
    },
    {
      headerName: "Agreement Number",
      width: 180,
      field: "agreement_no",
    },
    {
      headerName: "Agreeement Type",
      width: 180,
      field: "agreement_type",
    },
    {
      headerName: "Effective Date",
      width: 180,
      field: "effective_date",
    },
    {
      headerName: "Expiry Date",
      width: 180,
      field: "expiry_date",
    },
    {
      headerName: "Date of Execution",
      width: 180,
      field: "date_of_execution",
    },
  ];

  return (
    <Drawer
      width="50vw"
      title={`Add Other Parties`}
      onClose={() => {
        setshow(false);
      }}
      extra={
        <Space>
          <Button type="primary">Save</Button>
          <Button type="primary">Add More</Button>
          <Button
            type="primary"
            shape="circle"
            icon={<DownloadOutlined />}
            disabled={detaildata?.length == 0}
          />
        </Space>
      }
      open={show}
      bodyStyle={{ paddingTop: 5 }}
    >
      {loading === "fetch" && component}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
          width: "100%",
          marginLeft: 220,
        }}
      >
        <input
          placeholder="Party Name"
          style={{ padding: 10, borderRadius: 5, border: "1px solid #d9d9d9" }}
        />
        <input
          placeholder="Address"
          style={{ padding: 10, borderRadius: 5, border: "1px solid #d9d9d9" }}
        />
        <input
          placeholder="CIN"
          style={{ padding: 10, borderRadius: 5, border: "1px solid #d9d9d9" }}
        />
        <UsergroupDeleteOutlined
          style={{ color: "red", fontSize: 20, marginTop: 10 }}
        />
      </div>
    </Drawer>
  );
};
