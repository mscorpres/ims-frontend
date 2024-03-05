import { Modal, Divider } from "antd";

function ConfirmModal({
  open,
  setOpen,
  loading,
  setCreateVBT,
  createVBT,
  setEditingVBT,
  editingVBT,
  confirmModal,
  setConfirmModal,
}) {
  console.log("inside the modal");
  const cancel = () => {
    setOpen(false);
    setCreateVBT(false);
    setEditingVBT(null);
    setConfirmModal(false);
  };
  const submitHandler = () => {
    setCreateVBT(true);
    setOpen(false);
  };
  
  return (
    <Modal
      title="Submit Confirmation"
      open={open}
      onOk={submitHandler}
      confirmLoading={loading}
      onCancel={cancel}
    >
      <Divider />
      <p>There already exists a VBT for this vendor</p>
      <p>Are you sure you want to create the VBT?</p>
      <Divider />
    </Modal>
  );
}
export default ConfirmModal;
