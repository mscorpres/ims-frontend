import React, { useState, useEffect } from "react";
import { BsFillCloudArrowUpFill } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import { GrDocumentPdf } from "react-icons/gr";
import { AiOutlineFileWord } from "react-icons/ai";
import { v4 } from "uuid";
// import Loading from "./Loading";
import axios from "axios";
import { toast } from "react-toastify";
import printJS from "print-js";
import { AiFillPrinter } from "react-icons/ai";
import { Button, Col, Drawer, Row } from "antd";
import Dragger from "antd/lib/upload/Dragger";
import { InboxOutlined } from "@ant-design/icons";

export default function UploadDocs({
  showUploadDoc,
  setShowUploadDoc,
  files,
  setFiles,
  showExistingFiles,
  // poId,
}) {
  // const getExistingFiles = async () => {
  //   // console.log("showing");
  //   setLoading(true);
  //   setExistinFiles([]);
  //   if (showUploadDoc.poid && existingFiles) {
  //     // console.log(showUploadDoc.poid);
  //     const { data } = await imsAxios.post(
  //       "/purchaseOrder/fetchUploadedAttachment",
  //       {
  //         po_id: showUploadDoc.poid,
  //       }
  //     );
  //     // console.log(data);
  //     if (data.data) {
  //       console.log(data.data);
  //       setExistinFiles(data.data);
  //     } else {
  //       toast.error(data.message);
  //     }
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   if (showExistingFiles) {
  //     getExistingFiles();
  //   }
  // }, [showUploadDoc]);
  const props = {
    maxCount: 1,
    onRemove: (file) => {
      const index = files.indexOf(file);
      const newFileList = files.slice();
      newFileList.splice(index, 1);
      setFiles(newFileList);
    },
    beforeUpload: (file) => {
      setFiles((fs) => [...fs, file]);
      return false;
    },
    files,
  };
  console.log(showUploadDoc);
  return (
    <Drawer
      title={`Upload Docs`}
      width="35vw"
      placement="right"
      onClose={() => setShowUploadDoc(false)}
      open={showUploadDoc}
    >
      <div style={{ height: "95%" }}>
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
          <Button type="primary" onClick={() => setShowUploadDoc(false)}>
            Next
          </Button>
        </Col>
      </Row>
    </Drawer>
  );
}
