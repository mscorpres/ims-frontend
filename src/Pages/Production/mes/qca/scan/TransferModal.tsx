import { Flex, Modal, Typography } from "antd";
import MyButton from "@/Components/MyButton/index.jsx";

interface Props {
  hide: () => void;
  show: boolean;
  submitHandler: (status: "PASS" | "FAIL") => void;
  loading: (name: string) => boolean;
}

const TransferModal = ({ hide, show, loading, submitHandler }: Props) => {
  const isTransferring =
    loading("transfer-PASS") || loading("transfer-FAIL");

  return (
    <Modal
      open={show}
      onCancel={hide}
      footer={<></>}
      width={300}
      title="Transfer Lot"
      closable={!isTransferring}
      maskClosable={!isTransferring}
    >
      <Flex vertical gap={5}>
        <Typography.Text
          strong
          type="secondary"
          style={{ marginBottom: 10, textAlign: "center" }}
        >
          Select Lot type 'Passed' or 'Failed'
        </Typography.Text>
        <MyButton
          loading={loading("transfer-PASS")}
          disabled={isTransferring && !loading("transfer-PASS")}
          onClick={() => submitHandler("PASS")}
          variant="submit"
          text="PASSED"
        />
        <MyButton
          loading={loading("transfer-FAIL")}
          disabled={isTransferring && !loading("transfer-FAIL")}
          onClick={() => submitHandler("FAIL")}
          variant="clear"
          text="FAILED"
          danger
        />
      </Flex>
    </Modal>
  );
};

export default TransferModal;
