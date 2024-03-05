import React, { useEffect, useState } from "react";
import { Col, Drawer, Row, Space, Tooltip } from "antd";
import {
  EyeFilled,
  CloseCircleFilled,
  CloseOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { v4 } from "uuid";
import MyDataTable from "../../../../Components/MyDataTable";
import { imsAxios } from "../../../../axiosInterceptor";

function CashReceiptModal({ open, setOpen }) {
  const [cashReceiptRow, setCashReceiptRow] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allData, setAllData] = useState([]);
  const [header, setHeader] = useState([]);

  const getAllDataFetch = async () => {
    const { data } = await imsAxios.post(
      "/tally/cash/cash_receipt_report",
      {
        v_code: open,
      }
    );
    if (data.code == 200) {
      setHeader(data.header[0]);

      const arr = data.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setAllData(arr);
      // setCashReceiptRow(arr);
    }
  };

  const columns = [
    {
      headerName: "Particulars",
      field: "particulars",
      // sortable: false,
      width: 350,
    },
    {
      headerName: "Payment",
      renderCell: ({ row }) => row.ammount,
      //   row.which_module == "BP" ? <span>{row.debit}</span> : <span>{row.credit}</span>,

      field: "ammount",
    },
    {
      headerName: "Comment",
      //   width: "12.5vw",
      field: "comment",
      renderCell: ({ row }) => (
        <Tooltip title={row.comment}>{row.comment}</Tooltip>
      ),
    },
  ];

  useEffect(() => {
    if (open) {
      getAllDataFetch();
    }
  }, [open]);
  return (
    <Space>
      <Drawer
        width="50vw"
        height="100vh"
        title={`Cash Receipt Voucher: ${open}`}
        //   title={<CloseOutlined onClick={() => setOpen(false)} />}
        placement="right"
        closable={false}
        onClose={() => setOpen(false)}
        open={open}
        getContainer={false}
        //   style={{
        //     position: "absolute",
        //   }}
        extra={
          <Space>
            <CloseOutlined onClick={() => setOpen(false)} />
          </Space>
        }
      >
        <>
          <Row justify="space-between">
            <Col span={24} style={{ padding: "5px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Created:{header?.insert_date}</span>
                <span>
                  Effective Date:{header?.ref_date}{" "}
                </span>
                <span>Account: {header?.account}</span>
              </div>
            </Col>
          </Row>
          <div
            className="remove-table-footer"
            style={{ height: "75%", paddingTop: "10px" }}
          >
            <MyDataTable data={allData} columns={columns} />
          </div>
        </>
      </Drawer>
    </Space>
  );
}

export default CashReceiptModal;
