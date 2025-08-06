import { Drawer, Typography } from "antd";
import SelectEndPoint from "../Pages/SelectEndPoint";

const SettingDrawer = ({ open, hide }) => {
  return (
    <Drawer title="IMS Settings" open={open} onClose={hide}>
      <Typography.Title level={5}>Add Custom URL</Typography.Title>
      <SelectEndPoint/>
    </Drawer>
  );
};

export default SettingDrawer;
