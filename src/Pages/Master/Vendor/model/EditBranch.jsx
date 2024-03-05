import React, { useEffect, useState } from "react";
import MySelect from "../../../../Components/MySelect";
import { toast } from "react-toastify";
import {
  Button,
  Modal,
  Row,
  Col,
  Input,
  Form,
  Skeleton,
  Switch,
  Space,
  InputNumber,
} from "antd";
import { imsAxios } from "../../../../axiosInterceptor";
import UploadDocs from "../../../Store/MaterialIn/MaterialInWithPO/UploadDocs";

const EditBranch = ({ fetchVendor, setEditVendor, editVendor }) => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(false);
  const [vendorStatus, setVendorStatus] = useState();
  const [statusLoading, setStatusLoading] = useState(false);
  const [tdsOptions, setTdsOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [files, setFiles] = useState([]);
  const [updateVendorForm] = Form.useForm();

  const getDetails = async () => {
    setSkeletonLoading(true);

    const { data: tdsData } = await imsAxios.get("/vendor/getAllTds");
    const { data: vendorData } = await imsAxios.post("/vendor/getVendor", {
      vendor_id: editVendor?.vendor_code,
    });
    setSkeletonLoading(false);
    let tdsArr = tdsData?.data.map((row) => {
      return { text: row.tds_name, value: row.tds_key };
    });

    let obj = {
      ...vendorData?.data[0],
    };
    updateVendorForm.setFieldsValue(obj);
    setVendorStatus(obj.vendor_status);
    setTdsOptions(tdsArr);
  };
  const submitHandler = async () => {
    const values = await updateVendorForm.validateFields();
    let obj = {
      vendorcode: editVendor?.vendor_code,
      vendorname: values?.vendor_name,
      panno: values?.vendor_pan,
      cinno: values?.vendor_cin,
      tally_tds: values.vendor_tds,
      vendor_loc: values.vendor_loc,
      term_days: values.vendor_term_days,
    };
    const formData = new FormData();
    formData.append("uploadfile", files[0] ?? []);
    formData.append("vendor", JSON.stringify(obj));
    // formData.append("vendorname", values?.vendor_name);
    // formData.append("panno", values?.vendor_pan);
    // formData.append("cinno", values?.vendor_cin);
    // formData.append("tally_tds", values?.vendor_tds);
    // formData.append("vendor_loc", values?.vendor_loc);
    setSubmitLoading(true);
    const { data } = await imsAxios.post("/vendor/updateVendor", formData);
    setSubmitLoading(false);
    if (data.code == 200) {
      toast.success(data.message);
      fetchVendor();
      setEditVendor(null);
    } else {
      toast.error(data.message.msg);
    }
  };
  const changeStatus = async (value) => {
    setStatusLoading(true);
    const { data } = await imsAxios.post("/vendor/updateVendorStatus", {
      status: value ? "B" : "A",
      vendor_code: editVendor?.vendor_code,
    });
    setStatusLoading(false);
    if (data.code == 200) {
      toast.success(data.message);
      if (value) {
        setVendorStatus("B");
      } else {
        setVendorStatus("A");
      }
    }
  };
  const getAllVendorLocationOptions = async () => {
    const { data } = await imsAxios.get("/vendor/getAllLocation");
    if (data.code === 200) {
      let arr = data.data.map((row) => ({
        text: row.loc_name,
        value: row.location_key,
      }));
      setLocationOptions(arr);
    } else {
      toast.error(data.message.msg);
      setLocationOptions([]);
    }
  };
  // useEffect(() => {
  //   if (editVendor) {
  //     name();
  //   }
  //   getAccount();
  // }, [editVendor]);

  useEffect(() => {
    if (editVendor) {
      getDetails();
      getAllVendorLocationOptions();
    }
  }, [editVendor]);

  return (
    <Modal
      title={`Update Vendor: ${editVendor?.vendor_code}`}
      open={editVendor}
      width={600}
      onCancel={() => setEditVendor(false)}
      footer={[
        <Row style={{ width: "100%" }} align="middle" justify="space-between">
          <Col>
            <Form style={{ padding: 0, margin: 0 }}>
              <Form.Item label="Active" style={{ padding: 0, margin: 0 }}>
                <Switch
                  loading={statusLoading}
                  checked={vendorStatus == "B"}
                  defaultChecked
                  onChange={changeStatus}
                />
              </Form.Item>
            </Form>
          </Col>
          <Col>
            <Space>
              <Button key="back" onClick={() => setEditVendor(false)}>
                Back
              </Button>

              <Button
                key="submit"
                type="primary"
                loading={submitLoading}
                onClick={submitHandler}
              >
                Submit
              </Button>
            </Space>
          </Col>
        </Row>,
      ]}
    >
      {<Skeleton active loading={skeletonLoading} />}
      {<Skeleton active loading={skeletonLoading} />}
      {!skeletonLoading && (
        <Form form={updateVendorForm} layout="vertical">
          <Row>
            {/* <Space> */}
            <Col span={24}>
              <Form.Item label="Vendor Name" name="vendor_name">
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Row gutter={8}>
                <Col span={8}>
                  <Form.Item label="Pan Number" name="vendor_pan">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="CIN Number" name="vendor_cin">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Due Date (in days)" name="vendor_term_days">
                    <InputNumber
                      style={{ width: "100%" }}
                      size="default"
                      min={1}
                      max={999}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            <Col span={24}>
              <Form.Item label="Vendor TDS" name="vendor_tds">
                <MySelect
                  // size="default"
                  mode="multiple"
                  // value={allDetails.vendor_tds}
                  // onChange={(value) => inputHandler("vendor_tds", value)}
                  options={tdsOptions}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Vendor Locations" name="vendor_loc">
                <MySelect
                  // size="default"
                  mode="multiple"
                  // value={allDetails.vendor_loc}
                  // onChange={(value) => inputHandler("vendor_loc", value)}
                  options={locationOptions}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Vendor Document" name="file">
                <Row className="material-in-upload">
                  <UploadDocs
                    // disable={poData?.materials?.length == 0}
                    setFiles={setFiles}
                    files={files}
                  />
                </Row>
              </Form.Item>
            </Col>
            {/* </Space> */}
          </Row>
        </Form>
      )}
    </Modal>
  );
};

export default EditBranch;
