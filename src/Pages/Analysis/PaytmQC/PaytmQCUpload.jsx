import React, { useState, useEffect } from "react";
import { Button, Col, Drawer, Form, Modal, Row } from "antd";
import Dragger from "antd/lib/upload/Dragger";
import { InboxOutlined } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { toast } from "react-toastify";

export default function PaytmQCUpload({ showUploadDoc, setShowUploadDoc }) {
  const [QCUploadFile, setQCUploadFile] = useState([]);
  const [uploadDate, setUploadDate] = useState("");
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const props = {
    maxCount: 1,
    showUploadList: QCUploadFile.length > 0,
    onRemove: (file) => {
      const index = QCUploadFile.indexOf(file);
      const newFileList = QCUploadFile.slice();
      newFileList.splice(index, 1);
      setQCUploadFile(newFileList);
    },
    beforeUpload: (file) => {
      setQCUploadFile((fs) => [...fs, file]);
      return false;
    },

    QCUploadFile,
  };
  const updateFunction = async () => {
    let formData = new FormData();
    formData.append("file", QCUploadFile[0]);
    formData.append("date", uploadDate);
    setSubmitLoading(true);
    const { data } = await imsAxios.post("/paytmQc/uploadFile", formData);
    setSubmitLoading(false);
    if (data.code === 200) {
      toast.success(data.message);
      setShowSubmitConfirm(false);
      setShowUploadDoc(false);
    } else {
      toast.error(data.message.msg);
    }
  };
  useEffect(() => {
    setQCUploadFile([]);
  }, [showUploadDoc]);
  return (
    <Drawer
      title="Upload QC File"
      width="35vw"
      placement="right"
      onClose={() => setShowUploadDoc(false)}
      open={showUploadDoc}
    >
      <Modal
        title="Confirm Upload!"
        open={showSubmitConfirm}
        onCancel={() => setShowSubmitConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowSubmitConfirm(false)}>
            No
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={updateFunction}
          >
            Yes
          </Button>,
        ]}
      >
        <p>Are you sure you want to Upload Paytm QC file?</p>
      </Modal>
      <div style={{ height: "95%" }}>
        <Row>
          <Form style={{ margin: 0, padding: 0 }}>
            <Form.Item
              label="QC Date"
              style={{ marginBottom: 10, marginTop: -15 }}
            >
              <SingleDatePicker setDate={setUploadDate} />
            </Form.Item>
          </Form>
        </Row>
        <div style={{ height: 250 }}>
          <Dragger {...props}>
            <p>
              <InboxOutlined style={{ fontSize: 100, color: "lightgray" }} />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
          </Dragger>
        </div>
      </div>
      <Row justify="end">
        <Col>
          <Button
            disabled={QCUploadFile.length == 0}
            type="primary"
            onClick={() => setShowSubmitConfirm(true)}
          >
            Upload
          </Button>
        </Col>
      </Row>
    </Drawer>
  );
}
