import React, { useState, useEffect } from "react";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

export default function VendorTaxModal({
  taxData,
  roundOffSign,
  roundOffValue,
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={`tax-modal ${visible ? "visible" : ""}`}>
      <div onClick={() => setVisible((visible) => !visible)} className="head">
        {visible ? (
          <AiOutlineMinus className="add-icon" />
        ) : (
          <AiOutlinePlus className="add-icon" />
        )}

        <span>Taxes Detail</span>
      </div>
      <div className="body">
        <span>Net Amount</span>
        <span className="right">
          {Number(
            taxData?.valueTotal?.reduce((partialSum, a) => {
              return partialSum + Number(a);
            }, 0)
          ).toFixed(2)}
        </span>
        {taxData.freight && (
          <>
            {" "}
            <span>Freight</span>
            <span className="right">
              (+)
              {Number(
                taxData?.freightTotal?.reduce((partialSum, a) => {
                  return partialSum + Number(a);
                }, 0)
              ).toFixed()}
            </span>
          </>
        )}

        <span>CGST</span>
        <span className="right">
          (+){" "}
          {Number(
            taxData?.cgstTotal?.reduce((partialSum, a) => {
              return partialSum + Number(a);
            }, 0)
          ).toFixed(2)}
        </span>
        <span>SGST</span>
        <span className="right">
          (+){" "}
          {Number(
            taxData?.sgstTotal?.reduce((partialSum, a) => {
              return partialSum + Number(a);
            }, 0)
          ).toFixed(2)}
        </span>
        <span>IGST</span>
        <span className="right">
          (+){" "}
          {Number(
            taxData?.igstTotal?.reduce((partialSum, a) => {
              return partialSum + Number(a);
            }, 0)
          ).toFixed(2)}
        </span>
        <span>Total Taxes (CGST+SGST+IGST)</span>
        <span className="right">
          ₹{" "}
          {Number(
            taxData?.igstTotal?.reduce((partialSum, a) => {
              return partialSum + Number(a);
            }, 0) +
              taxData?.cgstTotal?.reduce((partialSum, a) => {
                return partialSum + Number(a);
              }, 0) +
              taxData?.sgstTotal?.reduce((partialSum, a) => {
                return partialSum + Number(a);
              }, 0)
          ).toFixed(2)}
        </span>
        <span>Round Off</span>
        <span className="right">
          ({roundOffSign}) {roundOffValue}
        </span>
        <span>TDS Amount</span>
        <span className="right">
          (-) ₹{" "}
          {Number(
            taxData?.tdsAmountTotal?.reduce((partialSum, a) => {
              return partialSum + Number(a);
            }, 0)
          ).toFixed(2)}
        </span>
        <span style={{ paddingBottom: "13px", height: "50px" }}>
          <strong>Vendor Amount</strong>
        </span>
        <span
          style={{ paddingBottom: "13px", height: "50px" }}
          className="right"
        >
          <strong>
            ₹
            {roundOffSign && roundOffValue
              ? roundOffSign == "-"
                ? Number(
                    Number(
                      taxData?.vendorAmountTotal?.reduce((partialSum, a) => {
                        // return Number(partialSum + a).toFixed(2);
                        return partialSum + Number(a);
                      }, 0)
                    ) - Number(roundOffValue)
                  ).toFixed(2)
                : Number(
                    Number(
                      taxData?.vendorAmountTotal?.reduce((partialSum, a) => {
                        // return Number(partialSum + a).toFixed(2);
                        return partialSum + Number(a);
                      }, 0)
                    ) + Number(roundOffValue)
                  ).toFixed(2)
              : Number(
                  taxData?.vendorAmountTotal?.reduce((partialSum, a) => {
                    // return Number(partialSum + a).toFixed(2);
                    return partialSum + Number(a);
                  }, 0)
                ).toFixed(2)}
          </strong>
        </span>
      </div>
    </div>
  );
}
