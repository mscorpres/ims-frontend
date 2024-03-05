import { Modal } from "antd";
import React from "react";

export default function CreateSubmitConfirmModal({
  showSubmitConfirm,
  setShowSubmitConfirm,
  submitHandler,
  loading,
  action,
}) {
  return (
    <Modal
      title={`Confirm ${action} Project!`}
      open={showSubmitConfirm}
      onCancel={() => setShowSubmitConfirm(false)}
      okText="Yes"
      cancelText="No"
      onOk={submitHandler}
      confirmLoading={loading}
    >
      <p>Are you sure you want {action} this project?</p>
    </Modal>
  );
}
