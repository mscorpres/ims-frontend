import React, { useState } from "react";
import { Button, Col, Row, Space } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import  {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import PaytmQCUpload from "./PaytmQCUpload";
import PaytmQCUpdate from "./PaytmQCUpdate";
import PaytmGraph from "./PaytmGraph";
import { BarChartOutlined } from "@ant-design/icons";

import { Box, IconButton, LinearProgress } from "@mui/material";
import { Edit, Search } from "@mui/icons-material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";
import CustomButton from "../../../new/components/reuseable/CustomButton";

export default function PaytmQCReport() {
  const [searchDate, setSearchData] = useState("");
  const [rows, setRows] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);
  const [updatingQC, setUpdatingQC] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [totalChartData, setTotalChartData] = useState(0);

  const getRows = async () => {
    setSearchLoading(true);

    const { data } = await imsAxios.post("/paytmQc/fetchPaytmQcReport", {
      data: searchDate,
    });
    setSearchLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
          // date: searchDate,
        };
      });
      setRows(arr);

      let chartArr = [
        { id: 1, type: "Device Validation Fail" },
        { id: 2, type: "QR Glass Problem" },
        { id: 3, type: "Speaker Not Working" },
        { id: 4, type: "LCD Issue" },
        { id: 5, type: "Body Gap" },
        { id: 6, type: "LED light not working" },
        { id: 7, type: "Button not working" },
        { id: 8, type: "Body scratch" },
        { id: 9, type: "Assembly issue" },
        { id: 10, type: "IMEI sticker printing issue" },
        { id: 11, type: "Help desk sticker missing" },
        { id: 12, type: "Body internal problem (loose screw)" },
        { id: 13, type: "Rubber feet missing" },
        { id: 14, type: "Speaker cover damage" },
        { id: 15, type: "IMEI mismatch" },
        { id: 16, type: "Language on device and packaging box mismatch" },
        { id: 17, type: "QR Code missing" },
        { id: 18, type: "Device not working" },
        { id: 19, type: "Body internal problem (loose screw)" },
        { id: 20, type: "USB Jack" },
        { id: 21, type: "Other" },
        { id: 22, type: "Keypad issue" },
        { id: 23, type: "SIM Lock" },
        { id: 24, type: "SIM Network issue" },
      ];

      let total = data.chart_data?.reduce((partialSum, a) => partialSum + a, 0);
      setTotalChartData(total);
      chartArr = data.chart_data?.map((value, index) => {
        chartArr[index].value = value;
        chartArr[index].percentage = (value * 100) / total;
        return chartArr[index];
      });
      console.log(chartArr);
      setChartData(chartArr);
    } else {
      toast.error(data.message.msg);
    }
  };

  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.date} />,
      width: 100,
    },
    {
      header: "QC Result",
      accessorKey: "qc_result",
      width: 100,
    },
    {
      header: "Category",
      accessorKey: "category",
      renderCell: ({ row }) => <ToolTipEllipses text={row.category} />,
      width: 150,
    },
    {
      header: "Issue Observe",
      accessorKey: "issue_observe",
      renderCell: ({ row }) => <ToolTipEllipses text={row.issue_observe} />,
      width: 180,
    },
    {
      header: "IMEI No.",
      accessorKey: "imei_no",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.imei_no} copy={true} />
      ),
      width: 180,
    },
    {
      header: "SKU Code",
      accessorKey: "sku_code",
      width: 120,
    },
    {
      header: "Device Type",
      accessorKey: "device_type",
      renderCell: ({ row }) => <ToolTipEllipses text={row.device_type} />,
      width: 180,
    },
    {
      header: "Defect Type",
      accessorKey: "defects_type",
      renderCell: ({ row }) => <ToolTipEllipses text={row.defects_type} />,
      width: 150,
    },
    {
      header: "Actual Problem Name",
      accessorKey: "actual_problems",
      renderCell: ({ row }) => <ToolTipEllipses text={row.actual_problems} />,
      width: 150,
    },
    {
      header: "Correction By Santosh",
      accessorKey: "correction_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.correction_by} />,
      width: 150,
    },
    {
      header: "Status After Correction",
      accessorKey: "after_correction_status",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.after_correction_status} />
      ),
      width: 150,
    },
    {
      header: "Reason of Accurance",
      accessorKey: "remark",
      renderCell: ({ row }) => <ToolTipEllipses text={row.remark} />,
      width: 250,
    },
  ];
  const table = useMaterialReactTable({
    columns: columns,
    data: rows || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    enableStickyHeader: true,
    enableRowActions: true,

    renderRowActions: ({ row }) => (
      <IconButton
        color="inherit"
        size="small"
        onClick={() => {
          () => setUpdatingQC(row.imei_no);
        }}
      >
        <Edit fontSize="small" />
      </IconButton>
    ),
    muiTableContainerProps: {
      sx: {
        height: searchLoading ? "calc(100vh - 240px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => <EmptyRowsFallback />,

    renderTopToolbar: () =>
      searchLoading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
  });

  return (
    <div style={{ height: "90%", position: "relative", margin: 12 }}>
      <PaytmQCUpdate
        getRows={getRows}
        updatingQC={updatingQC}
        setUpdatingQC={setUpdatingQC}
      />
      <Row justify="space-between">
        <Col>
          <Space>
            <div style={{ width: 300 }}>
              <MyDatePicker setDateRange={setSearchData} spacedFormat={true} />
            </div>
            <Space>
              <CustomButton
                size="small"
                title={"Search"}
                starticon={<Search fontSize="small" />}
                loading={searchLoading}
                onclick={getRows}
              />

              <CustomButton
                size="small"
                title={"Upload Paytm QC"}
                onclick={() => setShowUploadDoc(true)}
              />
              <Button
                disabled={chartData.length === 0}
                onClick={() => setShowGraph(true)}
                type="primary"
                shape="circle"
                icon={<BarChartOutlined />}
              />
            </Space>
          </Space>
        </Col>
        <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() =>
                downloadCSV(rows, columns, `Paytm QC Report ${rows[0].date}`)
              }
              disabled={rows.length == 0}
            />
          </Space>
        </Col>
      </Row>
      <PaytmQCUpload
        showUploadDoc={showUploadDoc}
        setShowUploadDoc={setShowUploadDoc}
      />
      <PaytmGraph
        chartData={chartData}
        showGraph={showGraph}
        setShowGraph={setShowGraph}
        searchDate={searchDate}
        totalChartData={totalChartData}
      />
      <div style={{ height: "95%", marginTop:12 }}>
        <MaterialReactTable table={table} />
      </div>
    </div>
  );
}
