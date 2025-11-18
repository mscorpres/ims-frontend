import React, { useState } from "react";
import { Col, Row, Space } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker.jsx";
import { toast } from "react-toastify";
import MyDataTable from "../../../Components/MyDataTable.jsx";
import { downloadCSV } from "../../../Components/exportToCSV.jsx";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions.jsx";
import ToolTipEllipses from "../../../Components/ToolTipEllipses.jsx";
import { imsAxios } from "../../../axiosInterceptor.js";
import { GridActionsCellItem } from "@mui/x-data-grid";
import MyButton from "../../../Components/MyButton/index.jsx";
import ViewPORequest from "./ViewPORequest.jsx";

const RequestPo = () => {
  const [searchLoading, setSearchLoading] = useState(false);
  const [viewPoId, setViewPoId] = useState(null);
  const [rows, setRows] = useState([]);
  const [searchDateRange, setSearchDateRange] = useState("");

  const columns = [
    {
      headerName: "",
      type: "actions",
      width: 30,
      getActions: ({ row }) => [
        // VIEW Icon
        <GridActionsCellItem
          key="view"
          showInMenu
          label="View"
          onClick={() => getComponentData(row.po_transaction, row.po_status)}
        />,
      ],
    },
    {
      headerName: "#.",
      field: "index",
      width: 30,
    },
    {
      headerName: "PO ID",
      field: "po_transaction",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.po_transaction} copy={true} />
      ),
      width: 150,
    },
    {
      headerName: "Cost Center",
      field: "cost_center",
      renderCell: ({ row }) => <ToolTipEllipses text={row.cost_center} />,
      flex: 1,
      minWidth: 150,
    },

    {
      headerName: "Vendor Name",
      field: "vendor_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendor_name} />,
      flex: 2,
      minWidth: 200,
    },
    {
      headerName: "Vendor Code",
      field: "vendor_id",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.vendor_id} copy={true} />
      ),
      width: 100,
    },
    {
      headerName: "Project ID",
      field: "project_id",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.project_id} copy={true} />
      ),
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "Project Name",
      field: "project_name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.project_name} />,
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "Requested By",
      field: "requested_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.requested_by} />,
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "Approved By/Rejected By",
      field: "approved_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.approved_by} />,
      minWidth: 200,
      flex: 1,
    },

    {
      headerName: "Po Reg. Date",
      field: "po_reg_date",
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_reg_date} />,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Created By",
      field: "po_reg_by",
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_reg_by} />,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Approval Status",
      field: "approval_status",
      renderCell: ({ row }) => <ToolTipEllipses text={row.approval_status} />,
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Advance Payment",
      field: "advPayment",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.advPayment == "0" ? "NO" : "YES"} />
      ),
      flex: 1,
      minWidth: 150,
    },
    {
      headerName: "Comment",
      field: "po_comment",
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_comment} />,
      flex: 1,
      minWidth: 150,
    },
  ];
  //getting rows from database from date wise filter
  const getSearchResults = async (silent = false) => {
    // If no date range is set, silently skip refresh (e.g., after approve/reject)
    if (!searchDateRange) {
      if (!silent) {
        toast.error("Please select start and end dates for the results");
      }
      return;
    }

    setRows([]);
    setSearchLoading(true);
    try {
      const { data } = await imsAxios.post("/purchaseOrder/requested", {
        data: searchDateRange,
        wise: "single_date_wise",
      });
      setSearchLoading(false);
      if (data.code == 200) {
        let arr = data?.data?.map((row, index) => ({
          ...row,
          id: row.po_transaction,
          index: index + 1,
        }));
        setRows(arr);
        // If no results and not silent, show info message
        if (arr.length === 0 && !silent) {
          // Note: PO might have been approved/rejected and is no longer in requested list
        }
      } else if (data.message?.msg) {
        if (!silent) {
          toast.error(data.message.msg);
        }
      } else {
        if (!silent) {
          toast.error(data.message);
        }
      }
    } catch (error) {
      setSearchLoading(false);
      if (!silent) {
        toast.error("Error fetching PO list");
      }
    }
  };

  //getting component view data - now opens ViewPORequest modal
  const getComponentData = async (poid, status) => {
    setViewPoId(poid);
  };

  return (
    <div className="manage-po" style={{ position: "relative", height: "100%" }}>
      <Row
        justify="space-between"
        style={{ padding: "0px 10px", paddingBottom: 5 }}
      >
        <Col>
          <Space>
            <div style={{ width: 300 }}>
              <MyDatePicker
                size="default"
                setDateRange={setSearchDateRange}
                dateRange={searchDateRange}
                value={searchDateRange}
              />
            </div>
            <MyButton
              disabled={searchDateRange === ""}
              type="primary"
              loading={searchLoading}
              onClick={getSearchResults}
              id="submit"
              variant="search"
            >
              Search
            </MyButton>
          </Space>
        </Col>
        <Col>
          <Space>
            <CommonIcons
              action="downloadButton"
              onClick={() => downloadCSV(rows, columns, "Pending PO Report")}
              disabled={rows.length == 0}
            />
          </Space>
        </Col>
      </Row>

      <div
        style={{
          height: "85%",
          padding: "0 10px",
        }}
      >
        <MyDataTable loading={searchLoading} rows={rows} columns={columns} />
      </div>
      <ViewPORequest
        poId={viewPoId}
        setPoId={setViewPoId}
        getRows={getSearchResults}
      />
    </div>
  );
};

export default RequestPo;
