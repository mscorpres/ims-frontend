import { Col, Divider, Modal, Row } from "antd";
import React, { useEffect } from "react";

export default function TaxDetail({ detailModal, setDetailModal, addRow }) {
  let value = addRow?.map((row) => Number(row.value));
  let Cgst = addRow?.map((row) => Number(row.cgst) + Number(row.sgst));
  let Igst = addRow?.map((row) => Number(row.igst));
  let all = addRow?.map((row) => Number(row.cgst) + Number(row.sgst) + Number(row.igst));
  let grandTotal = addRow?.map(
    (row) => Number(row.value) + Number(row.cgst) + Number(row.sgst) + Number(row.igst)
  );

  console.log(grandTotal);
  useEffect(() => {
    if (addRow) {
      // console.log(addRow[0]);
    }
  }, [addRow]);
  return (
    <Modal
      title="Tax Detail"
      open={detailModal}
      onOk={() => setDetailModal(false)}
      onCancel={() => setDetailModal(false)}
      okText="ok"
      cancelText="Close"
      // width={600}
    >
      <Row>
        <Col span={24}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",

              // border: "1px solid red",
            }}
          >
            <span style={{ fontWeight: "bolder" }}>Sub-Total value before Taxes:</span>
            <span style={{ fontWeight: "bolder" }}>₹{addRow[0]?.value}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              // border: "1px solid red",
            }}
          >
            <span style={{ fontWeight: "bolder" }}>CGST:</span>
            <span style={{ fontWeight: "bolder" }}>₹{addRow[0]?.cgst}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: "bolder" }}>SGST:</span>
            <span style={{ fontWeight: "bolder" }}>₹{addRow[0]?.sgst}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: "bolder" }}>IGST:</span>
            <span style={{ fontWeight: "bolder" }}>₹{addRow[0]?.igst}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: "bolder" }}>Total Taxes (CGST+SGST+IGST):</span>
            <span style={{ fontWeight: "bolder" }}>₹{all}</span>
          </div>
          {/* <Divider /> */}
          <br />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: "bolder" }}>Net Amount:</span>
            <span style={{ fontWeight: "bolder" }}>₹{grandTotal}</span>
          </div>
        </Col>
      </Row>
    </Modal>
  );
}
