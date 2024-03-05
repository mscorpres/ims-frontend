import {
  Button,
  Card,
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Typography,
} from "antd";
import React from "react";
import {
  createMIN,
  getLocationOptions,
  getWorkOrderDetails,
  getWorkOrderForMIN,
} from "../api";
import { useEffect, useState } from "react";
import MySelect from "../../../../Components/MySelect";
import Loading from "../../../../Components/Loading";
import WODetailsCard from "./WODetailsCard";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import FormTable2 from "../../../../Components/FormTable2";
import TaxDetails from "./TaxDetails";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import UploadDocs from "../../../Store/MaterialIn/MaterialInWithPO/UploadDocs";
import NavFooter from "../../../../Components/NavFooter";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";

const MINModal = ({ showView, setShowView, getRows }) => {
  // ////////////////
  const [locationOptions, setLocationOptions] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [minForm] = Form.useForm();
  const gstType = Form.useWatch("gstType", minForm);
  const components = Form.useWatch("components", minForm);
  const [files, setFiles] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  //
  //
  const getDetails = async (id, woId, sku) => {
    try {
      setLoading("fetch");
      minForm.setFieldValue("components", []);
      const { details } = await getWorkOrderForMIN(id, woId, false);
      const { components } = await getWorkOrderDetails(id, woId, sku);
      setLoading(false);
      setDetails(details);
      minForm.setFieldValue("components", components);
      minForm.setFieldValue("gstType", "L");
    } catch (error) {}
  };
  const handleGetLocations = async (search) => {
    try {
      const arr = await getLocationOptions(search);
      // console.log("sr", arr);
      setLocationOptions(arr);
    } catch (error) {
      console.log("some error occured while fetching locations", error);
    } finally {
      setLoading(false);
    }
  };
  const validateHandler = async () => {
    const values = await minForm.validateFields();
    Modal.confirm({
      title: "Submit MIN",
      content: "Are you sure you want to submit this MIN",
      onOk: () => submitHandler(values, showView, gstType),
      okText: "Submit",
    });
  };
  const validForSubmit = () => {
    const arr =
      components?.map((comp) => {
        if (comp.rate && comp.qty) {
          return true;
        }
      }) ?? [];
    if (arr.filter((row) => row !== undefined)[0]) {
      return true;
    }
  };
  const submitHandler = async (values, showView, gstType) => {
    setLoading("submit");
    const formData = new FormData();
    formData.append("files", files[0]);
    console.log("files[0]", files[0]);
    formData.append("woid", showView.woId);
    formData.append("doc_name", "--");
    formData.append("doc_date", values.docDate);
    const data = await createMIN(values, showView, gstType);
    if (formData && files[0]) {
      const uploadwodoc = await imsAxios.post(
        "/createwo/uploadAttachment",
        formData
      );
      setFiles([]);
      if (uploadwodoc.data.code === 200) {
        toast.success(uploadwodoc.data.message);

        setLoading(false);
        if (data.code === 200) {
          setShowView(false);
          getRows();
          minForm.resetFields();
        }
      } else if (uploadwodoc.data.code === 500) {
        toast.error(uploadwodoc.data.message.msg);
        setLoading(false);
      }
    }
    setLoading(false);
    setShowView(false);
    getRows();
    minForm.resetFields();
  };
  const getLocatonOptions = async (search) => {
    setLoading("select");
    const response = await imsAxios.post("/backend/fetchLocation", {
      searchTerm: search,
    });
    getData(response);
  };
  const getData = (response) => {
    const { data } = response;
    if (data) {
      if (data.length) {
        const arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));

        setAsyncOptions(arr);
      }
    }
  };
  useEffect(() => {
    if (showView) {
      getDetails(showView.subjectId, showView.woId, showView.sku);
      handleGetLocations();
    }
  }, [showView]);
  const locationColumn = {
    headerName: "Location",
    name: "location",
    width: 150,
    field: ({ row }) => (
      //  <MySelect options={locationOptions} />,
      <MyAsyncSelect
        onBlur={() => setAsyncOptions([])}
        loadOptions={getLocatonOptions}
        optionsState={asyncOptions}
        selectLoading={loading === "select"}
      />
    ),
  };

  const calculation = (fieldName, watchValues) => {
    const { qty, rate, gstRate } = watchValues;
    const value = +Number(qty ?? 0) * +Number(rate ?? 0).toFixed(3);
    const gstAmount = (+Number(value).toFixed(3) * +Number(gstRate)) / 100;
    let cgst = 0,
      igst = 0,
      sgst = 0;

    if (gstType === "L" && gstRate) {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
      igst = undefined;
    } else if (gstType === "I" && gstRate) {
      igst = gstAmount;
      cgst = undefined;
      sgst = undefined;
    }
    minForm.setFieldValue(
      ["components", fieldName, "value"],
      +Number(value).toFixed(3)
    );
    minForm.setFieldValue(
      ["components", fieldName, "cgst"],
      +Number(cgst).toFixed(3)
    );
    minForm.setFieldValue(
      ["components", fieldName, "sgst"],
      +Number(sgst).toFixed(3)
    );
    minForm.setFieldValue(
      ["components", fieldName, "igst"],
      +Number(igst).toFixed(3)
    );
  };
  const cgstTotal = isNaN(getArrSum(components, "cgst"))
    ? 0
    : getArrSum(components, "cgst");
  const sgstTotal = isNaN(getArrSum(components, "sgst"))
    ? 0
    : getArrSum(components, "sgst");
  const igstTotal = isNaN(getArrSum(components, "igst"))
    ? 0
    : getArrSum(components, "igst");
  const valueTotal = isNaN(getArrSum(components, "value"))
    ? 0
    : getArrSum(components, "value");

  const taxSummary = [
    {
      title: "Value Before Tax",
      description: valueTotal,
    },
    {
      title: "CGST",
      description: cgstTotal,
      hidden: gstType === "I",
    },
    {
      title: "SGST",
      description: sgstTotal,
      hidden: gstType === "I",
    },
    {
      title: "IGST",
      description: igstTotal,
      hidden: gstType === "L",
    },
    {
      title: "Value After Tax",
      description: valueTotal + cgstTotal + sgstTotal + igstTotal,
    },
  ];

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
    >
      {loading === "fetch" && <Loading />}
      <Form layout="vertical" form={minForm} style={{ height: "100%" }}>
        <Row gutter={6} style={{ height: "95%", overflow: "hidden" }}>
          <Col span={4} style={{ height: "100%", overflowY: "scroll" }}>
            <Row gutter={[0, 6]}>
              <Col span={24}>
                <Card size="small">
                  <Form.Item name="gstType" label="GST Type">
                    <MySelect options={gstTypeOptions} />
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
            <FormTable2
              removableRows={true}
              nonRemovableColumns={1}
              columns={[...componentsItems(gstType), locationColumn]}
              listName="components"
              watchKeys={["rate", "qty", "gstRate"]}
              nonListWatchKeys={["gstType"]}
              componentRequiredRef={["rate", "qty"]}
              form={minForm}
              calculation={calculation}
              rules={listRules}
            />
            {/* </Card> */}
          </Col>
        </Row>
      </Form>
      <NavFooter
        disabled={!validForSubmit()}
        loading={loading === "submit"}
        type="primary"
        resetFunction={() => {
          minForm.resetFields();
          setShowView(false);
        }}
        submitFunction={validateHandler}
        nextLabel="Submit"
      />
    </Drawer>
  );
};

export default MINModal;

const componentsItems = (gstType) => [
  {
    headerName: "#",
    name: "",
    width: 30,
    field: (_, index) => (
      <Typography.Text type="secondary">{index + 1}.</Typography.Text>
    ),
  },
  {
    headerName: "Component",
    name: "component",
    width: 250,
    flex: true,
    flexStart: true,
    field: (row) => <ToolTipEllipses text={row.component} />,
  },
  {
    headerName: "Part Code",
    name: "partCode",
    width: 150,
    flexStart: true,
    field: (row) => <ToolTipEllipses text={row.partCode} />,
  },
  {
    headerName: "Secondary Part Code",
    name: "partCode",
    width: 150,
    flexStart: true,
    field: (row) => <ToolTipEllipses text={row.newPartCode} />,
  },
  {
    headerName: "Qty",
    name: "qty",
    width: 100,
    field: () => <Input />,
  },
  {
    headerName: "Rate",
    name: "rate",
    width: 100,
    field: () => <Input />,
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
    field: () => <MySelect options={gstRateOptions} />,
  },
  {
    headerName: "CGST",
    name: "cgst",
    width: 100,
    conditional: true,
    condition: (row) => gstType === "L",
    field: ({ row }) => <Input disabled />,
  },
  {
    headerName: "SGST",
    name: "sgst",
    width: 100,
    conditional: true,
    condition: (row) => gstType === "L",
    field: ({ row }) => <Input disabled />,
  },
  {
    headerName: "IGST",
    name: "igst",
    width: 100,
    conditional: true,
    condition: (row) => gstType === "I",
    field: (row) => <Input disabled />,
  },

  {
    headerName: "HSN Code",
    name: "hsn",
    width: 150,
    field: (row) => <Input />,
  },
  {
    headerName: "Remark",
    name: "remark",
    width: 150,
    field: (row) => <Input.TextArea />,
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

const getArrSum = (list, key) => {
  const arr = list?.map((row) => row[key]);
  // console.log(arr);
  return arr?.reduce((a, b) => a + +Number(b).toFixed(2) ?? 0, 0);
};

const rules = {
  docId: [
    {
      required: true,
      message: "Please enter a doc ID",
    },
  ],
  // docDate: [
  //   {
  //     required: true,
  //     message: "Please select document date",
  //   },
  // ],
};
const listRules = {
  hsn: [
    {
      required: true,
      message: "Please enter a hsn code!",
    },
  ],
  location: [
    {
      required: true,
      message: "Please select a Location!",
    },
  ],
  qty: [
    {
      required: true,
      message: "Please enter MIN Qty!",
    },
  ],
  file: [
    {
      required: true,
      message: "Please select document!",
    },
  ],
  rate: [
    {
      required: true,
      message: "Please component rate!",
    },
  ],
  docDate: [
    {
      required: true,
      message: "Please select doc Date!",
    },
  ],
  invoiceId: [
    {
      required: true,
      message: "Please select doc id!",
    },
  ],
};
