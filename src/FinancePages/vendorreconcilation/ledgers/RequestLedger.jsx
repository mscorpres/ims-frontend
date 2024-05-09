import { Modal, Form, Col, Row, Input, Button, Space } from "antd";
import useApi from "../../../hooks/useApi.ts";
import {
  getLedgerEmail,
  sendRequestLedgerMail,
  updateLedgerEmail,
} from "../../../api/ledger";
import { useEffect } from "react";
import Loading from "../../../Components/Loading";

const initialValues = {
  senderEmail: "himanshi.singh@mscorpres.in",
  receiverEmail: "",
  subject: "",
  bodu: "",
};
const RequestLedgerModal = ({ open, hide }) => {
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const handleFetchEmail = async (vendorCode) => {
    const response = await executeFun(
      () => getLedgerEmail(vendorCode),
      "fetch"
    );
    if (response.success) {
      if (response.data.email) {
        form.setFieldValue("receiverEmail", response.data.email);
      }
    }
  };

  const handleUpdateEmail = async () => {
    const values = await form.validateFields(["receiverEmail"]);

    const response = await executeFun(
      () => updateLedgerEmail(values.receiverEmail, open.vendor.value),
      "submit"
    );
    if (response.success) {
      handleSendMail();
    }
  };

  const handleSendMail = async () => {
    const values = await form.validateFields();
    values["vendor"] = open.vendor;
    values["date"] = open.date;
    const response = await executeFun(
      () => sendRequestLedgerMail({ ...values, refId: open.refId }),
      "submit"
    );
    if (response.success) {
      form.resetFields();
    }
  };
  useEffect(() => {
    if (open) {
      handleFetchEmail(open.vendor.value);
    }
  }, [open]);
  return (
    <Row>
      {loading("fetch") && <Loading />}
      <Col span={24}>
        <Form initialValues={initialValues} form={form} layout="vertical">
          <Form.Item name="senderEmail" label="From">
            <Input placeholder="Enter sender Email Id" />
          </Form.Item>
          <Form.Item name="receiverEmail" label="To">
            <Input placeholder="Enter vendor's Email Id" />
          </Form.Item>
          <Form.Item name="subject" label="Subject">
            <Input placeholder="Enter subject" />
          </Form.Item>
          <Form.Item name="body" label="Body">
            <Input.TextArea rows={5} placeholder="Enter Body" />
          </Form.Item>
        </Form>
        <Row justify="end">
          <Space>
            <Button loading={loading("fetch")} onClick={handleSendMail}>
              Send and Update
            </Button>
            <Button
              type="primary"
              loading={loading("fetch")}
              onClick={handleUpdateEmail}
            >
              Send
            </Button>
          </Space>
        </Row>
      </Col>
    </Row>
  );
};

export default RequestLedgerModal;
