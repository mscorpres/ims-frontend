import { useEffect, useState, useMemo } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import { Row, Col, Input } from "antd";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_ActionMenuItem,
} from "material-react-table";
import { GridActionsCellItem } from "@mui/x-data-grid";
import printFunction, {
  downloadFunction,
} from "../../../../Components/printFunction";
import RequestApproveModal from "./RequestApproveModal";
import { Form, Modal } from "antd/es";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import EmptyRowsFallback from "../../../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
import { getMrPendingColumns } from "../columns";
import { Download, Print, Cancel, Loop } from "@mui/icons-material";

const PendingApproval = () => {
  const [loading, setLoading] = useState("fetch");
  const [rows, setRows] = useState([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [ModalForm] = Form.useForm();
  const getRows = async () => {
    try {
      setRows([]);
      const payload = {
        branch: "BRMSC012",
        status: "",
      };
      const response = await imsAxios.post(
        "storeApproval/fetchTransactionForApproval",
        payload
      );
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.response.data.map((row, index) => ({
            id: index + 1,
            requestedFrom: row.user_name,
            requestId: row.transaction_id,
            requestDate: row.insert_full_date,
          }));
          setRows(arr);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const showSubmitConfirmationModal = (type) => {
    // submit confirm modal
    Modal.confirm({
      title: "Do you Want to Cancel the Material Requisition?",
      icon: <ExclamationCircleOutlined />,
      content: (
        <Form form={ModalForm}>
          <Form.Item name="remark">
            <Input
              // onChange={(e) => {
              //   setCancelRemark(e.target.value);
              // }}
              placeholder="Please input the remark"
            />
          </Form.Item>
        </Form>
      ),
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await cancelmr(type);
      },
    });
  };
  const cancelmr = async (type) => {
    const values = await ModalForm.validateFields();
    // console.log("type", type);
    // console.log("values", values);
    // return;
    const response = await imsAxios.post("/storeApproval/requestCancellation", {
      transaction: type.requestId,
      remark: values.remark,
    });
    // console.log("response", response);
    if (response.success) {
      toast.success(response.message);
      ModalForm.resetFields();
    } else {
      toast.error(response.message);
    }
  };
  const actionColums = {
    headerName: "",
    type: "actions",
    width: 30,
    getActions: ({ row }) => [
      // approve Icon
      <GridActionsCellItem
        showInMenu
        label="Process"
        onClick={() =>
          setShowApproveModal({
            requestId: row.requestId,
          })
        }
      />,

      // Download icon
      <GridActionsCellItem
        showInMenu
        label="Download"
        disabled={row.approval_status === "P"}
        onClick={() => handleDownload("download", row.requestId)}
      />,

      // Print Icon
      <GridActionsCellItem
        showInMenu
        label="Print"
        onClick={() => handleDownload("print", row.requestId)}
      />,
      <GridActionsCellItem
        showInMenu
        label="Cancel"
        onClick={() => showSubmitConfirmationModal(row)}
      />,
    ],
  };

  const handleDownload = async (action, requestId) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/storeApproval/print_request", {
        transaction: requestId,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const buffer = data.data.buffer.data;
          if (action === "print") {
            printFunction(buffer);
          } else {
            downloadFunction(buffer, requestId);
          }
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getRows();
  }, []);

  const columns = useMemo(() => getMrPendingColumns(), []);
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
        height:
          loading === "fetch" ? "calc(100vh - 210px)" : "calc(100vh - 255px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      loading === "fetch" ? (
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
        icon={<Loop />}
        key="process"
        label="Process"
        onClick={() => {
          closeMenu?.();
          setShowApproveModal({
            requestId: row?.original?.requestId,
          });
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<Download />}
        key="download"
        label="Download"
        onClick={() => {
          closeMenu?.();
          handleDownload("download", row?.original?.requestId);
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<Print />}
        key="print"
        label="Print"
        onClick={() => {
          closeMenu?.();
          handleDownload("print", row?.original?.requestId);
        }}
        table={table}
      />,
      <MRT_ActionMenuItem
        icon={<Cancel />}
        key="cancel"
        label="Cancel"
        onClick={() => {
          closeMenu?.();
          showSubmitConfirmationModal(row);
        }}
        table={table}
      />,
    ],
  });

  return (
    <Row justify="center" style={{ height: "100%", padding: 15 }}>
      <Col span={24}>
        <MaterialReactTable table={table} />
      </Col>
      <RequestApproveModal
        getRows={getRows}
        show={showApproveModal}
        hide={() => setShowApproveModal(false)}
      />
    </Row>
  );
};

export default PendingApproval;
