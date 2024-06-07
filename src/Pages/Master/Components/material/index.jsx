import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Space,
  Typography,
} from "antd";
import MySelect from "../../../../Components/MySelect";
import MaterialUpdate from "../../Modal/MaterialUpdate";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import ComponentImages from "./ComponentImages";
import { imsAxios } from "../../../../axiosInterceptor";
import AddPhoto from "./AddPhoto";
import ComponentsTable from "./ComponentsTable";
import MyButton from "../../../../Components/MyButton";
import { CloseOutlined } from "@ant-design/icons";
import { v4 } from "uuid";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import TableActions from "../../../../Components/TableActions.jsx/TableActions";
import Loading from "../../../../Components/Loading";
import useApi from "../../../../hooks/useApi.ts";
import {
  downloadComponentMaster,
  downloadElectronicReport,
} from "../../../../api/master/component.ts";
import CategoryForm from "./CategoryForm.tsx";

const Material = () => {
  const [showImages, setShowImages] = useState();
  const [uomOptions, setUomOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attrCategoryOptions, setAttrCategoryOptions] = useState([]);
  const [materialModal, setMaterialModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [groupOptions, setGroupOptions] = useState([]);
  const [showAttributesModal, setShowAttributesModal] = useState(false);
  const [hsnRows, setHsnRows] = useState([]);
  const [attributeValues, setAttributeValues] = useState(null);
  const [uniqueId, setUniqueId] = useState(null);
  const [generatedCompName, setGeneratedCompName] = useState(null);
  const [manfCode, setManfCode] = useState(null);
  const [typeOfComp, setTypeOfComp] = useState("");
  const [valFromName, setValForName] = useState("");
  const { executeFun, loading: loading1 } = useApi();
  const [isEnabled, setIsEnabled] = useState(false);
  const [hsnForm] = Form.useForm();
  const [headerForm] = Form.useForm();
  const [attributeForm] = Form.useForm();
  const [components, setComponents] = useState([]);

  const selectedCategory = Form.useWatch("attrCategory", headerForm);
  const getRows = async () => {
    setLoading("fetch");
    try {
      setComponents([]);
      const response = await imsAxios.get("/component");
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row, index) => ({
            id: index + 1,
            componentName: row.c_name,
            partCode: row.c_part_no,
            key: row.component_key,
            unit: row.units_name,
          }));

          setComponents(arr);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getRows();
  }, []);
  const getGroupOptions = async () => {
    try {
      setLoading("fetch");
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
      setLoading(false);
    }
  };

  const getAttrCategoryOptions = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.get("/mfgcategory/listCategories");
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          setAttrCategoryOptions(data.data);
        } else {
          setAttrCategoryOptions([]);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getUomOptions = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("uom/uomSelect2");
      const { data } = response;
      if (data) {
        // if (data.code === 200) {
        let arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));

        setUomOptions(arr);
      } else {
        toast.error(data.message.msg);
      }
      // }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getHsnOptions = async (search) => {
    try {
      setLoading("select");
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
      setLoading(false);
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

  const modalConfirmMaterial = async () => {
    const headerValues = await headerForm.validateFields();
    // return;
    let atrrRes = {
      multipler: attributeValues?.multiplier,
      tolerance: attributeValues?.tolerance?.key,
      mountingStyle: attributeValues?.mounting_style?.key,
      packageSize: attributeValues?.package_size?.key,
      powerRating: attributeValues?.power_rating?.key,
      value: attributeValues?.value,
    };
    let atrrCAP = {
      // multipler: attributeValues.multiplier,
      tolerance: attributeValues?.tolerance?.key,
      mountingStyle: attributeValues?.mounting_style?.key,
      packageSize: attributeValues?.package_size?.key,
      voltage: attributeValues?.voltage?.key,
      value: attributeValues?.value,
      typeofCapacitor: attributeValues?.type_Of_capacitor,
      siUnit: attributeValues?.si_unit?.key,
    };
    let payload;
    if (selectedCategory?.label === "Resistor") {
      // setAttributeValues({atrrRes});
      payload = {
        part: headerValues.code,
        uom: headerValues.unit,
        component: headerValues.componentname,
        new_partno: headerValues.newPart,
        comp_type: "R",
        c_category: headerValues.category,
        notes: headerValues.description,
        group: headerValues.group,
        // attr_category: headerValues.attrCategory.value,
        attr_category: "R",
        attr_code: uniqueId,
        // attr_code
        hsns: hsnRows.map((row) => row.code.value),
        taxs: hsnRows.map((row) => row.percentage),
        attr_raw: atrrRes,
        //manufacturing code
        manufacturing_code: manfCode,
        pia_status: isEnabled == true ? "Y" : "N",
      };
    } else if (selectedCategory?.label === "Capacitor") {
      payload = {
        part: headerValues.code,
        uom: headerValues.unit,
        component: headerValues.componentname,
        new_partno: headerValues.newPart,
        comp_type: "C",
        c_category: headerValues.category,
        notes: headerValues.description,
        group: headerValues.group,
        // attr_category: headerValues.attrCategory.value,
        attr_category: "C",
        attr_code: uniqueId,
        // attr_code
        hsns: hsnRows.map((row) => row.code.value),
        taxs: hsnRows.map((row) => row.percentage),
        attr_raw: atrrCAP,
        //manufacturing code
        manufacturing_code: manfCode,
        pia_status: isEnabled == true ? "Y" : "N",
      };
    } else if (selectedCategory?.label === "Inductor") {
      payload = {
        part: headerValues.code,
        uom: headerValues.unit,
        component: headerValues.componentname,
        new_partno: headerValues.newPart,
        comp_type: "I",
        c_category: headerValues.category,
        notes: headerValues.description,
        group: headerValues.group,
        // attr_category: headerValues.attrCategory.value,
        attr_category: "I",
        attr_code: uniqueId,
        // attr_code
        hsns: hsnRows.map((row) => row.code.value),
        taxs: hsnRows.map((row) => row.percentage),
        attr_raw: "",
        //manufacturing code
        manufacturing_code: manfCode,
        pia_status: isEnabled == true ? "Y" : "N",
      };
    } else {
      payload = {
        part: headerValues.code,
        uom: headerValues.unit,
        component: headerValues.componentname,
        new_partno: headerValues.newPart,
        comp_type: "O",
        c_category: headerValues.category,
        notes: headerValues.description,
        group: headerValues.group,
        // attr_category: headerValues.attrCategory.value,
        attr_category: "O",
        attr_code: "--",
        // attr_code
        hsns: hsnRows.map((row) => row.code.value),
        taxs: hsnRows.map((row) => row.percentage),
        attr_raw: "",
        //manufacturing code
        manufacturing_code: manfCode,
        pia_status: isEnabled == true ? "Y" : "N",
      };
    }
    // return;

    const response = await imsAxios.post(
      "/component/addComponent/verify",
      payload
    );
    const { data } = response;
    if (data.code === 200) {
      Modal.confirm({
        title: "Are you sure you want to submit this Component?",
        content: `${data.message}`,
        onOk() {
          submitHandler(payload);
        },
        onCancel() {},
      });
    } else {
      toast.error(data.message.msg);
      // Modal.confirm({
      //   title: "Are you sure you want to submit this Material?",
      //   content: `${data.message.msg}`,
      //   // onOk() {
      //   //   submitHandler(payload);
      //   // },
      //   onCancel() {},
      // });
    }
  };
  const validateHandler = async () => {
    Modal.confirm({
      title: "Creating a new component",
      content: "Please check all the values before proceeding",
      okText: "Create",
      // onOk: () => modalConfirmMaterial(payload),
      // onOk: () => submitHandler(payload),
    });
  };

  const submitHandler = async (payload) => {
    try {
      setLoading("submit");
      // return;
      const response = await imsAxios.post(
        "/component/addComponent/save",
        payload
      );
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          setUniqueId("");
          setGeneratedCompName("");
          resetHandler();
          getRows();
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const resetConfirmHandler = (async) => {
    Modal.confirm({
      title: "Reset Confirm",
      content: "All the progess will be lost",
      okText: "Reset",
      onOk: resetHandler,
    });
  };
  const actionColumn = {
    field: "actions",
    headerName: "",
    width: 30,
    type: "actions",
    getActions: ({ row }) => [
      <GridActionsCellItem
        showInMenu
        label={
          <Link
            style={{
              textDecoration: "none",
              color: "black",
            }}
            to={`/master/component/${row.key}`}
            target="_blank"
          >
            Update
          </Link>
        }
      />,
      <GridActionsCellItem
        showInMenu
        label="View Images"
        onClick={() =>
          setShowImages({
            partNumber: row.key,
            partCode: row.partCode,
          })
        }
      />,
      <GridActionsCellItem
        showInMenu
        label="Upload Images"
        onClick={() =>
          setUploadingImage({
            key: row.key,
            label: row.componentName,
          })
        }
      />,
    ],
  };
  const resetHandler = () => {
    headerForm.resetFields();
    hsnForm.resetFields();
    setHsnRows([]);
  };

  const handleDownloadMaster = async () => {
    executeFun(downloadComponentMaster, "download");
  };

  const handleDownloadElectronicReport = async () => {
    const response = await executeFun(
      () => downloadElectronicReport(),
      "download"
    );
    if (response.success) {
      window.open(response.data, "_blank", "noreferrer");
    }
  };

  const updateNameAndCode = (code, name) => {
    if (code) {
      setUniqueId(code);
    }
    if (name) {
      setGeneratedCompName(name);
    }
  };
  useEffect(() => {
    getAttrCategoryOptions();
    getUomOptions();
    getGroupOptions();
  }, []);
  useEffect(() => {
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
          setAttributeValues(null);
          headerForm.setFieldValue("componentname", "");
        },
      });
    }
  }, [selectedCategory]);
  const typeIs = headerForm.getFieldValue("attrCategory");

  useEffect(() => {
    if (generatedCompName) {
      setGeneratedCompName(generatedCompName);
      headerForm.setFieldValue("componentname", generatedCompName);
    }
  }, [generatedCompName]);

  return (
    <div style={{ height: "90%" }}>
      <ComponentImages setShowImages={setShowImages} showImages={showImages} />
      <AddPhoto
        updatingImage={uploadingImage}
        setUpdatingImage={setUploadingImage}
      />
      <MaterialUpdate
        materialModal={materialModal}
        setMaterialModal={setMaterialModal}
        // allComponent={allComponent}
      />
      <UpdatedCategoryModal
        show={showAttributesModal}
        hide={() => setShowAttributesModal(false)}
        uniqueCode={uniqueId}
        setUniqueCode={setUniqueId}
        updateNameAndCode={updateNameAndCode}
        category={selectedCategory}
        componentName={generatedCompName}
        headerForm={headerForm}
        // setAttributeValues={setAttributeValues}
        // setGeneratedCompName={setGeneratedCompName}
        // generatedCompName={generatedCompName}
        // setValForName={setValForName}
        // valFromName={valFromName}
        // form={attributeForm}
        // headerForm={headerForm}
        // setManfCode={setManfCode}
        // manfCode={manfCode}
        // typeOfComp={typeOfComp}
        // setTypeOfComp={setTypeOfComp}
      />
      <Row gutter={[6, 6]} style={{ height: "100%", padding: "10px" }}>
        <Col
          span={8}
          style={{ height: "100%", overflow: "auto", overflowX: "hidden" }}
        >
          <Row gutter={[6, 6]}>
            <Col span={24}>
              <Card size="small" title="Add New Component">
                <Form
                  form={headerForm}
                  initialValues={headerInitialValues}
                  layout="vertical"
                >
                  {/* <Col span={12}>
                      <Form.Item
                        label="Category"
                        name="category"
                        rules={headerRules.category}
                      >
                        <MySelect options={categoryOptions} />
                      </Form.Item>
                    </Col> */}
                  <Row gutter={6}>
                    <Col span={12}>
                      <Form.Item
                        label="Type"
                        name="attrCategory"
                        rules={headerRules.attrCategory}
                      >
                        <MySelect
                          labelInValue={true}
                          options={attrCategoryOptions}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
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
                          // value={generatedCompName}
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
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="UoM"
                        name="unit"
                        rules={headerRules.uom}
                      >
                        <MySelect options={uomOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={10}>
                      <Form.Item
                        label="Group"
                        name="group"
                        rules={headerRules.group}
                      >
                        <MySelect options={groupOptions} />
                      </Form.Item>
                    </Col>

                    {uniqueId && (
                      <Col span={14} style={{ paddingLeft: 10 }}>
                        <Row justify="start">
                          <Flex style={{ width: "100%" }} align="end">
                            <Typography.Text strong style={{ width: "100%" }}>
                              <span style={{ fontSize: 11 }}>Unique Id:</span>{" "}
                              <br />
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
                    <Col span={24}>
                      <Form.Item name="piaEnable">
                        <Checkbox
                          checked={isEnabled}
                          onChange={(e) => setIsEnabled(e.target.checked)}
                        />
                        <Typography.Text
                          style={{
                            fontSize: "10px",
                            marginLeft: "4px",
                          }}
                        >
                          Enable PIA
                        </Typography.Text>
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
                            loading={loading1("download")}
                            text="Electronic Report"
                            variant="downloadSample"
                            onClick={handleDownloadElectronicReport}
                          />
                          <MyButton
                            loading={loading1("download")}
                            text="Master"
                            variant="downloadSample"
                            onClick={handleDownloadMaster}
                          />
                          <MyButton
                            variant="reset"
                            onClick={resetConfirmHandler}
                          />
                          <MyButton
                            variant="submit"
                            text="Create"
                            onClick={modalConfirmMaterial}
                          />
                        </Flex>
                      </Row>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Card
                    size="small"
                    title={`HSN Codes : ${hsnRows.length} Codes Added`}
                  >
                    <Form
                      layout="vertical"
                      form={hsnForm}
                      initialValues={hsnInitialValues}
                    >
                      <Row align="middle" gutter={6}>
                        <Col span={14}>
                          <Form.Item
                            label="Code"
                            name="code"
                            rules={rules.hsnCode}
                          >
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
                        <Typography.Text type="secondary">
                          No Codes Added
                        </Typography.Text>
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
                                      <Typography.Text>
                                        {index + 1}
                                      </Typography.Text>
                                    </Col>
                                    <Col span={16}>
                                      <Typography.Text>
                                        {row.code?.label}
                                      </Typography.Text>
                                    </Col>
                                    <Col span={5}>
                                      <Typography.Text>
                                        {row.percentage}%
                                      </Typography.Text>
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
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
        <Col span={16} style={{ height: "100%" }}>
          <ComponentsTable
            actionColumn={actionColumn}
            getRows={getRows}
            components={components}
            setComponents={setComponents}
            setLoading={setLoading}
            loading={loading}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Material;

const categoryOptions = [
  { text: "Component", value: "C" },
  { text: "Other", value: "O" },
];

const hsnInitialValues = {
  code: "",
  percentage: "",
};

const headerInitialValues = {
  componentname: undefined,
  code: undefined,
  unit: undefined,
  group: undefined,
  category: undefined,
  attrCategory: undefined,
  description: undefined,
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

const CategoryModal = ({
  show,
  hide,
  setAttributeValues,
  uniqueId,
  setUniqueId,
  generatedCompName,
  setGeneratedCompName,
  setValForName,
  valFromName,
  form,
  headerForm,
  setManfCode,
  manfCode,
  typeOfComp,
  setTypeOfComp,
}) => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState("fetch");
  const [fieldSelectOptions, setFieldSelectOptions] = useState([]);
  const [existingComponents, setExistingComponents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [uniqueCode, setUniqueCode] = useState("");
  const [stage, setStage] = useState(0);
  var alpha;
  var extractednum;
  var getAlpha;
  var wholeVal;
  var result;
  const value = Form.useWatch("value", form);
  const values = Form.useWatch([], form);

  console.log("fields", fields);
  console.log("values are", values);
  const getCategoryFields = async (categoryKey) => {
    setSelectedCategory(categoryKey);
    try {
      setLoading("fetch");
      setFields([]);
      const response = await imsAxios.post(
        "/mfgcategory/getAttributeListByCategory",
        {
          category: categoryKey.value,
        }
      );
      const { data } = response;

      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row) => ({
            label: row.text,
            name: row.id,
            type: row.inp_type,
            hasValue: row.hasValue,
            order: row.order,
          }));
          setFields(arr);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getieldSelectOptions = async (fields) => {
    try {
      let optionsArr = [];
      setLoading("fetch");
      setFieldSelectOptions([]);

      await fields.map(async (row) => {
        const response = await imsAxios.post("/mfgcategory/getAttributeValue", {
          attribute: row.name,
        });
        const { data } = response;
        if (data.code === 200) {
          optionsArr.push({ data: data.message });
          setFieldSelectOptions((curr) => [
            ...curr,
            {
              name: row.name,
              options: data.message.map((row) => ({
                text: row.attr_value,
                value: row.code,
              })),
            },
          ]);
        }
      });
    } catch (error) {}
    setLoading(false);
  };
  const checkDecimal = (value) => {
    {
      result = value - Math.floor(value) !== 0;
      if (result) {
        let decimalPartLength = (value.toString().split(".")[1] || "").length;
        let decimalVal = addZerosToTen(decimalPartLength);

        let pointVal = 1 / decimalVal;
        alpha = getLetterFromDeciNumber(pointVal);
        form.setFieldValue("multiplier", alpha);
        getWholeNumber(value, decimalVal);
        console.log("getWholeNumber", getWholeNumber(value, decimalVal));
      } else {
        let newNum = removeAndCountTrailingZeros(value);
        getAlpha = removeTrailingZerosUsingSwitch(newNum.count);
        extractednum = newNum.stringWithoutTrailingZeros;
      }
    }
  };
  //add Zero in the starting ot create 4 number code value digit
  function zeroPad(num) {
    return num.toString().padStart(5, "0");
  }
  const getComponentValueForName = (value) => {
    let componentVal;
    let categorSnip = selectedCategory?.label?.toUpperCase();

    let newSnip = categorSnip?.substr(0, 3);
    if (newSnip != "CAP") {
      if (value <= 999) {
        componentVal = value + "R";
      } else if (value <= 999999 && value >= 1000) {
        componentVal = +Number(value / 1000).toFixed(1) + "K";
      } else if (value > 1000000) {
        componentVal = +Number(value / 1000000).toFixed(1) + "M";
      }
    } else {
      componentVal = value;
    }
    setValForName(componentVal);
    return componentVal;
  };
  //generate code
  const getUniqueNo = async (compCode) => {
    let values = await form.validateFields();
    setAttributeValues(values);
    //
    let makingString;
    if (result) {
      makingString = wholeVal + alpha;
    } else {
      makingString = extractednum + alpha;
    }

    let categorSnip = selectedCategory.label.toUpperCase();
    let newSnip = categorSnip.substr(0, 3);
    if (newSnip == "CAP") {
      let compName =
        values.package_size.key +
        "-" +
        compCode +
        // "-" +
        values.si_unit.label +
        "-" +
        values.tolerance.label +
        "-" +
        values.voltage.label +
        "V" +
        "-" +
        values.mounting_style.label +
        "-" +
        "Capacitor";

      setGeneratedCompName(compName);

      let filledFields =
        newSnip +
        values.mounting_style.key +
        values.type_Of_capacitor.key +
        "(" +
        values.package_size.key +
        ")" +
        // values.power_rating.value +
        values.tolerance.key +
        values.voltage.key;

      if (makingString.length <= 5) {
        let codeValue = zeroPad(makingString);

        setUniqueId(filledFields + codeValue + values.si_unit.key);
      }
      //the Filledfields are change
    } else if (newSnip == "RES") {
      let compName =
        values.package_size.key +
        "-" +
        compCode +
        "-" +
        values.tolerance.label +
        "-" +
        values.power_rating.label +
        "W" +
        "-" +
        values.mounting_style.label +
        "-" +
        "Resistor";

      setGeneratedCompName(compName);
      headerForm.setFieldValue("componentname", compName);

      //
      let filledFields =
        newSnip +
        values.mounting_style.key +
        "(" +
        values.package_size.key +
        ")" +
        values.power_rating.key +
        values.tolerance.key;

      if (makingString.length <= 5) {
        let codeValue = zeroPad(makingString);
        setUniqueId(filledFields + codeValue);
      }
    } else if (newSnip == "IND") {
      //   " values.current_SI_Unit.label",
      //   values.current_SI_Unit.label.split(" ")
      // );
      let siUnit = values.current_SI_Unit.label.split(" ")[0];
      let siVal = values.current_SI_UnitText;
      let fqVal = values.frequencyText;
      let compName =
        "(" +
        values.package_size.key +
        ")" +
        "-" +
        values.value +
        values.si_unit.label +
        "-" +
        fqVal +
        values.frequency.label +
        "-" +
        values.current_SI_UnitText +
        values.current_SI_Unit.label +
        "-" +
        values.dc_resistanceText +
        values.dc_resistance.label +
        "-" +
        values.tolerance.label +
        "-" +
        values.mounting_style.label +
        "-" +
        "Inductor";
      // +

      // ----
      // values.mounting_style.label +
      // "-" +
      // compCode +
      // "-" +
      // fqVal +
      // values.frequency.label +
      // "-" +
      // siVal +
      // siUnit;
      // let compName =
      //   values.mounting_style.label +
      //   "-" +
      //   values.package_size.key +
      //   "-" +
      //   compCode +
      //   "-" +
      //   fqVal +
      //   values.frequency.label +
      //   "-" +
      //   siVal +
      //   siUnit;

      setGeneratedCompName(compName);
      setUniqueId(compName);
      headerForm.setFieldValue("componentname", compName);

      //
      let filledFields =
        newSnip +
        values.mounting_style.key +
        "(" +
        values.package_size.key +
        ")" +
        values.power_rating?.key +
        values.tolerance.key;

      if (makingString.length <= 5) {
        let codeValue = zeroPad(makingString);
        // setUniqueId(filledFields + codeValue);
      }
    }
    // //
    else {
    }
  };

  //without decimal value functions
  function addZerosToTen(numZeros) {
    let result = "1" + "0".repeat(numZeros);
    return parseInt(result);
  }
  function getLetterFromNumber(number) {
    const mapping = {
      0.001: "Z",
      0.01: "Y",
      0.1: "X",
      1: "A",
      10: "B",
      100: "C",
      1000: "D",
      10000: "E",
      100000: "F",
      1000000: "G",
      10000000: "H",
      100000000: "I",
      1000000000: "J",
      10000000000: "K",
    };

    const result = Object.entries(mapping).find(
      ([key, value]) => parseInt(key) === +number
    );
    console.log("this is resut", +number);
    form.setFieldValue("65490895", number);
    return mapping[+number] ? mapping[+number] : "Number not found";
  }
  function removeTrailingZerosUsingSwitch(numbers, letter) {
    let numberpowerOfTen;

    let number = addZerosToTen(numbers);
    alpha = getLetterFromNumber(number);
    setAttributeValues({ multipler: alpha });
    // form.setFieldValue("multiplier", alpha);
  }
  function removeAndCountTrailingZeros(number) {
    const numString = number.toString();
    let count = 0;

    for (let i = numString.length - 1; i >= 0; i--) {
      if (numString[i] === "0") {
        count++;
      } else {
        break;
      }
    }

    const stringWithoutTrailingZeros = numString.slice(
      0,
      numString.length - count
    );
    return {
      stringWithoutTrailingZeros: parseInt(stringWithoutTrailingZeros),
      count,
    };
  }

  //decimal value functions
  function getLetterFromDeciNumber(number) {
    let result;

    switch (number) {
      case 0.001:
        result = "Z";
        break;
      case 0.01:
        result = "Y";
        break;
      case 0.1:
        result = "X";
        break;
      default:
        result = "Number not found";
    }

    return result;
  }

  const getWholeNumber = (num, decimalVal) => {
    wholeVal = num * decimalVal;
    console.log("wholeVal", wholeVal);
    wholeVal = Number(wholeVal).toFixed(0);
  };
  // ---
  useEffect(() => {
    if (value) {
      console.log("updated value field", value);
      let a = getComponentValueForName(value);
      console.log("a value is", a);
      checkDecimal(value);
      getUniqueNo(a);
    }
  }, [value, alpha]);
  useEffect(() => {
    let a = getComponentValueForName(value);
    setValForName(a);
  }, [value]);

  const submitHandler = async (payload) => {
    try {
      setUniqueId(uniqueCode);

      hide();
      if (stage === 0) {
      } else {
        hide();
        setStage(0);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const sortedFields = [...fields].sort((a, b) => {
    if (a.type === b.type) {
      return a.label.localeCompare(b.label);
    }
    return a.type.localeCompare(b.type);
  });

  useEffect(() => {
    if (show) {
      setStage(0);
      getCategoryFields(show.selectedCategory);
      setTypeOfComp(show.selectedCategory);
    }
  }, [show]);
  useEffect(() => {
    if (typeOfComp) {
      form.resetFields();
      form.setFieldValue("componentname", "");
      headerForm.setFieldValue("componentname", "");
      setUniqueId(null);
      setGeneratedCompName(null);
    } else if (selectedCategory?.value === "348423984423") {
    }
  }, [typeOfComp]);
  useEffect(() => {
    getieldSelectOptions(fields);
  }, [fields]);

  useEffect(() => {
    console.log("typeOfComp", typeOfComp);
    if (values) {
      setAttributeValues(values);
      const mounting = values["12312"];
      const packageSize = values["434092"];
      const value =
        typeOfComp?.value === "20231025864820945"
          ? values["353453454"]
          : typeOfComp?.value === "20231028142920945"
          ? values["574954523value"]
          : values["574954524value"];
      const multiplier = values["65490895"];
      const tolerance = values["89768575"];
      const powerRating = values["7876567"];
      const frequency = values["5749534324"];
      const freequencyValue = values["5749534324value"];
      const capacitorType = values["49431234739"];
      const voltage = values["453940492"];
      const voltageValue = values["453940492value"];
      const siUnit = values["574954523"];
      const currentSiUnitInd = values["5749532987"];
      const currentSiUnitIndValue = values["5749532987value"]; //this one
      const dcResistance = values["98789537458"];
      const dcResistanceValue = values["98789537458value"];
      const siUnitInd = values["574954524"];
      const siUnitIndValue = values["574954524value"]; //this one
      const siUnitCap = values["574954523"];
      const siUnitCapValue = values["574954523value"];
      let zeroes = [1];
      const valueArr = value
        ?.toString()
        .replaceAll(".", "")
        .split(".")[0]
        .split("");
      for (let i = valueArr?.length - 1; i >= 0; i--) {
        const current = valueArr[i];

        if (current === "0") {
          zeroes.push(0);
          valueArr.pop();
        } else {
          break;
        }
      }
      const broken = convertValue(value?.toString());
      let valueLetter = "";
      if (broken.length > 0) {
        if (!value?.toString().includes(".")) {
          valueLetter = getLetterFromNumber(zeroes?.join(""));
        } else {
          valueLetter = getLetterFromNumber(convertValue(value?.toString()));
        }
        console.log("this is broken", broken);
      }
      console.log("valueArr", valueArr);

      let code = "";
      if (typeOfComp?.value === "20231025864820945") {
        //resistor
        code = `RES${getValue(mounting)}(${getValue(packageSize)})${getValue(
          tolerance
        )}${getValue(powerRating)}${
          valueArr?.join("")?.length > 4
            ? "Invalid Value"
            : valueArr?.join("")?.padStart(4, "0") ?? "__"
        }${valueLetter}`;

        setGeneratedCompName(
          `${getValue(packageSize)}-${
            getComponentValueForName(+value) ?? "__"
          }-${getLabel(tolerance)}-${getLabel(powerRating)}W-${
            getLabel(mounting) === "Thru Hole" ? "MI" : getLabel(mounting)
          }-Resistor`
        );
      } else if (typeOfComp?.value === "20231028142920945") {
        //capacitor
        code = `CAP${getValue(mounting)}${getValue(capacitorType)}(${getValue(
          packageSize
        )})${getValue(tolerance)}${getValue(voltage)}${
          valueArr?.join("")?.length > 4
            ? "Invalid Value"
            : valueArr?.join("")?.padStart(4, "0") ?? "__"
        }${getValue(siUnit)}`;

        setGeneratedCompName(
          `${getValue(packageSize)}-${getLabel(siUnitCapValue)}${getLabel(
            siUnitCap
          )}-${getLabel(tolerance)}-${getLabel(voltage)}V-${
            getLabel(mounting) === "Thru Hole" ? "MI" : getLabel(mounting)
          }-${getLabel(capacitorType)}`
        );
      } else if (typeOfComp?.value === "348423983543") {
        //inductor
        code = `(${getValue(packageSize)})-${getValue(
          siUnitIndValue
        )}${getLabel(siUnitInd)}-${getValue(freequencyValue)}${getLabel(
          frequency
        )}-${getValue(currentSiUnitIndValue)}${getLabel(
          currentSiUnitInd
        )}-${getValue(dcResistanceValue)}${getLabel(dcResistance)}-${getLabel(
          tolerance
        )}-${
          getLabel(mounting) === "Thru Hole" ? "MI" : getLabel(mounting)
        }-Inductor`;
        setGeneratedCompName(code);
      }
      setUniqueCode(code);
    }
  }, [values]);

  const getValue = (value) => {
    if (value === undefined) {
      return "__";
    } else if (value?.value) {
      return value.value;
    } else if (typeof value === "string") {
      return value;
    }
  };

  const getLabel = (value) => {
    if (value === undefined) {
      return "__";
    } else if (value?.label) {
      return value.label;
    } else if (typeof value === "string") {
      return value;
    }
  };
  return (
    <Modal
      title="Assign Attributes"
      open={show}
      onOk={submitHandler}
      width={800}
      okText="Continue"
      cancelText={stage === 0 ? "Cancel" : "Back"}
      confirmLoading={loading === "submit"}
      onCancel={
        stage === 0
          ? () => {
              headerForm.setFieldValue("attrCategory", undefined);
              hide();
            }
          : () => setStage(0)
      }
    >
      <Row gutter={8}>
        <Col span={12}>
          <Card
            size="small"
            style={{ height: "100%" }}
            bodyStyle={{ height: "98%" }}
          >
            <Flex vertical gap={20}>
              <div>
                <Typography.Text strong>
                  Selected Category: {selectedCategory?.label}
                </Typography.Text>
              </div>
              <Divider style={{ margin: "-5px 0px" }} />
              <div>
                <Typography.Text strong>
                  Unique Id: <br />
                  <span style={{ color: "#04b0a8" }}>{uniqueCode}</span>
                </Typography.Text>
              </div>
              <div>
                <Divider style={{ margin: "-5px 0px" }} />
                <Typography.Text strong>
                  Component Name: <br />
                  <span style={{ color: "#04b0a8" }}>{generatedCompName}</span>
                </Typography.Text>
              </div>
              <Divider style={{ margin: "-5px 0px" }} />
              <div>
                <Input
                  placeholder="Manufacturing Code"
                  onChange={(e) => setManfCode(e.target.value)}
                />
              </div>
            </Flex>
          </Card>
        </Col>
        <Col span={12}>
          {loading === "fetch" && <Loading />}
          {stage === 0 && (
            <Card size="small">
              <Form form={form} layout="vertical">
                <Row gutter={10}>
                  {fields
                    .sort((a, b) => a.order - b.order)
                    .filter((row) => row.order !== 0)
                    .map((row) => (
                      <Col span={24}>
                        <Flex>
                          <div></div>
                          {row.hasValue !== "" && (
                            <Form.Item
                              style={{ textTransform: "capitalize", flex: 1 }}
                              name={`${row.name}value`}
                              label={row.hasValue + " Value"}
                            >
                              <Input />
                            </Form.Item>
                          )}
                          <Form.Item
                            style={{ textTransform: "capitalize", flex: 1.5 }}
                            name={row.name}
                            label={row.label.replaceAll("_", " ")}
                          >
                            {row.type === "select" && (
                              <MySelect
                                style={{ textTransform: "none" }}
                                labelInValue
                                // disabled={row.label === "multiplier"}
                                options={
                                  fieldSelectOptions.find(
                                    (field) => field.name === row.name
                                  )?.options || []
                                }
                              />
                            )}
                            {row.type === "text" &&
                              row.name !== "353453454" && <Input />}
                            {row.name === "353453454" && (
                              <InputNumber
                                // maxLength={5}
                                style={{ width: "100%" }}
                              />
                            )}
                          </Form.Item>
                        </Flex>
                      </Col>
                    ))}
                </Row>
              </Form>
            </Card>
          )}

          {stage === 1 && (
            <Row>
              <Col span={24}>
                <Flex justify="center" gap={5} style={{ marginBottom: 10 }}>
                  <Typography.Text strong>Unique ID: </Typography.Text>
                  <Typography.Text>{uniqueId} </Typography.Text>
                </Flex>
                {existingComponents.length > 0 && (
                  <Flex justify="center" gap={5} style={{ marginBottom: 10 }}>
                    <Typography.Text
                      style={{ textAlign: "center" }}
                      strong
                      type="secondary"
                    >
                      There are <strong>{existingComponents.length}</strong>{" "}
                      components which are already assigned with the same unique
                      ID{" "}
                    </Typography.Text>
                  </Flex>
                )}
                {existingComponents.length > 0 && (
                  <Row gutter={[6, 6]}>
                    <Col span={1}>
                      <Typography.Text strong>#</Typography.Text>
                    </Col>
                    <Col span={18}>
                      <Typography.Text strong>Component Name</Typography.Text>
                    </Col>
                    <Col span={5}>
                      <Typography.Text strong>Part Code</Typography.Text>
                    </Col>
                    <Col span={24}>
                      <Row>
                        <Col
                          span={24}
                          style={{ maxHeight: 150, overflowY: "auto" }}
                        >
                          {existingComponents.map((row, index) => (
                            <Col span={24}>
                              <Row>
                                <Col span={1}>{index + 1}.</Col>
                                <Col span={18}>{row.name}</Col>
                                <Col span={5}>{row.partCode}</Col>
                              </Row>
                            </Col>
                          ))}
                        </Col>
                      </Row>
                    </Col>
                    <Divider />

                    <Flex justify="center" gap={5} style={{ marginBottom: 10 }}>
                      <Typography.Text
                        style={{ textAlign: "center" }}
                        strong
                        type="secondary"
                      >
                        Are you sure you want to create this component?
                      </Typography.Text>
                    </Flex>
                  </Row>
                )}
                {existingComponents.length === 0 && (
                  <Flex justify="center" gap={5} style={{ marginBottom: 10 }}>
                    <Typography.Text
                      style={{ textAlign: "center" }}
                      strong
                      type="secondary"
                    >
                      No Component found with this unique ID
                    </Typography.Text>
                  </Flex>
                )}
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Modal>
  );
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
}) => {
  const [form] = Form.useForm();

  const handleHide = async () => {
    form
      .validateFields()
      .then(() => {})
      .catch((error) => {
        headerForm.setFieldValue("attrCategory", undefined);
        headerForm.setFieldValue("componentname", undefined);
      });

    hide();
  };
  return (
    <Modal
      width={800}
      open={show}
      onCancel={handleHide}
      title="Assign Attributed"
    >
      <CategoryForm
        uniqueCode={uniqueCode}
        setUniqueCode={setUniqueCode}
        category={category}
        componentName={componentName}
        updateNameAndCode={updateNameAndCode}
        form={form}
      />
    </Modal>
  );
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

[
  {
    partCode: "",
    key: "",
    partName: "",
  },
];
