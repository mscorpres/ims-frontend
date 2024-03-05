import { useState, useEffect } from "react";
import { Col, Form, Modal, Row } from "antd";
import HeaderDetails from "./HeaderDetails";
import ProcessTable from "./ProcessTable";
import { processApi } from "../../api";
import { toast } from "react-toastify";

const MapProcesses = () => {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [skuBomOptions, setSkuBomOptions] = useState([]);
  const [skuSfgOptions, setSkuSfgOptions] = useState([]);

  const [locationOptions, setLocationOptions] = useState([]);
  const [mapProcessForm] = Form.useForm();

  const sku = Form.useWatch("sku", mapProcessForm);
  //   for header details
  const handleProductOptions = async (search) => {
    setLoading("select");
    const { data } = await processApi.getProductOptions(search);
    setLoading(false);
    setAsyncOptions(data);
  };

  const handleSkuBomOptions = async (sku) => {
    const { data } = await processApi.getSkuBomOptions(sku);
    setSkuBomOptions(data);
  };
  const handleSkuSfgOptions = async (sku) => {
    const { data } = await processApi.getSkuSfgOptions(sku);
    setSkuSfgOptions(data);
  };

  const handleLocationOptions = async () => {
    const { data } = await processApi.getLocationOptions();
    setLocationOptions(data);
  };

  const getAllOptionsWithSkyu = async (sku) => {
    handleSkuBomOptions(sku);
    handleSkuSfgOptions(sku);
  };
  const getOtherOptions = async () => {
    handleLocationOptions();
  };

  const validateHandler = async () => {
    const values = await mapProcessForm.validateFields();
    Modal.confirm({
      title: "Mapping Processes",
      content: "Are you sure you want to map these processes?",
      okText: "Continue",
      onOk: () => submitHandler(values),
    });
  };
  const submitHandler = async (values) => {
    const { success, message } = await processApi.mapProcess(values);
    if (success) {
      toast.success(message);
      mapProcessForm.resetFields();
    }
  };
  useEffect(() => {
    if (sku) {
      getAllOptionsWithSkyu(sku);
    }
  }, [sku]);
  useEffect(() => {
    getOtherOptions();
  }, []);
  return (
    <div style={{ height: "93%", padding: 5, paddingTop: 0 }}>
      <Form
        initialValues={initialValues}
        form={mapProcessForm}
        layout="vertical"
        style={{ height: "100%" }}
      >
        <Row gutter={6} style={{ height: "100%", overflow: "auto" }}>
          <Col span={4}>
            <HeaderDetails
              loading={loading}
              setLoading={setLoading}
              asyncOptions={asyncOptions}
              setAsyncOptions={setAsyncOptions}
              handleProductOptions={handleProductOptions}
              submitHandler={validateHandler}
            />
          </Col>
          <Col
            span={20}
            style={{
              height: "100%",
              overflow: "auto",
              opacity: !sku && 0.5,
              pointerEvents: !sku && "none",
            }}
          >
            <ProcessTable
              loading={loading}
              setLoading={setLoading}
              asyncOptions={asyncOptions}
              setAsyncOptions={setAsyncOptions}
              form={mapProcessForm}
              initialValues={initialValues}
              skuBomOptions={skuBomOptions}
              skuSfgOptions={skuSfgOptions}
              locationOptions={locationOptions}
            />
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default MapProcesses;

const initialValues = {
  sku: "",
  process: [
    {
      isBomRequired: "YES",
      level: 1,
    },
  ],
};
