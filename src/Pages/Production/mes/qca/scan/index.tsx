import { deleteQcaRows, getPprOptions } from "@/api/general";
import useApi from "@/hooks/useApi";
import CurrentDetails from "@/Pages/Production/mes/qca/scan/CurrentDetails";
import CustomerName from "@/Pages/Production/mes/qca/scan/customerDetails";
import LocationDetails from "@/Pages/Production/mes/qca/scan/locationDetails";
import ProductDetails from "@/Pages/Production/mes/qca/scan/productDetails";
import {
  Card,
  Checkbox,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Typography,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import MyButton from "@/Components/MyButton";
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import MySelect from "@/Components/MySelect.jsx";
import {
  currentScanDetails,
  headerType,
  PPRDetailsType,
  ProcessDetailsType,
} from "@/Pages/Production/mes/qca/scan/types";
import {
  fetchEntriesfromCount,
  fetchFailReasonOptions,
  fetchPreviousData,
  getPprDetails,
  getProcessOptions,
  insertQr,
  insertScanWithCount,
  transferLot,
} from "@/api/production/mes";
import { SelectOptionType } from "@/types/general";
import InsertModal from "@/Pages/Production/mes/qca/scan/InsertModal";
import TransferModal from "@/Pages/Production/mes/qca/scan/TransferModal";
import Loading from "@/Components/Loading.jsx";
import MyDataTable from "@/Components/MyDataTable.jsx";

type Props = {};
interface RowType {
  id: string | number;
  time: string;
  date: string;
  qr: string;
  status: "FAIL" | "PASS";
  checked: false;
}

const QcScan = (props: Props) => {
  const [failReasonOptions, setFailReasonOptions] = useState<
    SelectOptionType[]
  >([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [pprDetails, setPPRDetails] = useState<PPRDetailsType | null>(null);
  const [currentScanDetails, setCurrentScanDetails] =
    useState<currentScanDetails | null>({
      currentScanned: " 0",
      failed: " 0",
      passed: " 0",
      total: " 0",
    });
  const [processDetails, setProcessDetails] =
    useState<ProcessDetailsType | null>(null);
  const [rawProcesses, setRawProcesses] = useState<ProcessDetailsType[]>([]);
  const [processOptions, setProcessOptions] = useState<SelectOptionType[]>([]);
  const [rows, setRows] = useState<RowType[]>([]);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [isInsertingWithCount, setisInsertingWithCount] = useState(false);
  const [scanReady, setScanReady] = useState(false);
  const [deleteRow, setDeleteRow] = useState([]);

  const { executeFun, loading } = useApi();
  const [form] = Form.useForm<headerType>();
  const [scanForm] = Form.useForm();
  const scanInputRef = useRef(null);

  const selectedPpr = Form.useWatch("ppr", form);
  const selectedProcess = Form.useWatch("process", form);

  const handleFetchFailReasonOptions = async () => {
    const response = await executeFun(
      () => fetchFailReasonOptions(),
      "headers"
    );
    setFailReasonOptions(response.data);
  };
  const handleFetchPprOptions = async (search: string) => {
    setAsyncOptions([]);
    const response = await executeFun(() => getPprOptions(search), "select");
    setAsyncOptions(response.data);
  };

  const handleFetchPPRDetails = async (ppr: string) => {
    const response = await executeFun(() => getPprDetails(ppr), "headers");
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
  //   fetchPreviousData
  const handleFetchPreviousRows = async (ppr: string, process: string) => {
    setRows([]);
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
      ppr: values.ppr,
      process: values.process,
      status,
      reason,
    };

    const response = await executeFun(
      () => insertQr(payload),
      `singleScan-${status}`
    );
    if (response.success) {
      handleFetchPreviousRows(
        values.ppr.value as string,
        values.process.value as string
      );
      setShowInsertModal(false);
      scanForm.setFieldValue("qr", undefined);

      setCurrentScanDetails((curr) => ({
        currentScanned: +curr?.currentScanned + 1,
        failed: status === "FAIL" ? +curr?.failed + 1 : curr?.failed,
        passed: status === "PASS" ? +curr?.passed + 1 : curr?.passed,
        total: +curr?.currentScanned + 1,
      }));
    }
  };

  const handleGenerateClick = () => {
    setisInsertingWithCount(true);
    setShowInsertModal(true);
  };

  const handleInsertWithCount = async (
    reason: string,
    status: "PASS" | "FAIL"
  ) => {
    const values = await form.validateFields();
    const scanValues = await scanForm.validateFields();
    if (!values) return;
    const payload = {
      ppr: values.ppr.value as string,
      process: values.process.value as string,
      status: status,
      count: scanValues.count,
      reason: reason,
    };

    const response = await executeFun(
      () => insertScanWithCount(payload),
      `insertWithCount-${status}`
    );
    if (response.success) {
      setShowInsertModal(false);
      handleFetchPreviousRows(
        values.ppr.value as string,
        values.process.value as string
      );
    }
  };

  //runs when genrate code is clicked
  const handleLotTransfer = async (status: "PASS" | "FAIL") => {
    const values = await form.validateFields();
    if (!pprDetails || !values) return;

    const response = await executeFun(
      () => transferLot(pprDetails, values, rows, status),
      "transfer"
    );
    if (response.success) {
      setShowTransferModal(false);
      handleFetchPreviousRows(
        values.ppr.value as string,
        values.process.value as string
      );
    }
  };
  const filterTheCheckedRows = (selected, rows) => {
    let arr = [];
    let matched = [];
    selected.map((row) => {
      matched = rows.filter((r) => r.id === row)[0];

      if (matched) {
        arr.push(matched);
      }
    });
    setDeleteRow(arr);
    return arr;
  };
  const deleteSelected = async () => {
    let payload = {
      sku: form.getFieldValue("sku"),
      qca_process: selectedProcess.key,
      bar_code: deleteRow.map((r) => r?.qr),
      result: deleteRow.map((r) => r?.status),
    };

    const response = await executeFun(() => deleteQcaRows(payload), "select");
    handleFetchPreviousRows(selectedPpr.key, selectedProcess.key);
  };
  const columns = [
    {
      headerName: "#",
      field: "id",
      width: 30,
    },
    {
      headerName: "Date",
      field: "date",
      width: 120,
    },
    {
      headerName: "Time",
      field: "time",
      width: 120,
    },
    {
      headerName: "QR No.",
      field: "qr",
      width: 180,
    },
    {
      headerName: "Status",
      field: "status",
      width: 120,
    },
  ];
  useEffect(() => {
    if (selectedPpr) {
      handleFetchPPRDetails(selectedPpr.value.toString());
    }
  }, [selectedPpr]);
  useEffect(() => {
    if (selectedProcess) {
      handleSelectProcess(selectedProcess.value as string);
    }
  }, [selectedProcess]);

  useEffect(() => {
    if (selectedPpr && selectedProcess) {
      handleFetchPreviousRows(
        selectedPpr.value as string,
        selectedProcess.value as string
      );
    }
  }, [selectedPpr, selectedProcess]);

  useEffect(() => {
    handleFetchFailReasonOptions();
  }, []);

  useEffect(() => {
    setCurrentScanDetails(getCurrentScanDetails(rows ?? []));
  }, [rows]);
  return (
    <Row style={{ padding: 10, height: "95%" }} justify={"center"} gutter={6}>
      <TransferModal
        show={showTransferModal}
        hide={() => setShowInsertModal(false)}
        submitHandler={handleLotTransfer}
        loading={loading}
      />
      <InsertModal
        show={showInsertModal}
        hide={() => setShowInsertModal(false)}
        reasonOptions={failReasonOptions}
        submitHandler={
          isInsertingWithCount ? handleInsertWithCount : handleSingleScanInsert
        }
        loading={loading}
      />
      <Col lg={6} xl={4} span={4}>
        <Flex vertical style={{ height: "100%", overflowY: "auto" }} gap={5}>
          <Card title="Header Details" size="small">
            {loading("headers") && <Loading />}
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
            </Form>{" "}
            <div>
              <MyButton
                onClick={() => deleteSelected()}
                variant="delete"
                danger
                disabled={!deleteRow.length}
                text="Delete Selected"
                block
                loading={loading("transfer")}
              />
            </div>
          </Card>

          {/* scan card */}
          <Card title="Scan Details" size="small">
            <Form
              form={scanForm}
              layout="vertical"
              disabled={!selectedPpr || !selectedProcess}
            >
              {loading("singleScan") && <Loading />}
              <Form.Item
                name="qr"
                label="Qr Number"
                style={{
                  opacity: 0,
                  pointerEvents: "none",
                  position: "absolute",
                  zIndex: -1,
                }}
              >
                <Input
                  onBlur={() => setScanReady(false)}
                  ref={scanInputRef}
                  onKeyDown={(e) => {
                    if (e.keyCode === 13) {
                      setShowInsertModal(true);
                    }
                  }}
                />
              </Form.Item>
              <div
                style={{
                  marginBottom: 10,
                  width: "100%",
                }}
              >
                <Typography.Text
                  strong
                  style={{
                    color: scanReady ? "green" : "brown",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  {scanReady
                    ? "Ready to scan!!!"
                    : "Click Ready scan to start scanning!!!"}
                </Typography.Text>
              </div>
              <MyButton
                variant="scan"
                block
                text="Click to Scan"
                type="default"
                onClick={() => {
                  setScanReady(true);
                  scanInputRef.current?.focus();
                }}
              />
              <Divider>OR</Divider>
              <Typography.Title level={5}>Manual Entry</Typography.Title>

              <Form.Item style={{ flex: 1 }} name="count" label="Count">
                <Input />
              </Form.Item>
              <MyButton
                onClick={handleGenerateClick}
                variant="submit"
                type="default"
                text="Generate"
                loading={loading("insertWithCount")}
                block
              />
            </Form>
          </Card>
          <div>
            <MyButton
              onClick={() => setShowTransferModal(true)}
              variant="qr"
              disabled={!selectedPpr || !selectedProcess}
              text="Generate Code"
              block
              loading={loading("transfer")}
            />
          </div>
        </Flex>
      </Col>
      <Col lg={12} xl={14} xxl={10} span={10}>
        <Card
          size="small"
          style={{ height: "100%" }}
          bodyStyle={{ height: "95%", overflow: "auto" }}
        >
          {loading("fetchRows") && <Loading />}
          <MyDataTable
            checkboxSelection
            rows={rows}
            columns={columns}
            onSelectionModelChange={(selected) => {
              console.log(selected);
              console.log(rows);
              // setSelectedPo(selected);
              filterTheCheckedRows(selected, rows);
            }}
          />{" "}
        </Card>
      </Col>
      <Col lg={6} xl={4} span={4}>
        <Flex vertical gap={5} style={{ overflowY: "auto" }}>
          {pprDetails && <CustomerName details={pprDetails} />}
          {selectedProcess && (
            <LocationDetails
              details={getCurrentProcess(selectedProcess.value, rawProcesses)}
            />
          )}
          {pprDetails && <ProductDetails details={pprDetails} />}
          {currentScanDetails && (
            <CurrentDetails details={currentScanDetails} />
          )}
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

export const getCurrentScanDetails = (rows: RowType[]): currentScanDetails => {
  return {
    currentScanned: rows.length,
    failed: rows.filter((row) => row.status === "FAIL").length,
    passed: rows.filter((row) => row.status === "PASS").length,
    total: rows.length,
  };
};
