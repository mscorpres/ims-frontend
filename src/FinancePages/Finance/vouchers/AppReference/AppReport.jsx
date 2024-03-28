import React, { useState, useEffect } from "react";
import { Button, Col, message, Divider, Popconfirm, Row, Space } from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import MyDataTable from "../../../../Components/MyDataTable";
import { PlusOutlined } from "@ant-design/icons";
import { v4 } from "uuid";
import { imsAxios } from "../../../../axiosInterceptor";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { DeleteTwoTone } from "@ant-design/icons";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../../Components/exportToCSV";
import MyButton from "../../../../Components/MyButton";

function AppReport() {
  // const description = "Anuj";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectLoading, setSelectLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [allRefData, setAllRefData] = useState({
    vendorName: "",
  });
  const [selectedRows, setSelectedRows] = useState([]);

  const getInfo = async (search) => {
    allRefData.vendorName = "";
    allRefData.vendorID = "";
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/ap/fetchVendorLedger", {
      search: search,
    });
    setSelectLoading(false);
    const arr = data.map((row) => {
      return { value: row.id, text: row.text };
    });
    setAsyncOptions(arr);
  };

  const fetchReport = async () => {
    setLoading(true);
    setRows([]);
    const { data } = await imsAxios.get(
      `/tally/ap/fetchApReport?vendor=${allRefData?.vendorName}`
    );
    const arr = data?.map((row, index) => {
      return {
        ...row,
        id: v4(),
        index: index + 1,
      };
    });
    setRows(arr);
    setLoading(false);
  };

  const handleDownload = () => {
    downloadCSV(rows, columns, "AP Report");
  };
  const handleDeletion = async () => {
    const arr = [];
    selectedRows.map((row) => {
      let matched = rows.filter((r) => r.id === row)[0];
      if (matched) {
        arr.push({
          ID: matched?.ID,
          vbt_code: matched.refNo,
          bank_code: matched.soRefNo,
        });
      }
    });

    const finalObj = {
      ID: arr.map((row) => row.ID),
      vbt_code: arr.map((row) => row.vbt_code),
      bank_code: arr.map((row) => row.bank_code),
    };
    setDeleteLoading(true);
    const response = await imsAxios.post("/tally/ap/openAp", finalObj);
    setDeleteLoading(false);

    const { data } = response;
    if (data) {
      toast.success(data);
      fetchReport();
    }

    // setApprovePo(arr);
  };
  const columns = [
    {
      headerName: "Invoice Date",
      field: "invoiceDate",
      renderCell: ({ row }) => <ToolTipEllipses text={row?.invoiceDate} />,
      width: 120,
    },
    {
      headerName: "Invoice No.",
      field: "invoiceNumber",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row?.invoiceNumber} copy={true} />
      ),
      width: 160,
    },
    {
      headerName: "Reference No.",
      field: "refNo",
      width: 200,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row?.refNo} copy={true} />
      ),
    },
    // { field: "ap_code", headerName: "APP REFERENCE", width: 200 },
    {
      headerName: "Bill Amount",
      field: "billAmm",
      width: 160,
    },
    {
      headerName: "Settled Amount",
      field: "osAmmount",
      width: 160,
    },
    // { field: "so_amm", headerName: "SO AMOUNT", width: 130 },
    {
      headerName: "S/O Reference No.",
      field: "soRefNo",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row?.soRefNo} copy={true} />
      ),
      width: 150,
    },
    {
      headerName: "Particulars",
      field: "bankCode",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row?.bank + "/" + row?.bankCode} />
      ),
      width: 180,
    },
    {
      headerName: "Project",
      field: "projectId",
      width: 150,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row?.projectId} copy={true} />
      ),
    },
    {
      headerName: "PO Number",
      field: "poNumber",
      width: 120,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row?.poNumber} copy={true} />
      ),
    },
    {
      headerName: "Vendor",
      field: "vendor",
      width: 80,
      renderCell: ({ row }) => <ToolTipEllipses text={row?.vendor} />,
    },
    {
      headerName: "Vendor Name",
      field: "venName",
      width: 180,
      renderCell: ({ row }) => <ToolTipEllipses text={row?.venName} />,
    },
    {
      headerName: "Insert Date",
      field: "insertDate",
      width: 120,
      renderCell: ({ row }) => <ToolTipEllipses text={row?.insertDate} />,
    },
    {
      headerName: "Insert By",
      field: "insertBy",
      width: 120,
      renderCell: ({ row }) => <ToolTipEllipses text={row?.insertBy} />,
    },
    {
      headerName: "Status",
      field: "status",
      width: 80,
      renderCell: ({ row }) => (
        <div
          style={{
            fontWeight: "bolder",
            color: row?.status == "CLOSED" ? "green" : "red",
          }}
        >
          {row?.status == "CLOSED" ? "CLOSED" : "OPEN"}
        </div>
      ),
    },
  ];

  return (
    <div style={{ height: "90%" }}>
      <Row justify="space-between" gutter={10} style={{ padding: "0px 5px" }}>
        <Col>
          <Space>
            <div style={{ width: 250 }}>
              <MyAsyncSelect
                size="default"
                selectLoading={selectLoading}
                optionsState={asyncOptions}
                onBlur={() => setAsyncOptions([])}
                loadOptions={getInfo}
                value={allRefData?.vendorName}
                placeholder="Vendor name"
                onChange={(e) =>
                  setAllRefData((allRefData) => {
                    return { ...allRefData, vendorName: e };
                  })
                }
              />
            </div>
            <div>
              <Space>
                <MyButton
                  loading={loading}
                  type="primary"
                  onClick={fetchReport}
                  variant="search"
                >
                  Search
                </MyButton>
                <Button
                  disabled={selectedRows.length === 0}
                  loading={deleteLoading}
                  onClick={handleDeletion}
                >
                  Delete Selected
                </Button>
              </Space>
            </div>
          </Space>
        </Col>
        <Col>
          <CommonIcons action="downloadButton" onClick={handleDownload} />
        </Col>
        {/* <Col span={4} offset={18} style={{ border: "1px solid red" }}></Col> */}
        {/* <Divider /> */}
      </Row>

      <div style={{ height: "95%", margin: 5 }}>
        <MyDataTable
          loading={loading}
          data={rows}
          columns={columns}
          checkboxSelection
          onSelectionModelChange={(selected) => {
            console.log(selected);
            console.log(rows);
            setSelectedRows(selected);
          }}
        />
      </div>
    </div>
  );
}

export default AppReport;
