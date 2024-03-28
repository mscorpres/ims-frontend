import { useState, useEffect } from "react";
import { Button, Card, Col, Divider, Row, Space, Typography } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import { downloadCSV } from "../../../Components/exportToCSV";
import {
  bankColumns,
  cashColumns,
  journalColumns,
  contraColumns,
  vbtColumns,
} from "./DayBookColumns";
import MyButton from "../../../Components/MyButton";

function DayBook() {
  const [searchDateRange, setSearchDateRange] = useState("");
  const [loading, setLoading] = useState(0);
  const [bankRows, setBankRows] = useState([]);
  const [cashRows, setCashRows] = useState([]);
  const [journalRows, setJournalRows] = useState([]);
  const [contraRows, setContraRows] = useState([]);
  const [vbtRows, setVbtRows] = useState([]);

  const getBankRows = async () => {
    let paymentArr = [];
    let receiptArr = [];
    setLoading((loading) => loading + 1);
    const paymentResponse = await imsAxios.post("/tally/voucher/bp_list", {
      wise: "date_wise",
      data: searchDateRange,
    });
    const { data: paymentData } = paymentResponse;
    if (paymentData.code === 200) {
      paymentArr = paymentData.data;
    } else {
      toast.error(paymentData.message.msg);
    }
    const receptResponse = await imsAxios.post("/tally/voucher/br_list", {
      wise: "date_wise",
      data: searchDateRange,
    });
    const { data: receiptData } = receptResponse;
    if (receiptData.code === 200) {
      receiptArr = receiptData.data;
    } else {
      toast.error(receiptData.message.msg);
    }
    setLoading((loading) => loading + 1);
    let arr = [...paymentArr, ...receiptArr];
    let bankPayments = arr.map((row) => {
      if (row.payment) {
        return {
          ...row,
          payment: convertToNumber(row.payment),
        };
      }
    });
    setBankRows(bankPayments);
  };
  const convertToNumber = (debitString) => {
    const cleanedDebit = parseFloat(debitString.replace(/,/g, ""));

    const debitNumber = cleanedDebit === 0 ? 0 : cleanedDebit || 0;

    return debitNumber;
  };
  const convertToNumberForWithOutComma = (debitString) => {
    const cleanedDebit = parseFloat(debitString);

    const debitNumber = debitString === 0 ? 0 : cleanedDebit || 0;

    return debitNumber;
  };
  const getCashRows = async () => {
    let paymentArr = [];
    let receiptArr = [];
    const paymentResponse = await imsAxios.post(
      "/tally/cash/cashpayment_list",
      {
        wise: "date_wise",
        data: searchDateRange,
      }
    );
    const { data: paymentData } = paymentResponse;
    if (paymentData.code === 200) {
      paymentArr = paymentData.data;
    } else {
      toast.error(paymentData.message.msg);
    }
    const receptResponse = await imsAxios.post("/tally/cash/cashreceipt_list", {
      wise: "date_wise",
      data: searchDateRange,
    });
    const { data: receiptData } = receptResponse;
    if (receiptData.code === 200) {
      receiptArr = receiptData.data;
    } else {
      toast.error(receiptData.message.msg);
    }
    setLoading((loading) => loading + 1);
    let arr = [...paymentArr, ...receiptArr];
    // console.log("arrr", arr);
    let cashRows = arr.map((row) => {
      if (row.payment) {
        return {
          ...row,
          payment: convertToNumber(row.payment),
        };
      }
    });
    setCashRows(cashRows);
  };
  const getJournalRows = async () => {
    let jornalArr = [];
    const journalReponse = await imsAxios.post("/tally/jv/jv_list", {
      wise: "date_wise",
      data: searchDateRange,
    });
    const { data: journalData } = journalReponse;
    if (journalData.code === 200) {
      jornalArr = journalData.data;
    } else {
      toast.error(journalData.message.msg);
    }

    setLoading((loading) => loading + 1);
    let arr = [...jornalArr];
    // console.log("arrr", arr);
    let journalRows = arr.map((row) => {
      // if (row.credit) {
      return {
        ...row,
        credit: convertToNumberForWithOutComma(row.credit),
        debit: convertToNumberForWithOutComma(row.debit),
      };
      // }
    });
    // console.log("journalRows", journalRows);
    setJournalRows(journalRows);
  };
  const getContraRows = async () => {
    let contraArr = [];
    const contraResponse = await imsAxios.post(
      "/tally/contra/contra_report_list",
      {
        wise: "date",
        data: searchDateRange,
      }
    );
    const { data: contraData } = contraResponse;
    if (contraData.code === 200) {
      contraArr = contraData.data;
    } else {
      toast.error(contraData.message.msg);
    }

    setLoading((loading) => loading + 1);
    let arr = [...contraArr];

    let contraRows = arr.map((row) => {
      if (row.ammount) {
        return {
          ...row,
          ammount: convertToNumber(row.ammount),
        };
      }
    });
    setContraRows(contraRows);
  };
  const getVBTReport = async () => {
    let vbtArr = [];
    const vbtReponse = await imsAxios.post("/tally/vbt_report/vbt_report", {
      wise: "datewise",
      data: searchDateRange,
      vbt_type: "ALL",
    });
    const { data: vbtData } = vbtReponse;
    if (vbtData.code === 200) {
      vbtArr = vbtData.data;
    } else {
      toast.error(vbtData.message.msg);
      setLoading(false);
    }

    setLoading((loading) => loading + 1);
    let arr = [...vbtArr];
    setVbtRows(arr);
  };
  const getAllRows = async () => {
    resetHandler();
    await getBankRows();
    await getCashRows();
    await getJournalRows();
    await getContraRows();
    await getVBTReport();
    setLoading(0);
  };
  const resetHandler = () => {
    setBankRows([]);
    setCashRows([]);
    setJournalRows([]);
    setContraRows([]);
    setVbtRows([]);
  };

  return (
    <div style={{ height: "90%" }}>
      <Row
        style={{ padding: "0px 10px", paddingBottom: 5 }}
        justify="space-between"
      >
        <div>
          <Space>
            <MyDatePicker
              size="default"
              setDateRange={setSearchDateRange}
              dateRange={searchDateRange}
              value={searchDateRange}
            />

            <MyButton
              // disabled={
              //   wise === "date"
              //     ? searchDateRange === ""
              //       ? true
              //       : false
              //     : !searchInput
              //     ? true
              //     : false
              // }
              loading={loading > 0}
              type="primary"
              onClick={getAllRows}
              variant="search"
            >
              Search
            </MyButton>
          </Space>
        </div>
      </Row>
      <Row style={{ padding: "0px 10px" }}>
        <Col span={6}>
          <Card size="small">
            <Row>
              {/* bank report */}
              <Col span={24}>
                <Row gutter={12} align="middle" justify="space-between">
                  <Col>
                    <Typography.Text style={{ fontWeight: 700 }} level={5}>
                      Bank Report
                    </Typography.Text>
                  </Col>
                  <Space>
                    <Col>{bankRows.length} Rows</Col>
                    <Col>
                      <CommonIcons
                        loading={loading < 2 && loading > 0}
                        disabled={bankRows.length === 0}
                        onClick={() =>
                          downloadCSV(bankRows, bankColumns, "Bank Report")
                        }
                        action="downloadButton"
                      />
                    </Col>
                  </Space>
                </Row>
              </Col>
              <Divider
                style={{ marginBottom: 15, marginTop: 15 }}
                size="small"
              />
              {/* cash report */}
              <Col span={24}>
                <Row gutter={12} align="middle" justify="space-between">
                  <Col>
                    <Typography.Text style={{ fontWeight: 700 }} level={5}>
                      Cash Report
                    </Typography.Text>
                  </Col>
                  <Col>
                    <Space>
                      <Col>{cashRows.length} Rows</Col>
                      <CommonIcons
                        loading={loading < 3 && loading > 0}
                        disabled={cashRows.length === 0}
                        action="downloadButton"
                        onClick={() =>
                          downloadCSV(cashRows, cashColumns, "Cash Report")
                        }
                      />
                    </Space>
                  </Col>
                </Row>
              </Col>
              <Divider
                style={{ marginBottom: 15, marginTop: 15 }}
                size="small"
              />
              {/* journal Report */}
              <Col span={24}>
                <Row gutter={12} align="middle" justify="space-between">
                  <Col>
                    <Typography.Text style={{ fontWeight: 700 }} level={5}>
                      Journal Report
                    </Typography.Text>
                  </Col>
                  <Col>
                    <Space>
                      <Col>{journalRows.length} Rows</Col>
                      <CommonIcons
                        disabled={journalRows.length === 0}
                        loading={loading < 4 && loading > 0}
                        action="downloadButton"
                        onClick={() =>
                          downloadCSV(
                            journalRows,
                            journalColumns,
                            "Journal Report"
                          )
                        }
                      />
                    </Space>
                  </Col>
                </Row>
              </Col>
              <Divider
                style={{ marginBottom: 15, marginTop: 15 }}
                size="small"
              />
              {/* contra report */}
              <Col span={24}>
                <Row gutter={12} align="middle" justify="space-between">
                  <Col>
                    <Typography.Text style={{ fontWeight: 700 }} level={5}>
                      Contra Report
                    </Typography.Text>
                  </Col>
                  <Col>
                    <Space>
                      {contraRows.length} Rows
                      <CommonIcons
                        disabled={contraRows.length === 0}
                        loading={loading < 5 && loading > 0}
                        action="downloadButton"
                        onClick={() =>
                          downloadCSV(
                            contraRows,
                            contraColumns,
                            "Contra Report"
                          )
                        }
                      />
                    </Space>
                  </Col>
                </Row>
              </Col>
              <Divider
                style={{ marginBottom: 15, marginTop: 15 }}
                size="small"
              />
              <Col span={24}>
                <Row gutter={12} align="middle" justify="space-between">
                  <Col>
                    <Typography.Text style={{ fontWeight: 700 }} level={5}>
                      VBT Report
                    </Typography.Text>
                  </Col>
                  <Col>
                    <Space>
                      {vbtRows.length} Rows
                      <CommonIcons
                        disabled={vbtRows.length === 0}
                        loading={loading < 6 && loading > 0}
                        action="downloadButton"
                        onClick={() =>
                          downloadCSV(vbtRows, vbtColumns, "VBT Report")
                        }
                      />
                    </Space>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DayBook;
