import React, { useState } from "react";
import { FaGreaterThan } from "react-icons/fa";
import { CgCloseO } from "react-icons/cg";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Button,
  Col,
  Divider,
  Drawer,
  Input,
  Modal,
  Row,
  Skeleton,
  Space,
  Table,
  Tag,
} from "antd";
import {
  CloseCircleFilled,
  CheckCircleFilled,
  CaretRightOutlined,
} from "@ant-design/icons";
import { imsAxios } from "../../../../axiosInterceptor";

function PendingFGModal({ fGModal, setFGModal, getPendingData }) {
  const [loadingModal, setLoadingModal] = useState(false);
  const [allPendingData, setAllPendingData] = useState({
    qty: "",
  });

  const submitData = async () => {
    setLoadingModal(true);
    const { data } = await imsAxios.post("/fgIN/saveFGs", {
      pprqty: allPendingData.qty,
      pprrequest1: fGModal.mfg_ref_transid_1,
      pprrequest2: fGModal.mfg_transaction,
      pprsku: fGModal.mfg_sku,
    });
    //  console.log(data.message)
    if (data.code === 200) {
      getPendingData();
      setAllPendingData({
        qty: "",
      });
      setLoadingModal(false);
      setFGModal(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setAllPendingData({
        qty: "",
      });
      setFGModal(false);
      setLoadingModal(false);
    }
  };

  const reset = () => {
    setAllPendingData({ qty: "" });
    setFGModal(false);
    // getPendingData();
  };

  return (
    <Modal
      // style={{ top: -200 }}
      title="FG Inwarding"
      centered
      open={fGModal}
      onOk={() => {
        submitData();
        getPendingData();
        setFGModal(false);
      }}
      onCancel={() => setFGModal(false)}
      width={900}
    >
      <Row>
        <Skeleton active loading={loadingModal}>
          <Col span={24}>
            <div style={{ textAlign: "end", fontWeight: "bolder" }}>
              {fGModal.mfg_ref_id}
              <CaretRightOutlined style={{ color: "red" }} />
              <CaretRightOutlined style={{ color: "red" }} />
              <CaretRightOutlined style={{ color: "red" }} />
              {fGModal.mfg_transaction}
            </div>
          </Col>
          <Col span={24} style={{ marginTop: "10px" }}>
            <Row gutter={10} style={{ textAlign: "center" }}>
              <Col
                span={12}
                style={{ border: "1px solid grey", padding: "5px" }}
              >
                NAME / SKU
              </Col>
              <Col
                span={4}
                style={{ border: "1px solid grey", padding: "5px" }}
              >
                MFG / STIN QTY
              </Col>
              <Col
                span={8}
                style={{ border: "1px solid grey", padding: "5px" }}
              >
                IN QTY
              </Col>
              {/* <Divider/> */}

              <Col
                span={12}
                style={{
                  border: "1px solid grey",
                  padding: "5px",
                  fontWeight: "bolder",
                }}
              >
                {`${fGModal.p_name} / ${fGModal.mfg_sku}`}
              </Col>
              <Col
                span={4}
                style={{
                  border: "1px solid grey",
                  padding: "5px",
                  fontWeight: "bolder",
                }}
              >
                {`${fGModal.mfg_prod_planing_qty}/${fGModal.completedQTY}`}
              </Col>
              <Col
                span={8}
                style={{ border: "1px solid grey", padding: "5px" }}
              >
                <Input
                  suffix={fGModal.mfg_prod_planing_qty}
                  placeholder="Qty"
                  style={{ width: "60%" }}
                  value={allPendingData.qty}
                  onChange={(e) =>
                    setAllPendingData((allPendingData) => {
                      return { ...allPendingData, qty: e.target.value };
                    })
                  }
                />
              </Col>
            </Row>
          </Col>
        </Skeleton>
      </Row>
    </Modal>
  );
}

export default PendingFGModal;
