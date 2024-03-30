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
  // const [msmeStat, setMsmeStat] = useState("N");
  const [locationOptions, setLocationOptions] = useState([]);
  const [files, setFiles] = useState([]);
  const [updateVendorForm] = Form.useForm();
  const msmeStat = Form.useWatch("vendor_msme_status", updateVendorForm);
  // console.log("msmeStat here", msmeStat);/
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
    // console.log("vendorData", vendorData);
    let obj = {
      msmeStatus: vendorData.data.vendor_msme_status,
      year: vendorData.data.vendor_msme_year,
      msmeId: vendorData.data.vendor_msme_id,
      type: vendorData.data.vendor_msme_type,
      activity: vendorData.data.vendor_msme_activity,
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
      msme_status: values.vendor_msme_status,
      msme_year: values.vendor_msme_year,
      msme_id: values.vendor_msme_id,
      msme_type: values.vendor_msme_type,
      msme_activity: values.vendor_msme_activity,
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
  const msmeOptions = [
    { text: "Yes", value: "Y" },
    { text: "No", value: "N" },
  ];
  const msmeYearOptions = [
    { text: "2023 -2024", value: "2023 -2024" },
    { text: "2024 -2025", value: "2024 -2025" },
  ];
  const msmeTypeOptions = [
    { text: "Micro", value: "Micro" },
    { text: "Small", value: "Small" },
    { text: "Medium", value: "Medium" },
  ];
  const msmeActivityOptions = [
    { text: "Manufacturing", value: "Manufacturing" },
    { text: "Service", value: "Service" },
    { text: "Trading", value: "Trading" },
  ];

  // console.log("msmeStat", msmeStat);
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
        <Form
          form={updateVendorForm}
          // initialValues={initialValues}
          layout="vertical"
        >
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
              <Row gutter={[10, 10]}>
                <Col span={8}>
                  <Form.Item label="MSME Status" name="vendor_msme_status">
                    <MySelect
                      options={msmeOptions}
                      // value={msmeStat}
                      // onChange={setMsmeStat}
                    />
                  </Form.Item>
                </Col>
                {msmeStat === "Y" && (
                  <>
                    <Col span={8}>
                      <Form.Item label="Year" name="vendor_msme_year">
                        <MySelect options={msmeYearOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Id" name="vendor_msme_id">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Type" name="vendor_msme_type">
                        <MySelect options={msmeTypeOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Activity" name="vendor_msme_activity">
                        <MySelect options={msmeActivityOptions} />
                      </Form.Item>
                    </Col>
                  </>
                )}
              </Row>
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
const initialValues = {
  vendor_msme_status: "N",
};
