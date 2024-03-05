import { Button, Card, Col, Row, Space, Upload, message, Form } from "antd";
import React, { useState, useeffect } from "react";
import { BsFillCloudArrowUpFill } from "react-icons/bs";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import MyDataTable from "../../../Components/MyDataTable";
import { InboxOutlined } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import { useEffect } from "react";

function StockControl() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [uploadForm] = Form.useForm();

  ///change the smaple File
  const sampleData = [
    {
      PART_CODE: "P2044",
      SF_CTRL_QTY: "0",
    },
  ];
  const previewColumns = [
    { headerName: "#", field: "id", width: 30 },
    { headerName: "Component", field: "part_name", flex: 1 },
    { headerName: "PART Code", field: "part_no", width: 100 },
    { headerName: "SF Quantity", field: "sf_ctrl_qty", width: 100 },
  ];
  const previewRows = [];

  const displayDataTable = async () => {
    setLoading("fetch");
    const response = await imsAxios.get("/component/fetchSfCtrl");
    setLoading(false);

    const { data: newData } = response;
    if (newData.code === 200 || newData.code === "200") {
      let arr = newData.data.map((row, index) => ({
        ...row,
        id: index + 1,
      }));
      setRows(arr);
      console.log(rows);
    }
  };

  const submitFile = async () => {
    setLoading("submitting");
    const values = await uploadForm.validateFields();
    setLoading(false);

    const formData = new FormData();
    formData.append("file", values.dragger[0].originFileObj);

    const link = "/component/uploadSfCtrlFile";
    const response = await imsAxios.post(link, formData);

    const { data } = response;
    if (data) {
      if (data.code === 200 || data.code === "200") {
        // reset();
        toast.success(data.message);
        displayDataTable();
      }
    } else {
      toast.error(data.message.msg);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const reset = () => {
    uploadForm.resetFields();
  };

  const props = {
    name: "file",
    multiple: false,

    maxCount: 1,

    beforeUpload(file) {
      return false;
    },
  };

  useEffect(() => {
    displayDataTable();
  }, []);

  return (
    <div style={{ height: "90%" }}>
      <Row gutter={8} style={{ height: "100%", padding: "0 10px" }}>
        <Col span={10}>
          <Form initialValues={initialValues} form={uploadForm}>
            <Card size="small" title="Upload Stock Control Files">
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "5em 4em 5em 0em",

                  alignItems: "center",
                }}
              >
                <Form.Item>
                  <Form.Item
                    style={{ padding: "20px" }}
                    name="dragger"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    noStyle
                  >
                    <Upload.Dragger name="files" {...props}>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">
                        Click or drag file to this area to upload
                      </p>
                      <p className="ant-upload-hint">
                        Support for a single or bulk upload.
                      </p>
                    </Upload.Dragger>
                  </Form.Item>
                </Form.Item>
              </div>
            </Card>
          </Form>
          <Row justify="end">
            <Space style={{ marginTop: 10 }}>
              <Button loading={loading === "submitting"} onClick={reset}>
                Reset
              </Button>
              <Button
                loading={loading === "submitting"}
                type="primary"
                onClick={submitFile}
              >
                Submit
              </Button>
              <Button
                type="link"
                onClick={() =>
                  downloadCSVCustomColumns(sampleData, "Stock Control Sample")
                }
              >
                Download Sample File
              </Button>
            </Space>
          </Row>
        </Col>
        <Col
          span={14}
          style={{
            height: "93%",
            borderRadius: 5,
          }}
        >
          <MyDataTable
            loading={loading === "fetch"}
            columns={previewColumns}
            data={rows}
          ></MyDataTable>
        </Col>
      </Row>
    </div>
  );
}

export default StockControl;

const initialValues = {
  dragger: [],
};
