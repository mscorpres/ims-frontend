import { useState } from "react";
import "./r.css";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import MyButton from "../../../Components/MyButton";
import { Col, Row, Typography } from "antd";
import { toast } from "react-toastify";
import socket from "../../../Components/socket";

const R11 = () => {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!date) {
      return toast.error("Please select a date");
    }

    try {
      setLoading(true);
      socket.emit("weightedRateReport", {
        date 
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
    <div style={{ height: "90%" }}>
      <Row gutter={16} style={{ margin: "10px" }}>
        <Col span={4}>
          <SingleDatePicker size="default" setDate={setDate} />
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
            Select a date and click Generate to start the Weighted Rate Report.
          </Typography.Title>
        </Col>
      </Row>
    </div>
  );
};

export default R11;
