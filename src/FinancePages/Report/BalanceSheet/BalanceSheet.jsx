import { width } from "@mui/system";
import { Button, Col, Row, Space, Table } from "antd";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { imsAxios } from "../../../axiosInterceptor";
import { downloadCSVCustomColumns } from "../../../Components/exportToCSV";
import MyDatePicker from "../../../Components/MyDatePicker";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import EditSheet from "./EditSheet";

function BalanceSheet() {
  let arr = [];
  const [dateRange, setDateRange] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSheet, setEditingSheet] = useState(false);

  const getRows = async () => {
    setRows([]);
    arr = [];
    setLoading("fetchLoading");
    const response = await imsAxios.post("/tally/reports/balanceSheet", {
      date: dateRange,
    });
    setLoading(false);
    if (response.data) {
      let arr1 = response.data.data;
      arr1 = customFlatArray(arr1);
      setRows(arr1);
      // console.log("balance sheet", typeof arr1[0].credit);
      // let m = convertToNumber(arr1[0].credit);
      // console.log("balance sheet aftter convert fn", typeof m);
    }
  };
  const columns = [
    {
      title: "Name",
      // dataIndex: "name",
      key: "name",
      render: (_, record) =>
        record.type.toLowerCase() === "ledger" ? (
          <Link
            style={{ marginLeft: 110 }}
            target="_blank"
            to={`/tally/ledger_report/${record.code}`}
            state={{ code: record }}
          >
            {record.name}
          </Link>
        ) : (
          <p
            style={{
              marginLeft:
                record.type.toLowerCase() === "group"
                  ? 40
                  : record.type.toLowerCase() === "sub group" && 80,
              fontWeight:
                (record.type.toLowerCase() === "master" ||
                  record.type.toLowerCase() === "group") &&
                700,
              // fontSize: record.type.toLowerCase() === "master" && "1rem",
            }}
          >
            {record.name}
          </p>
        ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Closing",
      dataIndex: "closing",
      key: "closing",
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
  ];
  const flatArray = (array) => {
    array?.map((row) => {
      if (row.children) {
        let children = row.children;
        delete row["children"];
        arr = [...arr, row];
        customFlatArray(children);

        if (row.children) {
          arr = [...arr, ...children];
        }
      } else {
        arr = [...arr, row];
      }
    });
    return arr;
  };
  const customFlatArray = (array) => {
    array?.map((row) => {
      if (row.children) {
        let children = row.children;
        // if (row.type.toLowerCase() !== "sub group") {
        delete row["children"];
        // }
        arr = [...arr, row];
        // if (row.type.toLowerCase() !== "sub group") {
        // delete row["children"];
        customFlatArray(children);
        // }
        if (row.children) {
          // if (row.type.toLowerCase() !== "sub group") {
          arr = [...arr, ...children];
          // }
        }
      } else {
        arr = [...arr, row];
      }
      // else {
      //   arr = [...arr, row];
      //   if (row.children) {
      //     arr = [...arr, ...row.children];
      //   }
      // }
    });
    return arr;
  };
  const handleDownloadCSV = () => {
    let csvData = [];
    csvData = flatArray(rows).map((row) => {
      return {
        Name: row.name
          ? row.name
              .toString()
              .replaceAll("&amp;", "&")
              // .replaceAll("amp", "")
              .replaceAll(";", "")
          : " ",

        Type: row.type,

        Closing: convertToNumber(row.closing) ?? "--",
        Code: row.code,
      };
    });
    // "From - To": dateRange },
    // csvData = [
    //   {
    //     Code: "",
    //     label: "Grand Total",
    //     Type: "",
    //     Opening: summary[2].description,
    //     Debit: summary[4].description,
    //     Credit: summary[3].description,
    //     Closing: summary[1].description,
    //     "From - To": dateRange,
    //   },
    //   ...csvData,
    //   {
    //     Code: "",
    //     label: "Grand Total",
    //     Type: "",
    //     Opening: summary[2].description,
    //     Debit: summary[4].description,
    //     Credit: summary[3].description,
    //     Closing: summary[1].description,
    //   },
    // ];

    csvData = [...csvData];
    downloadCSVCustomColumns(csvData, "Balance Sheet Report");
  };
  const convertToNumber = (debitString) => {
    const cleanedDebit = parseFloat(debitString.replace(/,/g, ""));

    const debitNumber = cleanedDebit === 0 ? 0 : cleanedDebit || 0;

    return debitNumber;
  };
  return (
    <div style={{ height: "90%", padding: 5, paddingTop: 0 }}>
      <EditSheet
        editingSheet={editingSheet}
        setEditingSheet={setEditingSheet}
      />
      <Row justify="space-between">
        <Space>
          <div style={{ width: 300 }}>
            <MyDatePicker setDateRange={setDateRange} />
          </div>
          <Button
            loading={loading === "fetchLoading"}
            type="primary"
            onClick={getRows}
          >
            Fetch
          </Button>
        </Space>
        <Space>
          <CommonIcons
            action="editButton"
            onClick={() => setEditingSheet(true)}
          />
          <CommonIcons
            disabled={rows.length === 0}
            action="downloadButton"
            onClick={handleDownloadCSV}
          />
        </Space>
      </Row>
      <Row style={{ marginTop: 10, height: "100%" }}>
        <Table
          style={{ width: "100%", height: "100%" }}
          columns={columns}
          expandable={{
            defaultExpandedRowKeys: ["2010000"],
          }}
          bordered={false}
          pagination={false}
          size="small"
          scroll={{ y: "75vh" }}
          dataSource={rows}
        />
      </Row>
    </div>
  );
}

export default BalanceSheet;
