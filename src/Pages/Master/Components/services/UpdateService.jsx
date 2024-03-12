import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";
import MySelect from "../../../../Components/MySelect";
import { imsAxios } from "../../../../axiosInterceptor";

export default function UpdateService({ editService, setEditService, units }) {
  const [pageLoading, setPageLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [serviceDetails, setServiceDetails] = useState({
    serviceName: "",
    uom: "",
    isEnabled: "",
    description: "",
    taxType: "",
    taxRate: "",
    sac: "",
  });
  const enabledOption = [
    { text: "Yes", value: "Y" },
    { text: "No", value: "N" },
  ];
  const taxTypeOptions = [
    { text: "Local", value: "L" },
    { text: "InterState", value: "I" },
  ];
  const gstRateOptions = [
    { text: "05", value: "05" },
    { text: "12", value: "12" },
    { text: "18", value: "18" },
    { text: "28", value: "28" },
  ];
  const getDetails = async () => {
    setPageLoading(true);
    const { data } = await imsAxios.post("component/fetchUpdateComponent", {
      componentKey: editService.componentKey,
    });
    if (data.code == 200) {
      const res = data.data[0];
      setServiceDetails({
        serviceName: res.name,
        uom: res.uomid,
        isEnabled: "Y",
        description: res.description,
        taxType: "L",
        taxRate: "05",
        sac: res.sac,
      });
    } else {
      toast.error(data.message.msg);
      setEditService(null);
    }
    setPageLoading(false);
  };
  const inputHandler = (name, value) => {
    let obj = serviceDetails;
    obj = {
      ...obj,
      [name]: value,
    };
    setServiceDetails(obj);
  };
  const submitFunction = async () => {
    const newObj = {
      sac: serviceDetails.sac,
      description: serviceDetails.description,
      uom: serviceDetails.uom,
      gstrate: serviceDetails.taxRate,
      taxtype: serviceDetails.taxType,
      enable_status: serviceDetails.isEnabled,
      componentKey: editService.componentKey,
      componentname: serviceDetails.serviceName,
    };
    setSubmitLoading(true);
    const { data } = await imsAxios.post(
      "/component/updateServiceComponent",
      newObj
    );
    setSubmitLoading(false);
    if (data.code == 200) {
      toast.success(data.message);
      setEditService(null);
    } else {
      toast.error(toast.message.msg);
    }
  };
  useEffect(() => {
    if (editService) {
      getDetails();
    }
  }, [editService]);
  return (
    <Drawer
      title={`Update Service: ${editService?.partNo}`}
      width="40vw"
      onClose={() => {
        setEditService(null);
      }}
      open={editService}
    >
      <Skeleton active loading={pageLoading} />
      <Skeleton active loading={pageLoading} />
      {!pageLoading && (
        <>
          <Row>
            <Typography.Title level={4}>
              {serviceDetails.serviceName}
            </Typography.Title>
          </Row>
          <Divider style={{ margin: "10px 0" }} />
          <Row>
            <Col>
              <Typography.Title level={5}>Basic Details</Typography.Title>
            </Col>
          </Row>
          <Divider style={{ margin: "10px 0" }} />

          <Row gutter={16}>
            <Col span={12}>
              <Form size="small" layout="vertical">
                <Form.Item
                  label={
                    <span
                      style={{
                        fontSize: window.innerWidth < 1600 && "0.7rem",
                      }}
                    >
                      UoM
                    </span>
                  }
                >
                  <MySelect
                    size="default"
                    options={units}
                    value={serviceDetails.uom}
                    onChange={(value) => inputHandler("uom", value)}
                  />
                </Form.Item>
              </Form>
            </Col>
            <Col span={12}>
              <Form size="small" layout="vertical">
                <Form.Item
                  label={
                    <span
                      style={{
                        fontSize: window.innerWidth < 1600 && "0.7rem",
                      }}
                    >
                      Enabled
                    </span>
                  }
                >
                  <MySelect
                    size="default"
                    options={enabledOption}
                    value={serviceDetails.isEnabled}
                    onChange={(value) => inputHandler("isEnabled", value)}
                  />
                </Form.Item>
              </Form>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form size="small" layout="vertical">
                <Form.Item
                  label={
                    <span
                      style={{
                        fontSize: window.innerWidth < 1600 && "0.7rem",
                      }}
                    >
                      Description
                    </span>
                  }
                >
                  <Input.TextArea
                    rows={3}
                    style={{ resize: "none" }}
                    size="default"
                    options={enabledOption}
                    value={serviceDetails.description}
                    onChange={(e) =>
                      inputHandler("description", e.target.value)
                    }
                  />
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col>
              <Typography.Title level={5}>Tax Details</Typography.Title>
            </Col>
          </Row>
          <Divider style={{ margin: "10px 0" }} />
          <Row gutter={16}>
            <Col span={12}>
              <Form size="small" layout="vertical">
                <Form.Item
                  label={
                    <span
                      style={{
                        fontSize: window.innerWidth < 1600 && "0.7rem",
                      }}
                    >
                      Tax Type
                    </span>
                  }
                >
                  <MySelect
                    size="default"
                    options={taxTypeOptions}
                    value={serviceDetails.taxType}
                    onChange={(value) => inputHandler("taxType", value)}
                  />
                </Form.Item>
              </Form>
            </Col>
            <Col span={12}>
              <Form size="small" layout="vertical">
                <Form.Item
                  label={
                    <span
                      style={{
                        fontSize: window.innerWidth < 1600 && "0.7rem",
                      }}
                    >
                      GST Rate
                    </span>
                  }
                >
                  <MySelect
                    size="default"
                    options={gstRateOptions}
                    value={serviceDetails.taxRate}
                    onChange={(value) => inputHandler("taxRate", value)}
                  />
                </Form.Item>
              </Form>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form size="small" layout="vertical">
                <Form.Item
                  label={
                    <span
                      style={{
                        fontSize: window.innerWidth < 1600 && "0.7rem",
                      }}
                    >
                      SAC
                    </span>
                  }
                >
                  <Input
                    size="default"
                    value={serviceDetails.sac}
                    onChange={(e) => inputHandler("sac", e.target.value)}
                  />
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Row justify="end">
            <Space>
              <Button
                onClick={() => {
                  setEditService(null);
                }}
              >
                Back
              </Button>
              <Button
                onClick={submitFunction}
                loading={submitLoading}
                type="primary"
              >
                Submit
              </Button>
            </Space>
          </Row>
        </>
      )}
    </Drawer>
  );
}
