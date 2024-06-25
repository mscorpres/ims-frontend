import { ModalType, SelectOptionType } from "@/types/general";
import { Button, Divider, Flex, Modal, Typography } from "antd";
import MyButton from "@/Components/MyButton";
import MySelect from "@/Components/MySelect.jsx";
import { useState } from "react";

interface Props extends ModalType {
  reasonOptions: SelectOptionType[];
  submitHandler: (reason: string, status: "PASS" | "FAIL") => void;
}

const InsertModal = ({
  hide,
  show,
  loading,
  submitHandler,
  reasonOptions,
}: Props) => {
  const [reason, setReason] = useState();
  const [failDanger, setFailDanger] = useState(false);

  const handleSubmit = (status: "PASS" | "FAIL") => {
    if (status === "FAIL" && !reason) {
      setFailDanger(true);
      return;
    }

    if (submitHandler) submitHandler(reason, status);
  };
  return (
    <Modal title="Insert QCA Entry" open={show} onCancel={hide}>
      <Flex gap={10} vertical align="center">
        <MyButton
          onClick={() => handleSubmit("PASS")}
          text="PASS"
          variant="submit"
        />
        <Divider>OR</Divider>
        <Typography.Text
          strong
          type="secondary"
          style={{ color: failDanger ? "red" : "" }}
        >
          In Case of Fail reason is mandatory
        </Typography.Text>
        <div style={{ width: 200 }}>
          <MySelect
            value={reason}
            onChange={setReason}
            options={reasonOptions}
            placeholder="Select a reason if fail"
          />
        </div>
        <MyButton
          onClick={() => handleSubmit("FAIL")}
          text="FAIL"
          variant="clear"
          danger
        >
          FAIL
        </MyButton>
      </Flex>
    </Modal>
  );
};

export default InsertModal;
