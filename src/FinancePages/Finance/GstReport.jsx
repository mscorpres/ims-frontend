import React, { useState } from "react";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import MyDataTable from "../../Components/MyDataTable";
import { Button, Col, Row, Space, Table, DatePicker } from "antd";
import MyDatePicker from "../../Components/MyDatePicker";
import { imsAxios } from "../../axiosInterceptor";

import { GridExpandMoreIcon } from "@mui/x-data-grid";
import { v4 } from "uuid";
import { downloadCSVnested } from "../../Components/exportToCSV";
import { DownloadOutlined, MessageOutlined } from "@ant-design/icons";
import socket from "../../Components/socket";
import MySelect from "../../Components/MySelect";
import { useForm } from "antd/es/form/Form";
import { Form } from "antd";
import { toast } from "react-toastify";
//
function GstReport() {
  const { RangePicker } = DatePicker;
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [dataKeys, setDataKeys] = useState([]);
  const [accData, setAccData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [wise, setWise] = useState(wiseoptions[0].value);
  const [form] = Form.useForm();
  let columns;
  columns = [
    {
      title: "Serial Number",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "GST Number",
      dataIndex: "gstNo",
      key: "gstNo",
    },
    {
      title: "State Name",
      dataIndex: "stateName",
      key: "stateName",
      width: "12%",
    },
    {
      title: "Voucher Count",
      dataIndex: "Vcount",
      key: "Vcount",
    },
    {
      title: "Taxable Amt",
      dataIndex: "TaxableAmt",
      key: "TaxableAmt",
    },
    {
      title: "Total SGST",
      dataIndex: "ttlSgst",
      key: "ttlSgst",
    },
    {
      title: "Total CGST",
      dataIndex: "ttlCgst",
      key: "ttlCgst",
    },
    {
      title: "Total IGST",
      dataIndex: "ttlIgst",
      key: "ttlIgst",
    },
    {
      title: "Tax Amt",
      dataIndex: "TaxAmt",
      key: "TaxAmt",
    },
    {
      title: "Invoice Amt",
      dataIndex: "InvAmt",
      key: "InvAmt",
    },
  ];
  const getDifferentAndSameGST = (data) => {
    const uniqueGST = {};
    const sameGST = {};

    data.forEach((item) => {
      if (!uniqueGST[item.gstNo]) {
        uniqueGST[item.gstNo] = [item];
      } else {
        if (!sameGST[item.gstNo]) {
          sameGST[item.gstNo] = [uniqueGST[item.gstNo][0], item];
          delete uniqueGST[item.gstNo];
        } else {
          sameGST[item.gstNo].push(item);
        }
      }
    });

    return {
      uniqueGST: Object.values(uniqueGST).flat(),
      sameGST: Object.values(sameGST).flat(),
    };
  };

  function getLastDateOfMonth(year, month) {
    // Ensure month is in the valid range (1 to 12)
    if (month < 1 || month > 12) {
      throw new Error("Invalid month. Month must be between 1 and 12.");
    }

    // Create a Date object for the first day of the next month
    const nextMonthFirstDay = new Date(year, month, 1);

    // Subtract one day to get the last day of the current month
    const lastDateOfMonth = new Date(nextMonthFirstDay - 1);

    // Return the day component of the last date
    return lastDateOfMonth.getDate();
  }
  function getLastDateOfQuarter(startingMonth, year) {
    // Ensure startingMonth is in the valid range (1 to 12)
    if (startingMonth < 1 || startingMonth > 12) {
      throw new Error(
        "Invalid starting month. Month must be between 1 and 12."
      );
    }

    // Calculate the last month of the quarter
    const lastMonthOfQuarter =
      startingMonth + 2 > 12 ? startingMonth - 10 : startingMonth + 2;

    // Create a Date object for the first day of the next quarter
    const nextQuarterFirstDay = new Date(year, lastMonthOfQuarter, 1);

    // Subtract one day to get the last day of the current quarter
    const lastDateOfQuarter = new Date(nextQuarterFirstDay - 1);

    // Get day, month, and year components
    const day = lastDateOfQuarter.getDate();
    const month = lastDateOfQuarter.getMonth() + 1; // Months are 0-indexed
    const formattedMonth = month < 10 ? `0${month}` : month; // Add leading zero if needed
    const yearComponent = lastDateOfQuarter.getFullYear();

    // Return the formatted date as "DD-MM-YYYY"
    return `${day < 10 ? "0" : ""}${day}-${formattedMonth}-${yearComponent}`;
  }

  const emitDownloadEvent = async () => {
    const values = await form.validateFields();
    let date;
    if (wise === "month") {
      let lastdate = getLastDateOfMonth(values.date.$y, values.date.$M + 1);
      let formattedMonth =
        (values.date.$M + 1).toString().length === 1
          ? `0${values.date.$M + 1}`
          : values.date.$M + 1;
      date = `01-${formattedMonth}-${values.date.$y}-${lastdate}-${formattedMonth}-${values.date.$y}`;
    } else if (wise === "year") {
      date = `01-04-${values.date.$y}-31-03-${values.date.$y + 1}`;
    } else if (wise === "quarter") {
      let lastdate = getLastDateOfQuarter(searchInput.$M + 1, searchInput.$y);
      date = `01-0${searchInput.$M + 1}-${searchInput.$y}-${lastdate}`;
    }
    let newId = v4();
    let obj = {
      notificationId: newId,
      date: date,
    };
    toast.success("report has been generated and sent to your email.");
    socket.emit("gstrReport", JSON.stringify(obj));
  };

  function groupByGSTNumber(array) {
    const groupedByGST = {};

    array.forEach((obj) => {
      const gstNumber = obj.gstNo;

      if (!groupedByGST[gstNumber]) {
        groupedByGST[gstNumber] = [];
      }

      groupedByGST[gstNumber].push(obj);
    });

    // Convert the object to an array of arrays
    const resultArray = Object.values(groupedByGST);

    return resultArray;
  }
  const handleExpand = (expanded, record) => {
    if (expanded) {
      expandedRowKeys.pop(0, 1);
      expandedRowKeys.push(record.key);
    } else {
      expandedRowKeys.pop(0, 1);
    }
  };

  const getRows = async () => {
    setLoading(true);
    const response = await imsAxios.get(
      `/gstr/generateReport?date=${searchInput}`
    );
    setLoading(false);
    const { data } = response;
    if (response.status === 200) {
      let arr = response.data;
      let keys = Object.keys(data);
      let transformedData = [];
      let newarr;
      let arrs = keys.map((r) => {
        if (
          r === "B2B Invoices" ||
          r === "Credit or Debit Notes (Registered)"
        ) {
          const gstMap = new Map();
          data[r].forEach((entry) => {
            const gstNo = entry.gstNo;
            // If GST number is not in the map, add it
            if (!gstMap.has(gstNo)) {
              gstMap.set(gstNo, []);
            }

            // Add the entry to the corresponding GST number group
            gstMap
              .get(gstNo)
              .push(
                Object.fromEntries(
                  Object.entries(entry).filter(([key]) => key !== "gstNo")
                )
              );
          });

          // Append the transformed data to the result
          gstMap.forEach((data, gstNo) => {
            transformedData.push({ gstNo: gstNo, data: data, r: r });
          });
          newarr = transformedData
            .map((record, index) => ({
              id: v4(),
              customerCode: record.data[0].customerCode,
              customerName: record.data[0].customerName,
              gstNo: record.gstNo ?? "-",
              Vcount: record?.data?.length,
              stateName: record?.data[0]?.stateName || record?.state,
              TaxableAmt: calculateSum(record.data, "totalTaxableValue"),
              ttlSgst: calculateSum(record.data, "totalSGST"),
              ttlCgst: calculateSum(record.data, "totalCGST"),
              ttlIgst: calculateSum(record.data, "totalIGST"),
              TaxAmt: calculateSum(record.data, "totalTax"),
              InvAmt: calculateSum(record.data, "totalCustomerAmount"),
              gstdata: record.data,
              r: record.r,
            }))
            .filter((record) => record.r === r);
        } else {
          const gstMap = new Map();
          data[r].forEach((entry) => {
            const gstNo = entry.stateName;
            // If GST number is not in the map, add it
            if (!gstMap.has(gstNo)) {
              gstMap.set(gstNo, []);
            }
            // Add the entry to the corresponding GST number group
            gstMap
              .get(gstNo)
              .push(
                Object.fromEntries(
                  Object.entries(entry).filter(([key]) => key !== "stateName")
                )
              );
          });
          // Append the transformed data to the result
          gstMap.forEach((data, gstNo) => {
            transformedData.push({ state: gstNo, data: data, r: r });
          });
          newarr = transformedData
            .map((record, index) => ({
              id: v4(),
              customerCode: record.data[0].customerCode,
              customerName: record.data[0].customerName,
              Vcount: record?.data?.length,
              stateName: record?.state,
              TaxableAmt: calculateSum(record.data, "totalTaxableValue"),
              ttlSgst: calculateSum(record.data, "totalSGST"),
              ttlCgst: calculateSum(record.data, "totalCGST"),
              ttlIgst: calculateSum(record.data, "totalIGST"),
              TaxAmt: calculateSum(record.data, "totalTax"),
              InvAmt: calculateSum(record.data, "totalCustomerAmount"),
              gstdata: record.data,
              r: record.r,
            }))
            .filter((record) => record.r === r);
        }
        const expandedRowRender = (record) => {
          const expendedColumn = [
            {
              title: "Sr No.",
              dataIndex: "serialno",
              key: "serialno",
              width: "5%",
            },
            {
              title: "GST Number",
              dataIndex: "gstNo",
              key: "gstNo",
              width: "12%",
            },

            {
              title: "Customer Name",
              dataIndex: "customerName",
              key: "customerName",
              width: "10%",
            },
            {
              title: "Invoice No.",
              dataIndex: "invoiceNo",
              key: "invoiceNo",
              width: "11.2%",
            },
            {
              title: "Voucher No.",
              dataIndex: "voucherNo",
              key: "voucherNo",
              width: "11.2%",
            },
            {
              title: "Voucher Type",
              dataIndex: "voucherType",
              key: "voucherType",
              width: "8.2%",
            },
            {
              title: "SGST",
              dataIndex: "totalSGST",
              key: "totalSGST",
              width: "6%",
            },
            {
              title: "CGST",
              dataIndex: "totalCGST",
              key: "totalCGST",
              width: "6%",
            },

            {
              title: "IGST",
              dataIndex: "totalIGST",
              key: "totalIGST",
              width: "6%",
            },
            {
              title: "Total Tax",
              dataIndex: "totalTax",
              key: "totalTax",
              width: "8%",
            },
            {
              title: "Total Taxable Value",
              dataIndex: "totalTaxableValue",
              key: "totalTaxableValue",
              width: "8%",
            },
            {
              title: "Invoice Amt",
              dataIndex: "invAmt",
              key: "invAmt",
              width: "11.2%",
            },
          ];
          const data = record.gstdata?.map((consumptionItem, index) => ({
            serialno: index + 1,
            gstNo: record.gstNo,
            customerName: consumptionItem.customerName,
            invoiceNo: consumptionItem.invoiceNo,
            totalCGST: Number(consumptionItem.totalCGST).toFixed(2),
            totalSGST: Number(consumptionItem.totalSGST).toFixed(2),
            totalIGST: Number(consumptionItem.totalIGST).toFixed(2),
            totalTax: Number(consumptionItem.totalTax).toFixed(2),
            totalTaxableValue: Number(
              consumptionItem.totalTaxableValue
            ).toFixed(2),
            voucherType: consumptionItem.voucherType,
            voucherNo: consumptionItem.voucherNo,
            invAmt: Number(consumptionItem.totalCustomerAmount).toFixed(2),
          }));

          return (
            <>
              <Button
                type="primary"
                style={{ float: "right", marginBottom: "10px" }}
                onClick={() =>
                  downloadCSVnested(data, expendedColumn, "GST Report")
                }
                shape="circle"
                icon={<DownloadOutlined />}
              />
              <Table
                columns={
                  r === "B2C (Small) Invoices"
                    ? [
                        ...expendedColumn.slice(0, 1),
                        ...expendedColumn.slice(2),
                      ]
                    : expendedColumn
                }
                dataSource={data}
                pagination={false}
              />
            </>
          );
        };
        // if()

        console.log("tdddddddddd", r, transformedData);
        console.log("newarr", r, newarr);

        let rows = transformedData
          .map((record, index) => ({
            id: v4(),
            customerCode: record.data[0].customerCode,
            customerName: record.data[0].customerName,
            gstNo: record.gstNo ?? "-",
            Vcount: record?.data?.length,
            stateName: record?.state ?? "-",
            // ttlSgst: record.,
            TaxableAmt: calculateSum(record.data, "totalTaxableValue"),
            ttlSgst: calculateSum(record.data, "totalSGST"),
            ttlCgst: calculateSum(record.data, "totalCGST"),
            ttlIgst: calculateSum(record.data, "totalIGST"),
            TaxAmt: calculateSum(record.data, "totalTax"),
            InvAmt: calculateSum(record.data, "totalCustomerAmount"),
            r: record.r,
          }))
          .filter((record) => record.r === r);
        return {
          key: v4(),
          label: (
            <>
              <Row span={24}>
                <Col span={5}> {r}</Col>
                <Col span={3}> Voucher Count</Col>
                <Col span={3}> Taxable Amt</Col>
                <Col span={3}> SGST</Col>
                <Col span={3}> CGST</Col>
                <Col span={3}> IGST</Col>
                <Col span={3}> Invoice</Col>
              </Row>
              <Row span={24}>
                <Col span={5}></Col>
                <Col span={3}>{data[r].length}</Col>
                <Col span={3}>
                  {" "}
                  {calculateSum(data[r], "totalTaxableValue")}
                </Col>
                <Col span={3}> {calculateSum(data[r], "totalSGST")}</Col>
                <Col span={3}> {calculateSum(data[r], "totalCGST")}</Col>
                <Col span={3}> {calculateSum(data[r], "totalIGST")}</Col>
                <Col span={3}>
                  {" "}
                  {calculateSum(data[r], "totalCustomerAmount")}
                </Col>
              </Row>
            </>
          ),
          children: (
            <>
              <Button
                type="primary"
                style={{ float: "right", marginBottom: "10px" }}
                onClick={() => downloadCSVnested(rows, columns, r)}
                shape="circle"
                icon={<DownloadOutlined />}
              />
              <div style={{ height: "calc(150vh - 400px)" }}>
                <Table
                  size="large"
                  columns={
                    r === "B2C (Small) Invoices"
                      ? [...columns.slice(0, 1), ...columns.slice(2)]
                      : columns
                  }
                  bordered="false"
                  expandable={{
                    expandedRowRender,
                    expandedRowKeys,
                    onExpand: handleExpand,
                  }}
                  dataSource={newarr.map((record, index) => ({
                    ...record,
                    key: (index + 1).toString(),
                  }))}
                  // size="small"
                  pagination={{
                    pageSize: 20,
                  }}
                  scroll={{
                    y: 500,
                    x: 1000,
                  }}
                  loading={loading}
                />
              </div>
            </>
          ),
        };
      });

      setAccData(arrs);
    }
  };

  const calculateSum = (array, property) => {
    if (array && Array.isArray(array)) {
      const sum = array.reduce((acc, obj) => {
        return acc + parseFloat(obj[property] || 0);
      }, 0);

      return sum.toFixed(2); // Round the sum to two decimal places
    }
    return "0.00"; // Return '0.00' if the array is empty or undefined
  };
  const mergeObjectsByProperty = (data, propertyName) => {
    const mergedData = {};

    if (Array.isArray(data)) {
      data.forEach((item) => {
        const propertyValue = item[propertyName];
        if (!mergedData[propertyValue]) {
          mergedData[propertyValue] = [item];
        } else {
          mergedData[propertyValue].push(item);
        }
      });
    }

    return mergedData;
  };

  // Example of merging based on 'gstNo' property

  return (
    <>
      <div style={{ height: "10%", marginTop: "20px" }}>
        <Row
          gutters={[1, 10]}
          style={{ padding: 5, paddingTop: 0 }}
          justify="space-between"
        >
          <Col>
            <Space>
              <div style={{ paddingBottom: "10px" }}>
                <Space>
                  <Form form={form} layout="inline">
                    <Form.Item name="wise">
                      <div style={{ width: 250 }}>
                        <MySelect
                          options={wiseoptions}
                          value={wise}
                          onChange={(value) => {
                            setWise(value);
                          }}
                        />
                      </div>
                    </Form.Item>
                    <div>
                      <Form.Item name="date">
                        <DatePicker
                          onChange={setSearchInput}
                          picker={wise}
                          Value={searchInput}
                        />
                      </Form.Item>
                    </div>
                    <Button
                      onClick={emitDownloadEvent}
                      loading={loading}
                      type="primary"
                    >
                      Fetch
                    </Button>
                  </Form>
                </Space>
              </div>
            </Space>
          </Col>
        </Row>
      </div>
      <div style={{ height: "90%" }}>
        <Row
          gutters={[5, 10]}
          style={{ padding: 5, paddingTop: 0 }}
          justify="space-between"
        >
          <Col span={24}>
            {/* <div style={{ overflowY: "scroll", overflowX: "hidden" }}>
                <Collapse items={accData} size="large</Card>" />
              </div> */}
          </Col>
        </Row>
      </div>
    </>
  );
}

export default GstReport;

const wiseoptions = [
  {
    text: "Month Wise",
    value: "month",
  },
  {
    text: "Quarter Wise",
    value: "quarter",
  },
  {
    text: "Financial Year Wise",
    value: "year",
  },
];
