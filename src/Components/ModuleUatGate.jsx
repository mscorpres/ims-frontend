import { Button, Modal, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Paragraph } = Typography;

const UAT_MESSAGE =
"Effective 21-05-2026, this module is no longer available for use as average Rate implementation"

function ModuleUatGate() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate("/", { replace: true });
  };

  return (
    <Modal
      open
      centered
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={[
        <Button key="back" onClick={handleBack}>
          Back
        </Button>,
        <Button key="home" type="primary" onClick={handleHome}>
          Home
        </Button>,
      ]}
      title="Module unavailable"
    >
      <Paragraph style={{ marginBottom: 0 }}>{UAT_MESSAGE}</Paragraph>
    </Modal>
  );
}

export default ModuleUatGate;
