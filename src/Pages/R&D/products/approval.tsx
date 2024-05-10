import { getApprovalLogs } from "@/api/r&d/products";
import useApi from "@/hooks/useApi";
import { ModalType } from "@/types/general";
import { ApprovalType } from "@/types/r&d";
import {
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

interface PropTypes extends ModalType {
  productKey: string;
}
const Approval = (props: PropTypes) => {
  const [details, setDetails] = useState<ApprovalType | undefined>();
  const [showApprovingModal, setShowApprovingModal] = useState(false);
  const [approveAction, setApproveAction] = useState<
    "approve" | "reject" | null
  >(null);

  const { executeFun, loading } = useApi();

  const handleFetchDetails = async (productKey: string) => {
    const response = await executeFun(
      () => getApprovalLogs(productKey),
      "fetcj"
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
    <Modal open={props.show} onCancel={props.hide} title="Approval Logs">
      {details && approveAction && (
        <ApprovingModal
          show={showApprovingModal}
          hide={() => setShowApprovingModal(false)}
          stage={details?.stage}
          name={details?.name}
          action={approveAction}
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
            label="Approved By"
            value={details?.approvalDetails1.by ?? "--"}
          />
          <SingleDetail
            label="Remarks"
            value={details?.approvalDetails1.remarks ?? "--"}
          />
        </Flex>
        <div>
          {details?.stage === "0" && (
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
        </div>
      </Flex>
      <Typography.Title level={5} style={{ marginTop: 10 }}>
        Stage 2 Approval
      </Typography.Title>
      <Divider />
      <Flex justify="space-between" wrap="wrap">
        <Flex vertical gap={10}>
          <SingleDetail
            label="Approved By"
            value={details?.approvalDetails2.by ?? "--"}
          />
          <SingleDetail
            label="Remarks"
            value={details?.approvalDetails2.remarks ?? "--"}
          />
        </Flex>
        <div>
          {details?.stage === "1" && (
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
}
const ApprovingModal = (props: ApprovingTypes) => {
  const [form] = Form.useForm();
  return (
    <Modal
      open={props.show}
      onCancel={props.hide}
      okText={action === ""}
      title={
        props.action === "approve"
          ? `Approving ${props.name}`
          : `Rejecting ${props.name}`
      }
    >
      <Flex justify="center">
        <Typography.Text
          style={{
            textTransform: "capitalize",
            textAlign: "center",
            margin: "5px 0px",
          }}
          strong
          // type="secondary"
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
