import React, { useState } from "react";
import axios from "axios";
import MyDatePicker from "../../../Components/MyDatePicker";
import { toast } from "react-toastify";
import MyDataTable from "../../../Components/MyDataTable";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import links from "./links";
import { Button, Card, Col, Row, Skeleton, Space, Typography } from "antd";
import { PrinterFilled, DownloadOutlined } from "@ant-design/icons";
import { v4 } from "uuid";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import { useDispatch } from "react-redux/es/exports";
import { useEffect } from "react";
import { setCurrentLinks } from "../../../Features/loginSlice/loginSlice.js";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../axiosInterceptor";
import { useLocation, useParams } from "react-router-dom";

export default function LedgerReport() {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [searchLedger, setSearchLedger] = useState(null);
  const [searchDateRange, setSearchDateRange] = useState("");
  const [selectLoading, setSelectLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState({ rows: [] });
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const dispatch = useDispatch();
  const params = useParams();
  const { Title, Link, Text } = Typography;
  const getLedgerOptions = async (searchInput) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/ledger/ledger_options", {
      search: searchInput,
    });
    setSelectLoading(false);
    if (data.code === 200) {
      let arr = [];
      arr = data.data.map((d) => {
        return {
          text: d.text,
          value: d.id,
        };
      });
      setAsyncOptions(arr);
    }
  };
  const getLedgerReport = async () => {
    if (searchLedger && searchDateRange) {
      setLoading(true);
      setSearchLoading(true);
      const { data } = await imsAxios.post("/tally/ledger/ledger_report", {
        date: searchDateRange,
        data: searchLedger.value,
      });
      setLoading(false);
      setSearchLoading(false);
      if (data.code === 200) {
        const arr = data.data.rows.map((row, index) => {
          return {
            ...row,
            id: v4(),
            index: index + 1,
          };
        });
        setLedgerData({ summary: data.data.summary, rows: arr });
      } else {
        setLedgerData({ rows: [] });
        toast.error(data.message.msg);
      }
    }
  };
  const ledgerByCode = async (code) => {
    const response = await imsAxios.post("/tally/ledger/ledger_options", {
      search: code,
    });
    if (response.data) {
      if (response.data.code === 200) {
        let obj = {
          label: response.data.data[0].text,
          value: response.data.data[0].id,
        };
        setSearchLedger(obj);
      } else {
        toast.error(response.data.message.msg);
      }
    }
  };
  const ledgerReportColumns = [
    {
      headerName: "Ref. Date",
      field: "ref_date",
      renderCell: ({ row }) => <ToolTipEllipses text={row.ref_date} />,
      width: 100,
    },
    {
      headerName: "Invoice Number",
      field: "invoice_no",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.invoice_no} copy={true} />
      ),
      flex: 1,
    },
    {
      headerName: "Invoice Date",
      field: "invoice_date",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoice_date} />,
      width: 100,
    },

    {
      headerName: "Reference",
      field: "ref",
      renderCell: ({ row }) => <ToolTipEllipses text={row.ref} />,
      width: 200,

      // width: "12vw",
    },
    {
      headerName: "Voucher Type",
      field: "which_module",
      width: 100,
    },
    {
      headerName: "Voucher Number",
      field: "module_used",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.module_used} copy={true} />
      ),
      flex: 1,
    },
    {
      headerName: "Debit",
      field: "debit",
      flex: 1,
    },
    {
      headerName: "Credit",
      flex: 1,

      field: "credit",
    },
  ];
  const downloadFun = () => {
    let csvData = ledgerData.rows.map((row, index) => {
      return {
        "Ref Date": row.ref_date,
        Refrence: row.ref,
        "Invoice Date": row.invoice_date,
        "Invoice No.": row.invoice_no,
        "Voucher Type.": row.which_module,
        "Voucher Number": row.module_used,
        "Debit.": row.debit.replaceAll(",", ""),
        Credit: row.credit.replaceAll(",", ""),
      };
    });
    csvData = [
      ...csvData,
      {
        title: "Ledger: ",
        Ledger: searchLedger.label,
        datetitle: "Date Range",
        Date: searchDateRange,
      },
      {
        Opening:
          "Opening: " + ledgerData?.summary[0]?.opening.replaceAll(",", ""),
        "Current Total Debit":
          "Current Total Debit: " +
          ledgerData?.summary[0]?.total_debit.replaceAll(",", ""),
        "Current Total Credit":
          "Current Total Credit: " +
          ledgerData?.summary[0]?.total_credit.replaceAll(",", ""),
        Closing:
          "Closing: " + ledgerData?.summary[0]?.closing.replaceAll(",", ""),
      },
    ];
    downloadCSVCustomColumns(
      csvData,
      `Ledger Report ${searchLedger.label} ${searchDateRange}`
    );
  };
  useEffect(() => {
    dispatch(setCurrentLinks(links));
  }, []);
  useEffect(() => {
    if (params && params?.code) {
      ledgerByCode(params.code);
    }
  }, [params]);
  return (
    <div style={{ height: "100%" }}>
      {/* <InternalNav links={links} /> */}
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        <Col span={12}>
          <Space>
            <div style={{ width: 250 }}>
              <MyAsyncSelect
                onBlur={() => setAsyncOptions([])}
                value={searchLedger}
                selectLoading={selectLoading}
                placeholder="Select Ledger"
                labelInValue
                onChange={(value) => setSearchLedger(value)}
                loadOptions={getLedgerOptions}
                optionsState={asyncOptions}
              />
            </div>
            <div style={{ width: 300 }}>
              <MyDatePicker
                size="default"
                setDateRange={setSearchDateRange}
                dateRange={searchDateRange}
                value={searchDateRange}
              />
            </div>
            <Space>
              <Button
                disabled={!searchLedger || !searchDateRange || loading}
                type="primary"
                loading={searchLoading}
                onClick={getLedgerReport}
              >
                Search
              </Button>
            </Space>
          </Space>
        </Col>
        <CommonIcons
          disabled={ledgerData?.rows.length == 0}
          action={"downloadButton"}
          onClick={downloadFun}
        />
      </Row>
      <Row style={{ height: "100%", padding: "0 10px" }} gutter={8}>
        <Col span={6}>
          <Card title="Summary" size="small">
            <Row gutter={[0, 10]}>
              <Col span={24}>
                <Title
                  style={{
                    fontSize: window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                    marginBottom: -5,
                  }}
                  level={5}
                >
                  Opening:
                </Title>
              </Col>
              <Col span={24}>
                <Skeleton
                  paragraph={false}
                  style={{ width: "100%" }}
                  rows={2}
                  loading={loading}
                  active
                />
                {!loading && ledgerData?.summary && (
                  <Typography.Text
                    style={{
                      fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                    }}
                  >
                    {ledgerData?.summary[0]?.opening}
                  </Typography.Text>
                )}
              </Col>
              <Col span={24}>
                <Title
                  style={{
                    fontSize: window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                    marginBottom: -5,
                  }}
                  level={5}
                >
                  Current Total Debit:
                </Title>
              </Col>
              <Col span={24}>
                <Skeleton
                  paragraph={false}
                  style={{ width: "100%" }}
                  rows={2}
                  loading={loading}
                  active
                />
                {!loading && ledgerData?.summary && (
                  <Typography.Text
                    style={{
                      fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                    }}
                  >
                    {ledgerData?.summary[0]?.total_debit}
                  </Typography.Text>
                )}
              </Col>
              <Col span={24}>
                <Title
                  style={{
                    fontSize: window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                    marginBottom: -5,
                  }}
                  level={5}
                >
                  Current Total Credit:
                </Title>
              </Col>
              <Col span={24}>
                <Skeleton
                  paragraph={false}
                  style={{ width: "100%" }}
                  rows={2}
                  loading={loading}
                  active
                />
                {!loading && ledgerData?.summary && (
                  <Typography.Text
                    style={{
                      fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                    }}
                  >
                    {ledgerData?.summary[0]?.total_credit}
                  </Typography.Text>
                )}
              </Col>
              <Col span={24}>
                <Title
                  style={{
                    fontSize: window.innerWidth < 1600 ? "0.85rem" : "0.95rem",
                    marginBottom: -5,
                  }}
                  level={5}
                >
                  Closing:
                </Title>
              </Col>
              <Col span={24}>
                <Skeleton
                  paragraph={false}
                  style={{ width: "100%" }}
                  rows={2}
                  loading={loading}
                  active
                />
                {!loading && ledgerData?.summary && (
                  <Typography.Text
                    style={{
                      fontSize: window.innerWidth < 1600 ? "0.7rem" : "0.8rem",
                    }}
                  >
                    {ledgerData?.summary[0]?.closing}
                  </Typography.Text>
                )}
              </Col>
            </Row>
          </Card>
        </Col>
        <Col style={{ height: "85%" }} span={18}>
          <MyDataTable
            sortable={true}
            loading={loading}
            columns={ledgerReportColumns}
            data={ledgerData?.rows}
            pagination
            headText="center"
            // export={true}
          />
        </Col>
      </Row>
    </div>
  );
}
