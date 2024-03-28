import React, { useState } from "react";
import { Button, Col, Row, Space } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import { downloadCSV } from "../../../Components/exportToCSV";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import PaytmQCUpload from "./PaytmQCUpload";
import { useEffect } from "react";
import PaytmQCUpdate from "./PaytmQCUpdate";
import PaytmGraph from "./PaytmGraph";
import { BarChartOutlined } from "@ant-design/icons";
import MyButton from "../../../Components/MyButton";

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
      headerName: "Action",
      type: "actions",
      width: 100,
      getActions: ({ row }) => [
        // Edit icon
        <TableActions
          action="edit"
          onClick={() => setUpdatingQC(row.imei_no)}
        />,
      ],
    },
    {
      field: "date",
      headerName: "Date",
      // renderCell: ({ row }) => <ToolTipEllipses text={row.date} />,
      width: 100,
    },
    {
      headerName: "QC Result",
      field: "qc_result",
      width: 100,
    },
    {
      headerName: "Category",
      field: "category",
      renderCell: ({ row }) => <ToolTipEllipses text={row.category} />,
      width: 150,
    },
    {
      headerName: "Issue Observe",
      field: "issue_observe",
      renderCell: ({ row }) => <ToolTipEllipses text={row.issue_observe} />,
      width: 180,
    },
    {
      headerName: "IMEI No.",
      field: "imei_no",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.imei_no} copy={true} />
      ),
      width: 180,
    },
    {
      headerName: "SKU Code",
      field: "sku_code",
      width: 120,
    },
    {
      headerName: "Device Type",
      field: "device_type",
      renderCell: ({ row }) => <ToolTipEllipses text={row.device_type} />,
      width: 180,
    },
    {
      headerName: "Defect Type",
      field: "defects_type",
      renderCell: ({ row }) => <ToolTipEllipses text={row.defects_type} />,
      width: 150,
    },
    {
      headerName: "Actual Problem Name",
      field: "actual_problems",
      renderCell: ({ row }) => <ToolTipEllipses text={row.actual_problems} />,
      width: 150,
    },
    {
      headerName: "Correction By Santosh",
      field: "correction_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.correction_by} />,
      width: 150,
    },
    {
      headerName: "Status After Correction",
      field: "after_correction_status",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.after_correction_status} />
      ),
      width: 150,
    },
    {
      headerName: "Reason of Accurance",
      field: "remark",
      renderCell: ({ row }) => <ToolTipEllipses text={row.remark} />,
      width: 250,
    },
  ];

  return (
    <div style={{ height: "90%", position: "relative" }}>
      <PaytmQCUpdate
        getRows={getRows}
        updatingQC={updatingQC}
        setUpdatingQC={setUpdatingQC}
      />
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        <Col>
          <Space>
            <div style={{ width: 300 }}>
              <MyDatePicker setDateRange={setSearchData} spacedFormat={true} />
            </div>
            <Space>
              <MyButton
                variant="search"
                disabled={searchDate === ""}
                type="primary"
                loading={searchLoading}
                onClick={getRows}
              >
                Search
              </MyButton>
              <Button onClick={() => setShowUploadDoc(true)} type="primary">
                Upload Paytm QC
              </Button>
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
      <div style={{ height: "95%", padding: "0px 10px" }}>
        <MyDataTable loading={searchLoading} data={rows} columns={columns} />
      </div>
    </div>
  );
}
