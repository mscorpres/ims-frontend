import { useState, useEffect } from "react";
import { Card, Col, Row, Form, Input, Space, Button } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import axios from "axios";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import errorToast from "../../../Components/errorToast";

function MapClient() {
  const [client, setClient] = useState("");
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [mapClientForm] = Form.useForm();
  const statusOptions = [
    { text: "ACTIVE", value: "active" },
    { text: "INACTIVE", value: "inactive" },
  ];
  const gstOptions = [
    { text: "YES", value: "yes" },
    { text: "NO", value: "no" },
  ];
  const getClients = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/backend/fetchCustmors", {
      search: search,
    });
    setSelectLoading(false);
    if (data[0]) {
      let arr = data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const getSubGroupSelect = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/getSubgroup", {
      search: search,
    });
    setSelectLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((d) => {
        return { text: d.label, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };
  const clientReset = () => {
    const obj = {
      code: client.value,
      name: client.label,
      search_name: "",
      sub_group: "",
      gst: "yes",
      tds: "yes",
      status: "active",
    };
    mapClientForm.setFieldsValue(obj);
    setClient("");
  };
  const submitHandler = async (values) => {
    setSubmitLoading(true);
    const { data } = await imsAxios.post("/tally/ledger/addCustLedger", {
      name: values.name,
      code: values.code,
      sub_group: values.sub_group,
      search_name: values.search_name,
      gst: values.gst,
      tds: values.tds,
      status: values.status,
    });
    setSubmitLoading(false);
    if (data.code === 200) {
      toast.success(data.message);
      clientReset();
    } else {
      toast.error(errorToast(data.message));
    }
  };

  useEffect(() => {
    if (client) {
      const obj = {
        code: client.value,
        name: client.label,
        search_name: "",
        sub_group: "",
        gst: "yes",
        tds: "yes",
        status: "active",
      };
      mapClientForm.setFieldsValue(obj);
    }
  }, [client]);
  return (
    <Card title="Map Customer" size="small">
      <Form onFinish={submitHandler} form={mapClientForm} layout="vertical">
        <Row gutter={10} span={24}>
          <Col span={12}>
            <Form.Item name="code" label=" Select Customer">
              <MyAsyncSelect
                selectLoading={selectLoading}
                labelInValue
                onBlur={() => setAsyncOptions([])}
                onChange={(value) => setClient(value)}
                loadOptions={getClients}
                optionsState={asyncOptions}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name"
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Customer Name
                </span>
              }
            >
              <Input size="default" placeholder="Enter New Vendor Name.." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={10} span={24}>
          <Col span={12}>
            <Form.Item
              name="search_name"
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Search Name
                </span>
              }
            >
              <Input size="default" placeholder="Sub Group" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="sub_group"
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Sub Group
                </span>
              }
            >
              <MyAsyncSelect
                selectLoading={selectLoading}
                onBlur={() => setAsyncOptions([])}
                loadOptions={getSubGroupSelect}
                optionsState={asyncOptions}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={10} span={24}>
          <Col span={12}>
            <Form.Item
              name="gst"
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  GST Apply
                </span>
              }
            >
              <MySelect options={gstOptions} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="tds"
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TDS Apply
                </span>
              }
            >
              <MySelect options={gstOptions} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={10} span={24}>
          <Col span={12}>
            <Form.Item
              name="status"
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Block Account
                </span>
              }
            >
              <MySelect options={statusOptions} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Space align="center" style={{ height: "100%", paddingTop: 7 }}>
              <Button
                size="default"
                loading={submitLoading}
                htmlType="submit"
                type="primary"
              >
                Save
              </Button>
              <Button
                size="default"
                onClick={clientReset}
                htmlType="button"
                type="default"
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}

export default MapClient;
