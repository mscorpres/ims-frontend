import {
  Button,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Typography,
} from "antd";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import MySelect from "../../../../Components/MySelect";
import MyButton from "../../../../Components/MyButton";

import Loading from "../../../../Components/Loading";
import { Link } from "react-router-dom";
import CategoryDrawer from "./CategoryDrawer";
import {
  getComponentOptions,
  getProductsOptions,
  updateAlternatePartCode,
} from "../../../../api/general";
import useApi from "../../../../hooks/useApi";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MyDataTable from "../../../gstreco/myDataTable";

export default function UpdateComponent() {
  const [loading, setLoading] = useState(false);
  const [uomOptions, setuomOptions] = useState([]);
  const [groupOptions, setgroupOptions] = useState([]);
  const [attr_raw, setUniqueIdData] = useState("");
  const [categoryData, setCategoryData] = useState(null);
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);
  const [fetchPartCode, setFetchPartCode] = useState("");
  const [newPartCodeDb, setNewPartCodeDb] = useState([]);
  const [getAlternate_part_codes, setGetAlternate_part_codes] = useState([]);
  const { componentKey } = useParams();
  const [componentForm] = Form.useForm();
  const [altPartCodeForm] = Form.useForm();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [alternatePartModal, setAlternatePartModal] = useState(false);
  const [manfCode, setManfCode] = useState(null);
  const [partOptions, setPartOptions] = useState([]);

  const attrCategory = Form.useWatch("attrCategory", componentForm);
  console.log("attr_raw", attr_raw);

  const { executeFun, loading: loading1 } = useApi();
  const getDetails = async () => {
    try {
      const response = await imsAxios.post("/component/fetchUpdateComponent", {
        componentKey,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const value = data.data[0];
          // console.log("data...............", value);
          let catType = value.attr_category;
          console.log("data...............", catType);
          if (value.attr_category === "R") {
            catType = "Resistor";
          } else if (value.attr_category === "C") {
            catType = "Capacitor";
          } else {
            catType = "Other";
          }
          const finalObj = {
            partCode: value.partcode,
            newPartCode: value.new_partcode,
            // altPartCode: value.map((r) => {
            //   return {
            //     altPartCodeName: r.alternate_part_codes,
            //     altPartKeyCode: r.alternate_part_keys,
            //   };
            // }),

            component: value.name,
            uom: {
              label: value.uomname,
              value: value.uomid,
            },
            mrp: value.mrp,
            group: value.groupid,
            isEnabled: value.enable_status,
            jobWork: value.jobwork_rate,
            qcStatus: value.qc_status,
            description: value.description,
            taxType: value.tax_type,
            taxRate: value.gst_rate,
            brand: value.brand,
            ean: value.ean,
            weight: value.weight,
            height: value.height,
            width: value.width,
            volumetricWeight: value.vweight,
            minStock: value.minqty,
            maxStock: value.maxqty,
            minOrder: value.minorderqty,
            leadTime: value.leadtime,
            enableAlert: value.alert_status,
            purchaseCost: value.pocost,
            otherCost: value.othercost,
            catType: catType,
            alternate_part_codes: value.alternate_part_codes,
            alternate_part_keys: value.alternate_part_keys,
            attrCategory: {
              text: value.attr_category.text,
              value: value.attr_category.value,
            },
            // componentcategory: value.attr_raw.matType,
            category: value.category,
          };
          setCategoryData({
            // text: value.attr_category.text,
            // value: value.attr_category.value,
            text: value.attr_code,
            value: value.attr_code,
          });
          componentForm.setFieldsValue(finalObj);
          // console.log("finalObj");

          setFetchPartCode(finalObj);
          const objects = finalObj.alternate_part_codes.map((code, index) => ({
            value: finalObj.alternate_part_keys[index],
            text: code,
            label: code,
          }));
          // let obj = { components: objects };
          // setPartOptions(objects);
          altPartCodeForm.setFieldValue("alternatePart", objects);
          // console.log("partOptions", obj.components);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  // console.log("this is the alternate part codes values,", partOptions);
  useEffect(() => {
    // console.log("alternate_part_codes in useefect", fetchPartCode);
    if (fetchPartCode) {
      // setGetAlternate_part_codes(fetchPartCode.alternate_part_codes);
      //  if (getAlternate_part_codes) {
      // console.log("getAlternate_part_codes", getAlternate_part_codes);
      let alterpartcode = fetchPartCode.alternate_part_codes.map((r, index) => {
        return { r, id: index + 1 };
      });
      // console.log("alterPArt", alterpartcode);
      setNewPartCodeDb(alterpartcode);
      //  }
    }
  }, [fetchPartCode]);
  // console.log("alterPArt", newPartCodeDb);

  const getUomOptions = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/uom/uomSelect2");
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row) => ({
            text: row.text,
            value: row.id,
          }));
          setuomOptions(arr);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getGroupOptions = async () => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/groups/groupSelect2");
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row) => ({
            text: row.text,
            value: row.id,
          }));
          setgroupOptions(arr);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const modalConfirmMaterial = async () => {
    const values = await componentForm.validateFields();
    console.log("attr_raw =======", attr_raw);
    console.log("values", values);
    console.log("categoryData", categoryData);
    let attrCat;
    if (attr_raw?.attribute_category === "Resistor") {
      attrCat = "R";
    } else if (attr_raw.attribute_category === "Capacitor") {
      attrCat = "C";
    } else {
      attrCat = "O";
    }
    const payload = {
      componentKey: componentKey,
      componentname: values.component,
      uom: values.uom.value,
      category: "--",
      mrn: values.mrp,
      group: values.group,
      new_partno: values.newPartCode,
      enable_status: values.isEnabled,
      jobwork_rate: values.jobWork,
      qc_status: values.qcStatus,
      description: values.description,
      taxtype: values.taxType,
      taxrate: values.taxRate,
      brand: values.brand,
      ean: values.ean,
      weightgms: values.weight,
      vweightgms: values.volumetricWeight,
      height: values.height,
      width: values.width,
      minqty: values.minStock,
      maxqty: values.maxStock,
      minorder: values.minOrder,
      leadtime: values.leadTime,
      alert: values.enableAlert,
      pocost: values.purchaseCost,
      othercost: values.otherCost,
      attr_code: attr_raw?.attributeCode ?? "--",
      attr_raw: attr_raw?.attr_raw ?? "",
      // attr_category: attr_raw?.C_type ?? "O",
      attr_category: attrCat,
      componentcategory: "--",

      // c_type: attr_raw?.C_type ?? "O",
      //manu
      manufacturing_code: attr_raw?.attr_raw?.manufacturing_code,
    };
    console.log("payload", payload);

    const response = await imsAxios.post(
      "/component/updateComponent/verify",
      payload
    );
    console.log("response", response);
    const { data } = response;
    if (data.code === 200) {
      Modal.confirm({
        title: "Are you sure you want to submit this Updated Component?",
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
    const values = await componentForm.validateFields();
    console.log("attr_raw", attr_raw);
    const payload = {
      componentKey: componentKey,
      componentname: values.component,
      uom: values.uom.value,
      category: "--",
      mrn: values.mrp,
      group: values.group,
      new_partno: values.newPartCode,
      enable_status: values.isEnabled,
      jobwork_rate: values.jobWork,
      qc_status: values.qcStatus,
      description: values.description,
      taxtype: values.taxType,
      taxrate: values.taxRate,
      brand: values.brand,
      ean: values.ean,
      weightgms: values.weight,
      vweightgms: values.volumetricWeight,
      height: values.height,
      width: values.width,
      minqty: values.minStock,
      maxqty: values.maxStock,
      minorder: values.minOrder,
      leadtime: values.leadTime,
      alert: values.enableAlert,
      pocost: values.purchaseCost,
      othercost: values.otherCost,
      componentcategory: "--",
      attr_code: attr_raw?.attributeCode ?? "--",
      attr_raw: attr_raw?.attr_raw ?? "",
      attr_category: attr_raw?.C_type ?? "O",
      // c_type: attr_raw?.C_type ?? "O",
    };

    Modal.confirm({
      title: "Update Component",
      content: "Are you sure you want to update this component?",
      okText: "Update",
      onOk: () => submitHandler(payload),
      confirmLoading: loading === "submit",
    });
  };
  const getCategoryDetails = async () => {
    // try {
    //   const response = await imsAxios.post("/mfgcategory/editRmCategoryData", {
    //     component: componentKey,
    //   });
    //   const { data } = response;
    //   if (data) {
    //     if (data.code === 200) {
    //       if (data.header) {
    //         const finalObj = {
    //           name: data.header.category,
    //           code: data.header.category_code,
    //           key: data.header.category_id,
    //           fields: data.inputs.map((row) => ({
    //             key: row.attribute,
    //             label: row.attribute_name,
    //             type: row.type,
    //             value: row.value,
    //           })),
    //         };
    //         setCategoryData(finalObj);
    //       } else {
    //         setCategoryData(null);
    //       }
    //     } else {
    //       toast.error(data.message.msg);
    //     }
    //   }
    // } catch (error) {
    // } finally {
    //   setLoading(false);
    // }
  };

  const submitHandler = async (payload) => {
    console.log("inside rhos submit handler", payload);
    try {
      setLoading("submit");
      const response = await imsAxios.post(
        "/component/updateComponent/save",
        payload
      );

      const { data } = response;
      if (data) {
        if (data.code === "200") {
          toast.success(data.message);
          getDetails();
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const resetHandler = () => {
    componentForm.resetFields();
  };
  const getComponentOption = async (searchTerm) => {
    const response = await executeFun(
      () => getComponentOptions(searchTerm, true),
      "select"
    );
    let { data } = response;
    if (data) {
      if (data[0]) {
        let arr = data.map((row) => ({
          text: row.text,
          value: row.id,
          newPart: row.newPart,
        }));

        // console.log("arr", arr);
        setAsyncOptions(arr);
      }
    }
  };
  const updatePartCode = async () => {
    const values = await altPartCodeForm.validateFields();
    // console.log("values", values);
    let arr = values.alternatePart.map((r) => r.key);
    // console.log("arr", arr);
    const response = await executeFun(
      () => updateAlternatePartCode(arr, componentKey),
      "select"
    );
    // console.log("response", response);
    if (response.success) {
      setAlternatePartModal(false);
    }
    // const partCodes = altPartCodeForm.getFieldsValue("partCode");
    // console.log("partCodes", partCodes);
    // updateAlternatePartCode
  };
  useEffect(() => {
    getDetails();
    getUomOptions();
    getGroupOptions();
  }, []);
  const columns = [
    {
      headerName: "#",
      field: "id",
      width: 80,
    },
    {
      headerName: "Part Code",
      field: "r",
      width: 200,
    },
  ];
  return (
    <>
      <Drawer
        // width={600}
        title="Update Alternate Part Code"
        open={alternatePartModal}
        footer={[
          <Row justify="space-between">
            <Col span={4}></Col>
            <Col>
              <Button
                // loading={updateLoading}
                type="primary"
                onClick={() => updatePartCode()}
              >
                Update
              </Button>
            </Col>
          </Row>,
        ]}
        // confirmLoading={confirmLoading}
        onClose={() => setAlternatePartModal(null)}
      >
        {/* {modalLoading && <Loading />} */}
        <Form form={altPartCodeForm} layout="vertical">
          <Row>
            {/* components select */}
            <Col span={24}>
              <Form.Item label="Select Components" name="alternatePart">
                <MyAsyncSelect
                  optionsState={asyncOptions}
                  onBlur={() => setAsyncOptions([])}
                  mode="multiple"
                  labelInValue
                  selectLoading={loading1("select")}
                  loadOptions={getComponentOption}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <MyDataTable columns={columns} data={newPartCodeDb} />
      </Drawer>
      <Form
        layout="vertical"
        form={componentForm}
        style={{ height: "90%", width: "100%", padding: 20 }}
      >
        <Row justify="center">
          <Col
            span={16}
            style={{
              border: "1px solid #ccc",
              padding: 20,
              borderRadius: 10,
              position: "relative",
            }}
          >
            {loading === "fetch" && <Loading />}
            <Row>
              <Col span={24}>
                <Row justify="space-between">
                  <Col>
                    <Typography.Title level={5}>Basic Details</Typography.Title>
                  </Col>
                  <Col>
                    <Space>
                      <MyButton onClick={resetHandler} variant="reset" />
                      <MyButton
                        onClick={modalConfirmMaterial}
                        variant="submit"
                      />
                    </Space>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Row gutter={6}>
                  <Col span={4}>
                    <Form.Item name="partCode" label="Part Code">
                      <Input disabled />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="newPartCode"
                      // label="New Part Code"
                      label={
                        <div
                          style={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                            display: "flex",
                            justifyContent: "space-between",
                            width: 350,
                          }}
                        >
                          Cat Part Code
                          {/* Alternate Part Code */}
                          <span
                            onClick={() => setAlternatePartModal(true)}
                            style={{
                              color: "#1890FF",
                              cursor: "pointer",
                            }}
                          >
                            Update Part Code
                          </span>
                        </div>
                      }
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="component" label="Component Name">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="uom" label="UOM">
                      <MySelect options={uomOptions} />
                    </Form.Item>
                  </Col>
                  {/* <Col span={4}> */}

                  <Col span={8}>
                    <Form.Item name="catType" label="Type">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="mrp" label="MRP">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="group" label="Group">
                      <MySelect options={groupOptions} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Category">
                      <Row justify="space-between">
                        {categoryData && (
                          <Col>{categoryData?.text ?? "--"}</Col>
                        )}
                        {categoryData && (
                          <Col>
                            <Button
                              onClick={() =>
                                setShowCategoryDetails(categoryData)
                              }
                            >
                              Details
                            </Button>
                          </Col>
                        )}
                      </Row>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="isEnabled" label="is Enabled?">
                      <MySelect options={isEnabledOptions} />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item name="jobWork" label="Job Work">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="qcStatus" label="QC Status">
                      <MySelect options={qcStatusOptions} />
                    </Form.Item>
                  </Col>

                  <Col span={16}>
                    <Form.Item name="description" label="Description">
                      <Input.TextArea />
                    </Form.Item>
                  </Col>

                  <Divider />
                  <Col span={24}>
                    <Typography.Title level={5}>Tax Details</Typography.Title>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="taxType" label="Tax Type">
                      <MySelect options={taxTypeOptions} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="taxRate" label="Tax Rate %">
                      <MySelect options={taxRateOptions} />
                    </Form.Item>
                  </Col>
                  <Divider />
                  <Col span={24}>
                    <Descriptions
                      size="small"
                      title="Advance Details"
                    ></Descriptions>
                  </Col>

                  <Col span={8}>
                    <Form.Item name="brand" label="Brand">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="ean" label="EAN">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="weight" label="Weight (gms)">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="height" label="height (mm)">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="width" label="width (mm)">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="volumetricWeight"
                      label="Volumetric Weight"
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Divider />
                  <Col span={24}>
                    <Typography.Title level={5}>
                      Production Details
                    </Typography.Title>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="minStock" label="Min Stock">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="maxStock" label="Max Stock">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="minOrder" label="Min Order">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="leadTime" label="Lead Time">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item name="enableAlert" label="Enable Alert">
                      <Input />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item name="purchaseCost" label="Purchase Cost">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="otherCost" label="Other Cost">
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
        <CategoryDrawer
          show={showCategoryDetails}
          getDetails={getDetails}
          hide={() => setShowCategoryDetails(null)}
          setUniqueIdData={setUniqueIdData}
        />
      </Form>
    </>
  );
}

const initialValues = {
  partCode: "",
  component: "",
  uom: {
    label: "",
    value: "",
  },
  mrp: "",
  group: "",
  isEnabled: "Y",
  jobWork: "",
  qcStatus: "E",
  description: "",
  taxType: "L",
  taxRate: "18",
  brand: "",
  ean: "",
  weight: "",
  height: "",
  width: "",
  volumetricWeight: "",
  minStock: "",
  maxStock: "",
  minOrder: "",
  leadTime: "",
  enableAlert: "",
  purchaseCost: "",
  otherCost: "",
};

const isEnabledOptions = [
  { text: "Yes", value: "Y" },
  { text: "No", value: "N" },
];

const qcStatusOptions = [
  { text: "Yes", value: "E" },
  { text: "No", value: "D" },
  { text: "Please Select Value", value: "0" },
];

const taxTypeOptions = [
  { text: "Local", value: "L" },
  { text: "Inter State", value: "I" },
];

const taxRateOptions = [
  { text: "05%", value: "05" },
  { text: "12%", value: "12" },
  { text: "18%", value: "18" },
  { text: "28%", value: "28" },
];
const categoryOptions = [
  { text: "Assembly", value: "assembly" },
  { text: "Other", value: "other" },
  { text: "SMT", value: "smt" },
];
