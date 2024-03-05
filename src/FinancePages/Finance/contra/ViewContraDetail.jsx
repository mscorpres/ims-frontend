import React, { useState, useEffect } from "react";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import axios from "axios";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import { Button, Col, Drawer, Row, Space, Tooltip } from "antd";
import { PrinterFilled, DownloadOutlined } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";

export default function ViewContraDetail({ contraId, setContraId }) {
  const [createDate, setCreateDate] = useState("");
  const [refDate, setRefDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [contraRows, setContraRows] = useState([]);
  const [printLoading, setPrintLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const columns = [
    {
      headerName: "Account",
      flex: 1,
      field: "account_name",
    },
    {
      headerName: "Debit",
      field: "debit",
    },
    {
      headerName: "Credit",
      field: "credit",
    },

    {
      headerName: "Comment",
      width: 200,
      renderCell: ({ row }) => (
        <Tooltip title={row.comment}>{row.comment}</Tooltip>
      ),
      // selector: (row) => row.comment,
      sortable: false,
    },
  ];
  const getContraDetail = async () => {
    setLoading(true);

    if (contraId) {
      const { data } = await imsAxios.post("/tally/contra/contra_report", {
        data: contraId,
      });
      setLoading(false);
      if (data.code == 200) {
        const arr = data.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setCreateDate(data.data[0].create_date);
        setContraRows(arr);
        setRefDate(data.data[0].ref_date);
      }
    }
  };
  const printFun = async () => {
    setPrintLoading(true);
    const { data } = await imsAxios.post("/tally/contra/contra_print", {
      code: contraId,
    });
    printFunction(data.buffer.data);
    setPrintLoading(false);
  };
  const downloadFun = async () => {
    setDownloadLoading(true);
    let filename = `Contra ${contraId}`;
    const { data } = await imsAxios.post("/tally/contra/contra_print", {
      code: contraId,
    });
    downloadFunction(data.buffer.data, filename);
    setDownloadLoading(false);
  };
  const DescriptionItem = ({ title, content }) => (
    <div className="site-description-item-profile-wrapper">
      <p className="site-description-item-profile-p-label">{title}</p>
      {content}
    </div>
  );
  useEffect(() => {
    getContraDetail();
  }, [contraId]);
  return (
    <Drawer
      title={`Contra Transaction:  ${contraId}`}
      width="50vw"
      height="100vh"
      onClose={() => setContraId(null)}
      open={contraId}
      extra={
        <Space>
          <Button
            type="primary"
            shape="circle"
            loading={printLoading}
            icon={<PrinterFilled />}
            onClick={printFun}
          />
          <Button
            type="primary"
            shape="circle"
            loading={downloadLoading}
            icon={<DownloadOutlined />}
            onClick={downloadFun}
          />
        </Space>
      }
    >
      <>
        <div>
          <Row>
            <Col span={12}>
              <DescriptionItem title="Created Date" content={createDate} />
            </Col>
            <Col
              style={{ display: "flex", justifyContent: "flex-end" }}
              span={12}
            >
              <DescriptionItem title="Date" content={refDate} />
            </Col>
          </Row>
        </div>
        <div
          className="remove-table-footer"
          style={{ width: "100%", height: "90%", paddingTop: 10 }}
        >
          <MyDataTable data={contraRows} columns={columns} loading={loading} />
        </div>
      </>
    </Drawer>
  );
}
