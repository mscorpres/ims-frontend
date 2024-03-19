import { Tabs, Modal } from "antd";
import RequestLedgerModal from "./RequestLedger";
import RequestedLedgers from "./RequestedLedgers";
import { useState } from "react";

const Ledgers = ({ open, hide }) => {
  const [activeKey, setActiveKey] = useState("1");
  const items = [
    {
      key: "1",
      label: "Send Mail",
      children: <RequestLedgerModal open={open} />,
    },
    {
      key: "2",
      label: "Sent Mails",
      children: (
        <RequestedLedgers
          modalOpen={open}
          vendor={open?.vendor}
          date={open?.date}
          refId={open?.refId}
        />
      ),
    },
  ];
  return (
    <Modal
      open={open}
      width={activeKey === "2" ? 1000 : 400}
      onCancel={hide}
      footer={<div></div>}
    >
      <Tabs
        defaultActiveKey="1"
        onChange={(value) => setActiveKey(value)}
        items={items}
      />
    </Modal>
  );
};

export default Ledgers;
