import React from "react";
import { useEffect } from "react";

export default function FloatingTextBox({
  value,
  fun,
  name,
  id,
  max,
  inputType,
}) {
  return (
    <div className="input-floating-label" style={{ position: "relative" }}>
      <input
        //   name="order_qty[]"
        //   placeholder="--"
        // max={Number(max)}
        className="table-input"
        //   id="order_qty_1"
        type={inputType ? inputType : "text"}
        // onChange={(e) => console.log(id)}
        onChange={(e) => fun(name, e.target.value, id)}
        style={{ textAlign: "center", width: "100%" }}
        value={value?.qty}
      />
      <span
        className="floating-label text-grey-m3 quantity_old"
        id="avail_stock_qty_1"
        style={{
          // width: "100%",
          top: "15%",
          background: "white",
          left: "0%",
          fontSize: "0.6rem",
          fontWeight: 500,
          position: "absolute",
        }}
      >
        <span id="part_uom_1">{value?.uom}</span>
      </span>
    </div>
  );
}
