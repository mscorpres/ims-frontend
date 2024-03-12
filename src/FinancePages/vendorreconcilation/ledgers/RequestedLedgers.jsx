import {
  Row,
  Col,
  Card,
  Divider,
  Typography,
  Flex,
  Button,
  Form,
  Upload,
} from "antd";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import MyDataTable from "../../../Components/MyDataTable";
import { useEffect, useState } from "react";
import useApi from "../../../hooks/useApi";
import {
  getRequestedLedgerMails,
  uploadLedgerAttachmnt,
} from "../../../api/ledger";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { UploadOutlined } from "@ant-design/icons";
import MyButton from "../../../Components/MyButton";

const initialValues = {
  upload: undefined,
};

const RequestedLedgers = ({ vendor, date, modalOpen }) => {
  const [rows, setRows] = useState([]);
  const [showDetails, setShowDetails] = useState(null);

  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const handleFetchMails = async (vendorCode) => {
    const response = await executeFun(
      () => getRequestedLedgerMails(vendorCode),
      "fetch"
    );
    setRows(response.data);
  };

  const handleUploadAttachment = async () => {
    const values = await form.validateFields();
    const response = await executeFun(() =>
      uploadLedgerAttachmnt(vendor.value, showDetails?.refId, values.upload)
    );
    if (response.success) {
      form.resetFields();
    }
  };
  const actionColumn = {
    headerName: "",
    type: "actions",
    width: 30,
    getActions: ({ row }) => [
      <GridActionsCellItem
        showInMenu
        // disabled={disabled}
        label="Details"
        onClick={() => setShowDetails(row)}
      />,
    ],
  };

  useEffect(() => {
    if (vendor && modalOpen) {
      handleFetchMails(vendor.value);
    }
  }, [modalOpen]);
  return (
    <Row gutter={6}>
      <Col span={showDetails ? 12 : 24} style={{ minHeight: 500, width: 1000 }}>
        <MyDataTable columns={[actionColumn, ...columns]} data={rows} />
      </Col>
      {showDetails && (
        <Col span={12}>
          <DetailsCard
            handleUploadAttachment={handleUploadAttachment}
            form={form}
            mail={showDetails}
            setShowDetails={setShowDetails}
          />
        </Col>
      )}
    </Row>
  );
};

export default RequestedLedgers;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },

  {
    headerName: "Date",
    field: "requestedDate",
    width: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.requestedDate} />,
  },
  {
    headerName: "Subject",
    field: "subject",
    minWidth: 160,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.subject} />,
  },
  {
    headerName: "Status",
    field: "status",
    width: 160,
    renderCell: ({ row }) => <ToolTipEllipses text={row.status} />,
  },
];

const DetailsCard = ({
  mail,
  setShowDetails,
  form,
  handleUploadAttachment,
}) => {
  return (
    <Card
      size="small"
      title="Mail Details"
      extra={
        <Button size="small" onClick={() => setShowDetails(null)}>
          Cancel
        </Button>
      }
    >
      <Row>
        <Col span={24}>
          <Flex vertical>
            <Typography.Text type="secondary">Sent Date</Typography.Text>
            <Typography.Text strong>{mail.sentDate}</Typography.Text>
          </Flex>
        </Col>
        <Col span={24}>
          <Flex vertical>
            <Typography.Text type="secondary">From</Typography.Text>
            <Typography.Text strong>{mail.senderEmail}</Typography.Text>
          </Flex>
        </Col>
        <Col span={24}>
          <Flex vertical>
            <Typography.Text type="secondary">To</Typography.Text>
            <Typography.Text strong>{mail.receiverEmail}</Typography.Text>
          </Flex>
        </Col>
        <Col span={24}>
          <Flex vertical>
            <Typography.Text type="secondary">RequestedDate</Typography.Text>
            <Typography.Text strong>{mail.requestedDate}</Typography.Text>
          </Flex>
        </Col>
        <Col span={24}>
          <Flex vertical>
            <Typography.Text type="secondary">Subject</Typography.Text>
            <Typography.Text strong>{mail.subject}</Typography.Text>
          </Flex>
        </Col>
        <Col span={24}>
          <Flex vertical>
            <Typography.Text type="secondary">Body</Typography.Text>
            <Typography.Text strong>{mail.body}</Typography.Text>
          </Flex>
        </Col>
        <Divider />
        <Col span={24}>
          <Flex vertical>
            <Row>
              <UploadAttachementButton
                handleUploadAttachment={handleUploadAttachment}
                form={form}
              />
            </Row>
            <Typography.Text type="secondary">Uploaded Ledgers</Typography.Text>
            {(!mail.uploadedLedgers || mail.uploadedLedgers?.length === 0) && (
              <Typography.Text type="secondary" style={{ textAlign: "center" }}>
                No ledgers files found..
              </Typography.Text>
            )}
            <Flex vertical gap={10}>
              {mail.uploadedLedgers &&
                mail.uploadedLedgers.map((row) => (
                  <a href={row} target="_blank">
                    {row}
                  </a>
                ))}
            </Flex>
          </Flex>
        </Col>
      </Row>
    </Card>
  );
};

const UploadAttachementButton = ({ form, handleUploadAttachment }) => {
  return (
    <Form
      initialValues={initialValues}
      layout="vertical"
      form={form}
      style={{ width: "100%" }}
    >
      <Form.Item
        name="upload"
        label="Upload Attachment"
        valuePropName="file"
        getValueFromEvent={({ file }) => file}
      >
        <Upload
          beforeUpload={() => false}
          maxCount={1}
          name="file"
          listType="picture"
        >
          <Button x icon={<UploadOutlined />}>
            Click to upload
          </Button>
        </Upload>
      </Form.Item>
      <Row justify="end">
        <MyButton onClick={handleUploadAttachment} variant="submit" />
      </Row>
    </Form>
  );
};
