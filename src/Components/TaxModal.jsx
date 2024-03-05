import React, { useState, useEffect } from "react";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

export default function TaxModal({ totalValues, bottom, visibleBottom }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      style={{ bottom: visible ? visibleBottom : bottom }}
      className={`tax-modal ${visible ? "visible" : ""}`}
    >
      <div onClick={() => setVisible((visible) => !visible)} className="head">
        {/* {visible ? (
          <AiOutlineMinus className="add-icon" />
        ) : (
          <AiOutlinePlus className="add-icon" />
        )} */}

        <span>Tax Detail</span>
      </div>
      <div className="body">
        {totalValues?.map((row) => (
          <div key={row.label}>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight:
                  totalValues?.indexOf(row) == totalValues.length - 1 && 600,
              }}
            >
              {row.label}
            </span>
            <span className="right">
              {row.sign.toString() == "" ? (
                ""
              ) : (
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight:
                      totalValues?.indexOf(row) == totalValues.length - 1 &&
                      600,
                  }}
                >
                  ({row.sign.toString()}){" "}
                </span>
              )}
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight:
                    totalValues?.indexOf(row) == totalValues.length - 1 && 600,
                }}
              >
                {Number(
                  row.values?.reduce((partialSum, a) => {
                    return partialSum + Number(a);
                  }, 0)
                ).toFixed(2)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
