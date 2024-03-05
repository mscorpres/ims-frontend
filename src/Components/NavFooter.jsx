import { Button, Form, Row, Space } from "antd";
import React from "react";

export default function NavFooter({
  backFunction,
  resetFunction,
  submitFunction,
  uploadFun,
  nextLabel,
  loading,
  nextDisabled,
  disabled,
  backLabel,
  submithtmlType,
  submitButton,
  formName,
  additional,
}) {
  return (
    <Row
      align="middle"
      justify="end"
      style={{
        width: "100vw",
        padding: "0 10px",
        position: "fixed",
        bottom: "0px",
      }}
      className="nav-footer"
    >
      <Space>
        {additional && additional.map((row) => row())}
        {uploadFun && (
          <Button
            size="default"
            type="primary"
            disabled={disabled?.uploadDoc}
            onClick={uploadFun}
            className="secondary-button"
            id="reset_po"
          >
            Upload Docs
          </Button>
        )}
        {backFunction && (
          <Button
            size="default"
            type="default"
            disabled={disabled?.back || loading}
            id="next_btn"
            onClick={backFunction}
          >
            {backLabel ? backLabel : "Back"}
          </Button>
        )}
        {resetFunction && (
          <Button
            size="default"
            type="default"
            disabled={disabled?.reset || loading}
            onClick={resetFunction}
            id="reset_po"
          >
            Reset
          </Button>
        )}
        {(submitFunction || submitButton) && (
          <Button
            size="default"
            htmlType={submitButton ? "submit" : "button"}
            loading={loading}
            type="primary"
            disabled={nextDisabled || disabled?.next}
            onClick={submitFunction && submitFunction}
          >
            {nextLabel ? nextLabel : "Next"}
          </Button>
        )}
      </Space>
    </Row>
  );
}
