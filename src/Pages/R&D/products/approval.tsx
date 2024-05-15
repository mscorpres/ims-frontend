import { getApprovalLogs, updateApprovalStatus } from "@/api/r&d/products";
import useApi from "@/hooks/useApi";
import { ModalType } from "@/types/general";
import { ApprovalType } from "@/types/r&d";
import {
  Button,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Space,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import MyButton from "@/Components/MyButton";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import Loading from "@/Components/Loading.jsx";
import { useSelector } from "react-redux/es/exports";

interface PropTypes extends ModalType {
  productKey: string;
}
const Approval = (props: PropTypes) => {
  const [details, setDetails] = useState<ApprovalType | undefined>();
  const [showApprovingModal, setShowApprovingModal] = useState(false);
  const [approveAction, setApproveAction] = useState<
    "approve" | "reject" | null
  >(null);
  const { user } = useSelector((state) => state.login);
  const { executeFun, loading } = useApi();

  const handleFetchDetails = async (productKey: string) => {
    const response = await executeFun(
      () => getApprovalLogs(productKey),
      "fetch"
    );
    if (response.success) {
      setDetails(response.data);
    }
  };

  const handleToggleApprovingModal = (action: "approve" | "reject") => {
    setApproveAction(action);
    setShowApprovingModal(true);
  };
  useEffect(() => {
    console.log("this is the selected", props.productKey);
    if (props.productKey) {
      handleFetchDetails(props.productKey);
    }
  }, [props.productKey]);
  return (
    <Modal
      open={props.show}
      onCancel={props.hide}
      title="Approval Logs"
      footer={<Button onClick={props.hide}>Done</Button>}
    >
      {loading("fetch") && <Loading />}
      {details && approveAction && (
        <ApprovingModal
          show={showApprovingModal}
          hide={() => setShowApprovingModal(false)}
          stage={details?.stage}
          name={details?.name}
          action={approveAction}
          productKey={props.productKey}
          handleFetchDetails={handleFetchDetails}
        />
      )}

      <Typography.Title level={5}>Creation Details</Typography.Title>
      <Divider />
      <Flex justify="space-between" wrap="wrap">
        <SingleDetail label="Created By" value={details?.creationDetails.by} />
        <SingleDetail
          label="Created On"
          value={details?.creationDetails.date}
        />
      </Flex>

      <Typography.Title style={{ marginTop: 10 }} level={5}>
        Stage 1 Approval
      </Typography.Title>
      <Divider />
      <Flex justify="space-between" wrap="wrap">
        <Flex vertical gap={10}>
          <SingleDetail
            label="Approver"
            value={details?.approvalDetails1.by ?? "--"}
          />
          <SingleDetail
            label="Remarks"
            value={details?.approvalDetails1.remarks ?? "--"}
          />
        </Flex>
        <div>
          {details?.stage === "0" &&
            user.id === details.approvalDetails1.crn && (
              <Space>
                <MyButton
                  onClick={() => handleToggleApprovingModal("reject")}
                  variant="clear"
                  text="Reject"
                  danger
                />
                <MyButton
                  onClick={() => handleToggleApprovingModal("approve")}
                  variant="submit"
                  text="Approve"
                />
              </Space>
            )}
          {details?.stage !== "0" && (
            <SingleDetail
              label="Approved On"
              value={details?.approvalDetails1.date ?? "--"}
            />
          )}
          {details?.stage === "0" &&
            user.id !== details.approvalDetails1.crn && (
              <SingleDetail label="Approved On" value={"Not Approved"} />
            )}
        </div>
      </Flex>
      <Typography.Title level={5} style={{ marginTop: 10 }}>
        Stage 2 Approval
      </Typography.Title>
      <Divider />
      <Flex justify="space-between" wrap="wrap">
        <Flex vertical gap={10}>
          <SingleDetail
            label="Approver"
            value={details?.approvalDetails2.by ?? "--"}
          />
          <SingleDetail
            label="Remarks"
            value={details?.approvalDetails2.remarks ?? "--"}
          />
        </Flex>
        <div>
          {details?.stage === "1" &&
            user.id === details.approvalDetails2.crn && (
              <Space>
                <MyButton
                  onClick={() => handleToggleApprovingModal("reject")}
                  variant="clear"
                  text="Reject"
                  danger
                />
                <MyButton
                  onClick={() => handleToggleApprovingModal("approve")}
                  variant="submit"
                  text="Approve"
                />
              </Space>
            )}
          {details?.stage === "2" && (
            <SingleDetail
              label="Approved On"
              value={details?.approvalDetails2.date ?? "Not Approved"}
            />
          )}
          {details?.stage === "1" &&
            user.id !== details.approvalDetails2.crn && (
              <SingleDetail label="Approved On" value={"Not Approved"} />
            )}
        </div>
      </Flex>
    </Modal>
  );
};

export default Approval;

const SingleDetail = ({ label, value }: { label: string; value?: string }) => {
  return (
    <Flex vertical gap={5}>
      <Typography.Text style={{ fontSize: "0.8rem" }} strong>
        {label}
      </Typography.Text>
      <Typography.Text>{value ?? "--"}</Typography.Text>
    </Flex>
  );
};

interface ApprovingTypes extends ModalType {
  stage: "0" | "1" | "2";
  action: "approve" | "reject";
  name: string;
  productKey: string;
  handleFetchDetails: (productKey: string) => void;
}
const ApprovingModal = (props: ApprovingTypes) => {
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const handleUpdateStatus = async () => {
    const values = await form.validateFields();
    const response = await executeFun(
      () =>
        updateApprovalStatus(
          props.productKey,
          values.remarks,
          props.action,
          props.stage
        ),
      "submit"
    );
    if (response.success) {
      props.hide();
      props.handleFetchDetails(props.productKey);
    }
  };
  return (
    <Modal
      open={props.show}
      onCancel={props.hide}
      okButtonProps={{
        danger: props.action === "reject",
        icon: props.action === "reject" ? <CloseOutlined /> : <CheckOutlined />,
      }}
      okText={props.action === "approve" ? "Approve" : "Reject"}
      title={
        props.action === "approve"
          ? `Approving ${props.name}`
          : `Rejecting ${props.name}`
      }
      onOk={handleUpdateStatus}
      confirmLoading={loading("submit")}
    >
      <Flex justify="center">
        <Typography.Text
          style={{
            textTransform: "capitalize",
            textAlign: "center",
            margin: "5px 0px",
          }}
          strong
        >
          Are you sure you want to {props.action} <span>{props.name}</span>?
        </Typography.Text>
      </Flex>

      <Form form={form} layout="vertical">
        <Form.Item label="Remarks" name="remarks" rules={rules.remarks}>
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const rules = {
  remarks: [
    {
      required: true,
      message: "Remarks are required while approving or rejecting of product",
    },
  ],
};
