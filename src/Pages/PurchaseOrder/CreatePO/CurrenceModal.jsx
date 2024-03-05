import React, { useState, useRef } from "react";

export default function CurrenceModal({
  currency,
  price,
  rowId,
  inputHandler,
  setShowCurrencyModal,
}) {
  const inputRef = useRef();
  console.log(rowId);
  const [rate, setRate] = useState("");

  const submitHandler = () => {
    inputHandler(rowId, "exchange", rate);
    // inputHandler(rowId, "foreginValue", price);
    // inputHandler(rowId, "inrValue", enteredExchange.value * price);
    setShowCurrencyModal(null);
  };
  return (
    <div className="currency-modal">
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
    </div>
  );
}
