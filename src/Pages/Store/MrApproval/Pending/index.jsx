import { useEffect, useState } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import { Row, Col, Input } from "antd";
import MyDataTable from "../../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import printFunction, {
  downloadFunction,
} from "../../../../Components/printFunction";
import RequestApproveModal from "./RequestApproveModal";
import { Form, Modal } from "antd/es";
import { ExclamationCircleOutlined } from "@ant-design/icons";
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
          console.log(data.response.data);
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
  return (
    <Row
      justify="center"
      style={{ height: "100%", padding: 15, paddingBottom: 55 }}
    >
      <Col span={14}>
        <MyDataTable
          loading={loading === "fetch"}
          data={rows}
          columns={[actionColums, ...columns]}
        />
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

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },
  {
    headerName: "Requested From",
    minWidth: 20,
    flex: 1,
    field: "requestedFrom",
  },
  {
    headerName: "Request Id",
    width: 250,
    minWidth: 250,
    flex: 1,
    field: "requestId",
  },
  {
    headerName: "Request Date",
    width: 200,
    field: "requestDate",
  },
];
