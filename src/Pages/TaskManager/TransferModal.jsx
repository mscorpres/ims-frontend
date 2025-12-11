import { useEffect, useState } from "react";
import { Divider, Form, Input, Modal, Row, Typography } from "antd";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../Components/MyAsyncSelect";

const TransferModal = ({ show, hide }) => {
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState("fetch");
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [form] = Form.useForm();

  const getCurrent = async (taskId) => {
    try {
      const response = await imsAxios.post("/taskmaster/fetchLastAssignedTo", {
        task_id: taskId,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const finalObj = {
            assignedToName: data.data.assign_to_name,
            assignedTo: data.data.assign_to,
            assignedDate: data.data.assign_dt,
          };

          setCurrent(finalObj);
        } else {
          toast.error(data.message.msg);
          hide();
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getUserOptions = async (search) => {
    try {
      setLoading("select");
      setAsyncOptions([]);
      const response = await imsAxios.post("/backend/fetchUsers", {
        search,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row) => ({
            value: row.id,
            text: row.text,
          }));
          setAsyncOptions(arr);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        task_id: show.taskId,
        task_status: "TRANSFER",
        task_assign_to: values.employee.value,
        remark: values.remarks ?? "--",
      };
      setLoading("submit");
      const response = await imsAxios.post(
        "/taskmaster/add_task_status",
        payload
      );
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success("Task Transfered successfully");
          hide();
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
      getCurrent(show.taskId);
    } else {
      form.resetFields();
    }
  }, [show]);
  return (
    <Modal
      title="Transfer Task"
      open={show}
      width={300}
      okText="Transfer"
      onOk={submitHandler}
      confirmLoading={loading === "submit"}
      onCancel={hide}
    >
      <Row >
        <Typography.Text
          style={{ textAlign: "center" }}
          strong
          type="secondary"
        >
          Currently assigned to <strong>{current?.assignedToName}</strong>
          <br />
          Assigned on <strong>{current?.assignedDate}</strong>
        </Typography.Text>
      </Row>
      <Divider />
      <Form layout="vertical" initialValues={initialValues} form={form}>
        <Form.Item name="employee" label="Transfer To" rules={rules.employee}>
          <MyAsyncSelect
            labelInValue={true}
            onBlur={() => setAsyncOptions([])}
            loading={loading === "select"}
            loadOptions={getUserOptions}
            optionsState={asyncOptions}
          />
        </Form.Item>
        <Form.Item name="remarks" label="Any Remarks">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TransferModal;

const initialValues = {
  employee: undefined,
  remarks: undefined,
};
const rules = {
  employee: [
    {
      required: true,
      message: "Please select an employee",
    },
  ],
};
