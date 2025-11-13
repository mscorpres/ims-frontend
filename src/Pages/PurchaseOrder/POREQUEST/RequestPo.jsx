import React, { useState, useEffect } from "react";
import { Button, Col, Input, Row, Space } from "antd";
import MyDatePicker from "../../../Components/MyDatePicker.jsx";
import { toast } from "react-toastify";

import MyDataTable from "../../../Components/MyDataTable.jsx";
import MySelect from "../../../Components/MySelect.jsx";
import MyAsyncSelect from "../../../Components/MyAsyncSelect.jsx";

import { downloadCSV } from "../../../Components/exportToCSV.jsx";
import TableActions, { CommonIcons } from "../../../Components/TableActions.jsx/TableActions.jsx";
import ToolTipEllipses from "../../../Components/ToolTipEllipses.jsx";
import { imsAxios } from "../../../axiosInterceptor.js";
import { GridActionsCellItem } from "@mui/x-data-grid";
import useApi from "../../../hooks/useApi.ts";
import { getVendorOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import MyButton from "../../../Components/MyButton/index.jsx";
import ViewComponentSideBar from "../ManagePO/Sidebars/ViewComponentSideBar.jsx";
import ViewComponentReqSidebar from "../ManagePO/Sidebars/ViewComponentReqSidebar.jsx";

const RequestPo = () => {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showViewSidebar, setShowViewSideBar] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [componentData, setComponentData] = useState(null);
  const [rows, setRows] = useState([]);
  const [searchDateRange, setSearchDateRange] = useState("");
  const [newPoLogs, setnewPoLogs] = useState([]);
  const { executeFun, loading: loading1 } = useApi();

  const columns = [
    {
      headerName: "",
      type: "actions",
      width: 30,
      getActions: ({ row }) => [
        // VIEW Icon
        <GridActionsCellItem
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
      renderCell: ({ row }) => <ToolTipEllipses text={row.po_transaction} copy={true} />,
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
      renderCell: ({ row }) => <ToolTipEllipses text={row.vendor_id} copy={true} />,
      width: 100,
    },
    {
      headerName: "Project ID",
      field: "project_id",
      renderCell: ({ row }) => <ToolTipEllipses text={row.project_id} copy={true} />,
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
      renderCell: ({ row }) => <ToolTipEllipses text={row.advPayment == "0" ? "NO" : "YES"} />,
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
  const getSearchResults = async () => {
    setRows([]);
    if (searchDateRange) {
      setSearchLoading(true);
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
      } else {
        if (data.message.msg) {
          toast.error(data.message.msg);
        } else {
          toast.error(data.message);
        }
      }
    } else {
      toast.error("Please select start and end dates for the results");
    }
  };

  //getting component view data
  const getComponentData = async (poid, status) => {
    setViewLoading(true);
    const { data } = await imsAxios.post("/purchaseOrder/fetchComponentList4PO", {
      poid,
    });
    setViewLoading(false);
    if (data.code == 200) {
      const arr = data.data.map((row, index) => {
        return {
          ...row,
          id: index,
        };
      });
      setComponentData({ poid: poid, components: arr, status: status });

      setShowViewSideBar(true);
      getPoLogs(poid);
    } else {
      toast.error(data.message);
    }
  };

  const getPoLogs = async (po_id) => {
    const { data } = await imsAxios.post("/purchaseOthers/pologs", {
      po_id,
    });
    if (data.code === "200" || data.code == 200) {
      let arr = data.data;
      setnewPoLogs(arr.reverse());
    }
  };

  return (
    <div className="manage-po" style={{ position: "relative", height: "100%" }}>
      <Row justify="space-between" style={{ padding: "0px 10px", paddingBottom: 5 }}>
        <Col>
          <Space>
            <div style={{ width: 300 }}>
              <MyDatePicker size="default" setDateRange={setSearchDateRange} dateRange={searchDateRange} value={searchDateRange} />
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
            <CommonIcons action="downloadButton" onClick={() => downloadCSV(rows, columns, "Pending PO Report")} disabled={rows.length == 0} />
          </Space>
        </Col>
      </Row>

      <div
        style={{
          height: "85%",
          padding: "0 10px",
        }}
      >
        <MyDataTable loading={loading || viewLoading || searchLoading} rows={rows} columns={columns} />
      </div>
      <ViewComponentReqSidebar
        getPoLogs={getPoLogs}
        newPoLogs={newPoLogs}
        setnewPoLogs={setnewPoLogs}
        setShowViewSideBar={setShowViewSideBar}
        showViewSidebar={showViewSidebar}
        componentData={componentData}
      />
    </div>
  );
};

export default RequestPo;