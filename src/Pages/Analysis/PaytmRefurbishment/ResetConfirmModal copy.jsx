import { Modal } from "antd";
import React from "react";

function ResetConfirmModal({ open, handleCancel, resetHandler }) {
  return (
    <Modal
      title="Reset Confirm"
      open={open}
      onOk={resetHandler}
      onCancel={handleCancel}
    >
      <p>Are you sure you want to reset this MIN?</p>
    </Modal>
  );
}

export default ResetConfirmModal;
