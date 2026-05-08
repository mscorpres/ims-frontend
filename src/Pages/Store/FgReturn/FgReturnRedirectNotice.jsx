import { Button, Modal, Space, Typography } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";

const MATERIAL_IN_PRODUCT_PATH = "/warehouse/material-in-product";
const HOME_PATH = "/";

function FgReturnRedirectNotice({
  materialInProductPath = MATERIAL_IN_PRODUCT_PATH,
  homePath = HOME_PATH,
}) {
  const navigate = useNavigate();

  return (
    <Modal
      open
      title="FG Return"
      closable={false}
      maskClosable={false}
      keyboard={false}
      centered
      footer={
        <Space wrap>
      
          <Button
            type="primary"
            onClick={() => navigate(materialInProductPath)}
          >
            Click here
          </Button>
        </Space>
      }
    >
      <Typography.Paragraph style={{ marginBottom: 0 }}>
        Create FG Return module has been separated.
      </Typography.Paragraph>
    </Modal>
  );
}

export default FgReturnRedirectNotice;
