import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Col, Row, Space, Input, Form, Typography } from "antd";

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
  useEffect(() => {
    console.log(showCurrency);
  }, [showCurrency]);
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
      {/* <div style={{ position: "relative" }} className="values">
        <span></span>
       
      </div>
      <section className=".btn-div"> */}
      {/* <Button
          disabled={rate.length == 0 ? true : false}
          type="button"
          onClick={submitHandler}
        >
          Submit
        </Button> */}
      {/* <button
          style={{ outline: "none" }}
          className="btn btn-danger mt-10 "
          type="button"
          onClick={() => {
            setShowCurrencyModal(null);
          }}
        >
          Cancel
        </button> */}
      {/* </section> */}
    </Modal>
  );
}
