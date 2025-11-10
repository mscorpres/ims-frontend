import { useState, useEffect } from "react";
import { Button, Col, Form, Input, Modal, Row, Space } from "antd";
import MySelect from "../../Components/MySelect";
import MyDatePicker from "../../Components/MyDatePicker";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import MyDataTable from "../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ViewModal from "./components/woAnalysis/ViewModal";
import MINModal from "./components/woAnalysis/MINModal";
import {
  closeWorkOrder,
  getClientOptions,
  getSKUOptions,
  getWorkOrderAnalysis,
  printWorkOrder,
} from "./components/api";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { toast } from "react-toastify";
import FinalizeModal from "./components/woAnalysis/FinalizeModal";
import MyButton from "../../Components/MyButton";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
import { Edit, Search } from "@mui/icons-material";
import CustomButton from "../../new/components/reuseable/CustomButton";

const WoAnalysis = () => {
  const [wise, setWise] = useState(wiseOptions[0].value);
  const [searchInput, setSearchInput] = useState("");
  const [showView, setShowView] = useState(false);
  const [showMINModal, setShowMINModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [cancelForm] = Form.useForm();

  const getRows = async () => {
    try {
      setLoading("fetch");
      const arr = await getWorkOrderAnalysis(wise, searchInput);
      setRows(arr);
    } catch (error) {
      console.log("some error occured while fetching rows", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientOptions = async (search) => {
    try {
      setLoading("select");
      const arr = await getClientOptions(search);
      setAsyncOptions(arr);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const handleSKUOptions = async (search) => {
    try {
      setLoading("select");
      const arr = await getSKUOptions(search);
      setAsyncOptions(arr);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const handlePrint = async (woId, action) => {
    setLoading("print");
    await printWorkOrder(woId, action);
    setLoading(false);
  };
  const handleClose = async (woId, wku) => {
    cancelForm.resetFields();
    Modal.confirm({
      title: "Do you Want to Close this Work order",
      // icon: <ExclamationCircleFilled />,
      content: (
        <Row style={{ marginTop: 10 }}>
          <Col span={24}>
            <Form
              initialValues={{
                cancelRemarks: "",
              }}
              form={cancelForm}
              layout="vertical"
            >
              <Form.Item
                name="cancelRemarks"
                label="Close Reason"
                // rules={cancelRules.remarks}
              >
                <Input.TextArea rows={3} />
              </Form.Item>
            </Form>
          </Col>
        </Row>
      ),
      onOk: async () => {
        const values = await cancelForm.validateFields();
        validateCancelRemarks(woId, wku, values);
      },
    });
  };

  const validateCancelRemarks = async (woId, sku, values) => {
    setLoading("cancel");
    const { status, message } = await closeWorkOrder(
      woId,
      sku,
      values.cancelRemarks
    );
    setLoading(false);
    setLoading(false);
    if (status === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  useEffect(() => {
    if (wise !== wiseOptions[1].value) {
      setSearchInput("");
    }
  }, [wise]);

  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,
    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading ? (
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
    renderRowActionMenuItems: ({ row, table, closeMenu }) => [
      <MRT_ActionMenuItem
        key={row.status === "PENDING" ? "finalize" : "view"}
        label={row.status === "PENDING" ? "Finalize" : "View"}
        onClick={() => {
          closeMenu?.();
          if (row.status === "PENDING") {
            setShowFinalizeModal({
              woId: row.transactionId,
              subjectId: row.bomid,
            });
          } else {
            setShowView({
              woId: row.transactionId,
              subjectId: row.bomid,
              sku: row.productId,
            });
          }
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        key="materialin"
        label="Material In"
        onClick={() => {
          closeMenu?.();
          setShowMINModal({
            woId: row.transactionId,
            subjectId: row.bomid,
            sku: row.productId,
            hsn: row.hsn_code,
          });
        }}
        table={table}
        disabled={row.status === "PENDING"}
      />,
      <MRT_ActionMenuItem
        key="download"
        label="Download"
        onClick={() => {
          closeMenu?.();
          handlePrint(row.transactionId, "download");
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        key="print"
        label="Print"
        onClick={() => {
          closeMenu?.();
          handlePrint(row.transactionId, "print");
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        key="close"
        label="Close"
        onClick={() => {
          closeMenu?.();
          handleClose(row.transactionId, row.productId);
        }}
        table={table}
      />,
    ],
  });
  return (
    <Row style={{ height: "90%", margin: 12 }}>
      <Col span={24} style={{ marginBottom: 12 }}>
        <Row>
          <Col>
            <div>
              <Space>
                <div style={{ width: 200 }}>
                  <MySelect
                    onChange={setWise}
                    options={wiseOptions}
                    value={wise}
                    placeholder="Select Wise"
                  />
                </div>
                {wise === wiseOptions[0].value && (
                  <div style={{ width: 270 }}>
                    <MyAsyncSelect
                      selectLoading={loading === "select"}
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      value={searchInput}
                      onChange={setSearchInput}
                      loadOptions={handleClientOptions}
                    />
                  </div>
                )}
                {wise === wiseOptions[1].value && (
                  <MyDatePicker setDateRange={setSearchInput} />
                )}
                {wise === wiseOptions[2].value && (
                  <div style={{ width: 270 }}>
                    <Input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                )}
                {wise === wiseOptions[3].value && (
                  <div style={{ width: 270 }}>
                    <MyAsyncSelect
                      selectLoading={loading === "select"}
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      value={searchInput}
                      onChange={setSearchInput}
                      loadOptions={handleSKUOptions}
                    />
                  </div>
                )}

                <CustomButton
                  size="small"
                  title={"Search"}
                  starticon={<Search fontSize="small" />}
                  loading={loading === "fetch"}
                  onclick={getRows}
                />
              </Space>
            </div>
          </Col>
        </Row>
      </Col>
      <Col span={24} style={{ height: "95%" }}>
        <MaterialReactTable table={table} />
      </Col>

      <ViewModal showView={showView} setShowView={setShowView} />
      <MINModal
        getRows={getRows}
        showView={showMINModal}
        setShowView={setShowMINModal}
      />
      <FinalizeModal
        getRows={getRows}
        showView={showFinalizeModal}
        setShowView={setShowFinalizeModal}
      />
    </Row>
  );
};

const wiseOptions = [
  {
    text: "Client Wise",
    value: "clientwise",
  },
  {
    text: "Date Wise",
    value: "datewise",
  },
  {
    text: "Work Order Wise",
    value: "wo_transaction_wise",
  },
  {
    text: "SKU Wise",
    value: "wo_sfg_wise",
  },
];

const columns = [
  {
    header: "#",
    accessorKey: "index",
    size: 30,
  },
  {
    header: "Date",
    accessorKey: "date",
    size: 150,
  },
  {
    header: "Client",
    accessorKey: "client",
    size: 150,
    flex: 1,
  },
  {
    header: "Client PO ID",
    accessorKey: "transactionId",
    size: 200,
    render: ({ row }) => (
      <ToolTipEllipses text={row.transactionId} copy={true} />
    ),
  },
  {
    header: "Product",
    accessorKey: "product",
    size: 250,
    flex: 1,
    render: ({ row }) => <ToolTipEllipses text={row.product} />,
  },
  {
    header: "SKU",
    accessorKey: "sku",
    size: 250,
    render: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    header: "Required Qty",
    accessorKey: "requiredQty",
    size: 150,
  },
];

export default WoAnalysis;
