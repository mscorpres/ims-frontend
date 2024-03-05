import React, { useState, useRef } from "react";
import { Button, Modal, Col, Row, Input, Form, Typography } from "antd";

export default function CurrenceModal({ showCurrency, setShowCurrencyModal }) {
  const inputRef = useRef();
  const { Title } = Typography;
  const [rate, setRate] = useState(showCurrency.exchange_rate || 0);

  const submitHandler = () => {
    showCurrency.inputHandler(
      "exchange_rate",
      { rate: rate, currency: showCurrency.currency },
      showCurrency.rowId
    );
    setShowCurrencyModal(null);
  };
  return (
    <Modal
      title="Enter Currency Rate"
      open={showCurrency}
      width={300}
      onCancel={() => setShowCurrencyModal(null)}
      footer={[
        <Button key="back" onClick={() => setShowCurrencyModal(null)}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={submitHandler}>
          Submit
        </Button>,
      ]}
    >
      <Form layout="vertical">
        <Row>
          <Col span={24}>
            <Input
              ref={inputRef}
              value={rate}
              onKeyDown={(e) => e.key == "Enter" && submitHandler()}
              onChange={(e) => setRate(e.target.value)}
              type="number"
              placeholder="Enter Rate of exchange"
            />
          </Col>
        </Row>
      </Form>
      <Title
        level={5}
        style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}
      >
        {showCurrency?.symbol} {rate * showCurrency?.price}
      </Title>
      <Title level={5} style={{ display: "flex", justifyContent: "center" }}>
        ₹ {showCurrency?.price}
      </Title>
    </Modal>
  );
}
