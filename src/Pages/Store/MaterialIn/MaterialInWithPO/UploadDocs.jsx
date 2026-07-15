import React from "react";
import { Button, Drawer, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export default function UploadDocs({ files, setFiles, disable, size }) {
  const props = {
    maxCount: 1,
    accept: "image/*,.pdf",
    showUploadList: files.length > 0,
    onRemove: (file) => {
      const index = files.indexOf(file);
      const newFileList = files.slice();
      newFileList.splice(index, 1);
      setFiles(newFileList);
    },
    beforeUpload: (file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Only image and PDF files are allowed");
        return Upload.LIST_IGNORE;
      }
      setFiles([file]);
      return false;
    },
    files,
  };

  return (
    <Upload {...props}>
      <Button
        disabled={disable}
        type="primary"
        size={size && "large"}
        style={{ marginRight: size === "large" && 20 }}
        icon={<UploadOutlined />}
      >
        Upload File
      </Button>
    </Upload>
  );
}
