import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Drawer,
  Dropdown,
  Row,
  Skeleton,
  Space,
} from "antd";
import {
  EyeFilled,
  CloseCircleFilled,
  InfoCircleTwoTone,
} from "@ant-design/icons";
import { v4 } from "uuid";
import axios from "axios";
import InfoModal from "./InfoModal";
import MyDataTable from "../../../Components/MyDataTable";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSV } from "../../../Components/exportToCSV";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import Loading from "../../../Components/Loading";

const ViewModal = ({ viewModalOpen, setViewModalOpen }) => {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState([]);
  const [mainData, setMainData] = useState([]);
  // console.log(view);
  const getFecthData = async () => {
    setLoading(true);

    const response = await imsAxios.post("/jobwork/fetchTableAnly", {
      skucode: viewModalOpen.skuKey,
      jw_transaction: viewModalOpen.jwId,
      po_transaction: viewModalOpen.jwId,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        data.header.map((a) => setView(a));
        let arr = data.data.map((row, index) => {
          return {
            ...row,
            id: v4(),
            index: index + 1,
          };
        });
        setMainData(arr);
      } else {
        toast.error(data.message.msg);
        setViewModalOpen(false);
      }
    } else {
      setViewModalOpen(false);
      toast.error("Something went wrong");
    }
  };

  const columns = [
    { field: "index", headerName: "S No.", width: 8 },
    { field: "part_code", headerName: "Part Code", width: 120 },
    { field: "component_name", headerName: "Name", width: 350 },
    { field: "bom_uom", headerName: "Uom", width: 100 },
    { field: "bom_qty", headerName: "BOM Qty", width: 100 },
    { field: "bom_rate", headerName: "BOM Rate", width: 100 },
    { field: "required_qty", headerName: "Req. Qty", width: 100 },
    { field: "issue_qty", headerName: "Issue Qty", width: 100 },
    { field: "pending_qty", headerName: "Short/Access", width: 180 },
    { field: "comsump_qty", headerName: "Consumption", width: 120 },
    { field: "rm_return_qty", headerName: "RM Return", width: 120 },
    { field: "p_with_jw", headerName: "Pending With JW", width: 150 },
    { field: "outward_value", headerName: "Outward Value", width: 120 },
    { field: "inward_value", headerName: "Consumption Value", width: 120 },
    { field: "rtn_inward_value", headerName: "RM Return Value", width: 120 },
  ];

  const cancel = () => {
    setMainData([]);
    setViewModalOpen(false);
  };
  const handleDownload = () => {
    downloadCSV(
      mainData,
      columns,
      `PO analysis FG/SFG : ${viewModalOpen.skuKey} | ${viewModalOpen.jwId}`
    );
  };
  useEffect(() => {
    if (viewModalOpen) {
      getFecthData();
    }
  }, [viewModalOpen]);
  const items = [
    {
      key: "Create",
      label: <a href="/jw-rw-challan">Create</a>,
    },
    {
      key: "SF Inward",
      label: <a href="/jw-sf-inward">Inward</a>,
    },
    {
      key: "RM Return",
      label: <a href="/jw-rm-return">Return</a>,
    },
  ];
  return (
    <Space>
      <Drawer
        width="100vw"
        title={`FG/SFG : ${viewModalOpen?.sku} | ${viewModalOpen?.jwId}`}
        placement="right"
        destroyOnClose={true}
        closable={false}
        onClose={() => setViewModalOpen(false)}
        open={viewModalOpen}
        getContainer={false}
        bodyStyle={{ padding: 5 }}
        extra={
          <Space>
            <CloseCircleFilled onClick={cancel} />
          </Space>
        }
      >
        <Row>
          <Card
            size="small"
            title="Details"
            extra={
              <>
                <Dropdown menu={{ items }} placement="bottom">
                  <Button style={{ marginRight: 10 }}>Jump To</Button>
                </Dropdown>
                <CommonIcons action="downloadButton" onClick={handleDownload} />
              </>
            }
          >
            {loading && <Loading />}
            <Col span={24}>
              <Row gutter={[5, 8]}>
                <Col span={6} style={{ fontSize: "12px", fontWeight: "bold" }}>
                  JW PO ID:
                  <span
                    style={{
                      marginLeft: 5,

                      fontWeight: 500,
                    }}
                  >
                    {view.jobwork_id}
                  </span>
                </Col>
                <Col
                  span={6}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  Jobwork ID :
                  <span
                    style={{
                      marginLeft: 5,

                      fontWeight: 500,
                    }}
                  >
                    {view.jobwork_id}
                  </span>
                </Col>

                <Col
                  span={6}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG Name & SKU :
                  <span
                    style={{
                      marginLeft: 5,

                      fontWeight: 500,
                    }}
                  >
                    {view.product_name}
                  </span>
                </Col>
                <Col
                  span={6}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  JW PO created by :
                  <span
                    style={{
                      marginLeft: 5,

                      fontWeight: 500,
                    }}
                  >
                    {view.created_by}
                  </span>
                </Col>
                <Col
                  span={6}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG BOM of Recipe :
                  <span
                    style={{
                      marginLeft: 5,

                      fontWeight: 500,
                    }}
                  >
                    {view.subject_name}
                  </span>
                </Col>
                <Col
                  span={6}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  Regisered Date & Time :
                  <span
                    style={{
                      marginLeft: 5,

                      fontWeight: 500,
                    }}
                  >
                    {view.registered_date}
                  </span>
                </Col>
                <Col
                  span={6}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG Ord Qty :
                  <span
                    style={{
                      marginLeft: 5,

                      fontWeight: 500,
                    }}
                  >
                    {view.ordered_qty}
                  </span>
                </Col>
                <Col
                  span={6}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  Job ID Status :
                  <span
                    style={{
                      marginLeft: 5,

                      fontWeight: 500,
                    }}
                  >
                    {view.jw_status}
                  </span>
                </Col>
                <Col
                  span={6}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  FG/SFG processed Qty:
                  <span
                    style={{
                      marginLeft: 5,

                      fontWeight: 500,
                    }}
                  >
                    {view.proceed_qty}
                  </span>
                </Col>
                <Col
                  span={6}
                  style={{ fontSize: "12px", fontWeight: "bolder" }}
                >
                  Vendor:
                  <span
                    style={{
                      marginLeft: 5,

                      fontWeight: 500,
                    }}
                  >
                    {view.vendor_name}
                  </span>
                </Col>
              </Row>
            </Col>
          </Card>
        </Row>

        <div style={{ height: "82%", marginTop: "5px" }}>
          <div style={{ height: "100%" }} className="hide-select">
            <MyDataTable
              checkboxSelection={true}
              loading={loading}
              columns={columns}
              data={mainData}
            />
          </div>
        </div>
      </Drawer>
    </Space>
  );
};

export default ViewModal;
