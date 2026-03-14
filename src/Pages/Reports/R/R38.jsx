import { useState } from "react";
import "./r.css";
import MyButton from "../../../Components/MyButton";
import { Col, Row, Select, Typography } from "antd";
import { toast } from "react-toastify";
import socket from "../../../Components/socket";
import MyDatePicker from "../../../Components/MyDatePicker";

const options = [
  { value: "IN", label: "IN" },
  { value: "OUT", label: "OUT" },
];

const R38 = () => {
  const [date, setDate] = useState("");
  const [type, setType] = useState("IN");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!date) {
      return toast.error("Please select a date");
    }

    try {
      setLoading(true);
      socket.emit("skuMovementReport", {
        date,
        type,
      });
      toast.success(
        "Weighted Rate Report generation started. You will be notified when it is ready.",
      );
    } catch (error) {
      toast.error("Error initiating report generation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "90%", margin: "10px" }}>
      <Row gutter={16}>
        <Col span={3}>
          <Select
            placeholder="Select Option"
            options={options}
            value={type}
            onChange={(e) => setType(e)}
            style={{
              width: "100%",
            }}
          />
        </Col>
        <Col span={4}>
          <MyDatePicker size="default" setDateRange={setDate} />
        </Col>
        <Col span={2}>
          <MyButton
            variant="download"
            onClick={handleGenerate}
            loading={loading}
            type="primary"
          >
            Generate
          </MyButton>
        </Col>
      </Row>
      <Row justify="center" style={{ marginTop: 40 }}>
        <Col span={24}>
          <Typography.Title
            level={5}
            style={{ textAlign: "center", color: "darkslategray" }}
          >
            Select a date, type and click Generate to start the FG Registor Report.
          </Typography.Title>
        </Col>
      </Row>
    </div>
  );
};

export default R38;
