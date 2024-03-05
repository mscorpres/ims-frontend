import React, { useState } from "react";
import { Modal, Button, Input } from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";

function MinReverseModal({
  reverseModal,
  setReverseModal,
  inputStore,
  mainData,
}) {
  const [remark, setRemark] = useState("");
  const [reverseLoading, setReverseLoading] = useState(false);

  const ReverseUpdate = async () => {
    setReverseLoading(true);
    const authArray = [];
    const compArray = [];

    mainData.map((a) => authArray.push(a.authentication));
    mainData.map((aa) => compArray.push(aa.componentKey));

    const { data } = await imsAxios.post("/reversal/saveMINReversal", {
      branch: "BRMSC012",
      authentication: authArray,
      component: compArray,
      remark: remark,
      transaction: inputStore,
    });
    if (data.code == 200) {
      setRemark("");
      setReverseModal(false);
      setReverseLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setReverseModal(false);
      setReverseLoading(false);
    }
    console.log(data);
  };

  return (
    <>
      <Modal
        open={reverseModal}
        //   title="Reverse"
        onOk={() => setReverseModal(false)}
        onCancel={() => setReverseModal(false)}
        footer={[
          // <Button key="back" onClick={handleCancel}>
          //   Return
          // </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={ReverseUpdate}
            loading={reverseLoading}
          >
            Yes REVERSE
          </Button>,
          <Button onClick={() => setReverseModal(false)}>Close</Button>,
        ]}
      >
        <span style={{ fontWeight: "bolder", fontSize: "13px" }}>
          are you sure you want to reverse the MIN ?
        </span>
        <p style={{ fontWeight: "bolder", fontSize: "12px" }}>
          Note: "Yes REVERSE" action is an irreversible action..
        </p>
        <span style={{ fontWeight: "bolder", fontSize: "12px" }}>
          type any remark in the field below for reversal the MIN TXN:
          <span style={{ color: "green" }}>{inputStore}</span>
        </span>
        <div style={{ marginTop: "10px" }}>
          <Input
            value={remark}
            placeholder="Remark"
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>
      </Modal>
    </>
  );
}

export default MinReverseModal;
