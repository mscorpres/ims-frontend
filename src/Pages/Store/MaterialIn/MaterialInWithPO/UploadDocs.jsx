import React from "react";
import { Button, Drawer, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";

export default function UploadDocs({
  files,
  setFiles,
  disable,
  size,
  names,
  type,
}) {
  console.log("files, setFiles, disable, size ", files, names);
  const props = {
    maxCount: 2,
    name: "name",
    showUploadList: files.length > 0,
    onRemove: (file) => {
      const index = files.indexOf(file);
      const newFileList = files.slice();
      newFileList.splice(index, 1);
      setFiles(newFileList);
    },
    beforeUpload: (file) => {
      setFiles([file]);
      return false;
    },
    files,
  };

  return (
    <>
      <Upload {...props}>
        <Button
          disabled={disable}
          type={type && "primary"}
          size={size && "large"}
          style={{ marginRight: size === "large" && 20 }}
          icon={<UploadOutlined />}
        >
          Upload File
        </Button>
      </Upload>
    </>
  );
}
