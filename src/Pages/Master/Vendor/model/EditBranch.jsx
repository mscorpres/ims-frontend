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
import MyButton from "../../../../Components/MyButton";
import { v4 } from "uuid";
import dayjs from "dayjs";
import SingleDatePicker from "../../../../Components/SingleDatePicker";

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
const transactionTypeOptions = [
  { text: "Cheque", value: "cheque" },
  { text: "e-Fund Transfer", value: "transfer" },
  { text: "UPI", value: "upi" },
  { text: "Other", value: "other" },
  { text: "N/A", value: "na" },
];

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
  const [groupOptions, setGroupOptions] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const transactionType = Form.useWatch("transactionType", updateVendorForm);
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
    const vendor = Array.isArray(vendorData?.data)
      ? vendorData.data[0]
      : vendorData?.data;

    // Normalize MSME effective-from: API may send ISO (YYYY-MM-DD), DD-MM-YYYY, or "--".
    // SingleDatePicker expects DD-MM-YYYY, so parse with dayjs and pass a dayjs object
    // to avoid "Invalid Date" when the format doesn't match.
    const rawMsmeFrom = vendor?.msme_effective_from;
    const hasValidMsmeDate =
      rawMsmeFrom && rawMsmeFrom !== "--" && String(rawMsmeFrom).trim() !== "";
    const parsedMsmeFrom = hasValidMsmeDate ? dayjs(rawMsmeFrom) : null;
    const msmeEffectiveFrom = parsedMsmeFrom?.isValid()
      ? parsedMsmeFrom
      : undefined;
    let obj = {
      msmeStatus: vendor?.vendor_msme_status,
      year: vendor?.vendor_msme_year,
      msmeId: vendor?.vendor_msme_id,
      type: vendor?.vendor_msme_type,
      activity: vendor?.vendor_msme_activity,
      group: vendor?.group,
      transactionType: vendor?.transaction_type,
      accountNo: vendor?.account_no,
      ifsCode: vendor?.ifs_code,
      bankName: vendor?.bank_name,
      bankBranch: vendor?.bank_branch,
      ledgerCurrency: vendor?.ledger_currency,
      msmeEffectiveFrom,
      ...vendor,
      applicability: vendor?.eInvoice?.status ?? vendor?.applicability,
      dobApplicabilty: vendor?.eInvoice?.date ?? vendor?.dobApplicabilty,
    };
    updateVendorForm.setFieldsValue(obj);
    setVendorStatus(obj.vendor_status);
    setTdsOptions(tdsArr);
    let a =
      vendor?.msme_data?.map((r) => ({
        vendor_msme_year: r.year,
        vendor_msme_type: r.type,
        vendor_msme_activity: r.activity,
        id: v4(),
      })) ?? [];

    setRows(a);
    setIsMSMEEdited(false);
    // let b = rows.map((a) => {
    //   return {
    //     b: a.activity,
    //   };
    // });
  };

  useEffect(() => {
    if (transactionType === "na") {
      updateVendorForm.setFieldValue("accountNo", "N/A");
      updateVendorForm.setFieldValue("ifsCode", "N/A");
      updateVendorForm.setFieldValue("bankName", "N/A");
      updateVendorForm.setFieldValue("bankBranch", "N/A");
      updateVendorForm.setFieldValue("ledgerCurrency", "N/A");
    } else if (transactionType !== undefined && transactionType !== "") {
      updateVendorForm.setFieldValue(
        "accountNo",
        updateVendorForm.getFieldsValue().accountNo,
      );
      updateVendorForm.setFieldValue(
        "ifsCode",
        updateVendorForm.getFieldsValue().ifsCode,
      );
      updateVendorForm.setFieldValue(
        "bankName",
        updateVendorForm.getFieldsValue().bankName,
      );
      updateVendorForm.setFieldValue(
        "bankBranch",
        updateVendorForm.getFieldsValue().bankBranch,
      );
      updateVendorForm.setFieldValue(
        "ledgerCurrency",
        updateVendorForm.getFieldsValue().ledgerCurrency,
      );
      updateVendorForm.setFieldValue(
        "bankBranch",
        updateVendorForm.getFieldsValue().bank_branch,
      );
    }
  }, [transactionType]);
  const formatMsmeEffectiveFrom = (val) => {
    if (!val) return "--";
    return dayjs.isDayjs(val) ? val.format("DD-MM-YYYY") : val;
  };

  const submitHandler = async () => {
    let obj;
    const values = await updateVendorForm.validateFields();

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
        group: values.group,
        transaction_type: values.transactionType,
        account_no: values.accountNo,
        ifs_code: values.ifsCode,
        bank_name: values.bankName,
        bank_branch: values.bankBranch,
        ledger_currency: values.ledgerCurrency,
        msme_effective_from: formatMsmeEffectiveFrom(values.msmeEffectiveFrom),
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
        group: values.group,
        transaction_type: values.transactionType,
        account_no: values.accountNo,
        ifs_code: values.ifsCode,
        bank_name: values.bankName,
        bank_branch: values.bankBranch,
        ledger_currency: values.ledgerCurrency,
        msme_effective_from: formatMsmeEffectiveFrom(values.msmeEffectiveFrom),
      };
    }

    const formData = new FormData();
    formData.append("uploadfile", files[0] ?? []);
    formData.append("vendor", JSON.stringify(obj));
    // formData.append("vendorname", values?.vendor_name);
    // formData.append("panno", values?.vendor_pan);
    // formData.append("cinno", values?.vendor_cin);
    // formData.append("tally_tds", values?.vendor_tds);
    // formData.append("vendor_loc", values?.vendor_loc);
    setSubmitLoading(true);
    const data = await imsAxios.post("/vendor/updateVendor", formData);
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
    const data = await imsAxios.post("/vendor/updateVendorStatus", {
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

  const getGroupOptions = async () => {
    try {
      const response = await imsAxios.post("/groups/groupSelect2");
      const { data } = response;
      if (data?.code === 200) {
        const arr = data.data.map((row) => ({
          text: row.text,
          value: row.id,
        }));
        setGroupOptions(arr);
      } else if (data?.message?.msg) {
        toast.error(data.message.msg);
      }
    } catch (error) {
      setGroupOptions([]);
    }
  };

  const getCurrencies = async () => {
    try {
      const { data } = await imsAxios.get("/backend/fetchAllCurrecy");
      const arr =
        data?.data?.map((d) => ({
          text: d.currency_symbol,
          value: d.currency_id,
          notes: d.currency_notes,
        })) || [];
      setCurrencies(arr);
    } catch (error) {
      setCurrencies([]);
    }
  };

  useEffect(() => {
    if (editVendor) {
      getDetails();
      getAllVendorLocationOptions();
      getGroupOptions();
      getCurrencies();
    }
  }, [editVendor]);

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
      (row) => row.vendor_msme_year === val.vendor_msme_year,
    );
    if (found) {
      let removerow = rows.filter(
        (r) => r.vendor_msme_year !== val.vendor_msme_year,
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
              {/* <Col span={24}>
                <Row gutter={8}>
                  <Col span={8}>
                    <Form.Item label="Group" name="group">
                      <MySelect options={groupOptions} />
                    </Form.Item>
                  </Col>
                </Row>
              </Col> */}
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
                  <Col span={8}>
                    <Form.Item label="Effective From" name="msmeEffectiveFrom">
                      <SingleDatePicker
                        size="default"
                        setDate={(value) =>
                          updateVendorForm.setFieldValue(
                            "msmeEffectiveFrom",
                            value,
                          )
                        }
                        value={updateVendorForm.getFieldValue(
                          "msmeEffectiveFrom",
                        )}
                      />
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
                <Divider />
                <Row gutter={[10, 10]}>
                  <Col span={24}>
                    <Typography.Title level={5}>Bank Details</Typography.Title>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Transaction Type" name="transactionType">
                      <MySelect
                        options={transactionTypeOptions}
                        onChange={(value) =>
                          updateVendorForm.setFieldValue(
                            "transactionType",
                            value,
                          )
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="A/c No" name="accountNo">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="IFS Code" name="ifsCode">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Bank Name" name="bankName">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Bank Branch" name="bankBranch">
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Currency of Ledger" name="ledgerCurrency">
                      <MySelect options={currencies} />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Divider />
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
