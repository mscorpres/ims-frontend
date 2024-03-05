import { Button, Col, Drawer, Input, Row, Space, Typography } from "antd";
import Dragger from "antd/lib/upload/Dragger";
import { InboxOutlined } from "@ant-design/icons";
import React from "react";
import { useState } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import { useEffect } from "react";
import { toast } from "react-toastify";

function AddPhoto({ updatingImage, setUpdatingImage }) {
  const [previousImages, setImagePreview] = useState([]);
  const [caption, setCaption] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [image, setImage] = useState(false);
  const getImages = async () => {
    const { data } = await imsAxios.post("/products/fetchImageProduct", {
      product: updatingImage.key,
    });
  };
  const submitHandler = async () => {
    const formData = new FormData();
    console.log(image);
    formData.append("files", image);
    formData.append("caption", caption);
    formData.append("product", updatingImage.key);
    setSubmitLoading(true);
    const { data } = await imsAxios.post(
      "/products/upload_product_img",
      formData
    );
    setSubmitLoading(false);
    if (data.code === 200) {
      toast.success(data.message);
      setUpdatingImage(false);
    } else {
      toast.error(data.message.msg);
    }
  };
  const props = {
    // name: "file",
    maxCount: 1,
    listType: "picture",
    beforeUpload(file) {
      console.log(file);
      setImage(file);
      return false;
    },
  };
  useEffect(() => {
    if (updatingImage) {
      getImages();
      setImage(false);
    }
  }, [updatingImage]);
  return (
    <Drawer
      destroyOnClose={true}
      title={updatingImage.label}
      open={updatingImage}
      onClose={() => setUpdatingImage(false)}
    >
      <Row style={{ width: "100%", height: "95%" }}>
        <Col span={24} style={{ height: 100 }}>
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} />
          <Typography.Title level={5}>
            Click or drag file to this area to upload
          </Typography.Title>
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
          </Dragger>
        </Col>
        <Col span={24}>
          <Row></Row>
        </Col>
      </Row>
      <Row justify="end">
        <Space>
          <Button
            type="primary"
            loading={submitLoading}
            onClick={submitHandler}
          >
            Submit
          </Button>
        </Space>
      </Row>
    </Drawer>
  );
}

export default AddPhoto;
