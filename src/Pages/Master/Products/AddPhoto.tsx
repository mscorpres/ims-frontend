import React, { useEffect } from "react";
import { Drawer, Form, Input, Row, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import MyButton from "../../../Components/MyButton";
import useApi from "../../../hooks/useApi";
import { uploadImage } from "../../../api/master/products";
import { ProductType } from "@/types/master";

interface PropTypes {
  updatingImage: ProductType | false;
  setUpdatingImage: React.Dispatch<React.SetStateAction<false | ProductType>>;
}
function AddPhoto({ updatingImage, setUpdatingImage }: PropTypes) {
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleSubmit = async () => {
    if (updatingImage && updatingImage.productKey) {
      const values = await form.validateFields();
      const response = await executeFun(
        () => uploadImage(values, updatingImage.productKey),
        "submit"
      );

      if (response.success) {
        form.resetFields();
      }
    }
  };

  useEffect(() => {
    if (!updatingImage) {
      form.resetFields();
    }
  }, [updatingImage]);
  return (
    <Drawer
      destroyOnClose={true}
      title={updatingImage.name}
      open={updatingImage}
      onClose={() => setUpdatingImage(false)}
    >
      <div style={{ flex: 1 }}>
        <Form form={form} layout="vertical" initialValues={initialValues}>
          <Form.Item name="label" label="Label">
            <Input />
          </Form.Item>
          <Form.Item label="Upload Image">
            <Form.Item
              name="dragger"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              noStyle
            >
              <Upload.Dragger
                listType="picture-card"
                beforeUpload={() => false}
                name="files"
                maxCount={1}
                multiple={false}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                {/* <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p> */}
                <p className="ant-upload-hint">
                  Select images to upload for this product.
                </p>
              </Upload.Dragger>
            </Form.Item>
          </Form.Item>
        </Form>
        <Row justify="end">
          <MyButton
            loading={loading("submit")}
            onClick={handleSubmit}
            variant="submit"
          />
        </Row>
      </div>
    </Drawer>
  );
}

export default AddPhoto;

const initialValues = {
  label: undefined,
  dragger: undefined,
};
