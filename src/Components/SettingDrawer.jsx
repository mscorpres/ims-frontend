import { Drawer, Typography, Divider } from "antd";
import SelectEndPoint from "../Pages/SelectEndPoint";
import SelectSocketEndPoint from "../Pages/SelectSocketEndPoint";

const SettingDrawer = ({ open, hide }) => {
  return (
    <Drawer title="IMS Settings" open={open} onClose={hide}>
      <Typography.Title level={5}>Add Custom URL</Typography.Title>
      <SelectEndPoint />
      <Divider />
      <Typography.Title level={5}>Add Custom Socket URL</Typography.Title>
      <SelectSocketEndPoint />
    </Drawer>
  );
};

export default SettingDrawer;
