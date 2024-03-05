import { useState, useEffect } from "react";
import { Col, Drawer, Radio, Row, Typography } from "antd";
import { processApi } from "../../api";

const SelectProcessModal = ({ open, close, form, value }) => {
  const [processes, setProcesses] = useState([]);
  const [selected, setSelected] = useState("");
  const handleProcessOptions = async () => {
    setSelected(null);
    const { data } = await processApi.getProcessOptions();
    setProcesses(data);
  };

  const handleChange = (e) => {
    const sel = processes.find((process) => process.id === e.target.value);
    form.setFieldValue(["process", open?.fieldName, "process"], sel);
    setSelected(sel);
    close();
  };
  useEffect(() => {
    if (open) {
      handleProcessOptions();
    }
  }, [open]);
  return (
    <Drawer
      title="Select Process"
      placement="right"
      onClose={close}
      open={open}
    >
      <Row>
        <Radio.Group value={selected?.id} onChange={handleChange}>
          <Col span={24}>
            {processes.map((row) => (
              <Radio value={row.id}>
                <Typography.Text strong>{row.name}</Typography.Text>
              </Radio>
            ))}
          </Col>
        </Radio.Group>
      </Row>
    </Drawer>
  );
};

export default SelectProcessModal;
