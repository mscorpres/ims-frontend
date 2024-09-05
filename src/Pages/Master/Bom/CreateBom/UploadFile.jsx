import { Form, Upload } from "antd";
import React from "react";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";

const UploadFile = ({ rules }) => {
  const props = {
    name: "file",
    multiple: false,

    maxCount: 1,

    beforeUpload(file) {
      return false;
    },
  };
  const normFile = (e) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e.files[0].originFileObj;
    }
    return e?.fileList;
  };
  return (
    <Form.Item label="Upload">
      <Form.Item
        name="files"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        rules={rules}
        noStyle
      >
        <Upload.Dragger name="files" {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
        </Upload.Dragger>
      </Form.Item>
    </Form.Item>
  );
};

export default UploadFile;
