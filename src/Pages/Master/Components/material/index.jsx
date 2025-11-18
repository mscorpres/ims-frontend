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
import CustomButton from "../../../../new/components/reuseable/CustomButton.jsx";
import { renderIcon } from "../../../../new/components/layout/Sidebar/iconMapper";
import CustomFieldBox from "../../../../new/components/reuseable/CustomFieldBox.jsx";

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
        attr_code: "--",
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
    }
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
    const response = await executeFun(downloadComponentMaster, "download");

    if (response.success) {
      window.open(response.data.filePath, "_blank", "noreferrer");
    }
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
    <div style={{ height: "90%", margin:"12px"}}>
      <ComponentImages setShowImages={setShowImages} showImages={showImages} />
      <AddPhoto
        updatingImage={uploadingImage}
        setUpdatingImage={setUploadingImage}
      />
      <Row gutter={[0, 6]} style={{ height: "100%" }}>
        <Col
          span={8}
          style={{ height: "100%", overflow: "auto", overflowX: "hidden" }}
        >
          <Row gutter={[6, 6]}>
            <Col span={24}>
              <CustomFieldBox
                title="Add New Component"
                subtitle="Add a new component to the system"
              >
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
                            typeIs?.label === "Resistor" ||
                            typeIs?.label === "Capacitor" ||
                            typeIs?.label === "Inductor"
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
                      <Col span={14}>
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
                          <CustomButton
                            loading={loading1("download")}
                            variant="text"
                            onclick={handleDownloadElectronicReport}
                            title="Electronic Report"
                            endicon={renderIcon("DownloadIcon")}
                            size="small"
                          />
                          <CustomButton
                            loading={loading1("download")}
                            variant="text"
                            onclick={handleDownloadMaster}
                            title="Master"
                            endicon={renderIcon("DownloadIcon")}
                            size="small"
                          />
                          <CustomButton
                            variant="outlined"
                            onclick={resetConfirmHandler}
                            title="Reset"
                            endicon={renderIcon("ResetIcon")}
                          />
                          <CustomButton
                            variant="submit"
                            onclick={modalConfirmMaterial}
                            title="Create"
                            endicon={renderIcon("CheckCircleOutlined")}
                          />
                        </Flex>
                      </Row>
                    </Col>
                  </Row>
                </Form>
              </CustomFieldBox>
            </Col>

            <Col span={24}>
              <Row>
                <Col span={24}>
                  
                  <CustomFieldBox
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
                          <CustomButton
                            endicon={renderIcon("PlusIcon")}
                            onclick={addHsnRow}
                            title="Add"
                            size="small"
                          />
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
                  </CustomFieldBox>
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
            setShowImages={setShowImages}
            setUploadingImage={setUploadingImage}
          />
        </Col>
      </Row>
      <MaterialUpdate
        materialModal={materialModal}
        setMaterialModal={setMaterialModal}
      />
      <CategoryModal
        show={showAttributesModal}
        hide={() => setShowAttributesModal(false)}
        setAttributeValues={setAttributeValues}
        uniqueId={uniqueId}
        setUniqueId={setUniqueId}
        setGeneratedCompName={setGeneratedCompName}
        generatedCompName={generatedCompName}
        setValForName={setValForName}
        valFromName={valFromName}
        form={attributeForm}
        headerForm={headerForm}
        setManfCode={setManfCode}
        manfCode={manfCode}
        typeOfComp={typeOfComp}
        setTypeOfComp={setTypeOfComp}
      />
    </div>
  );
};

export default Material;

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
  const [stage, setStage] = useState(0);
  var alpha;
  var extractednum;
  var getAlpha;
  var wholeVal;
  var result;
  const value = Form.useWatch("value", form);
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
      let siUnit = values.current_SI_Unit.label.split(" ")[0];
      let siVal = values.current_SI_UnitText;
      let fqVal = values.frequencyText;
      let compName =
        values.mounting_style.label +
        "-" +
        values.package_size.key +
        "-" +
        compCode +
        "-" +
        fqVal +
        values.frequency.label +
        "-" +
        siVal +
        siUnit;

      setGeneratedCompName(compName);
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
        setUniqueId(filledFields + codeValue);
      }
    }
   };

  //without decimal value functions
  function addZerosToTen(numZeros) {
    let result = "1" + "0".repeat(numZeros);
    return parseInt(result);
  }
  function getLetterFromNumber(number) {
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
    form.setFieldValue("multiplier", result[1]);
    return result ? result[1] : "Number not found";
  }
  function removeTrailingZerosUsingSwitch(numbers, letter) {
    let number = addZerosToTen(numbers);
    alpha = getLetterFromNumber(number);
    setAttributeValues({ multipler: alpha });
  }
  function removeAndCountTrailingZeros(number) {
    // Convert number to string
    const numString = number.toString();
    let count = 0;

    // Handle case when number is 0  //add Zero in the starting ot create 4 number code value digit
    if (numString === "0") {
      return {
        stringWithoutTrailingZeros: 0,
        count: 1,
      };
    }

    // Count trailing zeros
    for (let i = numString.length - 1; i >= 0; i--) {
      if (numString[i] === "0") {
        count++;
      } else {
        break;
      }
    }

    // Remove trailing zeros
    const stringWithoutTrailingZeros = numString.slice(
      0,
      numString.length - count
    );

    return {
      stringWithoutTrailingZeros: parseInt(stringWithoutTrailingZeros, 10),
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
  };
  // ---
  useEffect(() => {
    if (value) {
      let a = getComponentValueForName(value);
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
      setUniqueId(uniqueId);

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
  return (
    <Modal
      title="Assign Attributes"
      open={show}
      onOk={submitHandler}
      width={1050}
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
            <Typography.Text underline strong>
              Selected Category: {selectedCategory?.label}
            </Typography.Text>
          </Flex>
        </Col>
        <Divider />
        <Col span={24} style={{ marginTop: 10 }}>
          <Row>
            <Col span={14}>
              <Typography.Text strong>Unique Id: {uniqueId}</Typography.Text>
            </Col>
            <Col span={10}>
              <Input
                placeholder="Manufacturing Code"
                onChange={(e) => setManfCode(e.target.value)}
              />
            </Col>
          </Row>
        </Col>
        <Col span={24} style={{ marginTop: 10 }}>
          <Typography.Text strong>
            Component Name: {generatedCompName}
          </Typography.Text>
        </Col>
        <Divider />
      </Row>
      {loading === "fetch" && <Loading />}
      {stage === 0 && (
        <Form form={form} layout="vertical" style={{ marginTop: 10 }}>
          <Row gutter={10}>
            {sortedFields.map((row) => (
              <Col span={8}>
                <Flex>
                  {row.hasValue === "true" && (
                    <Form.Item
                      style={{ textTransform: "capitalize", flex: 1 }}
                      name={row.label + "Text"}
                      label={
                        row.label === "frequency"
                          ? "Freq. Value"
                          : "SI Unit Value"
                      }
                    >
                      <Input />
                    </Form.Item>
                  )}
                  <Form.Item
                    style={{ textTransform: "capitalize", flex: 1.5 }}
                    name={row.label}
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
                    {row.type === "text" && <Input />}
                  </Form.Item>
                </Flex>
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
