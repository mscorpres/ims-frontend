import { ModalType, SelectOptionType } from "@/types/general";
import { Button, Divider, Flex, Modal, Typography } from "antd";
import MyButton from "@/Components/MyButton";
import MySelect from "@/Components/MySelect.jsx";
import { useEffect, useState } from "react";

interface Props extends ModalType {
  reasonOptions: SelectOptionType[];
  submitHandler: (reason: string, status: "PASS" | "FAIL") => void;
  loading: (name: string) => void;
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

  useEffect(() => {
    if (!show) {
      setReason(undefined);
      setFailDanger(false);
    }
  }, [show]);
  return (
    <Modal title="Insert QCA Entry" open={show} onCancel={hide} footer={<></>}>
      <Flex gap={10} align="center" justify="space-between">
        <Flex style={{ flex: 1 }} justify="center">
          <MyButton
            loading={loading("singleScan-PASS")}
            onClick={() => handleSubmit("PASS")}
            text="PASS"
            variant="submit"
          />
        </Flex>
        <Divider type="vertical" style={{ height: 100 }}>
          OR
        </Divider>
        <Flex vertical style={{ flex: 1 }} align="center" gap={5}>
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
            loading={loading("singleScan-FAIL")}
            danger
          >
            FAIL
          </MyButton>
          <Typography.Text
            strong
            type="secondary"
            style={{
              color: failDanger ? "red" : "",
              textAlign: "center",
              marginTop: 10,
            }}
          >
            In Case of Fail reason is mandatory
          </Typography.Text>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default InsertModal;
