import  { useState } from "react";
import { toast } from "react-toastify";
import { Button, Row, Space, Tooltip, Typography, Modal, Col } from "antd";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import { v4 } from "uuid";
import { downloadCSV } from "../../../Components/exportToCSV";
import { DownloadOutlined, MessageOutlined } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import CustomButton from "../../../new/components/reuseable/CustomButton";
import { Search, Visibility } from "@mui/icons-material";
import { Box, IconButton, LinearProgress } from "@mui/material";
import EmptyRowsFallback from "../../../new/components/reuseable/EmptyRowsFallback";

function ReportQC() {
  document.title = "QC Report";
  const [searchStatus, setSearchStatus] = useState("A");
  const [searchInput, setSearchInput] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [rows, setRows] = useState([]);

  const statusOptions = [
    { text: "Pass", value: "A" },
    { text: "Fail", value: "R" },
  ];
  const getRows = async () => {
    setRows([]);
    setSearchLoading(true);
    const { data } = await imsAxios.post("/qc/final_qc_report", {
      data: searchInput,
      type: searchStatus,
    });
    setSearchLoading(false);
    if (data.code == 200) {
      const arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
          statusLabel: row.status === "A" ? "Pass" : "Fail",
        };
      });
      setRows(arr);
    } else {
      toast.error(data.message.msg);
      setRows([]);
    }
  };

  const handleDownload = () => {
    const arr = rows.map((row) => ({
      ...row,
      comment1: row.comment.stage_1,
      comment2: row.comment.stage_2,
      comment3: row.comment.stage_3,
    }));
    const cols = [
      ...columns,
      {
        headerName: "Stage 1",
        field: "comment1",
      },
      {
        headerName: "Stage 2",
        field: "comment2",
      },
      {
        headerName: "Stage 3",
        field: "comment3",
      },
    ];
    downloadCSV(arr, cols, "Final QC Report");
  };
  const columns = [
    {
      header: "#",
      size: 50,
      accessorKey: "index",
    },

    {
      header: "Status",
      flex: 1,
      accessorKey: "statusLabel",
      render: ({ row }) => (
        <span
          style={{
            color: row.status == "A" ? "green" : "brown",
          }}
        >
          {row.statusLabel}
        </span>
      ),
    },
    {
      header: "Sample No.",
      size: 200,
      accessorKey: "smp_txn",
    },
    { header: "MIN No.", size: 150, accessorKey: "min_txn" },
    { header: "MIN Date", size: 150, accessorKey: "min_dt" },
    {
      header: "Component",
      size: 180,
      accessorKey: "component",
      render: ({ row }) => (
        <Tooltip title={row.component}>{row.component}</Tooltip>
      ),
    },
    { header: "Part", flex: 1, accessorKey: "part" },
    {
      header: "Vendor Name",
      size: 180,
      accessorKey: "vname",
      render: ({ row }) => <Tooltip title={row.vname}>{row.vname}</Tooltip>,
    },
    { header: "In Qty", flex: 1, accessorKey: "min_qty" },
    { header: "Sample Qty", flex: 1, accessorKey: "smp_qty" },
    { header: "UoM", flex: 1, accessorKey: "uom" },
    { header: "Approval Date", size: 150, accessorKey: "apv_dt" },
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
      <Tooltip title="View Comments">
        <IconButton
          color="inherit"
          size="small"
          onClick={() =>
            setShowComments({
              id: row.smp_txn,
              comment1: row.comment.stage_1,
              comment2: row.comment.stage_2,
              comment3: row.comment.stage_3,
            })
          }
        >
          <Visibility fontSize="small" />
        </IconButton>
      </Tooltip>
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
    <>
      <Row justify="space-between" style={{ margin: 12 }}>
        <div>
          <Space>
            <div style={{ width: 200 }}>
              <MySelect
                size={"default"}
                options={statusOptions}
                defaultValue={
                  statusOptions.filter((o) => o.value === searchStatus)[0]
                }
                onChange={setSearchStatus}
                value={searchStatus}
              />
            </div>
            <div style={{ width: 300 }}>
              <MyDatePicker
                size="default"
                setDateRange={setSearchInput}
                dateRange={setSearchInput}
                value={setSearchInput}
              />
            </div>

            <CustomButton
              size="small"
              disabled={!searchInput ? true : false}
              title="Search"
              starticon={<Search fontSize="small" />}
              loading={searchLoading}
              onclick={getRows}
            />
          </Space>
        </div>
        <Space>
          <Button
            type="primary"
            onClick={handleDownload}
            shape="circle"
            icon={<DownloadOutlined />}
            disabled={rows.length == 0}
          />
        </Space>
      </Row>
      <div style={{ height: "85%", padding: "0px 10px" }}>
        <MaterialReactTable table={table} />
      </div>
      <CommentModal show={showComments} hide={() => setShowComments(null)} />
    </>
  );
}

export default ReportQC;

const CommentModal = ({ show, hide }) => {
  return (
    <Modal title="Comments" open={show} onCancel={hide} onOk={hide}>
      <Row gutter={[6, 6]}>
        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Text strong>Stage 1 Comment:</Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text>{show?.comment1}</Typography.Text>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Text strong>Stage 2 Comment:</Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text>{show?.comment2}</Typography.Text>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Text strong>Stage 3 Comment:</Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text>{show?.comment3}</Typography.Text>
            </Col>
          </Row>
        </Col>
      </Row>
    </Modal>
  );
};
