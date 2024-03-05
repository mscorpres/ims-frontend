import { Modal } from "antd";

function SubmitConfirmModal({ open, handleCancel, submitHandler, loading }) {
  return (
    <Modal
      title="Submit Confirm"
      open={open}
      onOk={submitHandler}
      confirmLoading={loading}
      onCancel={handleCancel}
    >
      <p>Are you sure you want to save this shipping Address?</p>
    </Modal>
  );
}

export default SubmitConfirmModal;
