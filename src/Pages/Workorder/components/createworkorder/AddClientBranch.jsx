import React, { useEffect, useState } from "react";
import "../../../Master/Modal/modal.css";
import { Button, Row, Col, Input, Drawer, Skeleton, Form, Space } from "antd";
import { toast } from "react-toastify";
import errorToast from "../../../../Components/errorToast";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../../axiosInterceptor";

const { TextArea } = Input;

const AddClientBranch = ({ openBranch, setOpenBranch }) => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [addBranchForm] = Form.useForm();
  
  const getFetchState = async (e) => {
    if (e.length > 1) {
      setSelectLoading(true);
      const { data } = await imsAxios.post("/backend/stateList", {
        search: e,
      });
      setSelectLoading(false);
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };
  
// 
const addBranch = async() => {
    const values = await addBranchForm.validateFields()
    console.log(values)
    const obj = {
        "clientCode" : openBranch?.vendor_code,
        "state": values.state,
        "address": values.address,
        "city": values.city,
        "pinCode": values.pin,
        "phoneNo": values.mob,
        "gst": values.gst
    }
    console.log(obj)
    try {
        setSubmitLoading(true);
        const { data } = await imsAxios.post("client/addbranch", obj);
        if (data.code == 200) {
          // fetchVendor();
          reset()
          toast.success(data.message);
          setOpenBranch(false)
          // setShowAddVendorModal(false);
        } else {
          toast.error(data.message.msg);
        }
        } catch (error) {
          toast.error(error)
        } finally {
          setSubmitLoading(false);
        }

}   
  const reset = () => {
    addBranchForm.resetFields()
  };
  useEffect(() => {
    reset();
  }, [openBranch]);
  return (
    <Drawer
      title={`Add Branch of Client: ${openBranch?.vendor_code}`}
      centered
      confirmLoading={submitLoading}
      open={openBranch}
      onClose={() => setOpenBranch(false)}
      width="50vw"
    >
      <Form
        style={{ marginTop: -10, height: "95%", overflowY: "auto" }}
        layout="vertical"
        size="small"
        form={addBranchForm}
      >
        <Row style={{ width: "100%" }}>
          <>
            {/* <Col span={12} style={{ padding: 3 }}>
              <Form.Item label="Branch Name">
                <Input
                  size="default "
                  // placeholder="Branch Name"
                  value={addBilling.branch.branchname}
                  onChange={(e) => inputHandler("branchname", e.target.value)}
                  // prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col> */}

            <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="State" name='state' rules={[{ required: true, message: 'Please select State!'}]}>
                <MyAsyncSelect
                  selectLoading={selectLoading}
                  optionsState={asyncOptions}
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={getFetchState}
                  onChange={(e) => addBranchForm.setFieldValue('state',e.value)}
                  labelInValue
                />
              </Form.Item>
            </Col>
            <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="City" name="city" rules={[{ required: true, message: 'Please Input City!'}]}>
                <Input
                  size="default "
                />
              </Form.Item>
            </Col>
            <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="GST Number" name='gst' rules={[{ required: true, message: 'Please Input GST Number!'}]}>
                <Input
                  size="default "
                />
              </Form.Item>
            </Col>
            <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="Pin Code" name='pin' rules={[{ required: true, message: 'Please Input Pin Code'}]}>
                <Input
                  size="default "
                />
              </Form.Item>
            </Col>
            {/* <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="Email">
                <Input
                  size="default "
                  // placeholder="Email"
                  value={addBilling.branch.email}
                  onChange={(e) => inputHandler("email", e.target.value)}
                  // prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col> */}
            <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="Mobile" name="mob" rules={[{ required: true, message: 'Please Input Mobile Number!'}]}>
                <Input
                  size="default "
                />
              </Form.Item>
            </Col>
            {/* <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="Fax Number">
                <Input
                  size="default "
                  // placeholder="Fax No"
                  value={addBilling.branch.fax}
                  onChange={(e) => inputHandler("fax", e.target.value)}
                  // prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col> */}
            <Col span={24} style={{ padding: "3px" }}>
              <Form.Item label="Branch Address" name="address" rules={[{ required: true, message: 'Please input branch Address'}]}>
                <TextArea
                  rows={4}
                  maxLength={200}
                />
              </Form.Item>
            </Col>
          </>
        </Row>
      </Form>
      <Row justify="end">
        <Space>
          <Button onClick={reset} size="default">
            Reset
          </Button>
          <Button
            size="default"
            type="primary"
            loading={submitLoading}
            onClick={addBranch}
          >
            Submit
          </Button>
        </Space>
      </Row>
    </Drawer>
  );
};

export default AddClientBranch;
