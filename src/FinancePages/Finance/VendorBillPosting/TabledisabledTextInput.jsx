import React from "react";

export default function TabledisabledTextInput({
  value,
  fun,
  name,
  id,
  height,
}) {
  return (
    <>
      <input
        className="table-input"
        type="text"
        style={{ textAlign: "center", height: height && height }}
        value={value}
        disabled
        //   onChange={(e) => inputHandler("code", e.target.value)}
        // placeholder="Enter New Master Group Code.."
      />
    </>
  );
}
