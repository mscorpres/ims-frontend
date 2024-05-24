import { getLogs, updateStatus } from "@/api/r&d/bom";
import useApi from "@/hooks/useApi";
import { ModalType } from "@/types/general";
import { BOMApprovalType, BOMTypeExtended } from "@/types/r&d";
import {
  Button,
  Divider,
  Drawer,
  Flex,
  Form,
  Input,
  Modal,
  Space,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux/es/exports";
import MyButton from "@/Components/MyButton";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import Loading from "@/Components/Loading.jsx";

interface PropTypes extends ModalType {
  selectedBom: BOMTypeExtended | null;
}
const BOMApproval = (props: PropTypes) => {
  const [logs, setLogs] = useState<BOMApprovalType | {}>({});
  const [approvalModalDetails, setApprovalModalDetails] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const { user } = useSelector((state) => state.login);
  const { loading, executeFun } = useApi();

  const handleFetchLogs = async (bomKey: string) => {
    setLogs({});
    const response = await executeFun(() => getLogs(bomKey), "fetch");
    console.log("logs response", response);
    setLogs(response.data);
  };

  useEffect(() => {
    if (props.selectedBom && props.selectedBom?.key) {
      handleFetchLogs(props.selectedBom.key);
    }
  }, [props.show]);
  return (
    // <Drawer
    //   open={props.show}
    //   onClose={props.hide}
    //   title={`${props.selectedBom?.name} Logs`}
    //   extra={
    //     logs.logs?.find((row) => row.isRejected) && (
    //       <Typography.Text style={{ fontSize: 16 }} type="danger" strong>
    //         Rejected
    //       </Typography.Text>
    //     )
    //   }
    //   width={600}
    // >
    <>
      {loading("fetch") && <Loading />}
      <RemarksModal
        details={approvalModalDetails}
        handleFetchLogs={handleFetchLogs}
        show={showApproveModal}
        hide={() => {
          setShowApproveModal(false);
          setApprovalModalDetails(null);
        }}
      />
      {logs.logs?.map((row) => (
        <Flex
          vertical
          style={{
            marginBottom: 10,
            opacity:
              row.stage > logs?.currentStage + 1 && row.date === "" ? 0.5 : 1,
          }}
          gap={"10px 0px"}
        >
          <div>
            <Typography.Title level={5}>
              Stage: {row.formattedStage}
              {row.isRejected && (
                <span
                  style={{ color: "brown", marginLeft: 10, marginBottom: 10 }}
                >
                  Rejected
                </span>
              )}
            </Typography.Title>
          </div>
          <Flex wrap="wrap" justify="space-between">
            <Flex vertical>
              <SingleDetail label="Approver" value={row.approver?.name} />
              <Typography.Text style={{ fontSize: 11 }} type="secondary">
                {row.approver?.department}, {row.approver?.designation}
              </Typography.Text>
            </Flex>

            {logs.currentStage + 1 === row.stage &&
              user.id === row.approver?.crn &&
              !row.date && (
                <Space>
                  <MyButton
                    onClick={() => {
                      setShowApproveModal(true);
                      setApprovalModalDetails({
                        bom: props.selectedBom,
                        stage: row.stage,
                        type: "approve",
                      });
                    }}
                    variant="clear"
                    text="Reject"
                    danger
                  />
                  <MyButton
                    onClick={() => {
                      setShowApproveModal(true);
                      setApprovalModalDetails({
                        bom: props.selectedBom,
                        stage: row.stage,
                        type: "approve",
                      });
                    }}
                    variant="submit"
                    text="Approve"
                  />
                </Space>
              )}
            {(row.date !== "" || logs.currentStage + 1 !== row.stage) && (
              <SingleDetail
                label={row.isRejected ? "Rejected Date" : "Approval Date"}
                value={row.date ?? "--"}
              />
            )}
          </Flex>

          <SingleDetail label="Remarks" value={row.remarks ?? "--"} />
          <Divider />
        </Flex>
      ))}
    </>
  );
};

export default BOMApproval;

const SingleDetail = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => {
  return (
    <Flex vertical gap={3}>
      <Typography.Text style={{ fontSize: "0.8rem" }} strong>
        {label}
      </Typography.Text>
      <Typography.Text>{value ?? "--"}</Typography.Text>
    </Flex>
  );
};

interface ModalProps extends ModalType {
  details: {
    stage: number;
    type: "reject" | "approve";
    bom: BOMTypeExtended;
  } | null;
  handleFetchLogs: (bomKey: string) => void;
}

const RemarksModal = (props: ModalProps) => {
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const handleUpdateStatus = async () => {
    const values = await form.validateFields();
    console.log("these are the details", { ...props.details, ...values });
    const response = await executeFun(
      () =>
        updateStatus(
          props.details?.bom?.key ?? "",
          props.details?.type,
          values.remarks,
          props.details?.stage
        ),
      "submit"
    );
    if (response.success) {
      props.hide();
      props.handleFetchLogs(props.details?.bom.key ?? "");
    }
  };
  useEffect(() => {
    if (!props.show) {
      form.setFieldValue("remarks", undefined);
    }
  }, [props.show]);
  return (
    <Modal
      open={props.show}
      onCancel={props.hide}
      okButtonProps={{
        danger: props.details?.type === "reject",
        icon:
          props.details?.type === "reject" ? (
            <CloseOutlined />
          ) : (
            <CheckOutlined />
          ),
      }}
      okText={props.details?.type === "approve" ? "Approve" : "Reject"}
      title={
        props.details?.type === "approve"
          ? `Approving ${props.details?.bom?.name}`
          : `Rejecting ${props.details?.bom?.name}`
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
          Are you sure you want to {props.details?.type}{" "}
          <span>{props.details?.bom.name}</span>?
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
