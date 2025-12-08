import React, { useState, useRef } from "react";
import { Modal, Row, Col, Typography, Input, Button } from "antd";

export default function CurrenceModal({
  currency,
  price,
  showCurrency,
  inputHandler,
  setShowCurrencyModal,
}) {
  const inputRef = useRef();
  const [rate, setRate] = useState("");

  const submitHandler = () => {
    inputHandler(
      "exchange_rate",
      {
        rate: rate,
        currency: showCurrency.currency,
      },
      showCurrency?.rowId
    );
    // inputHandler(rowId, "foreginValue", price);
    setShowCurrencyModal(null);
  };
  return (
    <Modal
      title="Enter Currency Rate"
      open={showCurrency}
      width={300}
      onCancel={() => setShowCurrencyModal(false)}
      footer={[
        <Button key="back" onClick={() => setShowCurrencyModal(null)}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={submitHandler}>
          Submit
        </Button>,
      ]}
    >
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
      <Typography.Title
        level={5}
        style={{ display: "flex", justifyContent: "center", marginTop: "15px" }}
      >
       ₹ {rate * showCurrency?.price}
      </Typography.Title>
      <Typography.Title
        level={5}
        style={{ display: "flex", justifyContent: "center" }}
      >
        {showCurrency?.symbol} {showCurrency?.price}
      </Typography.Title>
      {/* <div className="currency-modal">
        <h2>Enter Currency Rate</h2>
        <input
          ref={inputRef}
          value={rate}
          onKeyDown={(e) => e.key == "Enter" && submitHandler()}
          onChange={(e) => setRate(e.target.value)}
          type="number"
          className="currency-rate-input"
          placeholder="Enter Rate of exchange"
        />
        <div style={{ position: "relative" }} className="values">
          <span>
            {currency?.label} {rate * price}
          </span>
          <span>₹ {price}</span>
        </div>
        <section className=".btn-div">
          <button
            disabled={rate.length == 0 ? true : false}
            style={{ outline: "none" }}
            className="btn btn-primary mt-10 mr-15"
            type="button"
            onClick={submitHandler}
          >
            Submit
          </button>
          <button
            style={{ outline: "none" }}
            className="btn btn-danger mt-10 "
            type="button"
            onClick={() => {
              setShowCurrencyModal(null);
            }}
          >
            Cancel
          </button>
        </section>
      </div> */}
    </Modal>
  );
}
