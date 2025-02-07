import {
  Button,
  Checkbox,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Tooltip,
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

import useApi from "../../../../hooks/useApi.ts";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MyDataTable from "../../../gstreco/myDataTable";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";

import AlternatePartCode from "./AlternatePartCode";

export default function UpdateComponent() {
  const [loading, setLoading] = useState(false);
  const [uomOptions, setuomOptions] = useState([]);
  const [groupOptions, setgroupOptions] = useState([]);
  const [attr_raw, setUniqueIdData] = useState("");
  const [tooldata, setTooldata] = useState({});
  const [categoryData, setCategoryData] = useState(null);
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);
  const [fetchPartCode, setFetchPartCode] = useState("");
  const [newPartCodeDb, setNewPartCodeDb] = useState([]);
  const { componentKey } = useParams();
  const [componentForm] = Form.useForm();
  const [altPartCodeForm] = Form.useForm();
  const [alternatePartModal, setAlternatePartModal] = useState(false);

  const [tooltipVisible, setTooltipVisible] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);
  const { executeFun, loading: loading1 } = useApi();
  useEffect(() => {
    // console.log("attr_raw", attr_raw);/
    if (attr_raw) {
      // console.log("attr in use----", attr_raw);
      setCategoryData({
        // text: value.attr_category.text,
        // value: value.attr_category.value,
        text: attr_raw.attributeCode,
        value: attr_raw.attributeCode,
      });
      componentForm.setFieldValue("catType", attr_raw.attribute_category);
    }
  }, [attr_raw]);

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
          // console.log("data...............", catType);
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
            piaStatus: value.pia_status == "Y" && setIsEnabled(true),
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
            alternate_part_name: value.alternate_part_name,
            attrCategory: {
              text: value.attr_category.text,
              value: value.attr_category.value,
            },
            // componentcategory: value.attr_raw.matType,
            category: value.category,
            toolLabel: value.attr_raw,
          };
          setCategoryData({
            // text: value.attr_category.text,
            // value: value.attr_category.value,
            text: value.attr_code,
            value: value.attr_code,
          });
          setTooldata(finalObj.toolLabel);
          componentForm.setFieldsValue(finalObj);

          setFetchPartCode(finalObj);
          const objects = finalObj.alternate_part_codes.map((code, index) => ({
            value: finalObj.alternate_part_keys[index],
            text: code,
            label: code,
          }));
          altPartCodeForm.setFieldValue("alternatePart", objects);
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
    if (tooldata) {
      if (fetchPartCode.catType == "Resistor") {
        componentForm.setFieldValue("mountingStyle", tooldata?.mountingStyle);
        componentForm.setFieldValue(
          "manufacturing_code",
          tooldata?.manufacturing_code
        );
        componentForm.setFieldValue("multipler", tooldata?.multipler);
        componentForm.setFieldValue("packageSize", tooldata?.packageSize);
        componentForm.setFieldValue("powerRating", tooldata?.powerRating);
        componentForm.setFieldValue("tolerance", tooldata?.tolerance);
        componentForm.setFieldValue("value", tooldata?.value);
      } else if (fetchPartCode.catType == "Capacitor") {
        componentForm.setFieldValue(
          "manufacturing_code",
          tooldata?.manufacturing_code
        );

        componentForm.setFieldValue("mountingStyle", tooldata?.mountingStyle);
        componentForm.setFieldValue("tolerance", tooldata?.tolerance);
        componentForm.setFieldValue("siUnit", tooldata?.siUnit);
        componentForm.setFieldValue(
          "typeofCapacitor",
          tooldata?.typeofCapacitor
        );
        componentForm.setFieldValue("tolerance", tooldata?.tolerance);
        componentForm.setFieldValue("packageSize", tooldata?.packageSize);
        componentForm.setFieldValue("value", tooldata?.value);
        componentForm.setFieldValue("voltage", tooldata?.voltage);
      }
    } else {
      setTooltipVisible(true);
    }
  }, [tooldata]);

  useEffect(() => {
    if (fetchPartCode) {
      const alterpartcode = fetchPartCode.alternate_part_name.map(
        (name, index) => {
          return {
            id: index + 1,
            partName: name,
            partCode: fetchPartCode.alternate_part_codes[index],
          };
        }
      );
      setNewPartCodeDb(alterpartcode);
    }
  }, [fetchPartCode]);

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
    // console.log("attr_raw", attr_raw);
    // console.log("catType", componentForm.getFieldValue("catType"));
    var catTypeCategory = componentForm.getFieldValue("catType");
    let attrCat;
    if (catTypeCategory === "Resistor") {
      attrCat = "R";
    } else if (catTypeCategory === "Capacitor") {
      attrCat = "C";
    } else {
      attrCat = "O";
    }
    // if (attr_raw?.attribute_category === "Resistor") {
    //   attrCat = "R";
    // } else if (attr_raw.attribute_category === "Capacitor") {
    //   attrCat = "C";
    // } else {
    //   attrCat = "O";
    // }
    // console.log("values", values);
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
      attr_category: attrCat,
      componentcategory: "--",
      manufacturing_code: attr_raw?.attr_raw?.manufacturing_code,
      pia_status: isEnabled == true ? "Y" : "N",
    };
    // console.log("payload", payload);

    const response = await imsAxios.post(
      "/component/updateComponent/verify",
      payload
    );
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
    }
  };
  const validateHandler = async () => {
    const values = await componentForm.validateFields();
    // console.log("attr_raw", attr_raw);
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

  useEffect(() => {
    getDetails();
    getUomOptions();
    getGroupOptions();
  }, []);

  return (
    <>
      <AlternatePartCode
        open={alternatePartModal}
        hide={() => setAlternatePartModal(false)}
      />
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
                          {/* Alternate Part Code */}
                          <span
                            onClick={() => setAlternatePartModal(componentKey)}
                            style={{
                              color: "#1890FF",
                              cursor: "pointer",
                            }}
                          >
                            Similar Part Codes
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
                    <Form.Item name="uom" label="UoM">
                      <MySelect options={uomOptions} />
                    </Form.Item>
                  </Col>
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
                    <Form.Item label="Attribute Code">
                      <Row justify="space-between">
                        {/* {categor yData && ( */}{" "}
                        <Tooltip
                          title={
                            "Please save the details to enable this feature"
                          }
                        >
                          <Col>{categoryData?.text ?? "--"}</Col>
                        </Tooltip>
                        {/* )} */}
                        {/* {(!categoryData?.value ||
                          categoryData?.value === "--") && ( */}
                        <Col>
                          <Button
                            onClick={() => setShowCategoryDetails(categoryData)}
                            // disabled={categoryData?.value.length > 3}
                          >
                            Detailsd
                          </Button>
                        </Col>
                        {/* )} */}
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
                  <Col span={4}>
                    <Form.Item name="piaStatus">
                      <Checkbox
                        checked={isEnabled}
                        onChange={(e) => setIsEnabled(e.target.checked)}
                      />
                      <Typography.Text
                        style={{
                          fontSize: "14px",
                          marginLeft: "4px",
                        }}
                      >
                        Enable PIA
                      </Typography.Text>
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item name="qcStatus" label="QC Status">
                      <MySelect options={qcStatusOptions} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="description" label="Description">
                      <Input.TextArea />
                    </Form.Item>
                  </Col>

                  {fetchPartCode.catType == "Resistor" && (
                    <>
                      {" "}
                      <Divider />
                      <Col span={24}>
                        <Typography.Title level={5}>
                          Attribute Code Details
                        </Typography.Title>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="manufacturing_code"
                          label="Manufacturing Code"
                        >
                          <Input
                            disabled
                            value={tooldata?.manufacturing_code}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="mountingStyle" label="Mounting Style">
                          <Input disabled value={tooldata?.mountingStyle} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="multipler" label="Multipler">
                          <Input disabled value={tooldata?.multipler} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="packageSize" label="Package Size">
                          <Input disabled value={tooldata?.packageSize} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="powerRating" label="Power Rating">
                          <Input disabled value={tooldata?.powerRating} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="value" label="Value">
                          <Input disabled value={tooldata?.value} />
                        </Form.Item>
                      </Col>
                    </>
                  )}
                  {fetchPartCode.catType == "Capacitor" && (
                    <>
                      {" "}
                      <Divider />
                      <Col span={24}>
                        <Typography.Title level={5}>
                          Attribute Code Details
                        </Typography.Title>
                      </Col>{" "}
                      <Col span={8}>
                        <Form.Item
                          name="manufacturing_code"
                          label="Manufacturing Code"
                        >
                          <Input
                            disabled
                            value={
                              tooldata?.manufacturing_code == 0
                                ? "--"
                                : tooldata?.manufacturing_code
                            }
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="mountingStyle" label="Mounting Style">
                          <Input disabled value={tooldata?.mountingStyle} />
                        </Form.Item>
                      </Col>{" "}
                      <Col span={8}>
                        <Form.Item name="tolerance" label="Tolerance">
                          <Input disabled value={tooldata?.tolerance} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="siUnit" label="SI Unit">
                          <Input disabled value={tooldata?.siUnit} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="typeofCapacitor"
                          label="Type of Capacitor"
                        >
                          <Input disabled value={tooldata?.typeofCapacitor} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="packageSize" label="Package Size">
                          <Input disabled value={tooldata?.packageSize} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="voltage" label="Voltage">
                          <Input disabled value={tooldata?.voltage} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="value" label="Value">
                          <Input disabled value={tooldata?.value} />
                        </Form.Item>
                      </Col>
                    </>
                  )}

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
          componentForm={componentForm}
          // catTypeCategory={catTypeCategory}
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
  piaStatus: "",
  mountingStyle: "",
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
