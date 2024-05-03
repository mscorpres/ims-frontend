import { useState, useEffect } from "react";
import {
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Typography,
} from "antd";
import { toast } from "react-toastify";
import MySelect from "../../../Components/MySelect";
import InputMask from "react-input-mask";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import NavFooter from "../../../Components/NavFooter";
import { imsAxios } from "../../../axiosInterceptor";
import Loading from "../../../Components/Loading";
import AddProjectModal from "./AddProjectModal";
import { getProductsOptions, getProjectOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";

const { TextArea } = Input;

const CreatePPR = () => {
  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [bomList, setBomList] = useState([]);
  const [locationn, setLocationn] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  const [createPPRForm] = Form.useForm();

  const { executeFun, loading: loading1 } = useApi();
  const existingQty = Form.useWatch("existingQty", {
    form: createPPRForm,
    preserve: true,
  });
  const stock = Form.useWatch("stock", {
    form: createPPRForm,
    preserve: true,
  });
  const sku = Form.useWatch("product", {
    form: createPPRForm,
    preserve: true,
  });
  const uom = Form.useWatch("uom", {
    form: createPPRForm,
    preserve: true,
  });
  const project = Form.useWatch("project", {
    form: createPPRForm,
    preserve: true,
  });

  const getLocation = async () => {
    const { data } = await imsAxios.get("ppr/ppr_section_location");
    const locArr = [];
    data.data.map((a) =>
      locArr.push({ text: `(${a.name}) ${a.address}`, value: a.location_key })
    );
    setLocationn(locArr);
  };

  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };

  const handleProjectChange = async (value) => {
    setLoading("page");
    const response = await imsAxios.post("/backend/projectDescription ", {
      project_name: value,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        createPPRForm.setFieldValue(
          "projectDescription",
          data.data.description
        );
      } else {
        toast.error(data.message.msg);
      }
    }
  };

  const handleFetchProductOptions = async (searchInput) => {
    const response = await executeFun(
      () => getProductsOptions(searchInput, true),
      "select"
    );
    setAsyncOptions(response.data);
  };

  const getExistingDetails = async (sku) => {
    setLoading("page");
    const response = await imsAxios.post("/ppr/fetchProductData", {
      search: sku,
    });
    setLoading(false);

    const { data } = response;
    if (data) {
      const bomArr = data.bom.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setBomList(bomArr);
      createPPRForm.setFieldValue(
        "existingQty",
        data?.other?.existingplanedQty
      );
      createPPRForm.setFieldValue("stock", data?.other?.stockInHand);
      createPPRForm.setFieldValue("uom", data?.other?.uom);
    }
  };

  const validateHandler = async () => {
    const values = await createPPRForm.validateFields();

    const payload = {
      comment: values.remark,
      project: values.project.value,
      requesttype: values.type,
      customer: values.customer,
      duedate: values.dueDate,
      location: values.section,
      product: values.product.value,
      projectinfo: values.projectDescription,
      qty: values.qty,
      recipe: values.bom,
      serverrefid: "",
    };

    Modal.confirm({
      title: "Confirm ",
      content: "Are you sure you want to create this PPR?",
      okText: "Continue",
      cancelText: "Cancel",
      onOk: () => submitHandler(payload),
    });
  };

  const submitHandler = async (payload) => {
    try {
      setLoading("submit");
      const response = await imsAxios.post("/ppr/createPPR", payload);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          resetFunction();
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const resetFunction = () => {
    createPPRForm.resetFields();
  };

  useEffect(() => {
    if (sku) {
      getExistingDetails(sku.value);
    }
  }, [sku]);

  useEffect(() => {
    getLocation();
  }, []);
  useEffect(() => {
    if (project) {
      handleProjectChange(project.value);
    }
  }, [project]);
  return (
    <div style={{ height: "90%" }}>
      <Row gutter={10} style={{ margin: "10px" }} justify="center">
        {loading === "page" && <Loading />}
        <Form
          initialValues={initialValues}
          form={createPPRForm}
          layout="vertical"
        >
          <Row>
            <Col span={4}>
              <Descriptions size="small" title="PPR Details">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Enter details like PPR type and project name
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={20}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item rules={rules.type} name="type" label="PPR Type">
                    <MySelect options={pprTypeOptions} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item rules={rules.type} name="project" label="Project">
                    <MyAsyncSelect
                      labelInValue
                      loadOptions={handleFetchProjectOptions}
                      optionsState={asyncOptions}
                      loading={loading1("select")}
                      onBlur={() => setAsyncOptions([])}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="projectDescription"
                    label="Project Description"
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={18}>
                  <Form.Item rules={rules.remark} name="remark" label="Remark">
                    <TextArea rows={2} />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Divider />
            <Col span={4}>
              <Descriptions size="small" title="Product Details">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Enter Product details and planning Qty
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={20}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    rules={rules.product}
                    name="product"
                    label="Product"
                  >
                    <MyAsyncSelect
                      selectLoading={loading1("select")}
                      loadOptions={handleFetchProductOptions}
                      labelInValue
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions(null)}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item rules={rules.bom} name="bom" label="BOM">
                    <MySelect options={bomList} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item rules={rules.qty} name="qty" label="Planning Qty">
                    <Input suffix={uom} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Row gutter={24}>
                    <Col>
                      <Typography.Text strong>Existing Qty:</Typography.Text>
                      <br />
                      <Row justify="center">
                        <Typography.Text strong>{existingQty}</Typography.Text>
                      </Row>
                    </Col>
                    <Col>
                      <Typography.Text strong>Stock:</Typography.Text>
                      <br />
                      <Row justify="center">
                        <Typography.Text strong>{stock}</Typography.Text>
                      </Row>
                    </Col>
                  </Row>
                </Col>
                <Col span={6}>
                  <Form.Item
                    rules={rules.dueDate}
                    name="dueDate"
                    label="Due Date"
                  >
                    <InputMask
                      className="input-date"
                      mask="99-99-9999"
                      placeholder="__-__-____"
                      style={{ textAlign: "center" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    rules={rules.section}
                    name="section"
                    label="Section / Location"
                  >
                    <MySelect options={locationn} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    rules={rules.customer}
                    name="customer"
                    label="Customer Name"
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </Row>
      <NavFooter
        resetFunction={resetFunction}
        submitFunction={validateHandler}
        nextLabel="Submit"
        loading={loading === "submit"}
      />

      <AddProjectModal
        showAddProjectConfirm={showAddProjectModal}
        setShowAddProjectConfirm={setShowAddProjectModal}
      />
    </div>
  );
};
export default CreatePPR;

const initialValues = {
  type: "new",
  project: undefined,
  projectDescription: undefined,
  remark: undefined,
  product: undefined,
  bom: undefined,
  qty: undefined,
  existingQty: "",
  stock: "",
  dueDate: "",
  section: undefined,
  customer: undefined,
};

const rules = {
  type: [
    {
      required: true,
      message: "Please select PPR Type",
    },
  ],
  project: [
    {
      required: true,
      message: "Please select Project",
    },
  ],
  remark: [
    {
      required: true,
      message: "Please enter remark",
    },
  ],
  product: [
    {
      required: true,
      message: "Please select Product",
    },
  ],
  bom: [
    {
      required: true,
      message: "Please select bom",
    },
  ],
  qty: [
    {
      required: true,
      message: "Please enter qty",
    },
  ],
  dueDate: [
    {
      required: true,
      message: "Please enter due date",
    },
  ],
  section: [
    {
      required: true,
      message: "Please select section",
    },
  ],
  customer: [
    {
      required: true,
      message: "Please enter customer name",
    },
  ],
};
const pprTypeOptions = [
  { text: "New", value: "new" },
  { text: "Repair", value: "repair" },
  { text: "Testing", value: "testing" },
  { text: "Packing", value: "packing" },
];
