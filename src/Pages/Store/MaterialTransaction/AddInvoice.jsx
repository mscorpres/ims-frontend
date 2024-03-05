import React, { useState, useEffect } from "react";
import { BsFillCloudArrowUpFill } from "react-icons/bs";

export default function ({ showAddInvoice, setShowAddInvoice }) {
  const [files, setFiles] = useState([]);

  return (
    <div
      style={{
        height: "81%",
        width: "30vw",
        position: "fixed",
        top: "11%",
        right: `${showAddInvoice ? "0vh" : "-100vh"}`,
        zIndex: "2",
        transition: "all 350ms linear",
      }}
      className="card text-center"
    >
      <div
        className="card-header bg-secondary text-white"
        style={{
          fontFamily: "montserrat",
          fontSize: "20px",
          color: "dodgerblue",
        }}
      >
        Add Invoice
      </div>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          padding: 0,
          marginBottom: 0,
          flexDirection: "column",
        }}
        className="card-body"
      >
        <form className="image-upload-btn">
          <input
            type="file"
            name="file"
            id="file-input"
            className="visuallyhidden"
            onChange={(e) =>
              e.target.files[0] && setFiles([...files, e.target.files[0]])
            }
            style={{ opacity: 0, pointerEvents: "all", width: "100%" }}
          />
          <div htmlFor="file-input">
            <div style={{ width: "100%" }}>
              <BsFillCloudArrowUpFill
                style={{
                  fontSize: 70,
                  color: "dodgerblue",
                  opacity: 0.6,
                  marginBottom: 5,
                }}
              />
              <h1
                className="text-muted"
                style={{
                  borderBottom: "2px dashed #cfcfcf",
                  paddingBottom: 10,
                  width: "105%",
                }}
              >
                Upload Files
              </h1>
            </div>
          </div>
        </form>
        <div className="preview-files">
          {files.map((file) => {
            return (
              file && <img src={`${URL.createObjectURL(file).toString()}`} />
            );
          })}
        </div>
      </div>

      <div className="btn-group btn-group-toggle" data-toggle="buttons">
        <label className="btn btn-success">
          <input type="radio" name="options" id="option2" />{" "}
          Submit
        </label>
        <label className="btn btn-danger">
          <input
            type="radio"
            name="options"
            id="option3"
            onClick={() => setShowAddInvoice(false)}
          />{" "}
          Cancel
        </label>
      </div>
    </div>
  );
}
