import { getLogs, getRejLogs, updateStatus } from "@/api/r&d/bom";
import useApi from "@/hooks/useApi";
import { ModalType } from "@/types/general";
import { BOMApprovalType, BOMTypeExtended } from "@/types/r&d";
import {
  Button,
  Collapse,
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
import { height } from "@mui/system";

interface PropTypes extends ModalType {
  selectedBom: BOMTypeExtended | null;
}

const BOMApproval = (props: PropTypes) => {
  const [logs, setLogs] = useState<BOMApprovalType | {}>({});
  const [rejlogs, setRejLogs] = useState({});
  const [isRejlen, setIsRejlen] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [approvalModalDetails, setApprovalModalDetails] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const { user } = useSelector((state) => state.login);
  const { loading, executeFun } = useApi();

  const handleFetchLogs = async (bomKey: string) => {
    setLogs({});
    const response = await executeFun(() => getLogs(bomKey), "fetch");
    setIsRejected(response.data?.isRejected);
    setLogs(response.data);
  };
  const handleRejectedFetchLogs = async (bomKey: string) => {
    setRejLogs({});
    const response = await executeFun(() => getRejLogs(bomKey), "fetch");
    let a = response.data[0].description;

    // Group the rejected logs by line, then by stage
    const grouped = a.reduce((acc, item) => {
      if (!acc[item.line]) {
        acc[item.line] = {};  // Group by line first
      }
      if (!acc[item.line][item.stage]) {
        acc[item.line][item.stage] = [];
      }
      acc[item.line][item.stage].push(item);
      return acc;
    }, {});

    setRejLogs(grouped);
  };

  useEffect(() => {

    if (
      props.selectedBom &&
      props.selectedBom?.key &&
      (props?.selectedBom?.status == "PENDING" ||
        props?.selectedBom?.status == "CLOSED")
    ) {
      handleFetchLogs(props.selectedBom.key);
    } else {
      handleRejectedFetchLogs(props?.selectedBom?.key);
    }
  }, [props.show]);

  const collapseItems = Object.entries(rejlogs).map(([line, stages]) => ({
    key: line,
    label: `Line ${line}`,
    children: Object.entries(stages).map(([stage, logs]) => ({
      key: stage,
      label: `Stage ${stage}`,
      children: logs.map((log) => ({
        key: log.id, // Unique key for each log
        label: (
          <div>
            <Typography.Text strong>{`S-${log.line}`}</Typography.Text>{" "}
            <div>{`Status: ${log?.status || "No status"} `}</div>{" "}
            <div>{`Approver: ${log.userName} `}</div>{" "}
            <div>{` Remark: ${log.remark || "No Remark"}`}</div>
            <Divider />
          </div>
        ),
      })),
    })),
  }));

  useEffect(() => {
    if (collapseItems.length) {
      setIsRejlen(true);
    }
  }, [collapseItems]);

  return (
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
      {isRejlen ? (
        <Collapse>
          {collapseItems?.map((item) => (
            <Collapse.Panel header={item?.label} key={item?.key}>
              {item.children.map((child) => (
                <div key={child?.key}>{child?.label}</div>
              ))}
            </Collapse.Panel>
          ))}
        </Collapse>
      ) : (
        <Collapse
          items={logs?.logs?.map((log) => ({
            key: log.line,
            label: `L${log.line}`,
            children: (
              <Collapse
                items={log.approvers.map((row) => ({
                  key: row.stageLabel,
                  label: `${row.stageLabel}`,
                  children: (
                    <Flex
                      vertical
                      gap={5}
                      style={{
                        opacity:
                          row.remarksDate === null &&
                          row.remarks === null &&
                          !row.currentApprover
                            ? 0.5
                            : 1,
                        pointerEvents:
                          row.remarksDate === null &&
                          row.remarks === null &&
                          !row.currentApprover
                            ? "none"
                            : "all",
                      }}
                    >
                      <Flex justify="space-between">
                        <Flex vertical>
                          <Typography.Text strong>{row.name}</Typography.Text>
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: 13 }}
                          >
                            {row.email}
                          </Typography.Text>
                        </Flex>
                      </Flex>
                      {row.currentApprover &&
                        !row.isRejected &&
                        user?.id === row.user && 
                        (
                          <Flex gap={5}>
                            <MyButton
                              onClick={() => {
                                setShowApproveModal(true);
                                setApprovalModalDetails({
                                  bom: props.selectedBom,
                                  stage: row.stage,
                                  line: row.line,
                                  type: "Rejected",
                                });
                              }}
                              danger
                              variant="clear"
                              block
                              text="Reject"
                            >
                              Reject
                            </MyButton>
                            <MyButton
                              onClick={() => {
                                setShowApproveModal(true);
                                setApprovalModalDetails({
                                  bom: props.selectedBom,
                                  stage: row.stage,
                                  line: row.line,
                                  type: "Approved",
                            
                                });
                              }}
                              variant="submit"
                              block
                              text="Approve"
                            >
                              Approve
                            </MyButton>
                          </Flex>
                        )}

                      <Flex justify="space-between">
                        <SingleDetail
                          label="Status"
                          value={
                            row.currentApprover
                              ? isRejected
                                ? "Rejected"
                                : "Current"
                              : row.remarksDate
                              ? "Approved"
                              : "pending"
                          }
                        />
                        <SingleDetail
                          label="Updated Date"
                          value={row.remarksDate ?? "--"}
                        />
                      </Flex>
                      <SingleDetail
                        label="Remarks"
                        value={row.remarks ?? "--"}
                      />
                      <Divider />
                    </Flex>
                  ),
                  extra: (
                    <div
                      style={{
                        height: 10,
                        width: 10,
                        marginTop: 7,
                        borderRadius: "100%",
                        background: row.currentApprover
                          ? isRejected
                            ? "brown"
                            : "green"
                          : "transparent",
                      }}
                    />
                  ),
                }))}
              />
            ),
            extra: (
              <div
                style={{
                  height: 10,
                  width: 10,
                  marginTop: 7,
                  borderRadius: "100%",
                  background: log.approvers.find((row) => row.currentApprover)
                    ? isRejected
                      ? "brown"
                      : "green"
                    : "transparent",
                }}
              />
            ),
          }))}
        />
      )}
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
    <Flex vertical gap={1} style={{ marginTop: 3 }}>
      <Typography.Text style={{ fontSize: "0.8rem" }} strong>
        {label}
      </Typography.Text>
      <Typography.Text style={{ fontSize: 13 }}>
        {value ?? "--"}
      </Typography.Text>
    </Flex>
  );
};

interface ModalProps extends ModalType {
  details: {
    stage: number;
    line: number;
    type: "Rejected" | "Approved";
    bom: BOMTypeExtended;
  } | null;
  handleFetchLogs: (bomKey: string) => void;
  handleRejectedFetchLogs: (bomKey: string) => void;
}

const RemarksModal = (props: ModalProps) => {
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const handleUpdateStatus = async () => {
    const values = await form.validateFields();

    const response = await executeFun(
      () =>
        updateStatus(
          props.details?.bom?.key ?? "",
          props?.details?.stage,
          props.details?.line,
          props.details?.type,
          values.remarks,
        ),
      "submit"
    );

    if (response.success) {
      props.hide();

      // if (response?.data?.type == true) {
        props.handleFetchLogs(props.details?.bom.key ?? "");
      // } else {
      //   props.handleRejectedFetchLogs(props.details?.bom.key ?? "");
      // }
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
        danger: props.details?.type === "Rejected",
        icon:
          props.details?.type === "Rejected" ? (
            <CloseOutlined />
          ) : (
            <CheckOutlined />
          ),
      }}
      okText={props.details?.type === "Approved" ? "Approved" : "Rejected"}
      title={
        props.details?.type === "Approved"
          ? `Approving ${props.details?.bom?.productName}`
          : `Rejecting ${props.details?.bom?.productName}`
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
      message: "Remarks are required while approving or rejecting the product",
    },
  ],
};
