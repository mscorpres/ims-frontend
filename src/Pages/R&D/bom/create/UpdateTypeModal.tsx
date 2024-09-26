import { ModalType } from "@/types/general";
import { bomUpdateType } from "@/types/r&d";
import { Button, Flex, Modal, Typography } from "antd";
import React from "react";

interface Props extends ModalType {
  setIsBomUpdating: React.Dispatch<React.SetStateAction<boolean>>;
  setUpdateType: React.Dispatch<React.SetStateAction<bomUpdateType | null>>;
}

const UpdateTypeModal = ({
  hide,
  setIsBomUpdating,
  setUpdateType,
  show,
  loading,
  submitHandler,
}: Props) => {
  const handleSelectType = (type: bomUpdateType) => {
    setUpdateType(type);
    setIsBomUpdating(true);
    hide();
  };
  return (
    <Modal
      open={show}
      onCancel={hide}
      width={400}
      title="Update Type"
      footer={<></>}
    >
      <Flex align="center" vertical gap={5}>
        <Typography.Text
          type="secondary"
          strong
          style={{ textAlign: "start", width: "90%", fontWeight: 600 }}
        >
          We have found that a BOM already exists of this product
        </Typography.Text>
        <Typography.Text
          type="secondary"
          strong
          style={{ textAlign: "start", width: "90%", fontWeight: 600 }}
        >
          Would you like to Update it?
        </Typography.Text>
        <Button block onClick={() => handleSelectType("ecn")}>
          ECN Update
        </Button>
        <Button block onClick={() => handleSelectType("main")}>
          PCB Update
        </Button>
      </Flex>
    </Modal>
  );
};

export default UpdateTypeModal;
