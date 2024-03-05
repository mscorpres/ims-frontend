import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Card, Col, Form, Input, Row, Space } from "antd";
import { toast } from "react-toastify";
import validateResponse from "../../../Components/validateResponse";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";

function AddLedger({ getLedgerList, options, statusOptions }) {
  const [newLedger, setNewLedger] = useState({
    name: "",
    code: "",
    sub_group: "",
    search_name: "--",
    gst: "yes",
    tds: "yes",
    status: "active",
    ledger_type: "L",
  });
  const [codeConfirmLoading, setCodeConfirmLoading] = useState(false);
  const [codeConfirmed, setCodeConfirmed] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);

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
  const ledgerTypeOptions = [
    { text: "Ledger", value: "L" },
    { text: "Cash", value: "CA" },
    { text: "Customer", value: "CU" },
    { text: "Bank", value: "B" },
  ];
  const inputHandler = (name, value) => {
    setNewLedger((newsubGroup) => {
      return { ...newLedger, [name]: value };
    });
  };
  const createLedger = async () => {
    const { gst, tds, status, sub_group, code, name } = newLedger;
    if (!name || name == "") {
      return toast.error("Please enter a Ledger Name");
    } else if (!code || code == "") {
      return toast.error("Please Enter a ledger Code");
    } else if (!sub_group || sub_group == "") {
      return toast.error("Please Select a Sub Group");
    } else if (!gst || gst == "") {
      return toast.error("Please Select GST Apply");
    } else if (!tds || tds == "") {
      return toast.error("Please Select TDS Apply");
    }
    setLoading(true);
    const { data } = await imsAxios.post("/tally/ledger/addLedger", {
      ...newLedger,
      sub_group: sub_group,
      gst: gst,
      tds: tds,
      status: status,
      type: newLedger.ledger_type,
    });
    setLoading(false);
    validateResponse(data);
    if (data.code == 200) {
      toast.success(data.message);
      getLedgerList();
      reset();
    }
  };
  const confirmCode = async () => {
    setCodeConfirmLoading(true);
    const { data } = await imsAxios.post("/tally/ledger/check_leadger_code", {
      code: newLedger.code,
    });
    setCodeConfirmLoading(false);
    if (data.code === 200) {
      if (data.data.exist) {
        setCodeConfirmed("exist");
      } else if (!data.data.exist) {
        setCodeConfirmed("not exist");
      }
    } else {
      setCodeConfirmed("exist");
      toast.error(data.message.msg);
    }
  };
  const reset = () => {
    setNewLedger({
      name: "",
      code: "",
      sub_group: "",
      search_name: "--",
      gst: "",
      tds: "",
      status: "active",
      ledger_type: "L ",
    });
  };
  return (
    <Card title="Add New Ledger" size="small">
      <Row gutter={10} span={24}>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Ledger Code
                </span>
              }
            >
              <Row>
                <Col span={3}>
                  <CommonIcons
                    onClick={confirmCode}
                    loading={codeConfirmLoading}
                    action={
                      codeConfirmed === "pending"
                        ? "searchButton"
                        : codeConfirmed === "not exist"
                        ? "checkButton"
                        : codeConfirmed === "exist" && "closeButton"
                    }
                    size="default"
                  />
                </Col>
                <Col span={21}>
                  <Input
                    size="default"
                    value={newLedger.code}
                    onChange={(e) => {
                      inputHandler("code", e.target.value);
                      setCodeConfirmed("pending");
                    }}
                    placeholder="Enter New Ledger Code.."
                  />
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Col>

        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Ledger Name
                </span>
              }
            >
              <Input
                size="default"
                value={newLedger.name}
                onChange={(e) => inputHandler("name", e.target.value)}
                placeholder="Enter New Ledger Name.."
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={10} span={24}>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
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
              <Input
                size="default"
                value={newLedger.search_name}
                onChange={(e) => inputHandler("search_name", e.target.value)}
                placeholder="Sub Group"
              />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
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
                value={newLedger.sub_group}
                onChange={(value) => {
                  inputHandler("sub_group", value);
                }}
                // defaultOptions
                loadOptions={getSubGroupSelect}
                optionsState={asyncOptions}
                placeholder="Select Sub Group..."
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={10} span={24}>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
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
              <MySelect
                options={options}
                value={newLedger.gst}
                onChange={(value) => {
                  inputHandler("gst", value);
                }}
              />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
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
              <MySelect
                value={newLedger.tds}
                onChange={(value) => {
                  inputHandler("tds", value);
                }}
                options={options}
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={10} span={24}>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
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
              <MySelect
                value={newLedger.status}
                onChange={(value) => {
                  inputHandler("status", value);
                }}
                options={statusOptions}
              />
            </Form.Item>
          </Form>
        </Col>
        <Col span={12}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Ledger Type
                </span>
              }
            >
              <MySelect
                value={newLedger?.ledger_type}
                onChange={(value) => {
                  inputHandler("ledger_type", value);
                }}
                options={ledgerTypeOptions}
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <Row justify="end">
        <Col>
          <Space align="center" style={{ height: "100%", paddingTop: 7 }}>
            <Button
              loading={loading}
              onClick={createLedger}
              disabled={codeConfirmed !== "not exist"}
              type="primary"
            >
              Save
            </Button>
            <Button onClick={reset} type="default">
              Reset
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
}

export default AddLedger;
