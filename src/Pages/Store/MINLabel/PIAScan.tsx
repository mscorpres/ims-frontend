import { Card, Col, Divider, Flex, Form, Input, Row, Typography } from "antd";
import { useEffect, useRef, useState } from "react";

import MyButton from "@/Components/MyButton";
import { fetchBoxDetails, updateBoxQty } from "@/api/store/material-in.js";
import useApi from "@/hooks/useApi";
import useDebounce from "@/hooks/useDebounce";
import Loading from "@/Components/Loading.jsx";

function PIAScan() {
  const [details, setDetails] = useState(defaultDetails);
  const [ready, setReady] = useState(false);
  const [scannedData, setScannedData] = useState({
    string: "",
    loading: false,
  });
  const updatedString = useDebounce(scannedData.string, 1000);

  const [scan] = Form.useForm();
  const { loading, executeFun } = useApi();
  const ref = useRef(null);

  const handleScan = (value: string) => {
    let parsed = JSON.parse(value);
    handleFetchDetails(parsed["MIN ID"], parsed["label"]);
  };
  const handleFetchDetails = async (minId: string, boxLabel: string) => {
    const response = await executeFun(
      () => fetchBoxDetails(minId, boxLabel),
      "fetch"
    );
    if (response.success) {
      setDetails(response.data);
      scan.setFieldValue("availabelQty", response.data.availabelQty);
    }
  };
  const reset = () => {
    scan.resetFields();
    setDetails(defaultDetails);
    setScannedData({
      string: "",
      loading: false,
    });
    scanTheQr();
  };
  const submitData = async () => {
    let values = await scan.validateFields();
    const response = await executeFun(
      () => updateBoxQty(details.minId, details.boxLabel, values.availabelQty),
      "submit"
    );

    if (response.success) {
      reset();
    }
  };
  const scanTheQr = () => {
    setReady(true);

    ref.current?.focus();
  };
  useEffect(() => {
    console.log("scan finish");
    if (updatedString) {
      if (updatedString.length > 10) {
        handleScan(updatedString);
      }
      setScannedData((curr) => ({
        ...curr,
        loading: false,
      }));
    }
  }, [updatedString]);
  useEffect(() => {
    if (scannedData.string.length === 1) {
      setScannedData((curr) => ({
        ...curr,
        loading: true,
      }));
    }
  }, [scannedData]);
  useEffect(() => {
    scanTheQr();
  }, []);

  return (
    <div>
      <Flex vertical justify="center" gap={10}>
        <Flex justify="center">
          <MyButton
            size="large"
            text="Scan Label"
            variant="scan"
            type="default"
            onClick={scanTheQr}
            loading={loading("fetch") || scannedData.loading}
          />
        </Flex>
        <Flex justify="center">
          <Typography.Text
            strong
            style={{ color: ready ? "green" : "brown", fontSize: 20 }}
          >
            {ready
              ? "Ready to Scan !!!"
              : "Click the scan button to start scanning !!!"}
          </Typography.Text>
        </Flex>
      </Flex>

      {/* hidden input */}
      <Input
        ref={ref}
        onChange={(e) => {
          setScannedData(() => ({
            loading: true,
            string: e.target.value,
          }));
        }}
        onBlur={() => {
          setReady(false);
        }}
        value={scannedData.string}
        style={{ opacity: 0, zIndex: -1, pointerEvents: "none", width: 10 }}
      />
      <Row justify="center">
        <Col span={12}>
          <Card title="Box Details">
            {(loading("fetch") || scannedData.loading) && <Loading />}
            <Form form={scan} layout="vertical">
              <Flex justify="center" vertical gap={"10px"}>
                <div>
                  <Typography.Text strong>MIN Details</Typography.Text>
                  <Divider />
                </div>
                <Flex gap={"15px 50px"} wrap="wrap">
                  <SingleDetail label="MIN ID" value={details.minId} />
                  <SingleDetail label="MIN Date" value={details.minDate} />
                  <SingleDetail label="Component" value={details.component} />
                  <SingleDetail label="Part Code" value={details.partCode} />
                  <SingleDetail label="MIN Qty" value={details.minQty} />
                  <SingleDetail
                    label="Cost Center"
                    value={details.costCenter}
                  />
                  <SingleDetail label="Vendor" value={details.vendor} />
                  <SingleDetail
                    label="Vendor Code"
                    value={details.vendorCode}
                  />
                  <SingleDetail label="Project" value={details.project} />
                </Flex>
                <div>
                  <Typography.Text strong>Box Details</Typography.Text>
                  <Divider />
                </div>
                <Flex gap={20} wrap="wrap">
                  <SingleDetail label="Box Label" value={details.boxLabel} />

                  <SingleDetail label="Box Qty" value={details.boxQty} />
                  <SingleDetail
                    label="Box Created Date"
                    value={details.boxDate}
                  />
                  <Form.Item
                    name="availabelQty"
                    label={
                      <Typography.Text strong style={{ fontSize: "0.8rem" }}>
                        Available Qty
                      </Typography.Text>
                    }
                  >
                    <Input disabled={!details.boxQty} />
                  </Form.Item>
                </Flex>
              </Flex>

              <Divider />
              <Flex justify="center" gap={5}>
                <MyButton variant="reset" onClick={reset}>
                  Reset
                </MyButton>
                <MyButton
                  variant="submit"
                  onClick={submitData}
                  disabled={!details.boxQty}
                  loading={loading("submit")}
                />
              </Flex>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default PIAScan;

const SingleDetail = ({ label, value }: { label: string; value?: string }) => {
  return (
    <Flex vertical gap={5}>
      <Typography.Text style={{ fontSize: "0.8rem" }} strong>
        {label}
      </Typography.Text>
      <Typography.Text>{value ?? "--"}</Typography.Text>
    </Flex>
  );
};

const defaultDetails = {
  minId: undefined,
  minDate: undefined,
  component: undefined,
  partCode: undefined,
  minQty: undefined,
  costCenter: undefined,
  vendor: undefined,
  vendorCode: undefined,
  boxLabel: undefined,
  boxDate: undefined,
  boxQty: undefined,
  project: undefined,
};
