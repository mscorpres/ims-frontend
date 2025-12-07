import React, { useEffect, useState } from "react";
import { Modal, Row, Col, Button, Switch, Form, Space, Input } from "antd";
import MySelect from "../../../Components/MySelect";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";

function EditClient({
  updatingClient,
  setUpdatingClient,
  getRows,
  addClientApi,
  setAddClientApi,
}) {
  const [updateClientForm] = Form.useForm();
  const [statusLoading, setStatusLoading] = useState(false);
  const [tdsOptions, setTdsOptions] = useState([]);
  const [tcsOptions, setTcsOptions] = useState([]);
  const [clientStatus, setClientStatus] = useState();

  // console.log(clientStatus);

  // const getMatchById = async () => {
  //   const { data: tdsData } = await imsAxios.get(
  //     "/vendor/getAllTds"
  //   );

  //   const { data: tcsData } = await imsAxios.get(
  //     "/tally/tcs/getAllTcs"
  //   );

  //   const { data: clientData } = await imsAxios.get(
  //     `/client/getClient?code=${updatingClient?.code}`
  //   );

  //   let tdsArr = tdsData?.data.map((row) => {
  //     return { text: row.text, value: row.id };
  //   });
  //   let tcsArr = tcsData?.data.map((row) => {
  //     return { text: row.text, value: row.id };
  //   });

  //   let obj = {
  //     ...clientData,
  //   };

  //   console.log(obj);
  //   updateClientForm.setFieldsValue(obj);

  //   setClientStatus(obj.status);
  //   setTdsOptions(tdsArr);
  //   setTcsOptions(tcsArr);
  // };

  // const changeStatus = async (value) => {
  //   setStatusLoading(true);
  //   const { data } = await imsAxios.post(
  //     "/vendor/updateVendorStatus",
  //     {
  //       status: value ? "B" : "A",
  //       vendor_code: editVendor?.vendor_code,
  //     }
  //   );
  //   setStatusLoading(false);
  //   if (data.code == 200) {
  //     toast.success(data.message);
  //     if (value) {
  //       setVendorStatus("B");
  //     } else {
  //       setVendorStatus("A");
  //     }
  //   }
  // };

  // const submitHandler = async () => {
  //   const values = await updateClientForm.validateFields();
  //   console.log(values);
  //   console.log(updatingClient?.code);
  //   // console.log(clientStatus);
  //   let obj = {
  //     code: updatingClient?.code,
  //     clientName: values?.name,
  //     email: values?.email,
  //     panNo: values?.panNo,
  //     mobileNo: values?.mobile,
  //     website: values?.website,
  //     salesPerson: values?.salePerson,
  //     status: clientStatus,
  //     tds: values?.tds,
  //     tcs: values?.tcs,
  //   };

  //   const { data } = await imsAxios.put(
  //     "/client/update",
  //     obj
  //   );
  //   if (data.code == 200) {
  //     getRows();
  //     setUpdatingClient(null);
  //     toast.success(data.message);
  //   }
  // };

  // const changeStatus = () => {
  //   setClientStatus(
  //     clientStatus == "active" ? "inactive" : "active"
  //   );
  //   toast.info(
  //     clientStatus == "active"
  //       ? "Status has been Inactive"
  //       : "Status has been Active"
  //   );
  // };

  const getMatchById = async () => {
    const { data } = await imsAxios.get(
      `/client/getClient?code=${updatingClient?.code}`
    );
    let obj = {
      ...data.data[0],
    };
    updateClientForm.setFieldsValue(obj);
    setClientStatus(obj.status);
    setAddClientApi(false);
  };

  const getAllTdsCall = async () => {
    const response = await imsAxios.get("/vendor/getAllTds");
    let { data } = response;
    let tdsArr = data?.data?.map((row) => {
      return { text: row.tds_name, value: row.tds_key };
    });
    setTdsOptions(tdsArr);
  };

  const getAllTcsCall = async () => {
    setTcsOptions([]);
    const { data } = await imsAxios.get("/tally/tcs/getAllTcs");
    console.log(data);

    let tcsArr = data?.map((row) => {
      return { text: row.tcsName, value: row.tcsKey };
    });
    console.log(tcsArr);
    setTcsOptions(tcsArr);
  };

  // const changeStatus = async (value) => {
  //   setStatusLoading(true);
  //   const { data } = await imsAxios.post(
  //     "/vendor/updateVendorStatus",
  //     {
  //       status: value ? "B" : "A",
  //       vendor_code: editVendor?.vendor_code,
  //     }
  //   );
  //   setStatusLoading(false);
  //   if (data.code == 200) {
  //     toast.success(data.message);
  //     if (value) {
  //       setVendorStatus("B");
  //     } else {
  //       setVendorStatus("A");
  //     }
  //   }
  // };

  const submitHandler = async () => {
    const values = await updateClientForm.validateFields();
    console.log(values);
    console.log(updatingClient?.code);
    // console.log(clientStatus);
    let obj = {
      code: updatingClient?.code,
      clientName: values?.name,
      email: values?.email,
      panNo: values?.panNo,
      mobileNo: values?.mobile,
      website: values?.website,
      salesPerson: values?.salePerson,
      status: clientStatus,
      tds: values?.tds,
      tcs: values?.tcs,
    };

    const res = await imsAxios.put("/client/update", obj);
    if (res?.success) {
      getRows();
      setUpdatingClient(null);
      toast.success(res?.message);
    }
  };

  const changeStatus = () => {
    setClientStatus(clientStatus == "active" ? "inactive" : "active");
    toast.info(
      clientStatus == "active"
        ? "Status has been Inactive"
        : "Status has been Active"
    );
  };

  useEffect(() => {
    if (addClientApi == true) {
      getAllTdsCall();
      getAllTcsCall();
      getMatchById();
    }
  }, [updatingClient, addClientApi]);

  return (
    <Modal
      title={`Update Client: ${updatingClient?.code}`}
      open={updatingClient}
      width={600}
      onCancel={() => setUpdatingClient(false)}
      footer={[
        <Row style={{ width: "100%" }} align="middle" justify="space-between">
          <Col>
            <Form style={{ padding: 0, margin: 0 }}>
              <Form.Item label="Active" style={{ padding: 0, margin: 0 }}>
                <Switch
                  // loading={statusLoading}
                  checked={clientStatus == "active"}
                  defaultChecked
                  onChange={changeStatus}
                />
              </Form.Item>
            </Form>
          </Col>
          <Col>
            <Space>
              <Button key="back" onClick={() => setUpdatingClient(false)}>
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
      <Form layout="vertical" form={updateClientForm}>
        <Row>
          {/* <Space> */}
          <Col span={24}>
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item label="Vendor Name" name="name">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Email" name="email">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item label="PAN Number" name="panNo">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Mobile"
                  name="mobile"
                  rules={[
                    {
                      required: true,
                      message: "Contact no must be add",
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={24}>
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item label="Sale Person" name="salePerson">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Website" name="website">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          {/* <Col span={24}></Col> */}
          {/* <Col span={24}>
            
          </Col> */}
          <Col span={24}>
            <Form.Item label="Client TDS" name="tds">
              <MySelect mode="multiple" options={tdsOptions} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Client TCS" name="tcs">
              <MySelect mode="multiple" options={tcsOptions} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default EditClient;
