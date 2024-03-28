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
  const actionColumn = {
    headerName: "",
    field: "actions",
    width: 10,
    type: "actions",
    getActions: ({ row }) => [
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
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
        label={row.status === "PENDING" ? "Finalize" : "View"}
      />,
      <GridActionsCellItem
        showInMenu
        disabled={row.status === "PENDING"}
        onClick={() =>
          setShowMINModal({
            woId: row.transactionId,
            subjectId: row.bomid,
            sku: row.productId,
            hsn: row.hsn_code,
          })
        }
        label="Material In"
      />,
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          handlePrint(row.transactionId, "print");
        }}
        label="Print"
      />,
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          handlePrint(row.transactionId, "download");
        }}
        label="Download"
      />,
      <GridActionsCellItem
        showInMenu
        // disabled={loading}
        onClick={() => {
          handleClose(row.transactionId, row.productId);
        }}
        label="Close"
      />,
    ],
  };

  useEffect(() => {
    if (wise !== wiseOptions[1].value) {
      setSearchInput("");
    }
  }, [wise]);
  return (
    <Row style={{ height: "90%", paddingRight: 10, paddingLeft: 10 }}>
      <Col span={24}>
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

                <MyButton
                  onClick={getRows}
                  loading={loading === "fetch"}
                  type="primary"
                  variant="search"
                >
                  Fetch
                </MyButton>
              </Space>
            </div>
          </Col>
        </Row>
      </Col>
      <Col span={24} style={{ height: "95%" }}>
        <MyDataTable
          loading={
            loading === "fetch" || loading === "print" || loading === "cancel"
          }
          data={rows}
          columns={[actionColumn, ...columns]}
        />
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
    headerName: "#",
    field: "index",
    width: 30,
  },
  {
    headerName: "Date",
    field: "date",
    width: 150,
  },
  {
    headerName: "Client",
    field: "client",
    minWidth: 150,
    flex: 1,
  },
  {
    headerName: "Client PO ID",
    field: "transactionId",
    width: 200,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.transactionId} copy={true} />
    ),
  },
  {
    headerName: "Product",
    field: "product",
    minWidth: 250,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.product} />,
  },
  {
    headerName: "SKU",
    field: "sku",
    width: 250,
    renderCell: ({ row }) => <ToolTipEllipses text={row.sku} copy={true} />,
  },
  {
    headerName: "Required Qty",
    field: "requiredQty",
    width: 150,
  },
];
const cancelRules = {
  remarks: [
    {
      required: true,
      message: "Please provide a reason to cancel this work order",
    },
  ],
};

export default WoAnalysis;
