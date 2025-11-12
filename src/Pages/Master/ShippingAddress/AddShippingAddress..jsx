import { useState } from "react";
import { Col, Form, Input, Row, Space } from "antd";
import { imsAxios } from "../../../axiosInterceptor";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import SubmitConfirmModal from "./SubmitConfirmModal";
import { toast } from "react-toastify";
import MyButton from "../../../Components/MyButton";
import CustomFieldBox from "@/new/components/reuseable/CustomFieldBox";
import CustomButton from "@/new/components/reuseable/CustomButton";
import { renderIcon } from "@/new/components/layout/Sidebar/iconMapper";

function AddShippingAddress({ handleCSVDownload, getRows }) {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitConfirmModal, setSubmitConfirmModal] = useState(false);

  const [addShippingAddressForm] = Form.useForm();

  const getStateOptions = async (searchTerm) => {
    setLoading("select");
    const response = await imsAxios.post("/backend/stateList", {
      search: searchTerm,
    });
    const { data } = response;
    if (data[0]) {
      let arr = data.map((row) => ({
        value: row.id,
        text: row.text,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
    setLoading(false);
  };
  const validateHandler = (values) => {
    let obj = {
      label: values.label,
      company: values.name,
      pan: values.pan,
      gstin: values.gstin,
      state: values.state,
      address: values.address,
    };
    setSubmitConfirmModal(obj);
  };
  const submitHandler = async () => {
    if (submitConfirmModal) {
      setLoading("submit");
      const response = await imsAxios.post(
        "/shippingAddress/saveShippingAddress",
        submitConfirmModal
      );
      setLoading(false);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          resetHandler();
          setSubmitConfirmModal(false);
          getRows();
        } else {
          toast.error(data.message.msg);
        }
      }
    }
  };
  const resetHandler = () => {
    const obj = {
      label: "",
      name: "",
      pan: "",
      gstin: "",
      state: "",
      address: "",
    };
    addShippingAddressForm.setFieldsValue(obj);
  };
  return (
    <CustomFieldBox title="Add Shipping Address" subtitle="Add a new shipping Address">
      <SubmitConfirmModal
        open={submitConfirmModal}
        handleCancel={() => setSubmitConfirmModal(false)}
        loading={loading === "submit"}
        submitHandler={submitHandler}
      />
      <Form
        onFinish={validateHandler}
        form={addShippingAddressForm}
        layout="vertical"
      >
        <Row>
          <Col span={24}>
            <Form.Item
              label="Address label"
              name="label"
              rules={[
                {
                  required: true,
                  message: "Please enter a label!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Company Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please enter a company Name!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Pan No."
              name="pan"
              rules={[
                {
                  required: true,
                  message: "Please enter pan number!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="GSTIN"
              name="gstin"
              rules={[
                {
                  required: true,
                  message: "Please enter GST number!",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="State"
              name="state"
              rules={[
                {
                  required: true,
                  message: "Please Select state!",
                },
              ]}
            >
              <MyAsyncSelect
                loading={loading === "select"}
                loadOptions={getStateOptions}
                optionsState={asyncOptions}
                onBlur={() => setAsyncOptions([])}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Address"
              name="address"
              rules={[
                {
                  required: true,
                  message: "Please enter complete address!",
                },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Row justify="end">
              <Space>
                <CustomButton
                onclick={resetHandler}
                variant="outlined"
                title="Reset"
                endicon={renderIcon("ResetIcon")}
              />
                <MyButton variant="add" type="primary" htmlType="submit">
                  Save
                </MyButton>
                <CommonIcons
                  action="downloadButton"
                  onClick={handleCSVDownload}
                />
              </Space>
            </Row>
          </Col>
        </Row>
      </Form>
    </CustomFieldBox>
  );
}

export default AddShippingAddress;
