import React, { useEffect, useState } from "react";
import { Alert, Button, Col, Drawer, Input, Row, Space } from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import "../../../Master/Modal/modal.css";
import { CloseCircleFilled, CheckCircleFilled } from "@ant-design/icons";
import { imsAxios } from "../../../../axiosInterceptor";

const { TextArea } = Input;

const RemoveModal = ({
  delModal,
  setDelModal,
  modalOpen,
  getDataFetch,
  mat,
  setOpen,
}) => {
  const [rem, setRem] = useState("");

  const cancelReq = async () => {
    const { data } = await imsAxios.post(
      "/storeApproval/AllowComponentsCancellation",
      {
        component: delModal.compKey,
        authKey: delModal.authIdentity,
        transaction: modalOpen,
        remark: rem,
      }
    );
    if (data.code == 200) {
      setDelModal(false);
      getDataFetch();
      setRem("");
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setDelModal(false);
      getDataFetch();
      setRem("");
    }
  };

  const closeModal = () => {
    setDelModal(false);
    setRem("");
  };
  return (
    <Space>
      <Drawer
        width="30vw"
        title="Cancel Request"
        placement="right"
        closable={false}
        onClose={() => setDelModal(false)}
        open={delModal}
        getContainer={false}
        style={{
          position: "absolute",
        }}
        extra={
          <Space>
            <CloseCircleFilled onClick={() => setDelModal(false)} />
          </Space>
        }
      >
        <Row>
          <Col span={24}>
            <Alert
              style={{ fontSize: "1px", marginBottom: "20px" }}
              // message="Error Text"
              description="Attention: Please specify the reasons why are you forcelly cancelling this request order so we can save it in our records for future reference"
              type="warning"
              // closable
            />
          </Col>
          <Col span={24}>
            <TextArea
              value={rem}
              onChange={(e) => setRem(e.target.value)}
              rows="3"
              placeholder="Specify the reason for "
              maxLength={250}
            />
          </Col>

          <Col span={24}>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Button onClick={closeModal}>Close</Button>
              <Button onClick={cancelReq} type="primary">
                Submit
              </Button>
            </div>
          </Col>
        </Row>
      </Drawer>
    </Space>
  );
};

export default RemoveModal;
