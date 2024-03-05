import {
  Button,
  Col,
  Descriptions,
  Divider,
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
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import MySelect from "../../../Components/MySelect";
import MyButton from "../../../Components/MyButton";
import CategoryDrawer from "./CategoryDrawer";
import Loading from "../../../Components/Loading";
import { Link } from "react-router-dom";

export default function UpdateComponent() {
  const [loading, setLoading] = useState(false);
  const [uomOptions, setuomOptions] = useState([]);
  const [groupOptions, setgroupOptions] = useState([]);

  const [categoryData, setCategoryData] = useState({
    name: "",
    code: "",
    key: "",
    fields: [],
  });
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);
  const { componentKey } = useParams();

  const [componentForm] = Form.useForm();

  const getDetails = async () => {
    try {
      const response = await imsAxios.post("/component/fetchUpdateComponent", {
        componentKey,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const value = data.data[0];
          const finalObj = {
            partCode: value.partcode,
            component: value.name,
            uom: {
              label: value.uomname,
              value: value.uomid,
            },
            newPartCode: value.new_partcode,
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
          };
          componentForm.setFieldsValue(finalObj);
        } else {
          toast.error(data.message.msg);
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
  const validateHandler = async () => {
    const values = await componentForm.validateFields();

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
      componentcategory: "assembly",
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
      console.log(payload)
      setLoading("submit");
      const response = await imsAxios.post(
        "/component/updateComponent",
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
                    <MyButton onClick={validateHandler} variant="submit" />
                  </Space>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Row gutter={6}>
                <Col span={8}>
                  <Form.Item name="partCode" label="Part Code">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="newPartCode" label="New Part Code">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="component" label="Component Name">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="uom" label="UOM">
                    <MySelect options={uomOptions} />
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
                      {categoryData && <Col>{categoryData.name}</Col>}
                      {categoryData && (
                        <Col>
                          <Button
                            onClick={() => setShowCategoryDetails(categoryData)}
                          >
                            Details
                          </Button>
                        </Col>
                      )}
                      {!categoryData && (
                        <Link>
                          <MyButton variant="add" />
                        </Link>
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
                  <Form.Item name="volumetricWeight" label="Volumetric Weight">
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
        hide={() => setShowCategoryDetails(null)}
      />
    </Form>
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
