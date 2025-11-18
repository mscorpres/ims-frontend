import { deleteQcaRows, getPprOptions } from "@/api/general";
import useApi from "@/hooks/useApi";
import CurrentDetails from "@/Pages/Production/mes/qca/scan/CurrentDetails";
import CustomerName from "@/Pages/Production/mes/qca/scan/customerDetails";
import LocationDetails from "@/Pages/Production/mes/qca/scan/locationDetails";
import ProductDetails from "@/Pages/Production/mes/qca/scan/productDetails";
import { Col, Divider, Form, Input, Modal, Row, Typography } from "antd";
import React, { useEffect, useRef, useState } from "react";
//@ts-ignore
import MyButton from "@/Components/MyButton";
//@ts-ignore
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";

//@ts-ignore
import MySelect from "@/Components/MySelect.jsx";
import {
  currentScanDetails,
  headerType,
  PPRDetailsType,
  ProcessDetailsType,
} from "@/Pages/Production/mes/qca/scan/types";
import {
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
//@ts-ignore
import Loading from "@/Components/Loading.jsx";

//@ts-ignore
import CustomFieldBox from "../../../../../new/components/reuseable/CustomFieldBox.jsx";
//@ts-ignore
import EmptyRowsFallback from "../../../../../new/components/reuseable/EmptyRowsFallback";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, LinearProgress, Tooltip } from "@mui/material";

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

  const [rawProcesses, setRawProcesses] = useState<ProcessDetailsType[]>([]);
  const [processOptions, setProcessOptions] = useState<SelectOptionType[]>([]);
  const [rows, setRows] = useState<RowType[]>([]);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [isInsertingWithCount, setisInsertingWithCount] = useState(false);
  const [scanReady, setScanReady] = useState(false);
  const [deleteRow, setDeleteRow] = useState([]);
  const [selectedPo, setSelectedPo] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const { executeFun, loading } = useApi();
  const [form] = Form.useForm<headerType>();
  const [scanForm] = Form.useForm();
  const scanInputRef: any = useRef(null);

  const selectedPpr: any = Form.useWatch("ppr", form);
  const selectedProcess: any = Form.useWatch("process", form);

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
  const confirmRemove = () => {
    Modal.confirm({
      // title: "Remove Qr Component",
      content: (
        <Typography.Text>
          Are you sure you want to delete the selected entries?
        </Typography.Text>
      ),
      //@ts-ignore
      confirmLoading: loading === "remove",
      okText: "Delete",
      cancelText: "Back",
      onOk: () => deleteSelected(),
    });
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

    const payload: any = {
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

      setCurrentScanDetails((curr: any) => ({
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
  const filterTheCheckedRows = (selected: any, rows: any) => {
    let arr: any = [];
    let matched = [];
    selected.map((row: any) => {
      matched = rows.filter((r: any) => r.id === row)[0];

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
      bar_code: deleteRow.map((r: any) => r?.qr),
      result: deleteRow.map((r: any) => r?.status),
    };

    const response = await executeFun(() => deleteQcaRows(payload), "select");
    handleFetchPPRDetails(selectedPpr.value.toString());
    handleFetchPreviousRows(selectedPpr.key, selectedProcess.key);
  };
  const columns: any = [
    {
      header: "#",
      accessorKey: "id",
      size: 30,
    },
    {
      header: "Date",
      accessorKey: "date",
      size: 120,
    },
    {
      header: "Time",
      accessorKey: "time",
      size: 120,
    },
    {
      header: "QR No.",
      accessorKey: "qr",
      size: 180,
    },
    {
      header: "Status",
      accessorKey: "status",
      size: 120,
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

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,

    enableRowSelection: true,

    muiTableContainerProps: {
      sx: {
        height: loading("select")
          ? "calc(100vh - 240px)"
          : "calc(100vh - 260px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading("select") ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
  });
  useEffect(() => {
    const selectedRows: any = table
      .getSelectedRowModel()
      .flatRows.map((r) => r.original);
    setSelectedPo(selectedRows);
  }, [rowSelection, table]);

  return (
    <div style={{ height: "calc-[(100%-100px)]", margin: 12 }}>
      <div className="grid grid-cols-[1fr_3fr_1fr]" style={{ gap: 12 }}>
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
            isInsertingWithCount
              ? handleInsertWithCount
              : handleSingleScanInsert
          }
          loading={loading}
        />
        <div
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
          className="max-h-[calc(100%-40px)] p-1 overflow-y-auto"
        >
          <CustomFieldBox title="Header Details">
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
                onClick={() => confirmRemove()}
                variant="delete"
                danger
                disabled={!deleteRow.length}
                text="Delete Selected"
                block
                loading={loading("transfer")}
              />
            </div>
          </CustomFieldBox>
          <CustomFieldBox title="Scan Details">
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
          </CustomFieldBox>

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
        </div>
        <div>
          {/* <MyDataTable
            checkboxSelection
            rows={rows}
            columns={columns}
            onSelectionModelChange={(selected: any) => {
    

              filterTheCheckedRows(selected, rows);
            }}
            loading={loading("select")}
          /> */}
          <MaterialReactTable table={table} />
        </div>
        <div>
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
        </div>
      </div>
    </div>
  );
};

export default QcScan;

const getCurrentProcess = (
  key: string,
  proccesses: ProcessDetailsType[]
): ProcessDetailsType => {
  return proccesses.find((row) => row.process.value === key) as any;
};

export const getCurrentScanDetails = (rows: RowType[]): currentScanDetails => {
  return {
    currentScanned: rows.length,
    failed: rows.filter((row) => row.status === "FAIL").length,
    passed: rows.filter((row) => row.status === "PASS").length,
    total: rows.length,
  };
};
