import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button, Col, Drawer, Form, Input, Row } from "antd";
import { imsAxios } from "../../../../axiosInterceptor";

export default function CancelPO({
  showCancelPO,
  setShowCancelPO,
  setRows,
  getSearchResults,
  componentStatus,
  rows,
}) {
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState();
  const [loading, setLoading] = useState(false);
  const getPOStatus = async () => {
    if (showCancelPO) {
      const { data } = await imsAxios.post("/purchaseOrder/fetchStatus4PO", {
        purchaseOrder: showCancelPO,
      });
      if (data.code == 200) {
        setStatus("okay");
      } else {
        setStatus(data);
      }
    }
  };
  const handleCancelPO = async () => {
    if (showCancelPO) {
      setLoading(true);

      const { data } = await imsAxios.post("/purchaseOrder/CancelPO", {
        purchase_order: showCancelPO,
        remark: reason,
      });
      setLoading(false);
      if (data.code == 200) {
        toast.success(data.message.msg);
        setReason("");
        let arr = rows;
        getSearchResults();
        // arr = arr.map((row) => {
        //   if (row.po_transaction == showCancelPO) {
        //     return {
        //       ...row,
        //       po_status: "C",
        //     };
        //   } else {
        //     return row;
        //   }
        // });
        setRows(arr);
        setShowCancelPO(null);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  useEffect(() => {
    // console.log(showCancelPO);
    getPOStatus();
    setReason("");
  }, [showCancelPO]);
  useEffect(() => {
    console.log(reason);
  }, [reason]);
  return (
    <Drawer
      title={`Cancelling Purchase Order: ${showCancelPO}`}
      width="50vw"
      onClose={() => setShowCancelPO(null)}
      open={showCancelPO}
    >
      <Form layout="vertical">
        <Row>
          <Col span={24}>
            <Form.Item
              name="reason"
              label="Cancelation Reason"
              rules={[
                { required: true, message: "Please enter Cancelation Reason" },
              ]}
            >
              <Input.TextArea
                rows={6}
                style={{ resize: "none" }}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please enter Cancelation Reason"
                value={reason}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button
              loading={loading}
              disabled={reason.length < 5 ? true : false}
              onClick={handleCancelPO}
              type="primary"
            >
              Cancel PO
            </Button>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}
