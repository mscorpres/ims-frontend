import  { useEffect, useState } from "react";
import "../../../Master/Modal/modal.css";
import { Button, Row, Col, Input, Drawer, Form, Space } from "antd";
import { toast } from "react-toastify";
import MySelect from "../../../../Components/MySelect";
import { imsAxios } from "../../../../axiosInterceptor";

const { TextArea } = Input;

const AddClientBranch = ({ openBranch, setOpenBranch }) => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [countriesOptions, setCountriesOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(83);
  const [addBranchForm] = Form.useForm();

  const getCountries = async () => {
    const { data } = await imsAxios.get("/tally/backend/countries");
    if (data?.data?.[0]) {
      setCountriesOptions(
        data.data.map((row) => ({
          text: row.name,
          value: row.code,
        }))
      );
    }
  };
  const getState = async () => {
    const { data } = await imsAxios.get("/tally/backend/states");
    if (data?.data?.[0]) {
      setStateOptions(
        data.data.map((row) => ({
          text: row.name,
          value: row.code,
        }))
      );
    }
  };

//
const addBranch = async() => {
    const values = await addBranchForm.validateFields()
    const obj = {
        "clientCode" : openBranch?.vendor_code,
        "country": values.country,
        "state": values.state,
        "address": values.address,
        "city": values.city,
        "pinCode": values.pin,
        "phoneNo": values.mob,
        "gst": values.gst
    }

    try {
        setSubmitLoading(true);
        const res = await imsAxios.post("client/addbranch", obj);
        if (res?.success) {
          // fetchVendor();
          reset()
          toast.success(res.message?.msg  ?? res.message);
          setOpenBranch(false)
          // setShowAddVendorModal(false);
        } else {
          toast.error(res.message.msg ?? res.message);
        }
        } catch (error) {
          toast.error(error?.message || "Something went wrong");
        } finally {
          setSubmitLoading(false);
        }

}
  const reset = () => {
    addBranchForm.resetFields()
    setSelectedCountry(83);
  };
  useEffect(() => {
    getCountries();
    getState();
  }, []);
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
        initialValues={{ country: 83 }}
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
              <Form.Item label="Country" name="country" rules={[{ required: true, message: 'Please select Country!'}]}>
                <MySelect
                  options={countriesOptions}
                  size="default"
                  onChange={(value) => {
                    setSelectedCountry(value);
                    addBranchForm.setFieldValue("state", undefined);
                    value === 83 && getState();
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="State" name='state' rules={[{ required: true, message: 'Please select State!'}]}>
                {selectedCountry == 83 ? (
                  <MySelect options={stateOptions} size="default" />
                ) : (
                  <Input size="default" />
                )}
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
