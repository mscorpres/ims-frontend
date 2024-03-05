import React, { useState, useEffect } from "react";
import { AiFillDelete } from "react-icons/ai";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import {
  Button,
  Drawer,
  Form,
  Input,
  Popconfirm,
  Space,
  List,
  Row,
  Col,
  Skeleton,
} from "antd";
import Dragger from "antd/lib/upload/Dragger";
import { InboxOutlined } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";

export default function UploadDoc({
  showUploadDocModal2,
  setShowUploadDocModal2,
}) {
  const [existingFiles, setExistinFiles] = useState([]);
  const [fileToBeDeleted, setFileToBeDeleted] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [showExistingFiles, setShowExistingFiles] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const getPoExistingDocuments = async () => {
    setLoading(true);
    if (showUploadDocModal2) {
      const { data } = await imsAxios.post(
        "/purchaseOrder/fetchUploadedAttachment",
        {
          po_id: showUploadDocModal2,
        }
      );
      setLoading(false);
      if (data.code == 200) {
        let arr = data.data.map((row) => {
          return {
            uid: row.doc_id,
            name: row.doc_name,
            // url: row.doc_url,
            status: "done",
          };
        });
        setExistinFiles(arr);
      } else {
        setExistinFiles([]);
      }
    }
  };

  // useEffect(() => {
  //   if (showExistingFiles) {
  //     getExistingFiles();
  //   }
  // }, [showUploadDoc]);
  const deleteFun = async (item) => {
    const { data } = await imsAxios.post(
      "/purchaseOrder/deleteUploadedAttachment",
      {
        doc_id: item?.uid,
        po_id: showUploadDocModal2,
      }
    );
    if (data.code == 200) {
      setFileToBeDeleted(null);
      toast.success(data.message);
      await getPoExistingDocuments(showUploadDocModal2?.poId);
    } else {
      toast.error(data.message.msg);
    }
  };
  const props = {
    multiple: false,
    maxCount: 1,
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    onRemove: (file) => {
      setFileList([]);
    },
    fileList,
  };
  const uploadFile = async () => {
    let formData = new FormData();
    formData.append("files", fileList[0]);
    formData.append("po_id", showUploadDocModal2);
    formData.append("doc_name", fileName);
    setUploadLoading(true);
    const { data } = await imsAxios.post(
      "/purchaseOrder/uploadAttachment",
      formData
    );
    setUploadLoading(false);
    if (data.code == 200) {
      toast.success(data.message);
      getPoExistingDocuments();
      setFileName("");
      setFileList([]);
    } else {
      toast.error(data.message.msg);
    }
  };
  useEffect(() => {
    if (!showUploadDocModal2) {
      setFileName("");
      setFileList([]);
    } else {
      getPoExistingDocuments();
    }
  }, [showUploadDocModal2]);
  return (
    <Drawer
      title={`Upload Document: ${showUploadDocModal2}`}
      width="35vw"
      placement="right"
      onClose={() => setShowUploadDocModal2(false)}
      open={showUploadDocModal2}
      extra={
        <Space>
          <Button
            disabled={loading}
            type="default"
            onClick={() => setShowExistingFiles(true)}
          >
            Show Existing Files
          </Button>
        </Space>
      }
    >
      <Skeleton active loading={loading} />

      {!loading && (
        <>
          <Form size="small" layout="vertical">
            <Form.Item
              label={
                <span
                  style={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Document Name
                </span>
              }
            >
              <Input
                size="default"
                onChange={(e) => setFileName(e.target.value)}
                value={fileName}
                placeholder="Enter document name"
              />
            </Form.Item>
          </Form>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "85%",
            }}
          >
            <Dragger {...props}>
              <p>
                <InboxOutlined style={{ fontSize: 100, color: "lightgray" }} />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
                <br />
                <span style={{ fontSize: "0.7rem" }}>
                  You can upload only one file at a time
                </span>
              </p>
            </Dragger>
            <Row justify="end" style={{ marginTop: 5 }}>
              <Col>
                <Button
                  loading={uploadLoading}
                  onClick={uploadFile}
                  disabled={fileList.length == 0 || fileName.length < 3}
                  type="primary"
                >
                  Upload
                </Button>
              </Col>
            </Row>
          </div>
          {showUploadDocModal2 && (
            <Drawer
              title="Existing Files"
              width={320}
              closable={false}
              onClose={() => setShowExistingFiles(false)}
              open={showExistingFiles}
            >
              <List
                itemLayout="horizontal"
                dataSource={existingFiles}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        title="Are you sure to delete this Document?"
                        onConfirm={() => deleteFun(item)}
                        onCancel={() => {
                          setDeleteConfirm(null);
                        }}
                        okText="Yes"
                        cancelText="No"
                      >
                        <AiFillDelete className={`view-icon`} />
                      </Popconfirm>,
                    ]}
                  >
                    <List.Item.Meta
                      title={<a href="https://ant.design">{item.name}</a>}
                    />
                  </List.Item>
                )}
              />
            </Drawer>
          )}
        </>
      )}
    </Drawer>
  );
}
