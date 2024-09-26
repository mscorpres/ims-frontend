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
  const handleRejectedFetchLogs = async (bomKey: string) => {
    setRejLogs({});
    const response = await executeFun(() => getRejLogs(bomKey), "fetch");
    let a = response.data[0].description;

    const grouped = a.reduce((acc, item) => {
      if (!acc[item.stage]) {
        acc[item.stage] = [];
      }
      acc[item.stage].push(item);
      return acc;
    }, {});

    setRejLogs(grouped);
  };
  useEffect(() => {
    console.log("props.selectedBom", props.selectedBom);

    if (
      props.selectedBom &&
      props.selectedBom?.key &&
      (props?.selectedBom?.status == "PENDING" ||
        props?.selectedBom?.status == "CLOSED")
    ) {
      handleFetchLogs(props.selectedBom.key);
    }
    // if (props?.selectedBom?.isActive == false)
    else {
      // console.log("props?.selectedBom?.isActive", props?.selectedBom?.isActive);

      handleRejectedFetchLogs(props?.selectedBom?.key);
    }
  }, [props.show]);
  const collapseItems = Object.entries(rejlogs).map(([stage, logs]) => ({
    key: stage,
    label: ` ${stage}`,
    children: logs.map((log) => ({
      key: log.id, // Unique key for each log
      label: (
        <div>
          <Typography.Text strong>S-{log.line}</Typography.Text>{" "}
          {/* <div>{`Status: ${log?.status || "No status"} `}</div>{" "} */}
          <div>{`Approver: ${log.userName} `}</div>{" "}
          <div>{` Remark: ${log.remark || "No Remark"}`}</div>
          <Divider />
        </div>
      ),
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
      {isRejlen == true ? (
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
            key: log.stage,
            label: `${log.stage}`,
            children: (
              <Collapse
                items={log.approvers.map((row) => ({
                  key: row.line,
                  label: `S-${row.line}`,
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
                        user?.id === row.user && (
                          <Flex gap={5}>
                            <MyButton
                              onClick={() => {
                                setShowApproveModal(true);
                                setApprovalModalDetails({
                                  bom: props.selectedBom,
                                  stage: log.stage,
                                  line: row.line,
                                  type: "reject",
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
                                  stage: log.stage,
                                  type: "approve",
                                  line: row.line,
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
                              ? logs.isRejected
                                ? "Rejected"
                                : "Current"
                              : row.remarksDate
                              ? "Approved"
                              : "pending"
                          }
                          style={
                            {
                              // color: row.currentApprover ? logs.isRejected :
                            }
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
                          ? logs.isRejected
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
                    ? logs.isRejected
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
    type: "reject" | "approve";
    bom: BOMTypeExtended;
  } | null;
  handleFetchLogs: (bomKey: string) => void;
  handleRejectedFetchLogs: (bomKey: string) => void;
}

const RemarksModal = (props: ModalProps) => {
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  console.log("these are the details", props.details);
  const handleUpdateStatus = async () => {
    const values = await form.validateFields();
    console.log("these are the details", { ...props.details, ...values });
    const response = await executeFun(
      () =>
        updateStatus(
          props.details?.bom?.key ?? "",
          props.details?.type,
          values.remarks,
          props.details?.stage,
          props.details?.line
        ),
      "submit"
    );
    if (response.success) {
      props.hide();
      // console.log("esponse?.data?.type", response);

      if (response?.data?.type == true) {
        props.handleFetchLogs(props.details?.bom.key ?? "");
      } else {
        // console.log("here");

        props.handleRejectedFetchLogs(props.details?.bom.key ?? "");
      }
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
