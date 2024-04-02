import { Button, Card, Col, Form, Input, Modal, Row } from "antd";
import React, { useEffect, useState } from "react";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import MySelect from "../../../Components/MySelect";
import MyDataTable from "../../../Components/MyDataTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import useApi from "../../../hooks/useApi";
import { getVendorOptions } from "../../../api/general";
function RegisteredUser() {
  const [user] = Form.useForm();
  const [searchInput, setSearchInput] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [asyncOption, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const [form] = Form.useForm();
  const getcompany = async (searchInput) => {
    const response = await imsAxios.post("/backend/companyList", {
      search: searchInput,
    });
    console.log("response", response);
    let { data } = response;
    let arr = [];
    if (response.status === 200) {
      arr = data.map((r) => {
        return {
          text: r.text,
          value: r.id,
        };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  let options = [
    { text: "Vendor", value: "vendor" },
    { text: "IMS", value: "ims" },
  ];
  let verificationsoptions = [
    { text: "Mobile Verified", value: "M" },
    { text: "Email Verified", value: "E" },
    { text: "Not Verified", value: "0" },
    { text: "All Verified", value: "1" },
  ];
  const handleFetchVendorOptiions = async (search) => {
    setAsyncOptions(false);
    const response = await executeFun(
      () => getVendorOptions(search),
      "vendorSelect"
    );
    let arr = [];
    if (response.success) {
      arr = response.data.data.map((row) => ({
        value: row.id,
        text: row.text,
      }));
    }

    setAsyncOptions(arr);
  };
  const getRows = async () => {
    setRows([]);
    const response = await imsAxios.post("auth/signup/fetch");
    // console.log("response", response);
    let arr = [];
    let { data } = response;
    if (data.code === 200) {
      arr = data.data.map((r, index) => {
        return { ...r, id: index + 1 };
      });
      setRows(arr);
    } else {
      toast.error(data.message.msg);
    }
  };
  useEffect(() => {
    getRows();
  }, []);
  const handleEvent = (row) => {
    form.setFieldsValue(row);
  };
  const modalConfirm = (finalObj) => {
    Modal.confirm({
      title: "Are you sure you want to verify this user?",
      onOk() {
        submitHandler(finalObj);
      },
      onCancel() {},
    });
  };
  const modalReject = (finalObj) => {
    Modal.confirm({
      title: "Are you sure you want to Reject this user?",
      icon: <ExclamationCircleOutlined />,
      onOk() {
        submitRejectHandler(finalObj);
      },
      onCancel() {},
    });
  };
  const submitRejectHandler = async (finalObj) => {
    setLoading(true);
    const response = await imsAxios.delete(
      `/auth/signup/reject/${finalObj.custid}`
    );
    const { data } = response;
    if (data.code == 200) {
      toast.success(data.message);
      setLoading(false);
      getRows();
    } else {
      toast.error(data.message);
    }

    setLoading(false);
  };
  const submitHandler = async (finalObj) => {
    setLoading(true);
    const response = await imsAxios.post(
      `/auth/signup/approve/${finalObj.custid}`,
      {
        company: finalObj.company.value,
        username: finalObj.username,
        email: finalObj.email,
        mobile: finalObj.mobile,
        verification: finalObj.verificationStatus,
        project: finalObj.vendor,
        vendor: finalObj.vendor === "vendor" ? finalObj.vendorCode.value : "--",
      }
    );
    const { data } = response;
    if (data.code == 200) {
      toast.success(data.message);
      setLoading(false);
      form.resetFields();
      getRows();
    } else {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };
  const submitVerify = async () => {
    const values = await form.validateFields();
    modalConfirm(values);
  };
  const columns = [
    {
      headerName: "",
      field: "actions",
      width: 10,
      type: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          showInMenu
          // disabled={loading}
          onClick={() => {
            handleEvent(row);
          }}
          label="Verify"
        />,
        <GridActionsCellItem
          showInMenu
          // disabled={loading}
          onClick={() => {
            modalReject(row);
          }}
          label="Reject"
        />,
      ],
    },
    // { field: "id", headerName: "S.No.", width: 60 },
    {
      field: "username",
      headerName: "Username No.",
      width: 180,
    },
    {
      field: "email",
      headerName: "Email",
      width: 250,
    },
    { field: "mobile", headerName: "Mobile", width: 150 },
    { field: "custid", headerName: "Customer Id", width: 150 },
    { field: "regDtTm", headerName: "Registered On", width: 200 },
  ];
  return (
    <div>
      <Row style={{ height: "100%" }} span={24} gutter={[10, 10]}>
        <Col span={8}>
          <Card title="Registered" style={{ marginLeft: "10px" }}>
            <Form layout="vertical" form={form}>
              <Row gutter={[10, 10]} style={{ marginLeft: "2px" }}>
                <Col span={24}>
                  <Form.Item
                    label="Company"
                    name="company"
                    rules={[
                      {
                        required: true,
                        message: "Please add Company",
                      },
                    ]}
                  >
                    <MyAsyncSelect
                      loadOptions={getcompany}
                      optionsState={asyncOption}
                      labelInValue
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Type"
                    name="vendor"
                    rules={[
                      {
                        required: true,
                        message: "Please add Vendor",
                      },
                    ]}
                  >
                    <MySelect
                      options={options}
                      value={selectedVendor}
                      onChange={(value) => setSelectedVendor(value)}
                    />
                  </Form.Item>
                </Col>
                {selectedVendor === "vendor" && (
                  <Col span={12}>
                    <Form.Item label="Vendor Code" name="vendorCode">
                      <MyAsyncSelect
                        labelInValue={true}
                        optionsState={asyncOption}
                        loadOptions={handleFetchVendorOptiions}
                        selectLoading={loading1("vendorSelect")}
                        onBlur={() => setAsyncOptions([])}
                      />
                    </Form.Item>
                  </Col>
                )}

                <Col span={12}>
                  <Form.Item
                    label="Username"
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: "Please add Username",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Please add Email",
                      },
                    ]}
                  >
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
                        message: "Please add Mobile",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="CUS. Id"
                    name="custid"
                    rules={[
                      {
                        required: true,
                        message: "Please add Customer Id",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Verification Status"
                    name="verificationStatus"
                    rules={[
                      {
                        required: true,
                        message: "Please add Verification Status",
                      },
                    ]}
                  >
                    <MySelect
                      options={verificationsoptions}
                      // value={selectedVendor}
                      // onChange={(value) => setSelectedVendor(value)}
                    />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Row justify="end">
                    <Button type="secondary">Reset</Button>
                    <Button type="primary" onClick={submitVerify}>
                      Save
                    </Button>
                  </Row>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={16}>
          <div style={{ height: "85vh" }}>
            <MyDataTable columns={columns} data={rows} loading={loading} />
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default RegisteredUser;
