import React, { useState, useEffect } from "react";
import { Button, Col, message, Divider, Popconfirm, Row, Space } from "antd";
import axios from "axios";
import { toast } from "react-toastify";
import MyDataTable from "../../../../Components/MyDataTable";
import { DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import { v4 } from "uuid";
import { imsAxios } from "../../../../axiosInterceptor";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { DeleteTwoTone } from "@ant-design/icons";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../../Components/exportToCSV";
import MySelect from "../../../../Components/MySelect";

function AppVendorReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectLoading, setSelectLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [allRefData, setAllRefData] = useState({
    vendorName: "",
  });
  const [selectedRows, setSelectedRows] = useState([]);
  const [vbtOption, setVbtOption] = useState("VBT01");
  const vbtTypeOptions = [
    { text: "Purchase Goods", value: "VBT01" },
    { text: "Services", value: "VBT02" },
    { text: "Import", value: "VBT03" },
    { text: "Fixed Asset", value: "VBT04" },
    { text: "Expenses", value: "VBT05" },
    { text: "Jobwork", value: "VBT06" },
    { text: "RCM", value: "VBT07" },
  ];

  const fetchReport = async () => {
    setLoading(true);
    setRows([]);
    const response =
      await imsAxios.get(`/tally/ap/fetchAccountsPayableReport?vbtType=${vbtOption}
`);
    console.log("response", response);
    if (!response) {
      setLoading(false);
    }
    if (response.status == 200) {
      const { data } = response;
      console.log("data ======", data);

      const arr = data?.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setLoading(false);
      setRows(arr);
    } else if (response.status == 500) {
      toast.error(response.message.msg);
      setLoading(false);
    }

    setLoading(false);
  };

  const handleDownload = () => {
    downloadCSV(rows, columns, "AP Vendors Report");
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
      headerName: " Total Bill Amount",
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
      <Row style={{ padding: "0px 5px" }} justify="space-between" gutter={10}>
        <Col>
          <Space>
            <MySelect
              options={vbtTypeOptions}
              onChange={setVbtOption}
              value={vbtOption}
            />

            <Button type="primary" onClick={fetchReport}>
              Search
            </Button>
          </Space>
        </Col>
        <Col>
          <Button type="primary" onClick={handleDownload}>
            <DownloadOutlined />
          </Button>
        </Col>
      </Row>

      <div style={{ height: "95%", margin: 5 }}>
        <MyDataTable
          loading={loading}
          data={rows}
          columns={columns}
          checkboxSelection
          onSelectionModelChange={(selected) => {
            setSelectedRows(selected);
          }}
        />
      </div>
    </div>
  );
}

export default AppVendorReport;
