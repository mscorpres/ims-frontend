import { imsAxios } from "@/axiosInterceptor";
import { Button, Card, Col, Divider, Form, Input, Row } from "antd";
import React, { useRef, useState } from "react";
import { toast } from "react-toastify";

function PIAScan() {
  const [scan] = Form.useForm();
  const [buttonName, setButtonName] = useState("Scan");
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const extractedJson = (e) => {
    console.log("parsed", e);
    console.log("parsed here");
    let parsed = JSON.parse(e);
    let obj = {
      minNumber: parsed["MIN ID"],
      minQty: parsed["MIN Qty"],
      minDate: parsed["MIN Date"],
      projectId: parsed["PRJ ID"],
      costCenter: parsed["Cost Center"],
      partCode: parsed["Part Code"],
      partName: parsed["Part Name"],
      compKey: parsed["component_key"],
      vendorName: parsed["Vendor Name"],
      label: parsed["label"],
      uom: parsed["part_uom"],
      venCode: parsed["Vendor Code"],
    };
    console.log("obj", obj);
    scan.setFieldValue("minNumber", obj.minNumber);
    console.log("obj.minNumber", obj.minNumber);
    if (obj && obj.label) {
      getData(obj);
    }
    scan.setFieldValue("minQty", obj.minQty);
    scan.setFieldValue("minDate", obj.minDate);
    scan.setFieldValue("projectId", obj.projectId);
    scan.setFieldValue("costCenter", obj.costCenter);
    scan.setFieldValue("partCode", obj.partCode);
    scan.setFieldValue("partName", obj.partName);
    scan.setFieldValue("compKey", obj.compKey);
    scan.setFieldValue("vendorName", obj.vendorName);
    scan.setFieldValue("label", obj.label);
    scan.setFieldValue("venCode", obj.venCode);
  };
  const getData = async (obj) => {
    const response = await imsAxios.post("/minBoxLablePrint/fetchBoxDetails", {
      box: obj.label,
      minId: obj.minNumber,
    });
    console.log("response", response);
    let { data } = response;
    if (response?.success) {
      scan.setFieldValue("avlQty", data.avlQty);
      scan.setFieldValue("boxCreateDt", data.boxCreateDt);
    }
  };
  const reset = () => {
    scan.resetFields();
  };
  const submitData = async () => {
    setLoading(false);
    let values = await scan.validateFields();
    console.log("values", values);
    const response = await imsAxios.post("/minBoxLablePrint/updateAvailQty", {
      box: values.label,
      minId: values.minNumber,
      avlQty: values.avlQty,
    });
    console.log("respomse", response);
    if (response.success) {
      toast.success(response?.message);
      setLoading(false);
      reset();
    }
    setLoading(false);
    scanTheQr();
  };
  const scanTheQr = () => {
    // console.log("here");
    if (ref && ref?.current) {
      console.log("ref", ref);
      setButtonName("Ready To Scan");
      ref.current?.focus();
    } else {
      console.log("ref here");
      setButtonName("Scan");
      console.error("Ref is not set up correctly.");
    }
    ref.current?.focus();
  };
  return (
    <div>
      <Row justify="center">
        {/* <Col span={4}> */}
        <Button style={{ width: "200px" }} type="primary" onClick={scanTheQr}>
          {buttonName}
        </Button>
        {/* </Col> */}
      </Row>
      <Input
        ref={ref}
        onChange={(e) => extractedJson(e.target.value)}
        style={{ opacity: 0, zIndex: -1, pointerEvents: "none" }}
      />
      <Row justify="center">
        {/* <Row>
        // <Col span={24}> /*/}
        <Col span={12}>
          <Card title="Details">
            <Form form={scan} layout="vertical">
              {/* <Col span={24}> */}
              <Row gutter={[10, 10]}>
                <Col span={12}>
                  <Form.Item name="partName" label="Part Name">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="partCode" label="Part Code">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="costCenter" label="Cost Center">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="venCode" label="Vendor Code">
                    <Input disabled />
                  </Form.Item>
                </Col>

                {/* <Col span={12}>
              <Form.Item name="compKey" label="component_key">
                <Input />
              </Form.Item>
            </Col> */}
                <Col span={12}>
                  <Form.Item name="vendorName" label="Vendor Name">
                    <Input disabled />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item name="minNumber" label="MIN Id">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="minQty" label="MIN Qty">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="minDate" label="MIN Date">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="projectId" label="Project ID">
                    <Input disabled />
                  </Form.Item>
                </Col>

                <Col span={6}>
                  <Form.Item name="label" label="Label">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item name="avlQty" label="Available Qty">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="boxCreateDt" label="Box Created Date">
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>
              {/* </Row>
              </Col> */}
              <Divider />
              <Row justify="end" gutter={[10, 10]}>
                <Col>
                  <Button onClick={reset}>Reset</Button>
                </Col>
                <Col>
                  <Button type="primary" onClick={submitData} loading={loading}>
                    Save
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        {/* </Col> */}
      </Row>
      {/* </Row> */}
    </div>
  );
}

export default PIAScan;
