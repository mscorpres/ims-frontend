import { Drawer, Typography, Row, Col, Form, Switch } from "antd";
import { useSelector } from "react-redux/es/exports";

const SettingDrawer = ({ open, hide }) => {
  const [form] = Form.useForm();
  const { settings } = useSelector((state) => state.login);
  return (
    <Drawer title="IMS Settings" open={open} onClose={hide}>
      <Row>
        <Col span={12}>
          <Typography.Title level={5}>MIN Setting</Typography.Title>
          <Typography.Text style={{ color: "#808080" }}>
            Cost Center MIN
          </Typography.Text>
        </Col>
        <Col span={12}>
          <Row justify="end">
            <Typography.Text style={{ color: "#808080" }}>
              {settings && settings[0].name}
            </Typography.Text>
            {/* <Form.Item noStyle valuePropName="checked"> */}
            {/* <Switch /> */}
            {/* </Form.Item> */}
          </Row>
        </Col>
      </Row>
    </Drawer>
  );
};

export default SettingDrawer;
