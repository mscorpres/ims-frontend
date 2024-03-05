import { Button, Col, Drawer, Form, Input, Row } from "antd";
import TextArea from "antd/lib/input/TextArea";
import axios from "axios";
import React, { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";

export default function EditTDSMoal({ editingTDS, setEditingTDS, getTDSList }) {
  const [ledgerOption, setLedgerOption] = useState(null);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [tdsData, setTdsData] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const inputHandler = (name, value) => {
    setTdsData((editingTDS) => {
      return {
        ...editingTDS,
        [name]: value,
      };
    });
  };
  const updateTDS = async () => {
    const {
      ladger_name,
      ledger,
      tds_code,
      desc,
      tds_key,
      gl_key,
      name,
      percentage,
    } = tdsData;
    // setLoading(true);
    const { data } = await imsAxios.post(
      "/tally/tds/update_new_nature_of_tds",
      {
        code: tds_code,
        name: name,
        description: desc,
        percentage: +percentage,
        ledger: gl_key,
        tds_key: tds_key,
      }
    );
    setLoading(false);
    if (data.code == 200) {
      toast.success(data.message.msg);
      setEditingTDS(null);
      getTDSList();
    } else {
      for (const key in data.message) {
        toast.error(data.message[key][0]);
      }
    }
  };
  const getGLCodes = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/tds/tds_ledger_options", {
      search: search,
    });
    setSelectLoading(false);
    if (data.code === 200) {
      const arr = data.data.map((row) => {
        return {
          text: row.text,
          value: row.id,
        };
      });
      setAsyncOptions(arr);
    }
  };
  useEffect(() => {
    setEditingTDS((editingTDS) => {
      return { ...editingTDS, ledger: { label: editingTDS?.name } };
    });
  }, []);
  useEffect(() => {
    setTdsData(editingTDS);
  }, [editingTDS]);
  return (
    <Drawer
      title={`Update TDS:  ${editingTDS?.name}`}
      width="40vw"
      extra={
        <Button loading={loading} type="primary" onClick={updateTDS}>
          Submit
        </Button>
      }
      placement="left"
      onClose={() => setEditingTDS(null)}
      open={editingTDS}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TDS Name
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please Enter TDS Name!",
                },
              ]}
            >
              <Input
                size="default"
                value={tdsData?.name}
                onChange={(e) => inputHandler("name", e.target.value)}
                placeholder="Enter New TDS Name.."
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TDS Code
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please Enter a TDS Code!",
                },
              ]}
            >
              <Input
                size="default"
                value={tdsData?.tds_code}
                onChange={(e) => inputHandler("tds_code", e.target.value)}
                placeholder="Enter New TDS Code.."
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TDS Description
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please Enter a TDS Description!",
                },
              ]}
            >
              <TextArea
                rows={4}
                style={{ resize: "none" }}
                size="default"
                value={tdsData?.desc}
                onChange={(e) => inputHandler("desc", e.target.value)}
                placeholder="Enter a TDS Desctiption.."
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  TDS Percentage
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please EnterT DS Percentage!",
                },
              ]}
            >
              <Input
                size="default"
                value={tdsData?.percentage}
                onChange={(e) => {
                  inputHandler("percentage", e.target.value);
                }}
                placeholder="Enter Percentage..."
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={24}>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  G/L
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please select G/L!",
                },
              ]}
            >
              <MyAsyncSelect
                size="default"
                onBlur={() => setAsyncOptions([])}
                optionsState={asyncOptions}
                value={tdsData?.gl_code}
                onChange={(value) => {
                  setLedgerOption(value);
                }}
                selectLoading={selectLoading}
                loadOptions={getGLCodes}
                placeholder="Select ax G/L"
                defaultOptions
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Drawer>
  );
}
