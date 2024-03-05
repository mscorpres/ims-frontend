import {
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Timeline,
  Typography,
} from "antd";
import React from "react";
import { useState } from "react";
import { imsAxios } from "../../axiosInterceptor";
import { useEffect } from "react";
import MyButton from "../../Components/MyButton";
import { toast } from "react-toastify";
import Loading from "../../Components/Loading";

const TaskLogs = ({ show, hide }) => {
  const [logs, setLogs] = useState([
    {
      label: "Today",
      children: "Task Updated",
    },
    {
      label: "Today",
      children: "Task marked as completed",
    },
  ]);
  const [loading, setLoading] = useState("fetch");
  const [remarksForm] = Form.useForm();
  const getLogs = async (taskId) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/taskmaster/fetch_task_logs", {
        task_id: taskId,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((task, index) => {
            let label = "";
            let user = "";
            switch (task.status) {
              case "PENDING":
                label = "Created for ";
                user = task.assign_to_name;

                break;
              case "TRANSFER":
                label = "Transferred to ";
                user = task.assign_to_name;
                break;

              case "COMPLETED":
                label = "Completed by ";
                user = task.assign_to_name;
                break;
              case "COMMENT":
                label = "Comment by ";
                user = task.activity_by_name;
            }
            return {
              label: task.activity_dt,
              children: (
                <Row>
                  <Col span={24}>
                    Task {label}
                    {user}
                  </Col>
                  <Col span={24}>
                    <Typography.Text type="secondary" strong>
                      {task.task_remark}
                    </Typography.Text>
                  </Col>
                </Row>
              ),
            };
          });

          setLogs(arr);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const validateHandler = async () => {
    const values = await remarksForm.validateFields();

    const payload = {
      task_id: show,
      comment: values.remarks,
    };

    Modal.confirm({
      title: "Add Remarks",
      content:
        "Are you sure you want to add this remarks to the timeline of this task",
      okText: "Add Remark",
      confirmLoading: loading === "submit",
      onOk: () => submitHandler(payload),
    });
  };

  const submitHandler = async (payload) => {
    try {
      setLoading("submit");
      const response = await imsAxios.post(
        "/taskmaster/add_task_comment",
        payload
      );
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          getLogs(show);
          remarksForm.resetFields();
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
      getLogs(show);
    }
  }, [show]);
  return (
    <Drawer
      title={`Task Timeline`}
      placement="right"
      width="30vw"
      onClose={hide}
      open={show}
    >
      <Form
        initialValues={{ remarks: "" }}
        form={remarksForm}
        layout="vertical"
        style={{ marginBottom: 20 }}
      >
        <Form.Item label="Remarks" name="remarks">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Row justify="end">
          <MyButton
            onClick={validateHandler}
            loading={loading === "submit"}
            variant="add"
          />
        </Row>
      </Form>
      <Divider style={{ marginBottom: 15 }} />
      {loading === "fetch" && <Loading />}
      <Timeline mode="left" items={logs} />
    </Drawer>
  );
};

export default TaskLogs;
