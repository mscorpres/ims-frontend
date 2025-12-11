import { InboxOutlined } from "@ant-design/icons";
import { Card, Flex, Form, Modal, Row, Typography, Upload } from "antd";
import MyButton from "@/Components/MyButton";
import { ModalType } from "@/types/general";
import { useState } from "react";
import useApi from "@/hooks/useApi";
import { uploadFile } from "@/api/far/upload";
import { downloadFunction } from "../../Components/printFunction";

const FARUpload = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [form] = Form.useForm();
  const { loading, executeFun } = useApi();

  const validateHandler = async () => {
    const values = await form.validateFields();
    setShowConfirm(true);
  };

  const submitHandler = async () => {
    const values = form.getFieldsValue();
    const file = values.dragger[0].originFileObj;

    //uploading logic
    const response = await executeFun(() => uploadFile(file), "submit");
    if (response.success) {
      downloadFunction(response.data.buffer.data, response.data.filename);
      setShowConfirm(false);
      form.resetFields();
    }
  };
  const normFile = (e) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  return (
    <Row  style={{ padding: 10, paddingTop: 200 }}>
      <ConfirmModal
        show={showConfirm}
        hide={() => setShowConfirm(false)}
        submitHandler={submitHandler}
        loading={loading("submit")}
      />
      <Card title="FAR Upload" size="small">
        <Form layout="vertical" form={form}>
          <Form.Item>
            <Form.Item
              name="dragger"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              noStyle
              rules={rules.file}
            >
              <Upload.Dragger
                name="files"
                beforeUpload={() => false}
                maxCount={1}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                {/* <p className="ant-upload-hint">
                Support for a single or bulk upload.
              </p> */}
              </Upload.Dragger>
            </Form.Item>
          </Form.Item>

          <Flex justify="center">
            <MyButton
              variant="print"
              text="Print Labels"
              onClick={validateHandler}
            />
          </Flex>
        </Form>
      </Card>
    </Row>
  );
};

const rules = {
  file: [
    {
      required: true,
      message: "A file is required",
    },
  ],
};

export default FARUpload;

interface PropType extends ModalType {
  submitHandler: () => void;
  loading: boolean;
}
const ConfirmModal = (props: PropType) => {
  return (
    <Modal
      open={props.show}
      title="Confirm Modal"
      onOk={props.submitHandler}
      confirmLoading={props.loading}
      okText="Upload"
      onCancel={props.hide}
    >
      <Typography.Text strong>
        Are you sure you want to upload this file?
      </Typography.Text>
    </Modal>
  );
};
