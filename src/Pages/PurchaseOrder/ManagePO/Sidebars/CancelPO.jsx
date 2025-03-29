import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button, Col, Drawer, Form, Input, Row, Modal } from "antd";
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
  const [payment,setPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const getPOStatus = async () => {
    if (showCancelPO) {
      const { data } = await imsAxios.post("/purchaseOrder/fetchStatus4PO", {
        purchaseOrder: showCancelPO,
      });
      if (data.code == 200) {
        setStatus("okay");
        setPayment(data?.data?.advPayment=="1"?true:false);
      } else {
        setStatus(data);
      }
    }
  };

  const showCofirmModal = () => {
    Modal.confirm({
      okText: "Save",
      title:"Are you sure you want to cancel this PO ? Since the advanced payment has already been made to the vendor.",
      onOk() {
        handleCancelPO();
      },
    });
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
              onClick={payment?showCofirmModal:handleCancelPO}
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
