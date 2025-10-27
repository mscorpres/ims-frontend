import { Button, Form, Row, Space } from "antd";
import React from "react";
import CustomButton from "../new/components/reuseable/CustomButton";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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
          // <Button
          //   size="default"
          //   type="default"
          //   disabled={disabled?.back || loading}
          //   id="next_btn"
          //   onClick={backFunction}
          // >
          //   {backLabel ? backLabel : "Back"}
          // </Button>
          <CustomButton variant="text" size="small" title={backLabel ? backLabel : "Back"} disabled={disabled?.back || loading} onclick={backFunction}/>
        )}
        {resetFunction && (
          // <Button
          //   size="default"
          //   type="default"
          //   disabled={disabled?.reset || loading}
          //   onClick={resetFunction}
          //   id="reset_po"
          // >
          //   Reset
          // </Button>
          <CustomButton variant="outlined" size="small" title="Reset" disabled={disabled?.reset || loading} onclick={resetFunction}/>
        )}
        {(submitFunction || submitButton) && (
          // <Button
          //   size="default"
          //   htmlType={submitButton ? "submit" : "button"}
          //   loading={loading}
          //   type="primary"
          //   disabled={nextDisabled || disabled?.next}
          //   onClick={submitFunction && submitFunction}
          // >
          //   {nextLabel ? nextLabel : "Next"}
          // </Button>
          <CustomButton htmlType={submithtmlType && submithtmlType} size="small" title={nextLabel ? nextLabel : "Next"} loading={loading} disabled={nextDisabled || disabled?.next} onclick={submitFunction && submitFunction} endicon={<ArrowForwardIcon fontSize="small"/>} />
          
        )}
      </Space>
    </Row>
  );
}
