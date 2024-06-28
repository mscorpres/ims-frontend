import {
  getPendingApprovalList,
  updateApprovalStatus,
  verifyAttributes,
} from "@/api/master/component";
import useApi from "@/hooks/useApi";
import ApprovalList from "@/Pages/Master/Components/material/approval/list";
import { ModalType } from "@/types/general";
import { Col, Divider, Flex, Form, Input, Modal, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import Loading from "@/Components/Loading.jsx";
import { useNavigate, useSearchParams } from "react-router-dom";

type Props = {};

const ComponentApproval = ({ getRows }: Props) => {
  const [rows, setRows] = useState([{ id: "1" }]);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [showApproveModal, setShowApproveModal] = useState<
    false | "approve" | "reject"
  >(false);
  let [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { executeFun, loading } = useApi();

  const handleFetchList = async () => {
    const response = await executeFun(() => getPendingApprovalList(), "fetch");
    if (preSelectedComponent && preSelectedStatus) {
      console.log("preselectedcmpnoent", preSelectedComponent);
      console.log("preselected status", preSelectedStatus);
      console.log(
        "presetting",
        preSelectedStatus === "approve" ? "approve" : "reject"
      );
      setSelectedComponent(
        response.data.find((row) => row.key === preSelectedComponent)
      );
      setShowApproveModal(
        preSelectedStatus === "approve" ? "approve" : "reject"
      );
    }
    setRows(response.data);
  };

  const handleSubmit = async (remarks: string) => {
    console.log("selected component", selectedComponent);
    const key = selectedComponent.key;
    const type = showApproveModal;

    if (type && key && remarks) {
      const response = await executeFun(
        () => updateApprovalStatus(key, type, remarks),
        "submit"
      );
      if (response.success) {
        setSelectedComponent(null);
        setShowApproveModal(false);
        handleFetchList();
        navigate("/material/pending-approval");
      }
    }
  };

  const preSelectedComponent = searchParams.get("component");
  const preSelectedStatus = searchParams.get("status");

  useEffect(() => {
    handleFetchList();
  }, []);
  return (
    <Row style={{ height: "95%", padding: 10 }} justify="center">
      <ApproveModal
        show={showApproveModal === "approve" || showApproveModal === "reject"}
        hide={() => {
          setSelectedComponent(null);
          setShowApproveModal(false);
        }}
        type={showApproveModal !== false ? showApproveModal : undefined}
        loading={loading("submit")}
        submitHandler={handleSubmit}
        component={selectedComponent}
      />
      <Col span={20}>
        <ApprovalList
          setSelectedComponent={setSelectedComponent}
          setShowApproveModal={setShowApproveModal}
          rows={rows}
          loading={loading("fetch")}
        />
      </Col>
    </Row>
  );
};

export default ComponentApproval;

interface ApproveModalType extends ModalType {
  type?: "approve" | "reject";
  component: any;
}

const ApproveModal = ({
  hide,
  show,
  loading,
  submitHandler,
  type,
  component,
}: ApproveModalType) => {
  const [form] = Form.useForm();
  const { loading: loading1, executeFun } = useApi();
  const [similarComponents, setSimilarComponents] = useState([]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    console.log("values are", values);
    if (values) {
      submitHandler(values.remarks);
    }
  };
  const handleFetchSimilarComponents = async () => {
    setSimilarComponents([]);
    const response = await executeFun(
      () =>
        verifyAttributes(
          component.categoryKey,
          component.uniqueCode,
          component.mfgCode
        ),
      "fetch"
    );

    setSimilarComponents(response.data ?? []);
  };

  useEffect(() => {
    console.log("selecte comp in modal", component);
    if (!show) {
      form.setFieldValue("remarks", undefined);
    } else {
      handleFetchSimilarComponents();
    }
  }, [show]);

  return (
    <Modal
      open={show}
      onCancel={hide}
      okText={type === "reject" ? "Reject" : "Approve"}
      okButtonProps={{
        danger: type === "reject",
      }}
      confirmLoading={loading}
      onOk={handleSubmit}
    >
      <Typography.Text strong>
        Are you sure you want to {type} this component?
      </Typography.Text>
      <Row>
        <Col span={24}>
          <Form
            disabled={loading1("fetch")}
            form={form}
            layout="vertical"
            style={{ marginTop: 15 }}
          >
            <Form.Item
              name="remarks"
              label="Remarks"
              rules={[{ required: true, message: "Remarks are required!!" }]}
            >
              <Input.TextArea rows={3} placeholder="Enter Remarks..." />
            </Form.Item>
          </Form>
        </Col>

        <Divider />

        <Col span={24}>
          {loading1("fetch") && <Loading />}
          <Typography.Text strong type="secondary">
            We Have found{" "}
            <span style={{ color: "black" }}>{similarComponents.length}</span>{" "}
            with the same SMT values
          </Typography.Text>

          <Flex vertical gap={2} style={{ maxHeight: 200, overflow: "auto" }}>
            {similarComponents.map((row) => (
              <Flex gap={10} justify="space-between">
                <Typography.Text strong>{row.partCode}</Typography.Text>

                <Typography.Text strong>{row.rmStock} stock</Typography.Text>
              </Flex>
            ))}
          </Flex>
        </Col>
      </Row>
    </Modal>
  );
};
