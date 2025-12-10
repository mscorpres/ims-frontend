import {
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Switch,
  Space,
  Button,
} from "antd";
import React, { useEffect, useState } from "react";
import MySelect from "../../../Components/MySelect";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";

function EditBranchModel({ setBranchId, branchId, setBranchModal, allBranch }) {
  const [countries, setCountries] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [statusBranch, setStatusBranch] = useState();
  const [updateBranchForm] = Form.useForm();
  const [stateOptions, setStateOptions] = useState([]);
  const [country, setCountry] = useState("");
  updateBranchForm.setFieldsValue(branchId);
  console.log("branchid", branchId);
  let obj = {
    address: branchId?.address,
    addressID: branchId?.addressID,
    clientCode: branchId?.clientCode,
    gst: branchId?.gst,
    phoneNo: branchId?.phoneNo,
    pinCode: branchId?.pinCode,
    status: branchId?.status,
    country: {
      label: branchId?.country.name,
      value: branchId?.country.code,
    },
    city: branchId?.city.name,
    state: {
      value: branchId?.state.code,
      label: branchId?.state.name,
    },
    email: branchId?.email,
  };
  updateBranchForm.setFieldsValue(obj);

  const getCountryShow = async () => {
    setPageLoading(true);
    const { data } = await imsAxios.get("/tally/backend/countries");
    setPageLoading(false);
    let arr = [];
    if (data.data[0]) {
      arr = data.data.map((row) => ({
        text: row.name,
        value: row.code,
      }));
      setCountries(arr);
    }
  };

  const getState = async () => {
    setPageLoading(true);
    const { data } = await imsAxios.get("/tally/backend/states");
    setPageLoading(false);
    if (data.data[0]) {
      let arr = data.data.map((row) => ({
        text: row.name,
        value: row.code,
      }));
      setStateOptions(arr);
    }
  };

  const submitHandler = async () => {
    const values = await updateBranchForm.validateFields();

    let newobj = {
      address: values.address,
      addressID: branchId?.addressID,
      clientCode: branchId?.clientCode,
      gst: values?.gst,
      phoneNo: values?.phoneNo,
      pinCode: values?.pinCode,
      status: branchId?.status,
      // countryName: values?.country,
      country: values?.country.value,
      city: values?.city,
      state: values?.state.value,
      // stateName: values?.state,
      email: values?.email,
    };
    console.log("cointry", country);
    const response = await imsAxios.put("client/updateBranch", newobj);

    if (response?.success) {
      toast.success(response?.message);
      setBranchId(null);
      setBranchModal(false);
    } else if (!response?.success) {
      toast.error(response?.message);
      setBranchId(null);
      setBranchModal(false);
      setBranchModal(false);
    } else {
      setBranchId(null);
      setBranchModal(false);
    }
  };

  useEffect(() => {
    getCountryShow();
  }, [branchId]);
  useEffect(() => {
    getState();
  }, [countries]);

  const changeStatus = () => {
    setStatusBranch(statusBranch == "active" ? "inactive" : "active");
  };
  // useEffect(() => {
  //   const values = updateBranchForm.validateFields();
  //   console.log(values);
  //   if (values.country == "83") {
  //     console.log("first");
  //   }
  // }, [newobj.country]);

  useEffect(() => {
    setStatusBranch(branchId?.status);
  }, [branchId?.clientCode]);
  return (
    //  <Drawer
    //    title="Edit"
    //    placement="left"
    //    // centered
    //    // confirmLoading={submitLoading}
    //    open={branchId}
    //    onClose={() => setBranchId(false)}
    //    width="40vw"
    //  ></Drawer>
    <Modal
      title={`Update Branch: ${branchId?.addressID}`}
      open={branchId}
      // onOk={branchId}
      onCancel={() => setBranchId(null)}
      footer={[
        <Row style={{ width: "100%" }} align="middle" justify="space-between">
          <Col>
            <Form style={{ padding: 0, margin: 0 }}>
              <Form.Item label="Active" style={{ padding: 0, margin: 0 }}>
                <Switch
                  // loading={statusLoading}
                  checked={statusBranch == "active"}
                  // defaultChecked
                  onChange={changeStatus}
                />
              </Form.Item>
            </Form>
          </Col>
          <Col>
            <Space>
              <Button key="back" onClick={() => setBranchId(false)}>
                Back
              </Button>

              <Button
                key="submit"
                type="primary"
                // loading={submitLoading}
                onClick={submitHandler}
              >
                Submit
              </Button>
            </Space>
          </Col>
        </Row>,
      ]}
    >
      <Form layout="vertical" form={updateBranchForm}>
        <Row>
          <Col span={24}>
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item name="country" label="Country">
                  <MySelect options={countries} labelInValue />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="State" name="state">
                  <MySelect options={stateOptions} labelInValue />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item label="City" name="city">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="GST" name="gst">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col span={24}>
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item label="Pin" name="pinCode">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Phone" name="phoneNo">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Form.Item label="Email" name="email">
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Address" name="address">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default EditBranchModel;
