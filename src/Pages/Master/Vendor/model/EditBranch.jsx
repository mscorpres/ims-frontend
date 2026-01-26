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
  Typography,
  Divider,
  Flex,
} from "antd";
import { imsAxios } from "../../../../axiosInterceptor";
import UploadDocs from "../../../Store/MaterialIn/MaterialInWithPO/UploadDocs";
import MyDataTable from "../../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import MyButton from "../../../../Components/MyButton";
import { v4 } from "uuid";
import SingleDatePicker from "../../../../Components/SingleDatePicker";

const EditBranch = ({ fetchVendor, setEditVendor, editVendor }) => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(false);
  const [vendorStatus, setVendorStatus] = useState();
  const [statusLoading, setStatusLoading] = useState(false);
  const [editMSME, setEditMSME] = useState([]);
  const [tdsOptions, setTdsOptions] = useState([]);
  // const [msmeStat, setMsmeStat] = useState("N");
  const [locationOptions, setLocationOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [files, setFiles] = useState([]);
  const [updateVendorForm] = Form.useForm();
  const [updateMSMEForm] = Form.useForm();
  const [isMSMEEdited, setIsMSMEEdited] = useState([]);
  const [msmeRow, setMsmeRows] = useState([]);
  const [add, isAdd] = useState(false);
  const einvoice = Form.useWatch("applicability", updateVendorForm);
  let msmeStat = "";
  msmeStat = Form.useWatch("vendor_msme_status", updateVendorForm);
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
      msmeStatus: vendorData.data.vendor_msme_status,
      year: vendorData.data.vendor_msme_year,
      msmeId: vendorData.data.vendor_msme_id,
      type: vendorData.data.vendor_msme_type,
      activity: vendorData.data.vendor_msme_activity,
      applicability: vendorData.data.eInvoice?.status,
      ...vendorData?.data[0],
    };
    updateVendorForm.setFieldsValue(obj);
    setVendorStatus(obj.vendor_status);
    setTdsOptions(tdsArr);
    let msmedata = vendorData.data;
    let a = msmedata[0]?.msme_data.map(
      (r, id) => {
        // if (r.year !== "--") {
        return {
          vendor_msme_year: r.year,
          vendor_msme_type: r.type,
          vendor_msme_activity: r.activity,
          id: v4(),
        };
      }
      // return;
    );

    setRows(a);
    setIsMSMEEdited(false);
    // let b = rows.map((a) => {
    //   return {
    //     b: a.activity,
    //   };
    // });
  };
  const submitHandler = async () => {
    let obj;
    const values = await updateVendorForm.validateFields();
    console.log("values", values);
    console.log("rows", rows);
    // return
    if (values.vendor_msme_status === "Y") {
      obj = {
        vendorcode: editVendor?.vendor_code,
        vendorname: values?.vendor_name,
        panno: values?.vendor_pan,
        cinno: values?.vendor_cin,
        tally_tds: values.vendor_tds,
        vendor_loc: values.vendor_loc,
        term_days: values.vendor_term_days,
        msme_status: values.vendor_msme_status,
        msme_year: rows.map((r) => r.vendor_msme_year),
        msme_id: values.vendor_msme_id,
        msme_type: rows.map((r) => r.vendor_msme_type),
        msme_activity: rows.map((r) => r.vendor_msme_activity),
        eInvoice: values.applicability,
        dateOfApplicability:
          values.applicability === "Y" ? values.dobApplicabilty : "--",
      };
    } else {
      obj = {
        vendorcode: editVendor?.vendor_code,
        vendorname: values?.vendor_name,
        panno: values?.vendor_pan,
        cinno: values?.vendor_cin,
        tally_tds: values.vendor_tds,
        vendor_loc: values.vendor_loc,
        term_days: values.vendor_term_days,
        msme_status: "N",
        msme_id: "--",
        eInvoice: values.applicability,
        dateOfApplicability:
          values.applicability === "Y" ? values.dobApplicabilty : "--",
      };
    }
    console.log("obj", obj);
    const formData = new FormData();
    formData.append("uploadfile", files[0] ?? []);
    formData.append("vendor", JSON.stringify(obj));
    // formData.append("vendorname", values?.vendor_name);
    // formData.append("panno", values?.vendor_pan);
    // formData.append("cinno", values?.vendor_cin);
    // formData.append("tally_tds", values?.vendor_tds);
    // formData.append("vendor_loc", values?.vendor_loc);
    setSubmitLoading(true);
    const  data  = await imsAxios.post("/vendor/updateVendor", formData);
    setSubmitLoading(false);
    if (data?.success) {
      toast.success(data.message);
      fetchVendor();
      setEditVendor(null);
    } else {
      toast.error(data.message);
    }
  };
  const changeStatus = async (value) => {
    setStatusLoading(true);
    const  data  = await imsAxios.post("/vendor/updateVendorStatus", {
      status: value ? "B" : "A",
      vendor_code: editVendor?.vendor_code,
    });
    setStatusLoading(false);
    if (data?.success) {
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
    { text: "2023-2024", value: "2023-2024" },
    { text: "2024-2025", value: "2024-2025" },
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
  // console.//console.log("isMSMEEdited", isMSMEEdited);

  const deleteRow = (id) => {
    // console.//console.log("aaaaaaaaaa", id);
    let newrows = rows.filter((a) => a.id !== id);
    setIsMSMEEdited(newrows);
    setRows(newrows);
  };
  const close = () => {
    setEditMSME(false);
    updateMSMEForm.resetFields();
  };
  useEffect(() => {
    if (rows) {
      setRows(rows);
    }
  }, [rows]);
  useEffect(() => {
    if (msmeStat == "N") {
      updateVendorForm.setFieldValue("vendor_msme_id", "--");
    } else {
    }
  }, [msmeStat]);

  const saveMSMEEntry = async () => {
    setEditMSME(false);
    const values = await updateMSMEForm.validateFields();
    let value;
    let a;
    let val;
    val = {
      id: v4(),
      vendor_msme_year: values.vendor_msme_year,
      vendor_msme_type: values.vendor_msme_type,
      vendor_msme_activity: values.vendor_msme_activity,
    };
    const found = rows.find(
      (row) => row.vendor_msme_year === val.vendor_msme_year
    );
    if (found) {
      let removerow = rows.filter(
        (r) => r.vendor_msme_year !== val.vendor_msme_year
      );
      value = [...removerow, val];
    } else {
      value = [...rows, val];
    }
    // });
    // if (a.vendor_msme_year == values.vendor_msme_year) {
    //   console.//console.log(" rows.year", rows.year, a);
    //   setIsMSMEEdited([val]);
    // } else {

    a = value.filter((b) => b.vendor_msme_year !== "--");
    // let newData = value.filter((r) => r.vendor_msme_year !== "--");
    setIsMSMEEdited(a);
    // rows.push
    setRows(a);
    updateMSMEForm.resetFields();

    // }
    // }
  };

  return (
    <>
      {" "}
      <Modal
        title={`Update Vendor: ${editVendor?.vendor_code}`}
        open={editVendor}
        width={700}
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
                    <Form.Item
                      label="Due Date (in days)"
                      name="vendor_term_days"
                    >
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
                    // mode="single"
                    // value={allDetails.vendor_loc}
                    // onChange={(value) => inputHandler("vendor_loc", value)}
                    options={locationOptions}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  style={{ padding: "3px" }}
                  label="E-Invoice Applicability"
                  name="applicability"
                  // rules={rules.applicability}
                >
                  <MySelect
                    options={msmeOptions}
                    // value={msmeStat}
                    // onChange={(value) => changeMSmeStatus(value)}
                  />
                </Form.Item>
              </Col>{" "}
              {einvoice === "Y" && (
                <Col span={8}>
                  {" "}
                  <Form.Item
                    style={{ padding: "3px" }}
                    label="Date of Applicability"
                    name="dobApplicabilty"
                    // rules={rules.dobApplicabilty}
                  >
                    <SingleDatePicker
                      size="default"
                      // setDate={setEffective}
                      setDate={(value) =>
                        updateVendorForm.setFieldValue("dobApplicabilty", value)
                      }
                    />
                  </Form.Item>
                </Col>
              )}
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
                  </Col>{" "}
                  <Col span={8}>
                    <Form.Item label="MSME Id" name="vendor_msme_id">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Row></Row>
                </Row>
              </Col>
              <Col span={24} style={{ height: "10rem" }}>
                <Flex vertical gap={10} align="center">
                  <MyButton
                    variant="add"
                    type="default"
                    text="Add MSME"
                    onClick={() => setEditMSME(true)}
                  ></MyButton>
                  {/* <Col span={24} gutter={[10, 10]}> */}
                  <Divider />
                  <Flex
                    gap={[10, 10]}
                    style={{ width: "100%" }}
                    justify="center"
                  >
                    {/* {isMSMEEdited?.map((a) => ( */}
                    <>
                      {" "}
                      <div style={{ width: 185 }}>
                        <Typography.Text strong>Year</Typography.Text>
                      </div>
                      <div style={{ width: 180 }}>
                        <Typography.Text strong>Type</Typography.Text>
                      </div>
                      <div style={{ width: 200 }}>
                        <Typography.Text strong>Activity</Typography.Text>
                      </div>
                      {/* <Col span={2}></Col> */}
                    </>
                    {/* ))} */}
                  </Flex>
                  {/* </Col>
                  <Col span={24} gutter={[10, 10]}> */}
                  {isMSMEEdited ? (
                    <Flex
                      gap={10}
                      style={{ width: "100%" }}
                      justify="center"
                      vertical
                    >
                      {isMSMEEdited.map((a) => (
                        <Flex key={a.id}>
                          {" "}
                          <div style={{ width: 40 }}></div>
                          <div style={{ width: 200 }}>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {a.vendor_msme_year}
                            </Typography.Text>
                          </div>
                          <div style={{ width: 180 }}>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {a.vendor_msme_type}
                            </Typography.Text>
                          </div>
                          <div style={{ width: 180 }}>
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {a.vendor_msme_activity}
                            </Typography.Text>
                          </div>
                          <div style={{ width: 40 }}>
                            {/* <MyButton
                              variant="edit"
                              text=""
                              size="small"
                              // shape="round"
                              onClick={() => setEditMSME(true)}
                            ></MyButton> */}
                          </div>
                          <div style={{ width: 40 }}>
                            <MyButton
                              variant="delete"
                              text=""
                              size="small"
                              // shape="round"

                              onClick={() => deleteRow(a.id)}
                            ></MyButton>
                          </div>
                        </Flex>
                      ))}
                      {/* {isMSMEEdited?.map((a) => ( */}

                      {/* ))} */}
                    </Flex>
                  ) : msmeStat == "Y" ? (
                    <Flex
                      gap={10}
                      style={{ width: "100%" }}
                      justify="center"
                      vertical
                    >
                      {rows.map((a) => (
                        <Flex>
                          {" "}
                          <div style={{ width: 40 }}></div>
                          <div style={{ width: 200 }}>
                            {" "}
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {a.vendor_msme_year}
                            </Typography.Text>
                          </div>
                          <div style={{ width: 180 }}>
                            {" "}
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {a.vendor_msme_type}
                            </Typography.Text>
                          </div>
                          <div style={{ width: 200 }}>
                            {" "}
                            <Typography.Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {a.vendor_msme_activity}
                            </Typography.Text>
                          </div>
                          <div span={2}>
                            {/* <MyButton
                              variant="edit"
                              text=""
                              size="small"
                              // shape="round"
                              onClick={() => setEditMSME(true)}
                            ></MyButton> */}
                          </div>
                          <div span={2}>
                            <div style={{ width: 40 }}>
                              <MyButton
                                variant="delete"
                                text=""
                                size="small"
                                // shape="round"

                                onClick={() => deleteRow(a.id)}
                              ></MyButton>
                            </div>
                          </div>
                          {/* <MyButton
                              variant="add"
                              type="secondary"
                              onClick={addRows}
                            ></MyButton> */}
                        </Flex>
                      ))}
                    </Flex>
                  ) : (
                    ""
                  )}
                  {/* </Col> */}
                </Flex>
              </Col>
              <Divider />
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
      <Modal
        title={`Addding MSME for ${editVendor?.vendor_code}`}
        open={editMSME == true || isMSMEEdited == true}
        width={600}
        height={600}
        onCancel={() => setEditMSME(false)}
        footer={[
          <Row style={{ width: "100%" }} align="middle" justify="space-between">
            <Divider />
            <Col>
              <Space>
                <Button key="back" onClick={close}>
                  Back
                </Button>

                <Button
                  key="submit"
                  type="primary"
                  loading={submitLoading}
                  onClick={saveMSMEEntry}
                >
                  Save
                </Button>
              </Space>
            </Col>
          </Row>,
        ]}
      >
        {" "}
        <Form
          form={updateMSMEForm}
          // initialValues={initialValues}
          layout="vertical"
        >
          {" "}
          <Divider />
          <Row gutter={[10, 10]}>
            {" "}
            <Col span={8}>
              <Form.Item
                label="MSME Year"
                name="vendor_msme_year"
                rules={[
                  {
                    required: true,
                    message: "Please select the Year",
                  },
                ]}
              >
                <MySelect options={msmeYearOptions} />
              </Form.Item>
            </Col>
            {/* <Col span={8}>
              <Form.Item label="Id" name="vendor_msme_id">
                <Input />
              </Form.Item>
            </Col> */}
            <Col span={8}>
              <Form.Item
                label="MSME Type"
                name="vendor_msme_type"
                rules={[
                  {
                    required: true,
                    message: "Please select the Type",
                  },
                ]}
              >
                <MySelect options={msmeTypeOptions} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="MSME Activity"
                name="vendor_msme_activity"
                rules={[
                  {
                    required: true,
                    message: "Please select the Activity",
                  },
                ]}
              >
                <MySelect options={msmeActivityOptions} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default EditBranch;
const initialValues = {
  vendor_msme_status: "N",
};
