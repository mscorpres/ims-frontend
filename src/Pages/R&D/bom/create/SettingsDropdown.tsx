import React from "react";
import { DownOutlined, SettingOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Dropdown, Space } from "antd";
import IconButton from "@/Components/IconButton";

interface Props {
  setShowApproverMetrics: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsDropdown = ({ setShowApproverMetrics }: Props) => {
  return (
    <Dropdown
      menu={{
        items: [
          {
            label: (
              <div onClick={() => setShowApproverMetrics(true)}>
                Approver Metrics
              </div>
            ),
            key: "0",
          },
        ],
      }}
      trigger={["click"]}
    >
      <a onClick={(e) => e.preventDefault()}>
        <IconButton icon={<SettingOutlined style={{ fontSize: 18 }} />} />
      </a>
    </Dropdown>
  );
};

export default SettingsDropdown;
