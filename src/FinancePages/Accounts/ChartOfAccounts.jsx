import React from "react";
import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import Loading from "../../Components/Loading";
import {
  downloadCSV,
  downloadCSVCustomColumns,
} from "../../Components/exportToCSV";
import { v4 } from "uuid";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material";
import TableActions, {
  CommonIcons,
} from "../../Components/TableActions.jsx/TableActions";
import { Button, Card, Col, Form, Row, Space } from "antd";
import SingleDatePicker from "../../Components/SingleDatePicker";
import MyDatePicker from "../../Components/MyDatePicker";
import { imsAxios } from "../../axiosInterceptor";
import SummaryCard from "../../Components/SummaryCard";

export default function ChartOfAccounts() {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState("");
  const [summary, setSummary] = useState([
    { title: "From - To", description: "" },
    { title: "Closing", description: "" },
    { title: "Opening", description: "" },
    { title: "Total Credit", description: "" },
    { title: "Total Debit", description: "" },
  ]);
  let arr = [];
  const getChart = async () => {
    setLoading(true);
    const response = await imsAxios.post("/tally/ledger/tally", {
      date: dateRange,
    });
    setLoading(false);
    let data = response.data;
    if (data) {
      setCharts(flatArray(data.data));

      let summaryData = [
        { title: "From - To", description: dateRange },
        {
          title: "Closing",
          description: Number(data.summary[0].closing),
        },
        {
          title: "Opening",
          description: Number(data.summary[0].opening),
        },
        {
          title: "Total Credit",
          // description: Number(data.summary[0].total_credit)

          description: Number(data.summary[0].total_credit),
        },
        {
          title: "Total Debit",
          description: Number(data.summary[0].total_debit),
        },
      ];
      setSummary(summaryData);
    }
  };
  const handleDownloadCSV = () => {
    let csvData = [];
    csvData = charts.map((row) => {
      return {
        Code: row.code,
        Name: row.label
          ? row.label
              .toString()
              .replaceAll("&amp;", "&")
              // .replaceAll("amp", "")
              .replaceAll(";", "")
          : " ",

        Type: row.parent
          ? row.parent == "--"
            ? "Master"
            : "Sub Group"
          : !row.type
          ? "Ledger"
          : row.type,
        Opening: row.opening ?? "--",
        Debit: row.debit && row.debit,
        Credit: row.credit && row.credit,
        Closing: row.closing ?? "--",
      };
    });
    // "From - To": dateRange },
    csvData = [
      {
        Code: "",
        label: "Grand Total",
        Type: "",
        Opening: summary[2].description,
        Debit: summary[4].description,
        Credit: summary[3].description,
        Closing: summary[1].description,
        "From - To": dateRange,
      },
      ...csvData,
      {
        Code: "",
        label: "Grand Total",
        Type: "",
        Opening: summary[2].description,
        Debit: summary[4].description,
        Credit: summary[3].description,
        Closing: summary[1].description,
      },
    ];

    csvData = [...csvData];
    downloadCSVCustomColumns(csvData, "Charts");
  };
  const flatArray = (array) => {
    array?.map((row) => {
      if (row.nodes) {
        arr = [...arr, row];
        flatArray(row.nodes);
        if (row.legers) {
          // let total row.legers.
          arr = [...arr, ...row.legers];
        }
      } else {
        arr = [...arr, row];
        if (row.legers) {
          arr = [
            ...arr,
            ...row.legers,
            {
              type: "End Total",
              label: row.label + " Total",
              debit: row.total_debit,
              credit: row.total_credit,
              closing: row.total_closing,
              opening: row.total_opening,
            },
          ];
        }
      }
    });
    arr = arr.map((row) => {
      return {
        ...row,
        id: v4(),
        type: row.parent
          ? row.parent == "--"
            ? "Master"
            : "Sub Group"
          : !row.type
          ? "Ledger"
          : row.type,
        lable:
          row.label &&
          row.label
            .replaceAll("&amp;", "&")
            .replaceAll("amp", "")
            .replaceAll(";", ""),
      };
    });
    return arr;
  };
  return (
    <>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "90%",
          padding: "0 10px",
          overflow: "hidden",
        }}
      >
        <Row style={{ marginBottom: 5 }} justify="space-between">
          <Space>
            <Form layout="inline">
              <Form.Item label="Select Range">
                <MyDatePicker setDateRange={setDateRange} />
              </Form.Item>
              <Button
                onClick={getChart}
                disabled={dateRange == ""}
                type="primary"
              >
                Fetch
              </Button>
            </Form>
          </Space>
          <CommonIcons
            action="downloadButton"
            onClick={handleDownloadCSV}
            disabled={charts.length == 0}
          />
        </Row>
        <Row gutter={4} style={{ height: "100%" }}>
          <Col span={4}>
            <SummaryCard summary={summary} title="Summary" loading={loading} />
          </Col>
          <Col span={20}>
            <Card size="small" style={{ height: "92%" }}>
              <TableContainer sx={{ maxHeight: "75vh" }}>
                {loading && <Loading size="large" />}
                <Table
                  stickyHeader
                  sx={{ width: "100%" }}
                  size="small"
                  aria-label="a dense table"
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Opening</TableCell>
                      <TableCell>Debit</TableCell>
                      <TableCell>Credit</TableCell>
                      <TableCell>Closing</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {charts.map((row) => (
                      <TableRow
                        key={row.name}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        {/* code */}
                        <TableCell
                          style={{
                            fontWeight: row.type === "End Total" && "bold",
                          }}
                          component="th"
                          scope="row"
                        >
                          {row.code}
                        </TableCell>
                        {/* name */}
                        <TableCell
                          style={{
                            fontWeight: row.type === "End Total" && "bold",
                          }}
                        >
                          {row.label}
                        </TableCell>
                        {/* type */}
                        <TableCell
                          style={{
                            fontWeight: row.type === "End Total" && "bold",
                          }}
                        >
                          {row.parent
                            ? row.parent == "--"
                              ? "Master"
                              : "Sub Group"
                            : !row.type
                            ? "Ledger"
                            : row.type}
                        </TableCell>
                        {/* opening */}
                        <TableCell
                          style={{
                            fontWeight: row.type === "End Total" && "bold",
                          }}
                        >
                          {/* {row.opening} */}
                          {row.opening}
                        </TableCell>
                        {/* debit */}
                        <TableCell
                          style={{
                            fontWeight: row.type === "End Total" && "bold",
                          }}
                        >
                          {/* {row.debit} */}
                          {row.debit}
                        </TableCell>
                        {/* credit */}
                        <TableCell
                          style={{
                            fontWeight: row.type === "End Total" && "bold",
                          }}
                        >
                          {/* {row.credit} */}
                          {row.credit}
                        </TableCell>
                        {/* closing */}
                        <TableCell
                          style={{
                            fontWeight: row.type === "End Total" && "bold",
                          }}
                        >
                          {/* {row.closing} */}
                          {row.closing}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
