import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
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
import useApi from "../../../../hooks/useApi";
import { downloadComponentMaster } from "../../../../api/master/component";
import { downloadFromLink } from "../../../../Components/printFunction";

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
  const [manfCode, setManfCode] = useState(null);

  const { executeFun, loading: loading1 } = useApi();

  const [hsnForm] = Form.useForm();
  const [headerForm] = Form.useForm();
  const [attributeForm] = Form.useForm();
  const selectedCategory = Form.useWatch("attrCategory", headerForm);
  const [components, setComponents] = useState([]);

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
        if (data.code === 200) {
          const arr = data.data.map((row) => ({
            text: row.text,
            value: row.id,
          }));

          setUomOptions(arr);
        } else {
          toast.error(data.message.msg);
        }
      }
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
    console.log("attributeValues", attributeValues);
    console.log("manfCode", manfCode);
    // return;
    let atrrRes = {
      multipler: attributeValues?.multiplier,
      tolerance: attributeValues?.tolerance,
      mountingStyle: attributeValues?.mounting_style,
      packageSize: attributeValues?.package_size,
      powerRating: attributeValues?.power_rating,
      value: attributeValues?.value,
    };
    let atrrCAP = {
      // multipler: attributeValues.multiplier,
      tolerance: attributeValues?.tolerance,
      mountingStyle: attributeValues?.mounting_style,
      packageSize: attributeValues?.package_size,
      voltage: attributeValues?.voltage,
      value: attributeValues?.value,
      typeofCapacitor: attributeValues?.type_Of_capacitor,
      siUnit: attributeValues?.si_unit,
    };
    let payload;
    if (selectedCategory?.label === "Resistor") {
      // setAttributeValues({atrrRes});
      payload = {
        part: headerValues.code,
        uom: headerValues.unit,
        component: headerValues.name,
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
      };
    } else if (selectedCategory?.label === "Capacitor") {
      payload = {
        part: headerValues.code,
        uom: headerValues.unit,
        component: headerValues.name,
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
      };
    } else {
      payload = {
        part: headerValues.code,
        uom: headerValues.unit,
        component: headerValues.name,
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
      };
    }

    const response = await imsAxios.post(
      "/component/addComponent/verify",
      payload
    );
    console.log("response", response);
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
      console.log("Here in submit handler");
      const response = await imsAxios.post(
        "/component/addComponent/save",
        payload
      );
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          setUniqueId("");
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
    const response = await executeFun(downloadComponentMaster, "download");

    if (response.success) {
      window.open(response.data.filePath, "_blank", "noreferrer");
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
          setAttributeValues(null);
        },
      });
    }
  }, [selectedCategory]);

  return (
    <div style={{ height: "90%" }}>
      <ComponentImages setShowImages={setShowImages} showImages={showImages} />
      <AddPhoto
        updatingImage={uploadingImage}
        setUpdatingImage={setUploadingImage}
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
                  <Row gutter={6}>
                    <Col span={12}>
                      <Form.Item
                        rules={headerRules.name}
                        label="Component Name"
                        name="name"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        rules={headerRules.newPart}
                        label="Cat Part Code"
                        name="newPart"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        rules={headerRules.partCode}
                        label="Part Code"
                        name="code"
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        label="UOM"
                        name="unit"
                        rules={headerRules.uom}
                      >
                        <MySelect options={uomOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={18}>
                      <Form.Item
                        label="Group"
                        name="group"
                        rules={headerRules.group}
                      >
                        <MySelect options={groupOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Category"
                        name="category"
                        rules={headerRules.category}
                      >
                        <MySelect options={categoryOptions} />
                      </Form.Item>
                    </Col>

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
                    {uniqueId && (
                      <Col span={24}>
                        <Row justify="end">
                          <Space>
                            <Typography.Text strong type="secondary">
                              Unique Id: {uniqueId}
                            </Typography.Text>

                            <TableActions
                              action="edit"
                              onClick={() =>
                                setShowAttributesModal({
                                  selectedCategory: selectedCategory,
                                })
                              }
                            />
                          </Space>
                        </Row>
                      </Col>
                    )}
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
                        <Space>
                          <MyButton
                            loading={loading1("download")}
                            text="Download Master"
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
                        </Space>
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
      <MaterialUpdate
        materialModal={materialModal}
        setMaterialModal={setMaterialModal}
        // allComponent={allComponent}
      />
      <CategoryModal
        show={showAttributesModal}
        hide={() => setShowAttributesModal(false)}
        setAttributeValues={setAttributeValues}
        uniqueId={uniqueId}
        setUniqueId={setUniqueId}
        form={attributeForm}
        headerForm={headerForm}
        setManfCode={setManfCode}
        manfCode={manfCode}
      />
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
  name: undefined,
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
  form,
  headerForm,
  setManfCode,
  manfCode,
}) => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState("fetch");
  const [fieldSelectOptions, setFieldSelectOptions] = useState([]);
  const [existingComponents, setExistingComponents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [stage, setStage] = useState(0);
  var alpha;
  var extractednum;
  var getAlpha;
  var wholeVal;
  var result;
  const value = Form.useWatch("value", form);
  const getCategoryFields = async (categoryKey) => {
    console.log("category key", categoryKey.label);
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
      console.log("result", result);
      if (result) {
        let decimalPartLength = (value.toString().split(".")[1] || "").length;
        console.log("Number has a decimal place.", decimalPartLength);
        let decimalVal = addZerosToTen(decimalPartLength);
        console.log("decimal", decimalVal);
        let pointVal = 1 / decimalVal;
        alpha = getLetterFromDeciNumber(pointVal);
        console.log("pointVAAAAAA", alpha);
        form.setFieldValue("multiplier", alpha);
        getWholeNumber(value, decimalVal);
        // getAlpha = removeTrailingZerosUsingSwitch(pointVal.count);
        // console.log("getAlpha", getAlpha);
        // extractednum = newNum.stringWithoutTrailingZeros;
      } else {
        // let newNum = removeZeros(result);
        // console.log("It is a whole number.", newNum);
        // const numberWithoutZeros = removeZeros(value);
        // const countZ = countZeros(numberWithoutZeros);
        // console.log("Number without Zeros:", numberWithoutZeros);
        let newNum = removeAndCountTrailingZeros(value);
        console.log("newNum", newNum);
        getAlpha = removeTrailingZerosUsingSwitch(newNum.count);
        console.log("getAlpha", getAlpha);
        extractednum = newNum.stringWithoutTrailingZeros;
      }
    }
  };
  //add Zero in the starting ot create 4 number code value digit
  function zeroPad(num) {
    return num.toString().padStart(5, "0");
  }
  //generate code
  const getUniqueNo = async () => {
    console.log("alpha getUniqueNo", alpha);
    let values = await form.validateFields();
    console.log("valuesvalues-----------", values);
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
    console.log("categorSnip=", newSnip);
    if (newSnip == "CAP") {
      console.log("inised cap");
      let filledFields =
        newSnip +
        values.mounting_style +
        values.type_Of_capacitor +
        "(" +
        values.package_size +
        ")" +
        // values.power_rating.value +
        values.tolerance +
        values.voltage;
      console.log("filledFields", filledFields);

      if (makingString.length <= 5) {
        let codeValue = zeroPad(makingString);

        console.log("!codeValue!", filledFields + codeValue + values.si_unit);
        setUniqueId(filledFields + codeValue + values.si_unit);
      }
    } else if (newSnip == "RES") {
      let filledFields =
        newSnip +
        values.mounting_style +
        "(" +
        values.package_size +
        ")" +
        values.power_rating +
        values.tolerance;
      console.log("filledFields", filledFields);

      if (makingString.length <= 5) {
        let codeValue = zeroPad(makingString);
        setUniqueId(filledFields + codeValue);
        console.log("codeValue ", filledFields + codeValue);
      }
    }
    // console.log("valuesvalues=", values);
    // //
    else {
      console.log("makingString greater than 5  =", makingString);
    }
  };

  //without decimal value functions
  function addZerosToTen(numZeros) {
    let result = "1" + "0".repeat(numZeros);
    return parseInt(result);
  }
  function getLetterFromNumber(number) {
    console.log("number number", number);
    const mapping = {
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
      ([key, value]) => parseInt(key) === number
    );
    console.log("resultresult", result);
    form.setFieldValue("multiplier", result[1]);
    return result ? result[1] : "Number not found";
  }
  function removeTrailingZerosUsingSwitch(numbers, letter) {
    let numberpowerOfTen;

    let number = addZerosToTen(numbers);
    console.log("number ->", number);
    alpha = getLetterFromNumber(number);
    console.log("apl", alpha);
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
    wholeVal = Number(wholeVal).toFixed(0);
    // console.log("num is here", wholeVal);
  };
  // ---
  useEffect(() => {
    if (value) {
      console.log("valueis added", value);
      checkDecimal(value);
      getUniqueNo();
    }
  }, [value, alpha]);
  const submitHandler = async (payload) => {
    try {
      setUniqueId(uniqueId);
      form.resetFields();
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
    }
  }, [show]);

  useEffect(() => {
    getieldSelectOptions(fields);
  }, [fields]);

  return (
    <Modal
      title="Assign Attributes"
      open={show}
      onOk={submitHandler}
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
      <Row>
        <Col span={24}>
          <Flex justify="center" gap={5}>
            <Typography.Text strong>
              Selected Category: {selectedCategory?.label}
            </Typography.Text>

            {/* <Typography.Text>{show?.selectedCategory?.label} </Typography.Text> */}
          </Flex>
        </Col>
        <Col span={24} style={{ marginTop: 6 }}>
          <Row>
            <Col span={14}>
              {/* <Flex justify="center"> */}
              <Typography.Text strong>Unique Id: {uniqueId}</Typography.Text>
            </Col>
            <Col span={10}>
              {/* <Flex justify="center"> */}
              {/* <Typography.Text strong>Manufacturing Code: {uniqueId}</Typography.Text> */}
              <Input
                placeholder="Manufacturing Code"
                onChange={(e) => setManfCode(e.target.value)}
              />
            </Col>
          </Row>
        </Col>
        <Divider />
      </Row>
      {loading === "fetch" && <Loading />}
      {stage === 0 && (
        <Form form={form} layout="vertical">
          <Row gutter={6}>
            {sortedFields.map((row) => (
              <Col span={8} key={row.label}>
                {" "}
                {/* Ensure to provide a unique key for each element */}
                {row.type === "select" ? (
                  <Form.Item
                    style={{ textTransform: "capitalize" }}
                    name={row.label}
                    label={row.label.replaceAll("_", " ")}
                  >
                    <MySelect
                      // labelInValue
                      // disabled={row.label === "multiplier"}
                      options={
                        fieldSelectOptions.find(
                          (field) => field.name === row.name
                        )?.options || []
                      }
                    />
                  </Form.Item>
                ) : (
                  ""
                )}
                {row.type === "text" && (
                  <Form.Item
                    style={{ textTransform: "capitalize" }}
                    name={row.label}
                    label={row.label.replaceAll("_", " ")}
                  >
                    <Input />
                  </Form.Item>
                )}
              </Col>
            ))}
          </Row>
        </Form>
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
                  components which are already assigned with the same unique ID{" "}
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
