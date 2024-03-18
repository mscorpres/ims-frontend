import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Button,
  Row,
  Space,
  Tooltip,
  Popover,
  Typography,
  Modal,
  Col,
} from "antd";
import MySelect from "../../../Components/MySelect";
import MyDatePicker from "../../../Components/MyDatePicker";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { downloadCSV } from "../../../Components/exportToCSV";
import { DownloadOutlined, MessageOutlined } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";
import { GridActionsCellItem } from "@mui/x-data-grid";

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
      headerName: "",
      type: "actions",
      width: 30,
      getActions: ({ row }) => [
        // VIEW Icon
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label="View Comments"
          onClick={() =>
            setShowComments({
              id: row.smp_txn,
              comment1: row.comment.stage_1,
              comment2: row.comment.stage_2,
              comment3: row.comment.stage_3,
            })
          }
        />,
      ],
    },
    {
      headerName: "#",
      width: 50,
      field: "index",
    },

    {
      headerName: "Status",
      flex: 1,
      field: "statusLabel",
      renderCell: ({ row }) => (
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
      headerName: "Sample No.",
      width: 200,
      field: "smp_txn",
    },
    { headerName: "MIN No.", width: 150, field: "min_txn" },
    { headerName: "MIN Date", width: 150, field: "min_dt" },
    {
      headerName: "Component",
      width: 180,
      field: "component",
      renderCell: ({ row }) => (
        <Tooltip title={row.component}>{row.component}</Tooltip>
      ),
    },
    { headerName: "Part", flex: 1, field: "part" },
    {
      headerName: "Vendor Name",
      width: 180,
      field: "vname",
      renderCell: ({ row }) => <Tooltip title={row.vname}>{row.vname}</Tooltip>,
    },
    { headerName: "In Qty", flex: 1, field: "min_qty" },
    { headerName: "Sample Qty", flex: 1, field: "smp_qty" },
    { headerName: "UoM", flex: 1, field: "uom" },
    { headerName: "Approval Date", width: 150, field: "apv_dt" },
  ];
  return (
    <>
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
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
            <Button
              disabled={!searchInput ? true : false}
              type="primary"
              loading={searchLoading}
              onClick={getRows}
              id="submit"
            >
              Search
            </Button>
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
        <MyDataTable columns={columns} data={rows} loading={searchLoading} />
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
