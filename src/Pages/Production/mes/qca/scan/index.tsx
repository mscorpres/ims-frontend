import { getPprOptions } from "@/api/general";
import useApi from "@/hooks/useApi";
import CurrentDetails from "@/Pages/Production/mes/qca/scan/CurrentDetails";
import CustomerName from "@/Pages/Production/mes/qca/scan/customerDetails";
import LocationDetails from "@/Pages/Production/mes/qca/scan/locationDetails";
import ProductDetails from "@/Pages/Production/mes/qca/scan/productDetails";
import { Card, Col, Divider, Flex, Form, Input, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import MySelect from "@/Components/MySelect.jsx";
import {
  headerType,
  PPRDetailsType,
  ProcessDetailsType,
} from "@/Pages/Production/mes/qca/scan/types";
import {
  fetchFailReasonOptions,
  fetchPreviousData,
  getPprDetails,
  getProcessOptions,
} from "@/api/production/mes";
import { SelectOptionType } from "@/types/general";
import InsertModal from "@/Pages/Production/mes/qca/scan/InsertModal";

type Props = {};
interface RowType {
  id: string | number;
  time: string;
  date: string;
  qr: string;
  status: "FAIL" | "PASS";
}

const QcScan = (props: Props) => {
  const [failReasonOptions, setFailReasonOptions] = useState<
    SelectOptionType[]
  >([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [pprDetails, setPPRDetails] = useState<PPRDetailsType | null>(null);
  const [processDetails, setProcessDetails] =
    useState<ProcessDetailsType | null>(null);
  const [rawProcesses, setRawProcesses] = useState<ProcessDetailsType[]>([]);
  const [processOptions, setProcessOptions] = useState<SelectOptionType[]>([]);
  const [rows, setRows] = useState<RowType[]>([]);
  const [showInsertModal, setShowInsertModal] = useState(false);

  const { executeFun, loading } = useApi();
  const [form] = Form.useForm<headerType>();
  const [scanForm] = Form.useForm();

  const selectedPpr = Form.useWatch("ppr", form);
  const selectedProcess = Form.useWatch("process", form);

  const handleFetchFailReasonOptions = async () => {
    const response = await executeFun(() => fetchFailReasonOptions(), "fetch");
    setFailReasonOptions(response.data);
  };
  const handleFetchPprOptions = async (search: string) => {
    setAsyncOptions([]);
    const response = await executeFun(() => getPprOptions(search), "select");
    setAsyncOptions(response.data);
  };

  const handleFetchPPRDetails = async (ppr: string) => {
    const response = await executeFun(() => getPprDetails(ppr), "fetch");
    if (response.success) {
      setPPRDetails(response.data);
      form.setFieldValue("sku", response.data.product.value);
      handleFetchProcessOptions(response.data.product.value);
    }
  };

  const handleFetchProcessOptions = async (ppr: string) => {
    const response = await executeFun(() => getProcessOptions(ppr), "fetch");
    const values: ProcessDetailsType[] = response.data;
    setProcessOptions(values.map((row) => row.process));
    setRawProcesses(values);
  };

  const handleSelectProcess = (key: string) => {
    form.setFieldValue("level", getCurrentProcess(key, rawProcesses)?.level);
  };
  const handleFetchPreviousRows = async (ppr: string, process: string) => {
    const response = await executeFun(
      () => fetchPreviousData(ppr, process),
      "fetchRows"
    );

    setRows(response.data ?? []);
  };

  const handleSingleScanInsert = async (
    reason: string,
    status: "PASS" | "FAIL"
  ) => {
    const values = await form.validateFields();
    const scanValues = await scanForm.validateFields();
    if (!values) {
      return;
    }

    const payload = {
      qr: scanValues.qr,
      ppr: values.ppr.value,
      process: values.process.value,
      status,
      reason,
    };

    console.log("this is the payload", payload);
  };
  //   fetchPreviousData

  useEffect(() => {
    if (selectedPpr) {
      handleFetchPPRDetails(selectedPpr.value.toString());
    }
  }, [selectedPpr]);
  useEffect(() => {
    if (selectedProcess) {
      handleSelectProcess(selectedProcess.value);
    }
  }, [selectedProcess]);

  useEffect(() => {
    if (selectedPpr && selectedProcess) {
      handleFetchPreviousRows(selectedPpr.value, selectedProcess.value);
    }
  }, [selectedPpr, selectedProcess]);

  useEffect(() => {
    handleFetchFailReasonOptions();
  }, []);

  return (
    <Row style={{ padding: 10, height: "95%" }} justify={"center"} gutter={6}>
      <InsertModal
        show={showInsertModal}
        hide={() => setShowInsertModal(false)}
        reasonOptions={failReasonOptions}
        submitHandler={handleSingleScanInsert}
      />
      <Col span={4}>
        <Flex vertical style={{ height: "100%", overflowY: "auto" }} gap={5}>
          <Card title="Header Details" size="small">
            <Form form={form} style={{ height: "100%" }} layout="vertical">
              <Row gutter={6}>
                <Col span={12}>
                  <Form.Item name="ppr" label="PPR No.">
                    <MyAsyncSelect
                      labelInValue={true}
                      optionsState={asyncOptions}
                      selectLoading={loading("select")}
                      loadOptions={handleFetchPprOptions}
                      onBlur={() => setAsyncOptions([])}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="sku" label="SKU">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="process" label="Process">
                    <MySelect labelInValue options={processOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="level" label="Level">
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
          <Card title="Scan Details" size="small">
            <Form form={scanForm} layout="vertical">
              <Form.Item name="qr" label="Qr Number">
                <Input
                  onKeyDown={(e) => {
                    if (e.keyCode === 13) {
                      setShowInsertModal(true);
                    }
                  }}
                />
              </Form.Item>
              <Divider>OR</Divider>
              <Typography.Title level={5}>Manual Entry</Typography.Title>
              <Flex gap={5}>
                <Form.Item name="count" label="Count">
                  <Input />
                </Form.Item>
                <Form.Item name="status" label="Status">
                  <Input />
                </Form.Item>
              </Flex>
            </Form>
          </Card>
        </Flex>
      </Col>
      <Col span={10}>
        <Card
          size="small"
          style={{ height: "100%" }}
          bodyStyle={{ height: "95%", overflow: "auto" }}
        >
          <Flex
            gap={5}
            style={{ borderBottom: "1px solid #eee", paddingBottom: 5 }}
          >
            <div style={{ width: 30 }}>
              <Typography.Text strong type="secondary">
                #
              </Typography.Text>
            </div>
            <div style={{ flex: 1 }}>
              <Typography.Text strong type="secondary">
                Date
              </Typography.Text>
            </div>
            <div style={{ flex: 1 }}>
              <Typography.Text strong type="secondary">
                Time
              </Typography.Text>
            </div>
            <div style={{ flex: 1 }}>
              <Typography.Text strong type="secondary">
                QR No.
              </Typography.Text>
            </div>
            <div style={{ flex: 1 }}>
              <Typography.Text strong type="secondary">
                Status
              </Typography.Text>
            </div>
          </Flex>
          <Flex vertical gap={5}>
            {rows.map((row) => (
              <Flex
                gap={5}
                style={{
                  borderBottom: "1px solid #eee",
                  paddingBottom: 5,
                  paddingTop: 5,
                }}
              >
                <div style={{ width: 30 }}>
                  <Typography.Text>{row.id}</Typography.Text>
                </div>
                <div style={{ flex: 1 }}>
                  <Typography.Text>{row.date}</Typography.Text>
                </div>
                <div style={{ flex: 1 }}>
                  <Typography.Text>{row.time}</Typography.Text>
                </div>
                <div style={{ flex: 1 }}>
                  <Typography.Text>{row.qr}</Typography.Text>
                </div>
                <div style={{ flex: 1 }}>
                  <Typography.Text>{row.status}</Typography.Text>
                </div>
              </Flex>
            ))}
          </Flex>
        </Card>
      </Col>
      <Col span={4}>
        <Flex vertical gap={5} style={{ overflowY: "auto" }}>
          {pprDetails && <CustomerName details={pprDetails} />}
          {selectedProcess && (
            <LocationDetails
              details={getCurrentProcess(selectedProcess.value, rawProcesses)}
            />
          )}
          {pprDetails && <ProductDetails details={pprDetails} />}

          <CurrentDetails />
        </Flex>
      </Col>
    </Row>
  );
};

export default QcScan;

const getCurrentProcess = (
  key: string,
  proccesses: ProcessDetailsType[]
): ProcessDetailsType => {
  return proccesses.find((row) => row.process.value === key);
};
