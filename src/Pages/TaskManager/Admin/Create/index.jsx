import { Drawer, Form, Input, Modal, Row, Space } from "antd";
import React from "react";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import MySelect from "../../../../Components/MySelect";
import MyButton from "../../../../Components/MyButton";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import { useState } from "react";
import { useEffect } from "react";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";

const CreateTask = ({ show, hide, fetchTasks }) => {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [taskForm] = Form.useForm();

  const getExistingData = async (data) => {
    try {
      setLoading("fetch");
      const finalObj = {
        title: data.title,
        description: data.description,
        employee: {
          label: data.assignedToName,
          value: data.assignedTo,
        },
        assignDate: data.assignedDate,
        tat: data.tat,
        canTransfer: data.canTransfer === "YES" ? "Y" : "N",
        category: data.category,
      };
      taskForm.setFieldsValue(finalObj);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const validateHandler = async () => {
    const values = await taskForm.validateFields();

    const payload = {
      task_title: values.title,
      task_desc: values.description,
      task_assign_to: values.employee?.value,
      task_type: values.category,
      task_tat: values.tat,
      assign_date: values.assignDate,
      is_transfer: values.canTransfer,
      task_id: show.edit ? show.details.taskId : undefined,
    };
    Modal.confirm({
      title: "Create Task",
      content: "Are you sure you want to create this task?",
      okText: "Create",
      confirmLoading: loading === "submit",
      cancelText: "Back",
      onOk: () => submitHandler(payload),
    });
  };

  const submitHandler = async (payload) => {
    try {
      setLoading("submit");
      let url = "";
      if (show.edit) {
        url = "/taskmaster/update_created_task";
      } else {
        url = "/taskmaster/add_task";
      }

      const response = await imsAxios.post(url, payload);

      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          fetchTasks();
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

  useEffect(() => {
    if (show && show.edit) {
      getExistingData(show.details);
    }
  }, [show]);
  return (
    <Drawer
      title={`${
        show?.edit
          ? `Update Task : #${show?.details.taskId}`
          : "Create new Task"
      }`}
      placement="right"
      onClose={hide}
      open={show}
    >
      <Form
        style={{ height: "95%" }}
        form={taskForm}
        layout="vertical"
        initialValues={initialValues}
      >
        <Form.Item name="title" label="Task Title">
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item name="employee" label="Assign To">
          <MyAsyncSelect
            labelInValue={true}
            onBlur={() => setAsyncOptions([])}
            loading={loading === "select"}
            loadOptions={getUserOptions}
            optionsState={asyncOptions}
          />
        </Form.Item>
        <Form.Item name="assignDate" label="Assign Date">
          <SingleDatePicker
            setDate={(value) => taskForm.setFieldValue("assignDate", value)}
          />
        </Form.Item>
        <Form.Item name="canTransfer" label="Transferable?">
          <MySelect options={transferrableOptions} />
        </Form.Item>
        <Form.Item name="tat" label="TAT">
          <SingleDatePicker
            setDate={(value) => taskForm.setFieldValue("tat", value)}
          />
        </Form.Item>
        <Form.Item name="category" label="Category">
          <Input />
        </Form.Item>
      </Form>
      <Row justify="end">
        <Space>
          <MyButton variant="reset" />
          <MyButton
            loading={loading === "submit"}
            onClick={validateHandler}
            variant="submit"
          />
        </Space>
      </Row>
    </Drawer>
  );
};

export default CreateTask;

const initialValues = {
  // title: "Test title",
  // description: "test description",
  // employee: "MS0048",
  // assignDate: dayjs(),
  // canTransfer: "Y",
  // tat: dayjs().format("DD-MM-YYYY"),
  // category: "FE",
};

const transferrableOptions = [
  {
    text: "Yes",
    value: "Y",
  },
  {
    text: "No",
    value: "N",
  },
];
