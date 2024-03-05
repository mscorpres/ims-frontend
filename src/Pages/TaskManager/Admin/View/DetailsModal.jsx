import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Typography,
} from "antd";
import React from "react";
import { useState, useEffect } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import MyButton from "../../../../Components/MyButton";
import MySelect from "../../../../Components/MySelect";
import { toast } from "react-toastify";
import TaskLogs from "../../TaskLogs";

const DetailsModal = ({
  show,
  hide,
  setShowAddModal,
  fetchTasks,
  setShowTransferModal,
}) => {
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("PENDING");
  const [showLogs, setShowLogs] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);

  const getDetails = async (taskId) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/taskmaster/fetchTaskDetails", {
        task_id: taskId,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const finalObj = {
            taskId: data.data.task_id,
            title: data.data.task_title,
            assignedBy: data.data.assign_by,
            assignedByName: data.data.assign_by_name,
            assignedTo: data.data.assign_to,
            assignedToName: data.data.assign_to_name,
            assignedDate: data.data.assign_dt,
            category: data.data.type,
            tat: data.data.tat,
            description: data.data.task_desc,
            canTransfer: data.data.is_transferable === "N" ? "NO" : "YES",
          };
          setStatus(data.data.status);

          setDetails(finalObj);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const checkAdmin = async () => {
    try {
      setLoading(false);
      const response = await imsAxios.get("/taskmaster/check_admin");
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          setIsAdmin(data.data.isAdmin);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (status) => {
    try {
      const payload = {
        status: status,
        taskId: show.taskId,
      };

      setShowStatusConfirm(payload);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const submitStatusChange = async (payload, handleReset) => {
    try {
      setLoading("submit");
      const response = await imsAxios.post(
        "/taskmaster/update_task_status",
        payload
      );
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success("Task Updated Successfully");
          handleReset();
          setShowStatusConfirm(false);
          // hide();
          fetchTasks();
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
    if (show) {
      getDetails(show.taskId);
      checkAdmin();
    }
  }, [show]);

  return (
    <Modal
      title={`Task: #${show?.taskId}`}
      open={show}
      onOk={() => {}}
      onCancel={hide}
      cancelText="Back"
      footer={(params) => {
        return (
          <Space>
            {params.props.children[0]}
            {isAdmin && (
              <MyButton
                onClick={() => {
                  hide();
                  setShowAddModal({
                    edit: true,
                    details: details,
                  });
                }}
                variant="edit"
              />
            )}

            <MyButton
              type="link"
              variant="next"
              text="Transfer"
              onClick={() => setShowTransferModal({ taskId: details.taskId })}
            />
          </Space>
        );
      }}
    >
      <Row gutter={[6, 6]}>
        <Divider />
        <Col span={12}>
          <Typography.Text strong>Title</Typography.Text>
          <br />
          <Typography.Text>{details.title}</Typography.Text>
        </Col>
        <Col span={12}>
          <Typography.Text strong>Assigned By</Typography.Text>
          <br />
          <Typography.Text>{details.assignedByName}</Typography.Text>
        </Col>
        <Col span={12}>
          <Typography.Text strong>Assigned Date</Typography.Text>
          <br />
          <Typography.Text>{details.assignedDate}</Typography.Text>
        </Col>
        <Col span={12}>
          <Typography.Text strong>Assigned to</Typography.Text>
          <br />
          <Typography.Text>{details.assignedToName}</Typography.Text>
        </Col>
        <Col span={12}>
          <Typography.Text strong>Category</Typography.Text>
          <br />
          <Typography.Text>{details.category}</Typography.Text>
        </Col>
        <Col span={12}>
          <Typography.Text strong>TAT</Typography.Text>
          <br />
          <Typography.Text>{details.tat}</Typography.Text>
        </Col>
        <Col span={24}>
          <Typography.Text strong>Description</Typography.Text>
          <br />
          <Typography.Text>{details.description}</Typography.Text>
        </Col>
        <Col span={12}>
          <Typography.Text strong>Status</Typography.Text>
          <br />
          <div style={{ width: "70%" }}>
            <MySelect
              value={status}
              onChange={handleStatusChange}
              options={statusOptions}
            />
          </div>
        </Col>
        <Col span={12}>
          <Typography.Text strong>Transferrable</Typography.Text>
          <br />
          <Typography.Text>{details.canTransfer}</Typography.Text>
        </Col>
      </Row>

      <StatusChangeModal
        show={showStatusConfirm}
        hide={() => setShowStatusConfirm(false)}
        submitStatusChange={submitStatusChange}
      />
    </Modal>
  );
};

export default DetailsModal;

const statusOptions = [
  {
    text: "Pending",
    value: "PENDING",
  },
  {
    text: "Completed",
    value: "COMPLETED",
  },
];

const StatusChangeModal = ({ show, hide, submitStatusChange }) => {
  const [form] = Form.useForm();

  const validateHandler = async () => {
    const values = await form.validateFields();
    const payload = {
      task_id: show.taskId,
      task_status: show.status,
      remark: values.remark,
    };
    submitStatusChange(payload, handleReset);
  };
  const handleReset = () => {
    form.resetFields();
  };
  return (
    <Modal
      title="Confirm Status"
      open={show}
      onOk={validateHandler}
      // confirmLoading={confirmLoading}
      onCancel={hide}
      width={300}
      okText="Update"
    >
      <Form
        initialValues={{
          remark: "",
        }}
        form={form}
        layout="vertical"
      >
        <Row>
          <Col span={24}>
            <Form.Item name="remark" label="Remarks (If any)">
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
