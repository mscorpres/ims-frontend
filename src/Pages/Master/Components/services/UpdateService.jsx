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
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../../axiosInterceptor";
import { getPlHeadListOptions } from "../../../../api/general.ts";

const toPlHeadArray = (value) => {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.includes(",")) {
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [value];
};

const toSelectedKeys = (value, keyName) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((row) => Number(row?.selected) === 1)
    .map((row) => row?.[keyName])
    .filter(Boolean);
};

export default function UpdateService({ editService, setEditService, units }) {
  const [pageLoading, setPageLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [plHeadOptions, setPlHeadOptions] = useState([]);
  const [plHeadSelectLoading, setPlHeadSelectLoading] = useState(false);
  const [natureOfTdsOptions, setNatureOfTdsOptions] = useState([]);
  const [serviceDetails, setServiceDetails] = useState({
    serviceName: "",
    uom: "",
    plHeads: [],
    natureOfTds: [],
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
    try {
      const response = await imsAxios.post("/component/fetchUpdateComponent", {
        componentKey: editService.componentKey,
      });
      if (response.success) {
        const res = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        if (!res) {
          toast.error("Service details not found.");
          setEditService(null);
          return;
        }
        setServiceDetails({
          serviceName: res.name,
          uom: res.uomid,
          plHeads: toPlHeadArray(
            res.plHeads ?? res.gl_head ?? res.gl_code ?? []
          ).slice(0, 1),
          natureOfTds:
            toSelectedKeys(res.tdsHeads, "tdsKey").length > 0
              ? toSelectedKeys(res.tdsHeads, "tdsKey")
              : toPlHeadArray(
                  res.nature_of_tds ?? res.tds_nature ?? res.tds
                ),
          isEnabled: res.enable_status || "Y",
          description: res.description,
          taxType: res.tax_type || "L",
          taxRate: res.gst_rate || "05",
          sac: res.sac,
        });
      } else {
        toast.error(response.message?.msg ?? response.message);
        setEditService(null);
      }
    } catch (error) {
      toast.error(error.message);
      setEditService(null);
    } finally {
      setPageLoading(false);
    }
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
    if (!serviceDetails.plHeads?.length) {
      return toast.error("Please select at least one P&L head");
    }
    const newObj = {
      sac: serviceDetails.sac,
      description: serviceDetails.description,
      uom: serviceDetails.uom,
      plHeads: serviceDetails.plHeads,
      tdsHeads: serviceDetails.natureOfTds ?? [],
      gstrate: serviceDetails.taxRate,
      taxtype: serviceDetails.taxType,
      enable_status: serviceDetails.isEnabled,
      componentKey: editService.componentKey,
      componentname: serviceDetails.serviceName,
    };
    setSubmitLoading(true);
    try {
      const response = await imsAxios.post(
        "/component/updateServiceComponent",
        newObj
      );
      if (response.success) {
        toast.success(response.message);
        setEditService(null);
      } else {
        toast.error(response.message?.msg ?? response.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitLoading(false);
    }
  };
  const getPlHeadOptions = async (search) => {
    try {
      setPlHeadSelectLoading(true);
      const options = await getPlHeadListOptions(search);
      setPlHeadOptions(options);
    } catch (error) {
      setPlHeadOptions([]);
    } finally {
      setPlHeadSelectLoading(false);
    }
  };

  const getNatureOfTdsOptions = async () => {
    try {
      const response = await imsAxios.get("/tally/tds/nature_of_tds");
      const { data } = response;

      if (data?.code === 200 && Array.isArray(data.data)) {
        const arr = data.data.map((row) => ({
          text: row.tds_name ?? row.tdsName ?? row.text ?? row.name,
          value: row.tds_key ?? row.tdsKey ?? row.id ?? row.value,
        }));
        setNatureOfTdsOptions(arr);
      } else {
        setNatureOfTdsOptions([]);
      }
    } catch (error) {
      setNatureOfTdsOptions([]);
    }
  };

  useEffect(() => {
    if (editService) {
      getDetails();
      getNatureOfTdsOptions();
    }
  }, [editService]);
  return (
    <Drawer
      title={`Update Service: ${editService?.partNo}`}
      width="40vw"
      onClose={() => {
        setEditService(null);
      }}
      open={!!editService}
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
            <Col span={12}>
              <Form size="small" layout="vertical">
                <Form.Item
                  label={
                    <span
                      style={{
                        fontSize: window.innerWidth < 1600 && "0.7rem",
                      }}
                    >
                      P&L Heads Selection
                    </span>
                  }
                >
                  <MyAsyncSelect
                    size="default"
                    onBlur={() => setPlHeadOptions([])}
                    loadOptions={getPlHeadOptions}
                    optionsState={plHeadOptions}
                    selectLoading={plHeadSelectLoading}
                    value={serviceDetails.plHeads?.[0]}
                    onChange={(value) =>
                      inputHandler(
                        "plHeads",
                        value != null && value !== "" ? [value] : []
                      )
                    }
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
                      Nature of TDS
                    </span>
                  }
                >
                  <MySelect
                    mode="multiple"
                    size="default"
                    options={natureOfTdsOptions}
                    value={serviceDetails.natureOfTds}
                    onChange={(value) => inputHandler("natureOfTds", value)}
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
