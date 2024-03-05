import { Button, Card, Col, Form, Input, Row } from "antd";
import React from "react";
import MyDataTable from "../../../Components/MyDataTable";
import { imsAxios } from "../../../axiosInterceptor";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

function QaProcess() {
  const [rows, setRows] = useState([]);
  const [form] = Form.useForm();
  const addRows = async (values) => {
    console.log("values",values)
    const data = await imsAxios.post("/qaProcessmaster/insert_Process", values);

    console.log("row Data", data);
    if (data.status === "200" || data.status === 200) {
      getRows();
    }
  };
  const getRows = async () => {
    const response = await imsAxios.get("/qaProcessmaster/fetch_Process");
    // console.log("datadata", data.data);
    if (response.status === "200" || response.status === 200) {
      const { data } = response.data;
      console.log("datadata", data);
      const arr = data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setRows(arr);
    }
  };
  const submitForm = async () => {
    const values = await form.validateFields();
    console.log("form value", values);
    addRows(values);
  };
  const columns = [
    {
      headerName: "Index",
      field: "index",
      width: 100,
    },
    {
      headerName: "Process Code",
      field: "process_code",
      flex: 1,
    },
    {
      headerName: "Process Name",
      field: "process_name",
      flex: 1,
    },
    {
      headerName: "Process Decsription",
      field: "process_desc",
      flex: 1,
    },
  ];
  useEffect(() => {
    getRows();
  }, []);

  return (
    <div>
      <Row gutter={10} span={24}>
        <Col span={8}>
          <Card>
            <Form form={form} size="small" layout="vertical">
              <Form.Item
                name="processName"
                label="Process Name"
                rules={rules.processName}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="processDesc"
                label="Process Description"
                rules={rules.processDesc}
              >
                <Input />
              </Form.Item>
            </Form>
            <Row justify="end">
              <Col span={4}>
                <Button>Reset</Button>
              </Col>
              <Col span={4}>
                <Button type="primary" onClick={submitForm}>
                  Submit
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col style={{ height: "100%" }} span={16}>
          {/* <div style={{ height: "15rem", marginTop: "20px" }}> */}
          <MyDataTable
            style={{ height: "80vh" }}
            columns={columns}
            data={rows}
          />
          {/* </div> */}
        </Col>
      </Row>
    </div>
  );
}

export default QaProcess;

const rules = {
  processName: [
    {
      required: true,
      message: "Process Name is required",
    },
  ],
  processDesc: [
    {
      required: true,
      message: "Process description is required",
    },
  ],
};
