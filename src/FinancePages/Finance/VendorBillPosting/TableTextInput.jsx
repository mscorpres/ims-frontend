import React from "react";

export default function TableTextInput({ value, fun, name, id, placeholder }) {
  return (
    <>
      <input
        className="table-input"
        type="text"
        style={{ textAlign: "center" }}
        value={value}
        onChange={(e) => fun(name, e.target.value, id)}
        placeholder={placeholder && placeholder}
      />
    </>
  );
}
