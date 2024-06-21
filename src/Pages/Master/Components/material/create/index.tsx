import {
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import MySelect from "@/Components/MySelect.jsx";
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import TableActions from "@/Components/TableActions.jsx/TableActions.jsx";
import MyButton from "@/Components/MyButton/index.jsx";
import useApi from "@/hooks/useApi";
import {
  createComponent,
  downloadComponentMaster,
  downloadElectronicReport,
  getCategoryTypeOptions,
  verifyAttributes,
} from "@/api/master/component";
import { imsAxios } from "@/axiosInterceptor";
import { v4 } from "uuid";
import { CloseOutlined, LoadingOutlined } from "@ant-design/icons";
import CategoryForm from "@/Pages/Master/Components/material/list/CategoryForm";
import { toast } from "react-toastify";
import { ModalType } from "@/types/general";
import { getComponentOptions, getUserOptions } from "@/api/general";
import useDebounce from "@/hooks/useDebounce";

interface PropType {
  rows: any[];
}
const AddComponent = ({ rows }: PropType) => {
  const [attrCategoryOptions, setAttrCategoryOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const [showAttributesModal, setShowAttributesModal] = useState(false);
  const [hsnRows, setHsnRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [generatedCompName, setGeneratedCompName] = useState(null);
  const [attributes, setAttributes] = useState({});
  const [allAttributeOptions, setAllAttributeOptions] = useState([]);
  const [similarComponents, setSimilarComponents] = useState([]);
  const [showSimilarPartCodeModal, setShowSimilarPartCodeModal] =
    useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const { loading, executeFun } = useApi();
  const [headerForm] = Form.useForm();
  const [hsnForm] = Form.useForm();
  const selectedCategory = Form.useWatch("attrCategory", headerForm);

  const enteredPartCode = useDebounce(Form.useWatch("code", headerForm), 1500);
  const [partCodeError, setPartCodeError] = useState({
    status: "success",
    message: "",
  });

  const getHsnOptions = async (search) => {
    try {
      const response = await imsAxios.post("/backend/searchHsn", {
        searchTerm: search,
      });
      const { data } = response;
      if (data?.length) {
        const arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));

        setAsyncOptions(arr);
      }
    } catch (error) {
    } finally {
    }
  };

  const handleComponentOptions = async (search: string) => {
    if (search.length < 4) return;
    const response = await executeFun(
      () => getComponentOptions(search),
      "validate"
    );

    if (response.data?.length > 0) {
      setPartCodeError({
        status: "error",
        message: "Part Code already in use",
      });
    } else {
      setPartCodeError({
        status: "success",
        message: "",
      });
    }
  };
  const handleGetUomOptions = async () => {
    //  setUomOptions(response.data ?? [])
  };

  const getGroupOptions = async () => {
    try {
      const response = await imsAxios.post("/groups/groupSelect2");

      const { data } = response;
      if (data?.code === 200) {
        const arr = data.data.map((row) => ({
          text: row.text,
          value: row.id,
        }));

        setGroupOptions(arr);
      } else {
        toast.error(data.message.msg);
      }
    } catch (error) {
      setAsyncOptions([]);
    } finally {
    }
  };

  const getAttrCategoryOptions = async () => {
    const response = await executeFun(() => getCategoryTypeOptions(), "fetch");
    setAttrCategoryOptions(response.data ?? []);
  };
  const resetConfirmHandler = (async) => {
    Modal.confirm({
      title: "Reset Confirm",
      content: "All the progess will be lost",
      okText: "Reset",
      onOk: resetHandler,
    });
  };

  const resetHandler = () => {
    headerForm.resetFields();
    hsnForm.resetFields();
    setHsnRows([]);
  };

  const handleDownloadMaster = async () => {
    executeFun(downloadComponentMaster, "masterReport");
  };

  const handleDownloadElectronicReport = async () => {
    const response = await executeFun(
      () => downloadElectronicReport(),
      "electronicReport"
    );
    if (response.success) {
      window.open(response.data, "_blank", "noreferrer");
    }
  };

  const addHsnRow = async () => {
    const values = await hsnForm.validateFields();
    const newRow = {
      ...values,
      id: v4(),
    };
    setHsnRows((curr) => [newRow, ...curr]);
    hsnForm.resetFields();
  };
  const removeHsnRow = (id) => {
    setHsnRows((curr) => curr.filter((row) => row.id !== id));
  };

  const updateNameAndCode = (code, name) => {
    if (code) {
      setUniqueId(code);
    }
    if (name) {
      setGeneratedCompName(name);
    }
  };

  const handleUpdateAttributes = (values: any) => {
    setAttributes(values);
  };

  const handleFetchUsersOptions = async (search: string) => {
    const response = await executeFun(() => getUserOptions(search), "select");
    setAsyncOptions(response.data);
  };

  const handleVerify = async (mfgCode) => {
    const values = await headerForm.validateFields(["attrCategory", "mfgCode"]);
    console.log("mfg code", values);
    const response = await executeFun(
      () => verifyAttributes(values.attrCategory, uniqueId, mfgCode),
      "verify"
    );

    if (response.success) {
      setSimilarComponents(response.data);
      setShowSimilarPartCodeModal(true);
      setShowAttributesModal(false);
    }
  };
  const handleCreate = async () => {
    const values = await headerForm.validateFields();

    const response = await executeFun(
      () =>
        createComponent(
          { ...values, uniqueId },
          attributes,
          allAttributeOptions
        ),
      "submit"
    );
    if (response.success) {
      headerForm.resetFields();
      setShowSimilarPartCodeModal(false);
      setSimilarComponents([]);
    }
  };

  useEffect(() => {
    setUniqueId(null);
    if (selectedCategory && selectedCategory?.value !== "348423984423") {
      setShowAttributesModal({
        selectedCategory: selectedCategory,
      });
    }
    if (selectedCategory?.value === "348423984423") {
      Modal.confirm({
        title: "Are you sure you want to change the type to Others?",
        content: "Note: It will reset the unique Id if generated",
        onOk: () => {
          setUniqueId(null);
          setGeneratedCompName("");
          //   setAttributeValues(null);
          headerForm.setFieldValue("componentname", "");
        },
      });
    }
  }, [selectedCategory]);
  useEffect(() => {
    if (generatedCompName) {
      setGeneratedCompName(generatedCompName);
      headerForm.setFieldValue("componentname", generatedCompName);
    }
  }, [generatedCompName]);
  useEffect(() => {
    getAttrCategoryOptions();
    handleGetUomOptions();
    getGroupOptions();
  }, []);
  useEffect(() => {
    handleComponentOptions(enteredPartCode);
  }, [enteredPartCode]);
  console.log("these are all options", allAttributeOptions);
  return (
    <Flex vertical>
      <UpdatedCategoryModal
        show={showAttributesModal}
        hide={() => setShowAttributesModal(false)}
        uniqueCode={uniqueId}
        setUniqueCode={setUniqueId}
        updateNameAndCode={updateNameAndCode}
        category={selectedCategory}
        componentName={generatedCompName}
        headerForm={headerForm}
        setAttributes={handleUpdateAttributes}
        setAllAttributeOptions={setAllAttributeOptions}
        submitHandler={handleVerify}
        loading={loading("verify")}
        setIsVerified={setIsVerified}
      />
      <SimilarPartCodesModal
        show={showSimilarPartCodeModal}
        hide={() => setShowSimilarPartCodeModal(false)}
        similarPartCodes={similarComponents}
        submitHandler={handleCreate}
        loading={loading("submit")}
        setShowAttributesModal={setShowAttributesModal}
        setIsVerified={setIsVerified}
      />
      <Card
        size="small"
        title="Add New Component"
        extra={
          <Typography.Text strong style={{ fontSize: 13 }}>
            Last Part Code: {rows[0]?.partCode ?? "--"}
          </Typography.Text>
        }
      >
        <Form
          form={headerForm}
          initialValues={headerInitialValues}
          layout="vertical"
        >
          <Row gutter={6}>
            <Col span={6}>
              <Form.Item
                label="Type"
                name="attrCategory"
                rules={headerRules.attrCategory}
              >
                <MySelect labelInValue={true} options={attrCategoryOptions} />
              </Form.Item>
            </Col>
            <Col span={18}>
              <Form.Item
                rules={headerRules.name}
                label="Component Name"
                name="componentname"
              >
                <Input
                  disabled={
                    selectedCategory?.label === "Resistor" ||
                    selectedCategory?.label === "Capacitor" ||
                    selectedCategory?.label === "Inductor"
                  }
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                rules={headerRules.newPart}
                label="Cat Part Code"
                name="newPart"
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                rules={headerRules.partCode}
                label="Part Code"
                name="code"
                validateStatus={partCodeError.status}
                help={partCodeError.message}
              >
                <Input suffix={loading("validate") && <LoadingOutlined />} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="UoM" name="unit" rules={headerRules.uom}>
                <MySelect options={uomOptions} />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label="Group" name="group" rules={headerRules.group}>
                <MySelect options={groupOptions} />
              </Form.Item>
            </Col>

            {uniqueId && (
              <Col span={14} style={{ paddingLeft: 10 }}>
                <Row justify="start">
                  <Flex style={{ width: "100%" }} align="end">
                    <Typography.Text strong style={{ width: "100%" }}>
                      <span style={{ fontSize: 11 }}>Unique Id:</span> <br />
                      {uniqueId}
                    </Typography.Text>

                    <TableActions
                      action="edit"
                      onClick={() =>
                        setShowAttributesModal({
                          selectedCategory: selectedCategory,
                        })
                      }
                    />
                  </Flex>
                </Row>
              </Col>
            )}
            <Col span={12}>
              <Form.Item
                label="Requested By"
                name="raisedBy"
                // rules={rules.raisedBy}
              >
                <MyAsyncSelect
                  selectLoading={loading("select")}
                  size="default"
                  onBlur={() => setAsyncOptions([])}
                  optionsState={asyncOptions}
                  loadOptions={handleFetchUsersOptions}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="piaEnable"
                label="Enable PIA"
                valuePropName="checked"
              >
                <Checkbox

                // onChange={(e) => setIsEnabled(e.target.checked)}
                />
                {/* <Typography.Text
                    style={{
                      fontSize: "10px",
                      marginLeft: "4px",
                    }}
                  >
                    Enable PIA
                  </Typography.Text> */}
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Description"
                name="description"
                rules={headerRules.description}
              >
                <Input.TextArea />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Row justify="end">
                <Flex wrap="wrap" gap={10}>
                  <MyButton
                    loading={loading("masterReport")}
                    text="Electronic Report"
                    variant="downloadSample"
                    onClick={handleDownloadElectronicReport}
                  />
                  <MyButton
                    // loading={loading1("download")}
                    text="Master"
                    variant="downloadSample"
                    onClick={handleDownloadMaster}
                  />
                  <MyButton variant="reset" onClick={resetConfirmHandler} />
                  <MyButton
                    variant="submit"
                    text={"Create"}
                    disabled={
                      selectedCategory?.value !== "348423984423" && !isVerified
                    }
                    onClick={handleCreate}
                  />
                </Flex>
              </Row>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card size="small" title={`HSN Codes : ${hsnRows.length} Codes Added`}>
        <Form layout="vertical" form={hsnForm} initialValues={hsnInitialValues}>
          <Row align="middle" gutter={6}>
            <Col span={14}>
              <Form.Item label="Code" name="code" rules={rules.hsnCode}>
                <MyAsyncSelect
                  labelInValue={true}
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={getHsnOptions}
                  optionsState={asyncOptions}
                  selectLoading={loading === "select"}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Percentage %"
                name="percentage"
                rules={rules.percentage}
              >
                <Input suffix="%" />
              </Form.Item>
            </Col>
            <Col span={2}>
              <MyButton variant="add" onClick={addHsnRow} />
            </Col>
          </Row>
        </Form>
        {hsnRows.length === 0 && (
          <Row justify="center">
            <Typography.Text type="secondary">No Codes Added</Typography.Text>
          </Row>
        )}
        {hsnRows.length > 0 && (
          <Col size="small">
            <Row>
              <Col span={1}>
                <Typography.Text strong type="secondary">
                  #
                </Typography.Text>
              </Col>
              <Col span={16}>
                <Typography.Text strong type="secondary">
                  Code
                </Typography.Text>
              </Col>
              <Col span={5}>
                <Typography.Text strong type="secondary">
                  %
                </Typography.Text>
              </Col>
              <Col
                span={24}
                style={{
                  maxHeight: 120,
                  overflow: "auto",
                  overflowX: "hidden",
                }}
              >
                <Row>
                  {hsnRows.map((row, index) => (
                    <Col span={24}>
                      <Row>
                        <Col span={1}>
                          <Typography.Text>{index + 1}</Typography.Text>
                        </Col>
                        <Col span={16}>
                          <Typography.Text>{row.code?.label}</Typography.Text>
                        </Col>
                        <Col span={5}>
                          <Typography.Text>{row.percentage}%</Typography.Text>
                        </Col>
                        <Col>
                          <Button
                            type="text"
                            size="small"
                            style={{ color: "red" }}
                            icon={<CloseOutlined />}
                            onClick={() => removeHsnRow(row.id)}
                          />
                        </Col>
                      </Row>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </Col>
        )}
      </Card>
    </Flex>
  );
};

export default AddComponent;
const headerInitialValues = {
  componentname: undefined,
  code: undefined,
  unit: undefined,
  group: undefined,
  category: undefined,
  attrCategory: undefined,
  description: undefined,
};
const headerRules = {
  name: [
    {
      required: true,
      message: "Please input component name",
    },
  ],
  partCode: [
    {
      required: true,
      message: "Please input Part Code",
    },
  ],
  uom: [
    {
      required: true,
      message: "Please select a unit for the component",
    },
  ],
  group: [
    {
      required: true,
      message: "Please select a component group",
    },
  ],
  category: [
    {
      required: true,
      message: "Please select a component category",
    },
  ],
  attrCategory: [
    {
      required: true,
      message: "Please select a component type",
    },
  ],
  description: [
    {
      required: true,
      message: "Please provide a description",
    },
  ],
  newPart: [
    {
      required: true,
      message: "Please provide a New Part code",
    },
  ],
};

const hsnInitialValues = {
  code: "",
  percentage: "",
};

const rules = {
  hsnCode: [
    {
      required: true,
      message: "HSN code required",
    },
  ],
  percentage: [
    {
      required: true,
      message: "Percentage required",
    },
  ],
};

const UpdatedCategoryModal = ({
  show,
  hide,
  uniqueCode,
  setUniqueCode,
  category,
  componentName,
  updateNameAndCode,
  headerForm,
  setAttributes,
  setAllAttributeOptions,
  submitHandler,
  loading,
  setIsVerified,
  isVerified,
}) => {
  const [form] = Form.useForm();

  const handleHide = async () => {
    form.resetFields();
    headerForm.setFieldValue("attrCategory", undefined);
    updateNameAndCode("", "");
    hide();
  };

  const values = Form.useWatch([], form);

  const handleOk = async () => {
    form.validateFields().then((values) => {
      submitHandler(values.mfgCode);
    });
  };

  useEffect(() => {
    form.resetFields();
    setIsVerified(false);
  }, [category]);
  useEffect(() => {
    if (isVerified) {
      setIsVerified(false);
    }
  }, [values]);
  return (
    <Modal
      width={800}
      open={show}
      onCancel={handleHide}
      okText="Verify"
      onOk={handleOk}
      title="Assign Attributed"
      confirmLoading={loading}
    >
      <CategoryForm
        uniqueCode={uniqueCode}
        setUniqueCode={setUniqueCode}
        category={category}
        componentName={componentName}
        updateNameAndCode={updateNameAndCode}
        form={form}
        setAttributes={setAttributes}
        setAllAttributeOptions={setAllAttributeOptions}
      />
    </Modal>
  );
};

// const SimilarUniqueCodeModal = (props: SimilarUniqueCodeModalType) => {
//   return <Modal open={}></Modal>;
// };

interface SimilarPartCodesModalType extends ModalType {
  similarPartCodes: any[];
  setShowAttributesModal: React.Dispatch<React.SetStateAction<boolean>>;
  setIsVerified: React.Dispatch<React.SetStateAction<boolean>>;
}
const SimilarPartCodesModal = ({
  show,
  hide,
  similarPartCodes,
  submitHandler,
  loading,
  setShowAttributesModal,
  setIsVerified,
}: SimilarPartCodesModalType) => {
  console.log("found components", similarPartCodes);
  return (
    <Modal
      open={show}
      onCancel={() => {
        hide();
        setShowAttributesModal(true);
      }}
      okText="Continue"
      onOk={() => {
        setIsVerified(true);
        hide();
      }}
      confirmLoading={loading}
    >
      <Typography.Text strong type="secondary">
        We have found{" "}
        <strong style={{ color: "black" }}>{similarPartCodes.length}</strong>{" "}
        components with similar values.
      </Typography.Text>

      <Flex
        vertical
        style={{
          marginTop: 20,
          marginBottom: 20,
          maxHeight: 700,
          overflowY: "auto",
        }}
      >
        {similarPartCodes?.map((row, index) => (
          <Flex style={{ fontSize: 11 }} align="center" gap={20}>
            <div>{index + 1}.</div>
            <div>
              <Typography.Text strong>{row.partCode}</Typography.Text>
            </div>
            <div>
              <Typography.Text strong>{row.componentName}</Typography.Text>
            </div>
            <div>
              <Typography.Text strong>Stock {row.rmStock}</Typography.Text>
            </div>
          </Flex>
        ))}
      </Flex>
      <Typography.Text strong type="secondary">
        Are you sure you want to create a new component with these values?
      </Typography.Text>
    </Modal>
  );
};
