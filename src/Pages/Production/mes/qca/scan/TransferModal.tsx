import { ModalType } from "@/types/general";
import { Flex, Modal, Typography } from "antd";
import MyButton from "@/Components/MyButton/index.jsx";
interface Props extends ModalType {
  submitHandler: (status: "PASS" | "FAIL") => void;
  loading: (name: string) => void;
}

const TransferModal = ({ hide, show, loading, submitHandler }: Props) => {
  return (
    <Modal
      open={show}
      onCancel={hide}
      footer={<></>}
      width={300}
      title="Transfer Lot"
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
          loading={loading("insertWithCount-PASS")}
          onClick={() => submitHandler("PASS")}
          variant="submit"
          text="PASSED"
        />
        <MyButton
          loading={loading("insertWithCount-FAIL")}
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
