import React, { useState, useEffect } from "react";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import axios from "axios";
import { Button, Col, Drawer, Row, Space, Tooltip } from "antd";
import { PrinterFilled, DownloadOutlined } from "@ant-design/icons";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import { imsAxios } from "../../../axiosInterceptor";

export default function JounralPostingView({ jvId, setJvId }) {
  const [journalDate, setJournalDate] = useState("");
  const [refData, setRefDate] = useState("");
  const [debitTotal, setDebitTotal] = useState(0);
  const [creditTotal, setCreditTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [journalRows, setJounralRows] = useState([]);
  const [printLoading, setPrintLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const columns = [
    {
      headerName: "GL Code",
      // width: "15vw",
      flex: 1,
      sortable: false,
      field: "ladger_name",
      renderCell: ({ row }) =>
        row.total ? (
          <span
            style={{
              fontWeight: 500,
            }}
          >
            Total
          </span>
        ) : (
          <div className="copy-cell">
            {row.ladger_name +
              " (" +
              row.code +
              ")"
                .replaceAll("&amp;", "&")
                .replaceAll("amp", "")
                .replaceAll(";", "")}
          </div>
        ),
      // sortable: false,
    },
    {
      headerName: "Debit",
      sortable: false,
      field: "debit",
      width: 100,
      renderCell: ({ row }) => (
        <>
          {row.total ? (
            <span style={{ fontWeight: 500 }}>{debitTotal.toFixed(2)}</span>
          ) : (
            <span>{row?.debit == "" ? 0 : row?.debit}</span>
          )}
        </>
      ),

      // width: "8vw",
      // sortable: false,
    },
    {
      headerName: "Credit",
      width: 100,
      sortable: false,
      field: "credit",
      renderCell: ({ row }) => (
        <>
          {row.total ? (
            <span style={{ fontWeight: 500 }}>{creditTotal.toFixed(2)}</span>
          ) : (
            <span>{row?.credit == "" ? 0 : row?.credit}</span>
          )}
        </>
      ),
      sortable: false,
    },
    {
      headerName: "Comment",
      flex: 1,
      sortable: false,
      field: "comment",
      renderCell: ({ row }) => (
        <Tooltip title={row.comment}>{row.comment}</Tooltip>
      ),
      //   width: "12.5vw",
      // sortable: false,
    },
  ];
  const getJVDetail = async () => {
    setLoading(true);
    let creditArr = [];
    let debitArr = [];
    let arr = [];
    if (jvId) {
      const { data } = await imsAxios.post("/tally/jv/jv_detail", {
        jv_key: jvId,
      });
      setLoading(false);
      if (data.code == 200) {
        setJournalDate(data.data[0].insert_date);
        setRefDate(data.data[0].ref_date);
        arr = data.data;
        data.data.map((row) => {
          if (row.credit != "") {
            creditArr.push(row.credit);
          } else {
            creditArr.push(0);
          }
          if (row.debit != "") {
            debitArr.push(row.debit);
          } else {
            debitArr.push(0);
          }
          //   creditArr.push(row.credit);
          //   debitArr.push(row.debit);
        });
      }
      arr = [...arr, { id: v4(), total: true, debit: 0, credit: 0 }];
      arr = arr.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setJounralRows(arr);
    }
    setCreditTotal(
      creditArr?.reduce((partialSum, a) => {
        return Number(partialSum) + Number(a);
      }, 0)
    );
    setDebitTotal(
      debitArr?.reduce((partialSum, a) => {
        return Number(partialSum) + Number(a);
      }, 0)
    );
  };
  const printFun = async () => {
    setPrintLoading(true);
    const { data } = await imsAxios.post("/tally/jv/jv_print", {
      jv_key: jvId,
    });
    setPrintLoading(false);
    printFunction(data.buffer.data);
  };
  const downloadFun = async () => {
    setDownloadLoading(true);
    let filename = `Journal Voucher ${jvId}`;
    const { data } = await imsAxios.post("/tally/jv/jv_print", {
      jv_key: jvId,
    });
    setDownloadLoading(false);
    downloadFunction(data.buffer.data, filename);
  };
  useEffect(() => {
    getJVDetail();
  }, [jvId]);

  const DescriptionItem = ({ title, content }) => (
    <div className="site-description-item-profile-wrapper">
      <p className="site-description-item-profile-p-label">{title}</p>
      {content}
    </div>
  );
  return (
    <Drawer
      title={`Journal Voucher:  ${jvId}`}
      width="50vw"
      height="100vh"
      onClose={() => setJvId(null)}
      open={jvId}
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
              <DescriptionItem title="Created Date" content={journalDate} />
            </Col>
            <Col
              style={{ display: "flex", justifyContent: "flex-end" }}
              span={12}
            >
              <DescriptionItem title="Date" content={refData} />
            </Col>
          </Row>
        </div>
        <div style={{ width: "100%", height: "90%", paddingTop: 10 }}>
          <MyDataTable
            hideHeaderMenu
            data={journalRows}
            columns={columns}
            loading={loading}
          />
        </div>
      </>
    </Drawer>
  );
}
