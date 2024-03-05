import React, { useEffect, useState } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import {
  Col,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Switch,
  Typography,
} from "antd";
import MySelect from "../../../../Components/MySelect";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import InputMask from "react-input-mask";
import NavFooter from "../../../../Components/NavFooter";
import Loading from "../../../../Components/Loading";
import TextArea from "antd/es/input/TextArea";
import ReqdComponentModal from "./ReqdComponentModal";
import useApi from "../../../../hooks/useApi";
import { getProductsOptions, getProjectOptions } from "../../../../api/general";

const EditPPR = ({ editPPR, setEditPPR }) => {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [reqdKeys, setReqdKeys] = useState(null);
  const [sqdComponents, setSqdComponents] = useState([]);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [bomList, setBomList] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [rqdDetails, setRqdDetails] = useState(null);
  const [rqdSaved, setRqdSaved] = useState(false);
  const [pprDetailsForm] = Form.useForm();

  const { executeFun, loading: loading1 } = useApi();
  const existingQty = Form.useWatch("existingQty", {
    form: pprDetailsForm,
    preserve: true,
  });
  const stock = Form.useWatch("stock", {
    form: pprDetailsForm,
    preserve: true,
  });
  const sku = Form.useWatch("product", {
    form: pprDetailsForm,
    preserve: true,
  });
  const uom = Form.useWatch("uom", {
    form: pprDetailsForm,
    preserve: true,
  });
  const project = Form.useWatch("project", {
    form: pprDetailsForm,
    preserve: true,
  });
  const getLocation = async () => {
    const { data } = await imsAxios.get("ppr/ppr_section_location");
    const locArr = [];
    data.data.map((a) =>
      locArr.push({ text: `(${a.name}) ${a.address}`, value: a.location_key })
    );
    setLocationOptions(locArr);
  };
  const getDetails = async (pprDetails) => {
    try {
      setLoading("fetch");
      setSqdComponents([]);
      const response = await imsAxios.post("/ppr/fetchData4Update", pprDetails);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const { product } = data.data;
          let obj = {
            type: data.data.type,
            project: {
              label: data.data.project.text,
              value: data.data.project.id,
            },
            remark: data.data.remark,
            product: {
              label: product.sku.text,
              value: product.sku.id,
            },
            bom: {
              label: product.bom.text,
              value: product.bom.id,
            },
            qty: product.qty,
            dueDate: product.duedate,
            section: {
              label: product.section.text,
              value: product.section.id,
            },
            customer: product.customer,
          };
          setRqdDetails(product.rqd[0]);
          pprDetailsForm.setFieldsValue(obj);
        } else {
          setEditPPR(null);
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getExistingDetails = async (sku) => {
    setLoading("page");
    console.log("this is working");
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
      pprDetailsForm.setFieldValue(
        "existingQty",
        data?.other?.existingplanedQty
      );
      pprDetailsForm.setFieldValue("stock", data?.other?.stockInHand);
      pprDetailsForm.setFieldValue("uom", data?.other?.uom);
    }
  };
  const getProduct = async (searchInput) => {
    try {
      const response = await executeFun(
        () => getProductsOptions(searchInput, true),
        "select"
      );
      let { data } = response;
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    } catch (error) {
    } finally {
      setSelectLoading(false);
    }
  };

  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };

  const getProjectDescription = async (search) => {
    setLoading("card");
    const response = await imsAxios.post("/backend/projectDescription ", {
      project_name: search,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        pprDetailsForm.setFieldValue(
          "projectDescription",
          data.data.description
        );
      } else {
        toast.error(data.message.msg);
      }
    }
  };

  const getRqdDetails = async () => {
    console.log(editPPR);
    // { bom, qty, component, rqd, projectId }
    const values = await pprDetailsForm.validateFields([
      "project",
      "product",
      "bom",
      "qty",
    ]);
    if (!reqdKeys) {
      let obj = {
        bom: values.bom.value,
        qty: values.qty,
        sku: values.product.value,
        ppr: editPPR.ppr,
        rqd: rqdDetails,
        projectId: values.project.value,
      };

      setReqdKeys(obj);
    } else {
      setReqdKeys(null);
      setReqdKeys(false);
    }
  };
  const validateHandler = async () => {
    const values = await pprDetailsForm.validateFields();
    console.log(values);

    let obj = {
      header: {
        type: values.type,
        project: values.project.value,
        remark: values.remark,
        ppr: editPPR?.ppr,
      },
      ppr: {
        bom: values.bom.value,
        qty: values.qty,
        duedate: values.dueDate,
        sku: values.product.value,
        customer: values.customer,
      },
    };

    setShowSubmitConfirmModal(obj);
  };
  const submitHandler = async () => {
    try {
      setLoading("submit");
      const response = await imsAxios.post(
        "/ppr/updatePPR",
        showSubmitConfirmModal
      );

      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          setShowSubmitConfirmModal(false);
          setEditPPR(false);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const resetHandler = () => {};

  useEffect(() => {
    if (editPPR) {
      getDetails(editPPR);
      getLocation();
    } else {
      setReqdKeys(null);
      setReqdKeys(false);
    }
  }, [editPPR]);
  console.log("this is ther qd details,", rqdDetails);
  useEffect(() => {
    sku && editPPR && getExistingDetails(sku.value);
  }, [sku, editPPR]);
  useEffect(() => {
    project && editPPR && getProjectDescription(project.value);
  }, [project, editPPR]);
  return (
    <Drawer
      title={`Editing PPR: ${editPPR?.ppr}`}
      width="100vw"
      onClose={() => setEditPPR(null)}
      open={editPPR}
      bodyStyle={{ padding: 15 }}
    >
      {loading === "fetch" && <Loading />}
      <Modal
        title="Submit Confirm"
        open={showSubmitConfirmModal}
        onOk={submitHandler}
        confirmLoading={loading === "submit"}
        onCancel={() => setShowSubmitConfirmModal(false)}
        okText="Yes"
        cancelText="No"
      >
        <p>Are you sure you want to update this PPR</p>
      </Modal>
      <Row gutter={6}>
        <Form
          initialValues={initialValues}
          form={pprDetailsForm}
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
                      disabled={rqdDetails === "E"}
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
                      selectLoading={selectLoading}
                      loadOptions={getProduct}
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
                    <MySelect options={locationOptions} />
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
            <Col span={4}>
              <Descriptions size="small" title="RQD Details">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Enter details like PPR type and project name
                </Descriptions.Item>
              </Descriptions>
              <Row justify="end">
                <Switch checked={reqdKeys} onChange={getRqdDetails} />
              </Row>
            </Col>
            {reqdKeys && (
              <ReqdComponentModal
                sqdComponents={sqdComponents}
                setSqdComponents={setSqdComponents}
                editPPR={editPPR}
                reqdKeys={reqdKeys}
                setRqdSaved={setRqdSaved}
                setReqdKeys={setReqdKeys}
                // getComponentOptions={getComponentOptions}
                asyncOptions={asyncOptions}
                setAsyncOptions={setAsyncOptions}
              />
            )}
          </Row>
        </Form>
      </Row>

      <NavFooter
        submitFunction={validateHandler}
        resetFunction={resetHandler}
        nextLabel="Submit"
        nextDisabled={reqdKeys && !rqdSaved}
      />
    </Drawer>
  );
};

export default EditPPR;

const notes = ["Product / SKU (Only if RQD is not set)"];

// if the rqd is set then you cant change the product / SKU
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
