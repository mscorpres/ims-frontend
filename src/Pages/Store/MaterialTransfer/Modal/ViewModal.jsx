import React, { useState, useEffect } from "react";
import "../Modal/viewModal.css";
import { AiFillCloseCircle } from "react-icons/ai";
import { CloseCircleFilled, CheckCircleFilled } from "@ant-design/icons";
import { toast } from "react-toastify";
import axios from "axios";
import { Button, Col, Drawer, Input, Row, Space } from "antd";
import { imsAxios } from "../../../../axiosInterceptor";

function ViewModal({ viewModal, setViewModal }) {
  const [pendingLoading, setPendingLoading] = useState(false);
  const [allPenData, setAllPenData] = useState({
    quantity: "",
  });

  const PendingTranfer = async () => {
    if (!allPenData.quantity) {
      toast.error("Please Add Quantity");
    } else {
      setPendingLoading(true);
      const { data } = await imsAxios.post("/godown/ApproveTransfer", {
        qty: allPenData.quantity,
        transaction: viewModal.transaction_id,
      });
      if (data.code == 200) {
        setViewModal(false);
        setPendingLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setPendingLoading(false);
      }
    }
  };

  const reset = () => {
    setAllPenData({ quantity: "" });
    setViewModal(false);
  };

  // useEffect(() => {
  //   getLocation();
  // }, []);
  return (
    <Space>
      <Drawer
        width="50vw"
        title="Transaction Approved"
        placement="right"
        closable={false}
        onClose={() => setViewModal(false)}
        open={viewModal}
        getContainer={false}
        style={{
          position: "absolute",
        }}
        extra={
          <Space>
            <CloseCircleFilled onClick={() => setViewModal(false)} />
          </Space>
        }
      >
        <Row>
          <Col span={24}>
            <div style={{ textAlign: "end" }}>
              <span>{viewModal.transaction_id}</span>
            </div>
          </Col>
          <Col span={24} style={{ marginTop: "20px" }}>
            <div style={{ height: "100px", margin: "10px" }}>
              <table style={{ width: "100%" }}>
                <tr
                  style={{
                    border: "1px solid #ddd",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <th>Name</th>
                  <th>Part</th>
                  <th>Transfer Qty</th>
                  <th>Received Qty</th>
                </tr>
                <tr style={{ textAlign: "center" }}>
                  <td style={{ border: "1px solid #ddd" }}>
                    {viewModal.component_name}
                  </td>
                  <td style={{ border: "1px solid #ddd" }}>
                    {viewModal.component_part}
                  </td>
                  <td
                    style={{ border: "1px solid #ddd", padding: "10px" }}
                  >{`${viewModal.request_qty} / ${viewModal.required_qty}`}</td>
                  <td style={{ border: "1px solid #ddd", padding: "1px" }}>
                    <Input
                      placeholder="Qty"
                      style={{ width: "30%" }}
                      value={allPenData.quantity}
                      onChange={(e) =>
                        setAllPenData((allPenData) => {
                          return { ...allPenData, quantity: e.target.value };
                        })
                      }
                    />
                  </td>
                </tr>
              </table>
            </div>
          </Col>

          <Col span={24}>
            <div style={{ textAlign: "end" }}>
              <Button
                onClick={reset}
                style={{
                  backgroundColor: "#DD5353",
                  color: "white",
                  marginRight: "5px",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={PendingTranfer}
                loading={pendingLoading}
                type="primary"
              >
                Save
              </Button>
            </div>
          </Col>
        </Row>
      </Drawer>
    </Space>
  );
}

export default ViewModal;
